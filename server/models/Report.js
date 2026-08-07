/**
 * Report Model - Citizen problem reporting with images
 * One Health focus only
 */

const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  
  // One Health Categories
  category: {
    type: String,
    enum: [
      'maternal_health', 'child_nutrition', 'water_quality', 
      'air_quality', 'disease_prevention', 'healthcare_access',
      'zoonotic_diseases', 'climate_health'
    ],
    required: true
  },
  
  district: { type: String, required: true },
  municipality: { type: String },
  ward: { type: Number },
  
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterPhone: { type: String },
  
  // ===== IMAGE UPLOAD SUPPORT =====
  images: [{
    url: { type: String },
    caption: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'acknowledged', 'resolved'],
    default: 'pending'
  },
  
  affectedPeople: { type: Number },
  affectedChildren: { type: Number },
  affectedWomen: { type: Number },
  
  votes: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  
  location: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

// Indexes for faster queries
ReportSchema.index({ district: 1, category: 1 });
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ urgency: 1 });

module.exports = mongoose.model("Report", ReportSchema);


// This model is designed to manage the complete lifecycle of a citizen's One Health issue report , from submission, categorization, and location tracking to status updates, prioritization, and resolution.