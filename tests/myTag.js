var mongoose = require('mongoose');
var uuid = require('node-uuid');

var myTagSchema = new mongoose.Schema({
  id: { type: String, default: uuid.v4, required: true, unique: true },
  value: {type: String, index: true, unique: true, required: true },
  color: {type: String, index: true, required: true },
  // category: {type: String, ref: 'Category' },
  description: {type: String},
  // The models in which this tag appears, you don't need to add appears
  appearsIn: {type: [String]}
}, { timestamps: true });

/**
 * @hook
 * Turn tags to lowercase before saving
 */
// TagSchema.pre('save', function(next) {
//   if (this.isNew || this.isModified('value')) {
//     this.value = this.value.toLowerCase();
//   }

//   next();
// });

module.exports = myTagSchema;