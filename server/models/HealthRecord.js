/**
 * HealthRecord — seeded training records for the health ML models.
 * Populated by `npm run seed:sim` from the deterministic generators in
 * services/ml/data.js (anchored to NDHS 2022 / NHIF / CBS). The models
 * train on these records at first use.
 *
 * `kind` discriminates the three datasets:
 *   policy — success-prediction rows (logistic regression)
 *   budget — budget-outcome rows (coverage gain per program)
 *   claim  — insurance claim rows (claims forecast)
 */

const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['policy', 'budget', 'claim'], required: true, index: true },
    province: { type: String, default: '' },
    program: { type: String, default: '' },
    budget: { type: Number, default: 0 },
    coverageGap: { type: Number, default: 0 },
    remoteShare: { type: Number, default: 0 },
    infraIndex: { type: Number, default: 0 },
    diseaseBurden: { type: Number, default: 0 },
    priorTrack: { type: Number, default: 0 },
    success: { type: Number, default: 0 },
    baselineCoverage: { type: Number, default: 0 },
    finalCoverage: { type: Number, default: 0 },
    gain: { type: Number, default: 0 },
    age: { type: Number, default: 0 },
    familySize: { type: Number, default: 0 },
    incomeBand: { type: Number, default: 0 },
    regionRisk: { type: Number, default: 0 },
    preExisting: { type: Number, default: 0 },
    healthIndex: { type: Number, default: 0 },
    claim: { type: Number, default: 0 },
  },
  { timestamps: true }
);

healthRecordSchema.index({ kind: 1, province: 1, program: 1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
