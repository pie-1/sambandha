/**
 * Database Seed Script
 * Run with: npm run seed
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Draft = require("../models/Draft");
const Comment = require("../models/Comment");
const Feedback = require("../models/Feedback");

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📡 Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Draft.deleteMany({});
    await Comment.deleteMany({});
    await Feedback.deleteMany({});
    console.log("🗑️  Cleared existing data");

    const salt = await bcrypt.genSalt(10);
    const hash = (pwd) => bcrypt.hash(pwd, salt);

    // Create users
    const users = await User.insertMany([
      {
        name: "Ram Sharma",
        email: "ram.sharma@moi.gov.np",
        passwordHash: await hash("password123"),
        role: "officer",
        department: "Ministry of Infrastructure",
        district: "Kathmandu"
      },
      {
        name: "Sita Adhikari",
        email: "sita.adhikari@mof.gov.np",
        passwordHash: await hash("password123"),
        role: "officer",
        department: "Ministry of Finance",
        district: "Lalitpur"
      },
      {
        name: "Dr. Krishna Poudel",
        email: "krishna.poudel@nast.gov.np",
        passwordHash: await hash("password123"),
        role: "expert",
        isVerifiedExpert: true,
        phone: "9812345678",
        district: "Kathmandu"
      },
      {
        name: "Prof. Gita Sharma",
        email: "gita.sharma@nast.gov.np",
        passwordHash: await hash("password123"),
        role: "expert",
        isVerifiedExpert: true,
        phone: "9823456789",
        district: "Chitwan"
      },
      {
        name: "Bishnu Ghimire",
        email: "bishnu.ghimire@gmail.com",
        passwordHash: await hash("password123"),
        role: "citizen",
        phone: "9841234567",
        district: "Pokhara"
      },
      {
        name: "Nisha Thapa",
        email: "nisha.thapa@yahoo.com",
        passwordHash: await hash("password123"),
        role: "citizen",
        phone: "9852345678",
        district: "Biratnagar"
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    const officerIds = users.filter(u => u.role === 'officer').map(u => u._id);
    const expertIds = users.filter(u => u.role === 'expert').map(u => u._id);

    // Create drafts
    const drafts = await Draft.insertMany([
      {
        title: "National Infrastructure Development Plan 2026-2030",
        sector: "development",
        currentVersionText: "This policy aims to develop critical infrastructure across Nepal including roads, bridges, and urban development projects.",
        officerId: officerIds[0],
        status: "draft",
        district: "Kathmandu",
        description: "Comprehensive 5-year infrastructure development plan",
        budgetAmount: 500000000,
        _lastEditorId: officerIds[0]
      },
      {
        title: "Agricultural Subsidy Reform Policy",
        sector: "agriculture",
        currentVersionText: "Proposed reforms to agricultural subsidies including direct cash transfers to farmers.",
        officerId: officerIds[1],
        status: "under_review",
        district: "Chitwan",
        description: "Modernizing agricultural subsidies",
        budgetAmount: 250000000,
        _lastEditorId: officerIds[1]
      },
      {
        title: "Digital Nepal 2030: Technology Infrastructure Policy",
        sector: "infrastructure",
        currentVersionText: "Policy framework for expanding digital infrastructure and internet connectivity across Nepal.",
        officerId: officerIds[0],
        status: "finalized",
        district: "Kathmandu",
        description: "Digital transformation policy",
        budgetAmount: 350000000,
        _lastEditorId: officerIds[0]
      }
    ]);

    console.log(`✅ Created ${drafts.length} drafts`);

    // Add versions to finalized draft
    const finalizedDraft = drafts[2];
    finalizedDraft.versions = [
      {
        versionNumber: 1,
        text: "Initial draft: Digital Nepal vision",
        editedBy: officerIds[0],
        editedAt: new Date('2025-12-01')
      },
      {
        versionNumber: 2,
        text: "Updated with expert recommendations",
        editedBy: officerIds[0],
        editedAt: new Date('2025-12-10')
      }
    ];
    await finalizedDraft.save();

    // Add comments
    const underReviewDraft = drafts[1];
    const comments = await Comment.insertMany([
      {
        draftId: underReviewDraft._id,
        authorId: expertIds[0],
        authorRole: "expert",
        text: "Excellent initiative. I recommend adding climate-resilient farming practices."
      },
      {
        draftId: underReviewDraft._id,
        authorId: expertIds[1],
        authorRole: "expert",
        text: "Agree. Should consider impact on small-scale farmers."
      }
    ]);

    console.log(`✅ Created ${comments.length} comments`);
    underReviewDraft.commentCount = comments.length;
    await underReviewDraft.save();

    // Create feedback
    const feedbackData = [
      { phone: "9841234567", reaction: "approve" },
      { phone: "9852345678", reaction: "approve" },
      { phone: "9863456789", reaction: "approve" },
      { phone: "9874567890", reaction: "disapprove" },
      { phone: "9885678901", reaction: "approve" }
    ];

    const feedbacks = await Feedback.insertMany(
      feedbackData.map(f => ({
        draftId: finalizedDraft._id,
        ...f,
        district: ['Kathmandu', 'Lalitpur', 'Pokhara'][Math.floor(Math.random() * 3)]
      }))
    );

    console.log(`✅ Created ${feedbacks.length} feedback entries`);
    finalizedDraft.feedbackCount = feedbacks.length;
    await finalizedDraft.save();

    // Summary
    console.log("\n🎉 Database Seeded Successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Users: ${users.length}`);
    console.log(`   Drafts: ${drafts.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log(`   Feedback: ${feedbacks.length}`);

    console.log("\n👤 Test Accounts:");
    console.log("\nOfficers:");
    console.log("   Email: ram.sharma@moi.gov.np | Password: password123");
    console.log("   Email: sita.adhikari@mof.gov.np | Password: password123");
    console.log("\nExperts:");
    console.log("   Email: krishna.poudel@nast.gov.np | Password: password123");
    console.log("   Email: gita.sharma@nast.gov.np | Password: password123");
    console.log("\nCitizens:");
    console.log("   Email: bishnu.ghimire@gmail.com | Password: password123");
    console.log("   Email: nisha.thapa@yahoo.com | Password: password123");

    console.log("\n📝 Sample Drafts:");
    drafts.forEach((draft, i) => {
      const officer = users.find(u => u._id.toString() === draft.officerId.toString());
      console.log(`   ${i + 1}. "${draft.title}" (${draft.status}) - ${officer?.name}`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Seed complete!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
