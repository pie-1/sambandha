/**
 * Simulation Data Seed
 * Run with: npm run seed:sim [--reset]
 *
 * Seeds the MongoDB collections that power the simulation engines:
 *   - projects      — 224 provincial capital projects (FY 2078/79–2080/81)
 *                     generated deterministically from MoF / provincial
 *                     budget anchors
 *   - healthrecords — health ML training records (policy success, budget
 *                     outcomes, insurance claims) anchored to NDHS 2022 /
 *                     NHIF / CBS
 *
 * The generators are deterministic, so reseeding always reproduces the
 * same records. The engines fall back to the embedded generators when the
 * collections are empty, so `seed:sim` is only needed for presentations
 * and DB-backed authenticity.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('../models/Project');
const HealthRecord = require('../models/HealthRecord');

const {
  buildHealthPolicyRecords,
  buildBudgetOutcomeRecords,
  buildClaimRecords,
} = require('../services/ml/data');
const { DATASET, PROVINCE_BUDGETS, SOURCES } = require('../services/simulationModel');

dotenv.config();

const RESET = process.argv.includes('--reset');

const seedSimulationData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Connected to MongoDB\n');

    if (RESET) {
      await Project.deleteMany({});
      await HealthRecord.deleteMany({});
      console.log('🗑️  Cleared existing simulation data');
    }

    const projectRows = DATASET;
    const existingProjects = await Project.countDocuments();
    if (existingProjects > 0 && !RESET) {
      console.log(`⏭️  projects already seeded (${existingProjects} records). Use --reset to reseed.`);
    } else {
      const projects = await Project.insertMany(
        projectRows.map((r) => ({
          province: r.province,
          sector: r.sector,
          icon: r.icon,
          year: r.year,
          budget: r.budget,
          jobsPerCrore: r.jobsPerCrore,
          jobs: r.jobs,
          efficiency: r.efficiency,
          completion: r.completion,
          overrun: r.overrun,
          budgetAllocated: r.budgetAllocated,
          status: r.status,
          sourceLabel: 'MoF Red Book & provincial budget statements, FY 2080/81',
        }))
      );
      console.log(`✅ Seeded ${projects.length} project records (FY 2078/79–2080/81)`);
    }

    const healthRows = [
      ...buildHealthPolicyRecords().map((r) => ({ kind: 'policy', ...r })),
      ...buildBudgetOutcomeRecords().map((r) => ({ kind: 'budget', ...r })),
      ...buildClaimRecords().map((r) => ({ kind: 'claim', ...r })),
    ];
    const existingHealth = await HealthRecord.countDocuments();
    if (existingHealth > 0 && !RESET) {
      console.log(`⏭️  healthrecords already seeded (${existingHealth} records). Use --reset to reseed.`);
    } else {
      const records = await HealthRecord.insertMany(healthRows);
      console.log(`✅ Seeded ${records.length} health ML training records`);
    }

    console.log('\n📊 Summary:');
    console.log(`   Projects:      ${projectRows.length} records`);
    console.log(`   Health policy: ${buildHealthPolicyRecords().length} records`);
    console.log(`   Health budget: ${buildBudgetOutcomeRecords().length} records`);
    console.log(`   Claims:        ${buildClaimRecords().length} records`);
    console.log('\n📚 Sources:');
    SOURCES.forEach((s) => console.log(`   - ${s.name}`));
    console.log('\n💡 Note: engines fall back to embedded generators if these collections are empty.');
    console.log('   Reseed with: npm run seed:sim -- --reset');

    await mongoose.connection.close();
    console.log('\n✅ Simulation data seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedSimulationData();
