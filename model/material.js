const mongoose = require('mongoose');
const { Schema } = mongoose;

const materialSchema = new Schema({
 name: {
  type: 'String',
  unique: true,
 },
 image_url: {
  type: 'String',
 },
});
const MaterialModel = mongoose.model('Materials', materialSchema);
module.exports = MaterialModel;
