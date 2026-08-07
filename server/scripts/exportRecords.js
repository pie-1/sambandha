/**
 * Export the real records (MongoDB `healthrecords` + `projects` ledger) to
 * ml-service/data/records.json for the Jupyter notebook pipeline.
 *
 * Usage: npm run export:records
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { exportAllRecords } = require('../services/ml/pythonBridge');

const mlRoot = path.resolve(__dirname, '..', '..', 'ml-service');

function mongoUri() {
  const envPath = path.resolve(__dirname, '..', '.env');
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    const line = raw
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.startsWith('MONGO_URI='));
    if (line) return line.slice('MONGO_URI='.length);
  } catch {
    /* no .env — fall through to default */
  }
  return 'mongodb://localhost:27017/sambandh';
}

async function main() {
  await mongoose.connect(mongoUri(), { serverSelectionTimeoutMS: 5000 });
  const records = await exportAllRecords();
  await mongoose.disconnect();

  const dataDir = path.join(mlRoot, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'records.json'), JSON.stringify(records));

  const counts = {
    policy: records.policy.length,
    budget: records.budget.length,
    claims: records.claims.length,
    projects: records.projects.length,
  };
  console.log(
    `Exported ${counts.policy} policy / ${counts.budget} budget / ` +
      `${counts.claims} claims / ${counts.projects} projects -> ml-service/data/records.json`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
