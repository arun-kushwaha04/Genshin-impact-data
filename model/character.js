const mongoose = require('mongoose');
const { Schema } = mongoose;

const weaponBuildSchema = new Schema(
 {
  weaponId: {
   type: Schema.Types.ObjectId,
   ref: 'Weapons',
  },
  rank: {
   type: 'Number',
  },
 },
 { _id: false },
);

const artifactBuildSchema = new Schema(
 {
  artifacts: [
   {
    type: Schema.Types.ObjectId,
    ref: 'Artifacts',
   },
  ],
  value: {
   type: ['Number'],
  },
  rank: {
   type: 'Number',
  },
 },
 { _id: false },
);

const characterStatSchema = new Schema(
 {
  statName: {
   type: 'String',
  },
  statValue: {
   type: 'String',
  },
 },
 { _id: false },
);

const characterSkillSchema = new Schema(
 {
  skillTitle: {
   type: 'String',
  },
  image_url: {
   type: 'String',
  },
  skillName: {
   type: 'String',
  },
  description: { type: 'Object' },
 },
 { _id: false },
);

const characterAscensionSchema = new Schema(
 {
  rank: {
   type: 'Number',
  },
  level: {
   type: 'Number',
  },
  cost: {
   type: 'Number',
  },
  materials: {
   type: ['Mixed'],
  },
 },
 { _id: false },
);

const characterSchema = new Schema({
 character_intro: {
  image_url: {
   type: 'String',
  },
  name: {
   type: 'String',
   unique: true,
  },
  vision: {
   type: 'String',
  },
  weapon: {
   type: 'String',
  },
  role: {
   type: 'String',
  },
 },
 character_materials: [{ type: Schema.Types.ObjectId, ref: 'Materials' }],
 character_build: {
  weapon_build: [{ type: weaponBuildSchema }],
  artifact_build: [{ type: artifactBuildSchema }],
 },
 character_stats: [{ type: characterStatSchema }],
 character_talent: [{ type: characterSkillSchema }],
 character_passives: [{ type: characterSkillSchema }],
 character_constellations: [{ type: characterSkillSchema }],
 character_ascension_cost: [{ type: characterAscensionSchema }],
});
const CharacterModel = mongoose.model('Characters', characterSchema);
module.exports = CharacterModel;
