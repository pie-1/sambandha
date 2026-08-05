/**
 * Draft Model - Simplified
 * Policy draft with version history
 */

const mongoose = require("mongoose");

const DraftSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sector: { 
    type: String, 
    enum: ['budget', 'development', 'agriculture', 'education', 'health', 'infrastructure', 'tourism', 'other'],
    required: true 
  },
  currentVersionText: { type: String, required: true },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  versions: [{
    versionNumber: Number,
    text: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['draft', 'under_review', 'finalized'],
    default: 'draft'
  },
  district: { type: String, required: true },
  description: { type: String },
  budgetAmount: { type: Number, default: null },
  meetingLink: { type: String, default: null },
  meetingCreatedAt: { type: Date, default: null },
  meetingCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  viewCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  feedbackCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// ✅ SIMPLIFIED FIX - Just remove the pre-save hook entirely!
// For now, we'll handle versioning manually in the controller

module.exports = mongoose.model("Draft", DraftSchema);