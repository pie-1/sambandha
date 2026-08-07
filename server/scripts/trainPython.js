/**
 * Live training demo: export the same records the JS models use, run the
 * notebook-style training demo (demo_train.py) in the ML venv, and push
 * the trained models to the running FastAPI service.
 *
 * Usage: npm run train:python
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
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

  console.log('Exporting records from MongoDB...');
  const records = await exportAllRecords();
  const counts = {
    policy: records.policy.length,
    budget: records.budget.length,
    claims: records.claims.length,
    projects: records.projects.length,
  };
  console.log(
    `Exported: ${counts.policy} policy / ${counts.budget} budget / ` +
      `${counts.claims} claims / ${counts.projects} projects`
  );
  await mongoose.disconnect();

  const dataDir = path.join(mlRoot, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'records.json'), JSON.stringify(records));

  const python = fs.existsSync(path.join(mlRoot, '.venv', 'bin', 'python'))
    ? path.join(mlRoot, '.venv', 'bin', 'python')
    : 'python3';
  console.log(`Running: ${python} demo_train.py\n`);

  const child = spawn(python, ['demo_train.py', 'data/records.json'], {
    cwd: mlRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
    },
  });

  child.on('exit', (code) => {
    console.log(
      code === 0
        ? '\nDone — models trained, pushed, and the service is predicting with them.'
        : `\ndemo_train.py exited with code ${code}`
    );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
