/**
 * Parliament Topic Model - One Health focus
 */

const mongoose = require("mongoose");

const ParliamentTopicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  
  // One Health focus
  sector: {
    type: String,
    enum: ['health', 'environment', 'one_health'],
    required: true,
    default: 'one_health'
  },
  
  district: { type: String },
  
  // Parliament details
  parliamentDate: { type: Date },
  parliamentSession: { type: String },
  
  // Public engagement
  publicVotes: [{
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vote: { type: String, enum: ['approve', 'disapprove'] },
    votedAt: { type: Date, default: Date.now }
  }],
  approvalPercentage: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  
  // Expert opinions
  expertOpinions: [{
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    opinion: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Status
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Link to draft if policy created
  linkedDraftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draft' },
  
}, { timestamps: true });

module.exports = mongoose.model("ParliamentTopic", ParliamentTopicSchema);


// This model is designed to manage One Health parliament topics—from storing topic details and parliamentary information to tracking citizen votes, expert opinions, and links to related policy drafts.