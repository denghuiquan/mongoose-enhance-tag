var assert = require('chai').assert;
var mongoose = require('mongoose');
var tagEverything = require('../index');
var _ = require('lodash');
var testDb = 'mongodb://127.0.0.1:27017/test';
var connection;
var firstTwo;

mongoose.Promise = Promise;

describe('mongoose-tag-everything', function() {
  before(function(done) {
    connection = mongoose.connect(testDb);
    mongoose.connection.on('connected', function(err) {
      if (err) {
        throw new Error(err);
      }
      connection.connection.db.dropDatabase(done);
      connection.plugin(tagEverything);
    });
  });


  after(function(done) {
    mongoose.connection.close(done);
  });

  it('should add a tags path to the schema', function() {
    var schema = new mongoose.Schema({
      name: String
    });
    schema.plugin(tagEverything);
    assert.property(schema.paths, 'tags');
  });

  it('should save tags to the tags path in a model', function(done) {
    var Model;
    var schema = new connection.Schema({
      name: String
    });
    schema.plugin(tagEverything);

    var Tag = connection.model('Tag');
    Tag.insertMany([{ value: 'hello test' }, { value: 'hi test' }])
      .then(datas => {
        firstTwo = _.map(datas, '_id');
        Model = connection.model('Test', schema);
        Model.create({ name: 'Lorem Ipsum', tags: firstTwo }, function(err, doc) {
          assert.equal(doc.tags[0], firstTwo[0]);
          assert.equal(doc.tags[1], firstTwo[1]);
          done();
        });
      })
      .catch(err => {
        done();
      })
  });

  it('should create only one tag per tag value', function(done) {
    var Model = connection.model('Test');
    var Tag = connection.model('Tag');

    Tag.insertMany([{ value: 'who test' }])
      .then(datas => {
        var testTags = _.map(datas, '_id').concat(firstTwo);
        Model.create({ name: 'Wow this is cool', tags: testTags }, function(err, doc) {
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
    var Tag = connection.model('Tag');
    Tag.find({}, {lean: true}).exec(function(err, results) {
      assert.equal(results.length, 3);
      done();
    });
  });

});
