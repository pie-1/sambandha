/**
 * Draft Model - One Health Focus
 * Simplified - NO pre-save hook (versioning handled in controller)
 */

const mongoose = require("mongoose");

const DraftSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true, trim: true },
  
  // One Health Sectors ONLY
  sector: { 
    type: String, 
    enum: ['health', 'environment', 'one_health'],
    required: true,
    default: 'one_health'
  },
  
  // Sub-categories
  subCategory: {
    type: String,
    enum: [
      'maternal_health', 'child_nutrition', 'water_quality', 
      'air_quality', 'disease_prevention', 'sanitation',
      'climate_health', 'zoonotic_diseases', 'healthcare_access'
    ],
    default: 'healthcare_access'
  },
  
  currentVersionText: { type: String, required: true, trim: true },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Version History - Managed in controller
  versions: [{
    versionNumber: Number,
    text: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now }
  }],
  
  // Status
  status: { 
    type: String, 
    enum: ['draft', 'under_review', 'finalized'],
    default: 'draft'
  },
  
  // Location
  district: { type: String, required: true },
  municipality: { type: String },
  
  // Policy Details
  description: { type: String, trim: true },
  budgetAmount: { type: Number, default: null },
  
  // One Health Impact Metrics
  expectedImpact: {
    healthImpact: { type: String, default: '' },
    environmentalImpact: { type: String, default: '' },
    communityImpact: { type: String, default: '' }
  },
  
  // Meeting
  meetingLink: { type: String, default: null },
  meetingCreatedAt: { type: Date, default: null },
  meetingCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  // Tracking
  viewCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  feedbackCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },

  // Expert Consensus
  expertConsensus: {
    totalExperts: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },
    approvalPercentage: { type: Number, default: 0 },
    expertReviews: [{
      expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approved: { type: Boolean },
      comment: { type: String },
      reviewedAt: { type: Date, default: Date.now }
    }]
  },

  // Implementation Tracking
  implementationStatus: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'stalled'],
      default: 'pending'
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    startDate: { type: Date },
    completionDate: { type: Date },
    budgetAllocated: { type: Number, default: 0 },
    budgetSpent: { type: Number, default: 0 },
    impactScore: { type: Number, min: 0, max: 10 },
    milestones: [{
      title: String,
      completed: { type: Boolean, default: false },
      date: { type: Date }
    }],
    notes: { type: String }
  },

  // Parliament Topic Reference
  parliamentTopicId: { type: String },
  parliamentTopicTitle: { type: String },
  
  // Citizen Reports Linked
  citizenReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],

}, { timestamps: true });

// ✅ NO PRE-SAVE HOOK - VERSIONING HANDLED IN CONTROLLER

module.exports = mongoose.model("Draft", DraftSchema);