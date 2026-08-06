/**
 * Project — seeded historical provincial capital project.
 * Populated by `npm run seed:sim` from the deterministic ledger generator;
 * the simulation engine reads its nearest-neighbour pool from here.
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    province: { type: String, required: true, index: true },
    sector: { type: String, required: true, index: true },
    icon: { type: String, default: '' },
    year: { type: Number, required: true, index: true },
    budget: { type: Number, required: true },
    jobsPerCrore: { type: Number, default: 0 },
    jobs: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 },
    completion: { type: Number, default: 0 },
    overrun: { type: Number, default: 0 },
    budgetAllocated: { type: Number, default: 0 },
    status: { type: String, enum: ['Completed', 'Ongoing', 'Delayed'], default: 'Ongoing' },
    sourceLabel: { type: String, default: '' },
  },
  { timestamps: true }
);

projectSchema.index({ sector: 1, province: 1, year: 1 });

module.exports = mongoose.model('Project', projectSchema);
