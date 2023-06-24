const mongoose = require('mongoose');
const { Schema } = mongoose;

const elementReactionSchema = new Schema({
 name: {
  type: 'String',
  unique: true,
 },
 description: {
  type: 'String',
 },
 reactions: {
  type: [
   {
    name: {
     type: 'String',
     unique: true,
    },
    effect: {
     type: 'String',
     required: true,
    },
    element1: [{ type: Schema.Types.ObjectId, ref: 'Elements' }],
    element2: [{ type: Schema.Types.ObjectId, ref: 'Elements' }],
    description: {
     type: 'String',
    },
   },
  ],
 },
});
const ElementReactionModel = mongoose.model(
 'ElementReaction',
 elementReactionSchema,
);
module.exports = ElementReactionModel;
