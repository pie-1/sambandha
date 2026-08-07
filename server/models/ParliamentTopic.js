/**
 * Parliament Topic Model - One Health Focus
 */

const mongoose = require("mongoose");

const ParliamentTopicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  
  sector: {
    type: String,
    enum: ['health', 'environment', 'one_health'],
    required: true,
    default: 'one_health'
  },
  
  district: { type: String },
  relatedDistricts: { type: [String] },
  
  parliamentDate: { type: Date },
  parliamentSession: { type: String },
  speakerName: { type: String },
  speakerRole: { type: String },
  
  // ✅ Voting fields
  publicVotes: [{
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vote: { type: String, enum: ['approve', 'disapprove'] },
    votedAt: { type: Date, default: Date.now }
  }],
  
  // ✅ Total votes count
  totalVotes: { type: Number, default: 0 },
  approvalPercentage: { type: Number, default: 0 },
  
  expertOpinions: [{
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    opinion: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  linkedDraftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draft' },
  sourceLink: { type: String },
  
}, { timestamps: true });

ParliamentTopicSchema.index({ sector: 1, district: 1 });
ParliamentTopicSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ParliamentTopic", ParliamentTopicSchema);