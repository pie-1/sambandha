/**
 * Idempotent first-boot seeding for Docker: seeds only what is missing.
 * Used by docker-entrypoint.sh — never run this while relying on live demo data.
 *
 *   users empty        -> node seed/seed.js   (base users + starter drafts)
 *   projects empty     -> npm run seed:sim    (224-project ledger + ML records)
 *   drafts < 3         -> npm run seed:engagement (demo drafts with comments)
 *   priorityvotes empty-> npm run seed:priorities (27 demo votes)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { execSync } = require('child_process');

const URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sambandh';

async function count(collection) {
  try {
    return await mongoose.connection.db.collection(collection).countDocuments();
  } catch {
    return 0;
  }
}

async function run(name, command) {
  console.log(`\n>> seeding: ${name}`);
  execSync(command, { stdio: 'inherit' });
}

async function main() {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 30000 });

  const users = await count('users');
  const projects = await count('projects');
  const drafts = await count('drafts');
  const votes = await count('priorityvotes');

  if (users === 0) {
    await run('base seed (users + starter drafts)', 'node seed/seed.js');
  } else {
    console.log('users already present — skipping base seed');
  }
  if (projects === 0) {
    await run('simulation ledger + ML records', 'npm run seed:sim');
  } else {
    console.log('projects already present — skipping seed:sim');
  }
  if (drafts < 3) {
    await run('engagement drafts (comments + feedback)', 'npm run seed:engagement');
  } else {
    console.log('drafts already present — skipping seed:engagement');
  }
  if (votes === 0) {
    await run('priority votes', 'npm run seed:priorities');
  } else {
    console.log('priority votes already present — skipping seed:priorities');
  }

  await mongoose.disconnect();
  console.log('\nseed check complete — database is demo-ready');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
