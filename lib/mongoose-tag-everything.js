var _ = require('lodash');
var async = require('async');
var TagSchema = require('./Tag');

module.exports = (function() {

  var Factory = function(schema, options) {
    var _path = {},mongoose;
    if (!options) {
      options = {};
    }
    _.defaults(options, {
      path: 'tags',
      ModelName: 'Tag',
      // collection: 'tags',
      mongoose: require('mongoose')
    });

    mongoose = options.mongoose;

    /**
     * Add tags path to schema
     */
    _path[options.path] = { type: [mongoose.Schema.Types.String], index: true };
    schema.add(_path);

    var TagModel
    if (options.custom) {
      TagModel = options.myTagModel;
    } else {
      // Wrap in a try/catch block in case we're registering a model that is already registered
      try {
        TagModel = mongoose.model(options.ModelName);
      } catch(e) {
        // Schema hasn't been registered for model "Tag" or name by options
        TagModel = mongoose.model(options.ModelName, TagSchema(options));
      }
    }

    /**
     * @hook
     * Pre-save hook to replace add modelName to appearsIn on existing tags
     */
    schema.pre('save', function(done) {
      // TODO Add support for sub docs through the ownerDocument property
      var isSubDocument = Boolean(!this.constructor.db);
      var modelName = this.constructor.modelName;
      // The tags must be the _id filed of tag instance array
      var tags = this[options.path];

      if (isSubDocument || !this.isNew || !this.isModified(options.path) || !tags.length) {
        return done();
      }

      var appearsInFieldName = 'appearsIn' + modelName

      let exitSpecailPath = TagModel.schema.path(appearsInFieldName)
      if (!exitSpecailPath) {
        var paths = {};
        paths[appearsInFieldName] = [String];
        TagModel.schema.add(paths);
      }
      done()
    });

    /**
     * @hook
     * Post-save hook to update tag[appearsInFieldName]
     */
    schema.post('save', function(doc, next) {
      var modelName = this.constructor.modelName;
      // The tags must be the _id filed of tag instance array
      var tags = this[options.path];
      var id = options.id ? this[options.id] : this['_id'];
      var _id = options.id || '_id'
      var appearsInFieldName = 'appearsIn' + modelName;

      TagModel.find({ [_id]: { $in: tags }}, function(err, existingTags) {
        async.each(tags, function(t, nextAsync) {
          TagModel.update({ [_id]: { $in: tags }},
            { $addToSet: { appearsIn: modelName, [appearsInFieldName]: id }},
            { multi: true },
            nextAsync);
        }, next);
      });
    });

    // Todo: remove the related id if it exsit of a tag[appearsInFieldName]
    schema.post('remove', function(doc) {
      console.log('%s has been removed', doc);
    });

  };

  return Factory;
}());