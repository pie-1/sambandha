/**
 * Database Seed Script - One Health Focus
 * Run with: npm run seed
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Draft = require("../models/Draft");
const Comment = require("../models/Comment");
const Feedback = require("../models/Feedback");
const Report = require("../models/Report");
const ParliamentTopic = require("../models/ParliamentTopic");

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
    await Report.deleteMany({});
    await ParliamentTopic.deleteMany({});
    console.log("🗑️  Cleared existing data");

    const salt = await bcrypt.genSalt(10);
    const hash = (pwd) => bcrypt.hash(pwd, salt);

    // ===== CREATE USERS (One Health Focus) =====
    const users = await User.insertMany([
      {
        name: "Ram Sharma",
        email: "ram.sharma@mohp.gov.np",
        passwordHash: await hash("password123"),
        role: "officer",
        department: "Ministry of Health & Population",
        district: "Kathmandu"
      },
      {
        name: "Sita Adhikari",
        email: "sita.adhikari@mofe.gov.np",
        passwordHash: await hash("password123"),
        role: "officer",
        department: "Ministry of Forests & Environment",
        district: "Lalitpur"
      },
      {
        name: "Dr. Krishna Poudel",
        email: "krishna.poudel@nast.gov.np",
        passwordHash: await hash("password123"),
        role: "expert",
        isVerifiedExpert: true,
        phone: "9812345678",
        expertise: ['public_health', 'epidemiology'],
        qualifications: "PhD Public Health, TU",
        institution: "Nepal Academy of Science and Technology",
        district: "Kathmandu"
      },
      {
        name: "Prof. Gita Sharma",
        email: "gita.sharma@nast.gov.np",
        passwordHash: await hash("password123"),
        role: "expert",
        isVerifiedExpert: true,
        phone: "9823456789",
        expertise: ['water_sanitation', 'environment'],
        qualifications: "PhD Environmental Science",
        institution: "Nepal Academy of Science and Technology",
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
    const citizenIds = users.filter(u => u.role === 'citizen').map(u => u._id);

    // ===== CREATE DRAFTS (One Health Only) =====
    const drafts = await Draft.insertMany([
      {
        title: "Humla Maternity Care Emergency Plan",
        sector: "health",
        subCategory: "maternal_health",
        currentVersionText: "This policy aims to reduce maternal mortality in Humla by establishing 2 maternity centers, training 50 community health workers, and providing ambulance services. The goal is to reduce maternal deaths by 50% in 3 years.",
        officerId: officerIds[0],
        status: "draft",
        district: "Humla",
        municipality: "Simkot",
        description: "Emergency plan to address maternal mortality crisis in Humla",
        budgetAmount: 35000000,
        expectedImpact: {
          healthImpact: "50% reduction in maternal mortality",
          environmentalImpact: "Clean water facilities for maternity centers",
          communityImpact: "500 women receiving quality maternity care annually"
        },
        _lastEditorId: officerIds[0]
      },
      {
        title: "Banke Child Malnutrition Prevention Policy",
        sector: "health",
        subCategory: "child_nutrition",
        currentVersionText: "Addressing child malnutrition in Banke district through supplementary nutrition programs, community health worker training, and food security initiatives.",
        officerId: officerIds[1],
        status: "under_review",
        district: "Banke",
        municipality: "Nepalgunj",
        description: "Comprehensive nutrition intervention for malnourished children",
        budgetAmount: 25000000,
        expectedImpact: {
          healthImpact: "Reduce child malnutrition by 40%",
          environmentalImpact: "Improved water quality and sanitation",
          communityImpact: "Nutrition awareness in 50 communities"
        },
        _lastEditorId: officerIds[1]
      },
      {
        title: "Lalitpur Water Quality Improvement Policy",
        sector: "environment",
        subCategory: "water_quality",
        currentVersionText: "Addressing water contamination in Lalitpur's Konjyosom area where 60% of water samples show faecal coliform contamination. Policy includes installing clean water systems and regular monitoring.",
        officerId: officerIds[0],
        status: "finalized",
        district: "Lalitpur",
        municipality: "Konjyosom",
        description: "Clean water access policy for Lalitpur",
        budgetAmount: 20000000,
        expectedImpact: {
          healthImpact: "Reduce waterborne diseases by 60%",
          environmentalImpact: "Clean water systems for 10,000 households",
          communityImpact: "Improved public health in 5 municipalities"
        },
        _lastEditorId: officerIds[0]
      }
    ]);

    console.log(`✅ Created ${drafts.length} One Health drafts`);

    // Add versions to finalized draft
    const finalizedDraft = drafts[2];
    finalizedDraft.versions = [
      {
        versionNumber: 1,
        text: "Initial draft: Water quality assessment and proposal",
        editedBy: officerIds[0],
        editedAt: new Date('2026-01-15')
      },
      {
        versionNumber: 2,
        text: "Updated with expert recommendations on water treatment methods",
        editedBy: officerIds[0],
        editedAt: new Date('2026-01-25')
      },
      {
        versionNumber: 3,
        text: "Final version with budget allocation and implementation timeline",
        editedBy: officerIds[0],
        editedAt: new Date('2026-02-05')
      }
    ];
    await finalizedDraft.save();

    // ===== ADD EXPERT CONSENSUS =====
    const underReviewDraft = drafts[1];
    underReviewDraft.expertConsensus = {
      totalExperts: 2,
      approvedCount: 2,
      approvalPercentage: 100,
      expertReviews: [
        {
          expertId: expertIds[0],
          approved: true,
          comment: "Excellent policy. I recommend adding a component on nutrition education for mothers.",
          reviewedAt: new Date()
        },
        {
          expertId: expertIds[1],
          approved: true,
          comment: "Agree with Dr. Poudel. Also suggest including food fortification program.",
          reviewedAt: new Date()
        }
      ]
    };
    underReviewDraft.commentCount = 2;
    await underReviewDraft.save();

    // ===== CREATE COMMENTS =====
    const comments = await Comment.insertMany([
      {
        draftId: underReviewDraft._id,
        authorId: expertIds[0],
        authorRole: "expert",
        text: "This is a comprehensive policy. I strongly recommend adding community health worker training as a key component.",
        parentCommentId: null
      },
      {
        draftId: underReviewDraft._id,
        authorId: expertIds[1],
        authorRole: "expert",
        text: "I support Dr. Poudel's recommendation. We should also consider school-based nutrition programs.",
        parentCommentId: null
      }
    ]);

    console.log(`✅ Created ${comments.length} expert comments`);

    // ===== CREATE FEEDBACK (Citizen Voting) =====
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
        district: ['Lalitpur', 'Kathmandu', 'Bhaktapur'][Math.floor(Math.random() * 3)]
      }))
    );

    console.log(`✅ Created ${feedbacks.length} citizen votes`);
    finalizedDraft.feedbackCount = feedbacks.length;
    await finalizedDraft.save();

    // ===== CREATE CITIZEN REPORTS =====
    const reports = await Report.insertMany([
      {
        title: "No Maternity Center in Humla",
        description: "Women in Humla have to travel 3 days to reach a hospital for delivery. Pregnant women are at high risk.",
        category: "maternal_health",
        district: "Humla",
        municipality: "Simkot",
        reporterId: citizenIds[0],
        reporterPhone: "9841234567",
        urgency: "critical",
        affectedPeople: 5000,
        affectedWomen: 1000
      },
      {
        title: "78 Malnourished Children in Banke",
        description: "In a single ward of Khajura Rural Municipality, 78 children under 5 are malnourished.",
        category: "child_nutrition",
        district: "Banke",
        municipality: "Khajura",
        reporterId: citizenIds[1],
        reporterPhone: "9852345678",
        urgency: "critical",
        affectedPeople: 300,
        affectedChildren: 78
      },
      {
        title: "Water Contamination in Lalitpur",
        description: "60% of drinking water samples in Konjyosom are contaminated with faecal coliform.",
        category: "water_quality",
        district: "Lalitpur",
        municipality: "Konjyosom",
        reporterId: citizenIds[0],
        reporterPhone: "9841234567",
        urgency: "high",
        affectedPeople: 10000
      }
    ]);

    console.log(`✅ Created ${reports.length} citizen reports`);

    // ===== CREATE PARLIAMENT TOPICS =====
    const parliamentTopics = await ParliamentTopic.insertMany([
      {
        title: "Maternity Care Crisis in Humla — Government Response",
        description: "Parliament discussion on the maternal mortality crisis in Humla and the government's plan to address it.",
        sector: "health",
        district: "Humla",
        parliamentDate: new Date('2026-05-15'),
        parliamentSession: "Budget Session 2026",
        publicVotes: [
          { citizenId: citizenIds[0], vote: "approve" },
          { citizenId: citizenIds[1], vote: "approve" }
        ],
        totalVotes: 2,
        approvalPercentage: 100,
        expertOpinions: [
          {
            expertId: expertIds[0],
            opinion: "This is a critical issue. The government must allocate emergency funds for Humla's maternity services."
          }
        ],
        createdBy: officerIds[0],
        linkedDraftId: drafts[0]._id
      },
      {
        title: "Child Malnutrition Emergency in Banke",
        description: "Addressing the malnutrition crisis affecting hundreds of children in Banke district.",
        sector: "one_health",
        district: "Banke",
        parliamentDate: new Date('2026-05-20'),
        parliamentSession: "Budget Session 2026",
        publicVotes: [
          { citizenId: citizenIds[0], vote: "approve" }
        ],
        totalVotes: 1,
        approvalPercentage: 100,
        createdBy: officerIds[1],
        linkedDraftId: drafts[1]._id
      }
    ]);

    console.log(`✅ Created ${parliamentTopics.length} parliament topics`);

    // ===== SUMMARY =====
    console.log("\n🎉 Database Seeded Successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Users: ${users.length}`);
    console.log(`   One Health Drafts: ${drafts.length}`);
    console.log(`   Expert Comments: ${comments.length}`);
    console.log(`   Citizen Votes: ${feedbacks.length}`);
    console.log(`   Citizen Reports: ${reports.length}`);
    console.log(`   Parliament Topics: ${parliamentTopics.length}`);

    console.log("\n👤 Test Accounts:");
    console.log("\n🔵 Officers:");
    console.log("   ram.sharma@mohp.gov.np | password123");
    console.log("   sita.adhikari@mofe.gov.np | password123");
    console.log("\n🟡 Experts:");
    console.log("   krishna.poudel@nast.gov.np | password123");
    console.log("   gita.sharma@nast.gov.np | password123");
    console.log("\n🟢 Citizens:");
    console.log("   bishnu.ghimire@gmail.com | password123");
    console.log("   nisha.thapa@yahoo.com | password123");

    console.log("\n📝 One Health Drafts:");
    drafts.forEach((draft, i) => {
      const officer = users.find(u => u._id.toString() === draft.officerId.toString());
      console.log(`   ${i + 1}. "${draft.title}" (${draft.sector}/${draft.subCategory}) - ${officer?.name}`);
    });

    console.log("\n📌 Reported Problems:");
    reports.forEach((report, i) => {
      console.log(`   ${i + 1}. ${report.category}: ${report.district} (${report.urgency})`);
    });

    console.log("\n🏛️ Parliament Topics:");
    parliamentTopics.forEach((topic, i) => {
      console.log(`   ${i + 1}. ${topic.title}`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Seed complete! Run 'npm run dev' to start the server.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();