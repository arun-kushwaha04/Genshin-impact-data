const mongoose = require('mongoose');
const { Schema } = mongoose;

const weaponSchema = new Schema({
 name: {
  type: 'String',
  unique: true,
 },
 image_url: {
  type: 'String',
 },
 type: {
  type: 'String',
 },
 rarity: {
  type: 'Number',
 },
 attack: {
  type: 'Number',
 },
 secondaryAttack: {
  type: 'String',
 },
 drop: {
  type: 'String',
 },
 passive: {
  type: 'String',
 },
 passiveText: {
  type: 'String',
 },
});
const WeaponModel = mongoose.model('Weapons', weaponSchema);
module.exports = WeaponModel;
