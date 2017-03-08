var assert = require('chai').assert;
var mongoose = require('mongoose');
var tagEverything = require('../index');
var _ = require('lodash');
var myTagSchema = require('./myTag');
var testDb = 'mongodb://127.0.0.1:27017/test';
var connection;
var myTagModel;

mongoose.Promise = Promise;

describe('mongoose-tag-everything', function() {
  before(function(done) {
    connection = mongoose.connect(testDb);
    mongoose.connection.on('connected', function(err) {
      if (err) {
        throw new Error(err);
      }

      myTagModel = mongoose.model('CustomTag', myTagSchema);
      connection.connection.db.dropDatabase(done);
      // done();
      connection.plugin(tagEverything, {
        custom: true,
        myTagModel: myTagModel,
        id: 'id',
        path: 'mytags',
        ModelName: 'CustomTag',
        collection: 'customtags'
      });
    });
  });


  after(function(done) {
    mongoose.connection.close(done);
  });

  it('should add a tags path to the schema', function() {
    var schema = new mongoose.Schema({
      name: String
    });
    schema.plugin(tagEverything, {
        custom: true,
        myTagModel: myTagModel,
        id: 'id',
        path: 'mytags',
        ModelName: 'CustomTag'
        // collection: 'customtags'
      });
    assert.property(schema.paths, 'mytags');
  });

  it('should save tags to the mytags path in a model', function(done) {
    var Model;
    var schema = new connection.Schema({
      name: String
    });
    schema.plugin(tagEverything, {
        custom: true,
        myTagModel: myTagModel,
        id: 'id',
        path: 'mytags',
        ModelName: 'CustomTag'
        // collection: 'customtags'
      });

    var Tag = connection.model('CustomTag');
    Tag.insertMany([
        {
          value: 'hello test 1',
          color: '#334445',
          // category: 'categoryid',
          description: 'test for custom tag'
        },
        {
          value: 'hii test 1',
          color: '#335555',
          // category: 'categoryid',
          description: 'test for custom tag 44'
        }
      ])
      .then(datas => {
        firstTwo = _.map(datas, 'id');

        Model = connection.model('TestCustom', schema);
        Model.create({ name: 'Lorem Ipsum', mytags: firstTwo }, function(err, doc) {
          assert.equal(doc.mytags[0], firstTwo[0]);
          assert.equal(doc.mytags[1], firstTwo[1]);
          done();
        });
      })
      .catch(err => {
        done();
      })
  });

  it('should create only one tag per tag value', function(done) {
    var Model = connection.model('TestCustom');
    var Tag = connection.model('CustomTag');

    Tag.insertMany([{
          value: '666 test 1',
          color: '#666666',
          // category: 'categoryid',
          description: 'test for custom tag 666'
        }])
      .then(datas => {
        var testTags = _.map(datas, 'id').concat(firstTwo);
        Model.create({ name: 'Wow this is cool', mytags: testTags }, function(err, doc) {
          Tag.find({}, function(err, tags) {
            assert.equal(tags.length, 3);
            done();
          });
        });
      })
      .catch(err => {
        done();
      })
  });

  it('should return all tags when querying by value', function(done) {
    var Tag = connection.model('CustomTag');
    Tag.find({}, {lean: true}).exec(function(err, results) {
      assert.equal(results.length, 3);
      done();
    });
  });

});
