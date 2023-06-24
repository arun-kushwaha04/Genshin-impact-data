const mongoose = require('mongoose');
const { Schema } = mongoose;

const artifactSchema = new Schema({
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
 '2_piece_bonus': {
  type: 'String',
 },
 '4_piece_bonus': {
  type: 'String',
 },
});
const ArtifactModel = mongoose.model('Artifacts', artifactSchema);
module.exports = ArtifactModel;
