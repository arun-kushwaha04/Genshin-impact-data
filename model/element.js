const mongoose = require('mongoose');
const { Schema } = mongoose;

const elementSchema = new Schema({
 name: {
  type: 'String',
  unique: true,
 },
 image_url: {
  type: 'String',
 },
});
const ElementModel = mongoose.model('Elements', elementSchema);
module.exports = ElementModel;
