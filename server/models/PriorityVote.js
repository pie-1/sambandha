/**
 * PriorityVote Model
 * Citizen priority votes — top sectors per district for the public
 * "district priorities" board. One vote per phone.
 */

const mongoose = require('mongoose');

const PriorityVoteSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    district: { type: String, required: true, trim: true },
    sectors: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 3,
        message: 'Pick between 1 and 3 priority sectors',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PriorityVote', PriorityVoteSchema);
