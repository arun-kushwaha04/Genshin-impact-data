const mongoose = require('mongoose');
const { Schema } = mongoose;

const alchemySchema = new Schema({
 name: {
  type: 'String',
  unique: true,
 },
 image_url: {
  type: 'String',
 },
 rarity: {
  type: 'Number',
 },
 bonus: {
  type: 'String',
 },
 ingredients: {
  type: ['String'],
 },
});
const AlchemyModel = mongoose.model('alchemys', alchemySchema);
module.exports = AlchemyModel;
