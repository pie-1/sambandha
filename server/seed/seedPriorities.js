/**
 * Seed demo priority votes — district priorities board.
 * Idempotent: upserts by phone, safe to re-run.
 *
 * Usage: node server/seed/seedPriorities.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const PriorityVote = require('../models/PriorityVote');

const DEMO_VOTES = [
  // Koshi
  { phone: '9800000101', district: 'Ilam', sectors: ['Tourism & Culture', 'Agriculture & Irrigation', 'Roads & Bridges'] },
  { phone: '9800000102', district: 'Jhapa', sectors: ['Agriculture & Irrigation', 'Roads & Bridges', 'Education Infrastructure'] },
  { phone: '9800000103', district: 'Sunsari', sectors: ['Health & Nutrition', 'Water & Sanitation', 'Roads & Bridges'] },
  { phone: '9800000104', district: 'Solukhumbu', sectors: ['Tourism & Culture', 'Rural Electrification', 'Roads & Bridges'] },
  // Madhesh
  { phone: '9800000105', district: 'Sarlahi', sectors: ['Agriculture & Irrigation', 'Water & Sanitation', 'Health & Nutrition'] },
  { phone: '9800000106', district: 'Bara', sectors: ['Agriculture & Irrigation', 'Roads & Bridges', 'Water & Sanitation'] },
  { phone: '9800000107', district: 'Rautahat', sectors: ['Health & Nutrition', 'Water & Sanitation', 'Agriculture & Irrigation'] },
  // Bagmati
  { phone: '9800000108', district: 'Kathmandu', sectors: ['Health & Nutrition', 'Education Infrastructure', 'Water & Sanitation'] },
  { phone: '9800000109', district: 'Lalitpur', sectors: ['Education Infrastructure', 'Health & Nutrition', 'Tourism & Culture'] },
  { phone: '9800000110', district: 'Bhaktapur', sectors: ['Tourism & Culture', 'Education Infrastructure', 'Local Governance Capacity'] },
  { phone: '9800000111', district: 'Nuwakot', sectors: ['Roads & Bridges', 'Rural Electrification', 'Health & Nutrition'] },
  { phone: '9800000112', district: 'Rasuwa', sectors: ['Tourism & Culture', 'Roads & Bridges', 'Health & Nutrition'] },
  // Gandaki
  { phone: '9800000113', district: 'Kaski', sectors: ['Tourism & Culture', 'Agriculture & Irrigation', 'Roads & Bridges'] },
  { phone: '9800000114', district: 'Lamjung', sectors: ['Rural Electrification', 'Agriculture & Irrigation', 'Tourism & Culture'] },
  { phone: '9800000115', district: 'Manang', sectors: ['Tourism & Culture', 'Rural Electrification', 'Roads & Bridges'] },
  // Lumbini
  { phone: '9800000116', district: 'Rupandehi', sectors: ['Education Infrastructure', 'Health & Nutrition', 'Roads & Bridges'] },
  { phone: '9800000117', district: 'Banke', sectors: ['Agriculture & Irrigation', 'Water & Sanitation', 'Health & Nutrition'] },
  { phone: '9800000118', district: 'Palpa', sectors: ['Agriculture & Irrigation', 'Tourism & Culture', 'Education Infrastructure'] },
  { phone: '9800000119', district: 'Gulmi', sectors: ['Agriculture & Irrigation', 'Roads & Bridges', 'Water & Sanitation'] },
  // Karnali
  { phone: '9800000120', district: 'Humla', sectors: ['Rural Electrification', 'Roads & Bridges', 'Health & Nutrition'] },
  { phone: '9800000121', district: 'Jumla', sectors: ['Agriculture & Irrigation', 'Health & Nutrition', 'Roads & Bridges'] },
  { phone: '9800000122', district: 'Surkhet', sectors: ['Education Infrastructure', 'Health & Nutrition', 'Roads & Bridges'] },
  { phone: '9800000123', district: 'Mugu', sectors: ['Rural Electrification', 'Roads & Bridges', 'Water & Sanitation'] },
  // Sudurpashchim
  { phone: '9800000124', district: 'Bajhang', sectors: ['Roads & Bridges', 'Rural Electrification', 'Health & Nutrition'] },
  { phone: '9800000125', district: 'Darchula', sectors: ['Roads & Bridges', 'Rural Electrification', 'Agriculture & Irrigation'] },
  { phone: '9800000126', district: 'Achham', sectors: ['Agriculture & Irrigation', 'Health & Nutrition', 'Water & Sanitation'] },
  { phone: '9800000127', district: 'Doti', sectors: ['Agriculture & Irrigation', 'Education Infrastructure', 'Roads & Bridges'] },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  let created = 0;
  for (const vote of DEMO_VOTES) {
    const res = await PriorityVote.findOneAndUpdate(
      { phone: vote.phone },
      { district: vote.district, sectors: vote.sectors },
      { upsert: true, returnDocument: 'after' }
    );
    created += 1;
  }

  const total = await PriorityVote.countDocuments();
  console.log(`Seeded ${created} priority votes. Total in DB: ${total}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
