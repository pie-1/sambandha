/**
 * Feedback Model
 * Public feedback on finalized policies
 */

const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  draftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draft', required: true },
  phone: { type: String, required: true },
  reaction: { type: String, enum: ['approve', 'disapprove'], required: true },
  comment: { type: String, trim: true },
  district: { type: String, trim: true }
}, { timestamps: true });

// One feedback per phone per draft
FeedbackSchema.index({ draftId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", FeedbackSchema);