/**
 * Seed engagement data — finalized drafts with expert comments AND
 * citizen feedback votes (for the simulator consensus section and the
 * "what neighbors think" district panel).
 *
 * Idempotent: skips drafts that already exist by title.
 *
 * Usage: npm run seed:engagement
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Draft = require('../models/Draft');
const Comment = require('../models/Comment');
const Feedback = require('../models/Feedback');

const NEW_DRAFTS = [
  {
    title: 'Provincial Health Insurance Expansion Act',
    sector: 'health',
    district: 'Pokhara',
    description: 'Extend provincial health insurance coverage to informal-sector households',
    budgetAmount: 420000000,
    text:
      'This policy extends provincial health insurance to all informal-sector households, ' +
      'subsidizing premiums for the bottom two income quintiles and digitizing claims ' +
      'settlement with a 14-day reimbursement guarantee. Maternal and child health ' +
      'services are included without additional premium from FY 2081/82.',
    comments: [
      { authorEmail: 'krishna.poudel@nast.gov.np', role: 'expert', text: 'Premium subsidy targeting the bottom two quintiles is sound economics — recommend a means-test registry to prevent leakage.' },
      { authorEmail: 'gita.sharma@nast.gov.np', role: 'expert', text: 'The 14-day claims settlement guarantee is ambitious. Pair it with a penalty clause for insurers to make it enforceable.' },
      { authorEmail: 'sita.adhikari@mof.gov.np', role: 'officer', text: 'अनौपचारिक क्षेत्रका परिवारका लागि प्रिमियम अनुदान वित्तीय रूपमा दिगो छ — गण्डकीको वार्षिक स्वास्थ्य बजेटभित्रै समायोजन गर्न सकिन्छ।' },
    ],
    feedback: [
      { phone: '9790000001', reaction: 'approve', district: 'Pokhara' },
      { phone: '9790000002', reaction: 'approve', district: 'Pokhara' },
      { phone: '9790000003', reaction: 'approve', district: 'Baglung' },
      { phone: '9790000004', reaction: 'disapprove', district: 'Baglung' },
      { phone: '9790000005', reaction: 'approve', district: 'Syangja' },
      { phone: '9790000006', reaction: 'disapprove', district: 'Kaski' },
      { phone: '9790000007', reaction: 'approve', district: 'Lamjung' },
    ],
  },
  {
    title: 'Irrigation Modernization & Farmer Resilience Program',
    sector: 'agriculture',
    district: 'Surkhet',
    description: 'Climate-resilient irrigation infrastructure for mid-hills agriculture',
    budgetAmount: 280000000,
    text:
      'A five-year program to rehabilitate community irrigation systems in the mid-hills, ' +
      'introduce drip and sprinkler technologies for high-value crops, and establish ' +
      'weather-indexed crop insurance with 40% premium subsidy for smallholders.',
    comments: [
      { authorEmail: 'gita.sharma@nast.gov.np', role: 'expert', text: 'Community-managed systems have the best maintenance records — keep ownership local and fund operator training.' },
      { authorEmail: 'krishna.poudel@nast.gov.np', role: 'expert', text: 'Weather-indexed insurance is a good hedge for rainfed districts like Surkhet, but requires 8-10 years of weather data for fair pricing.' },
    ],
    feedback: [
      { phone: '9890000001', reaction: 'approve', district: 'Surkhet' },
      { phone: '9890000002', reaction: 'approve', district: 'Surkhet' },
      { phone: '9890000003', reaction: 'approve', district: 'Dailekh' },
      { phone: '9890000004', reaction: 'approve', district: 'Jajarkot' },
      { phone: '9890000005', reaction: 'disapprove', district: 'Salyan' },
      { phone: '9890000006', reaction: 'approve', district: 'Banke' },
      { phone: '9890000007', reaction: 'disapprove', district: 'Surkhet' },
      { phone: '9890000008', reaction: 'approve', district: 'Dailekh' },
    ],
  },
  {
    title: 'Highland Tourism Trail Development Policy',
    sector: 'tourism',
    district: 'Syangja',
    description: 'Community-owned trekking trail network across Gandaki highlands',
    budgetAmount: 195000000,
    text:
      'Develops and upgrades a network of community-owned trekking trails in the ' +
      'Gandaki highlands, with homestay certification, waste management stations, ' +
      'and a digital trail-mapping platform linked to provincial tourism promotion.',
    comments: [
      { authorEmail: 'krishna.poudel@nast.gov.np', role: 'expert', text: 'Community ownership is the right model — revenue-sharing targets should be explicit and audited annually.' },
      { authorEmail: 'gita.sharma@nast.gov.np', role: 'expert', text: 'Waste management stations are essential; allocate at least 15% of budget to operations and maintenance, not construction.' },
      { authorEmail: 'ram.sharma@moi.gov.np', role: 'officer', text: 'Trail standards should align with the national trekking routes map being developed by MoCTCA.' },
    ],
    feedback: [
      { phone: '9870000001', reaction: 'approve', district: 'Syangja' },
      { phone: '9870000002', reaction: 'approve', district: 'Kaski' },
      { phone: '9870000003', reaction: 'disapprove', district: 'Kaski' },
      { phone: '9870000004', reaction: 'approve', district: 'Parbat' },
      { phone: '9870000005', reaction: 'disapprove', district: 'Parbat' },
      { phone: '9870000006', reaction: 'approve', district: 'Myagdi' },
      { phone: '9870000007', reaction: 'approve', district: 'Gorkha' },
    ],
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({}).lean();
  const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));
  const officers = users.filter((u) => u.role === 'officer');
  const experts = users.filter((u) => u.role === 'expert');

  let createdDrafts = 0;
  let createdComments = 0;
  let createdFeedback = 0;

  for (const spec of NEW_DRAFTS) {
    const existing = await Draft.findOne({ title: spec.title });
    if (existing) {
      console.log(`⏭️  Skipping existing draft: "${spec.title}"`);
      continue;
    }

    const officer = officers.find((u) => u.role === 'officer') || officers[0];
    const draft = await Draft.create({
      title: spec.title,
      sector: spec.sector,
      district: spec.district,
      description: spec.description,
      budgetAmount: spec.budgetAmount,
      currentVersionText: spec.text,
      officerId: officer._id,
      status: 'finalized',
      viewCount: 40 + createdDrafts * 30,
      isDeleted: false,
      versions: [
        { versionNumber: 1, text: spec.text, editedBy: officer._id, editedAt: new Date('2026-01-15') },
      ],
    });

    const comments = [];
    for (const c of spec.comments) {
      const author = byEmail[c.authorEmail] || experts[0];
      comments.push({
        draftId: draft._id,
        authorId: author._id,
        authorRole: c.role,
        text: c.text,
        isDeleted: false,
      });
    }
    if (comments.length) {
      await Comment.insertMany(comments);
      draft.commentCount = comments.length;
    }

    const feedback = [];
    for (const f of spec.feedback) {
      feedback.push({
        draftId: draft._id,
        phone: f.phone,
        reaction: f.reaction,
        district: f.district,
      });
    }
    if (feedback.length) {
      await Feedback.insertMany(feedback);
      draft.feedbackCount = feedback.length;
    }

    await draft.save();
    createdDrafts += 1;
    createdComments += comments.length;
    createdFeedback += feedback.length;
    console.log(`✅ Created "${spec.title}" — ${comments.length} comments, ${feedback.length} feedback votes`);
  }

  const totals = {
    drafts: await Draft.countDocuments({ isDeleted: false }),
    comments: await Comment.countDocuments({ isDeleted: false }),
    feedback: await Feedback.countDocuments({}),
  };

  console.log(`\nCreated: ${createdDrafts} drafts, ${createdComments} comments, ${createdFeedback} feedback votes`);
  console.log(`Totals — drafts: ${totals.drafts}, comments: ${totals.comments}, feedback: ${totals.feedback}`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
