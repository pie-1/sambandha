/**
 * Parliament Controller - One Health topics
 */

const ParliamentTopic = require("../models/ParliamentTopic");

// Get all parliament topics (One Health focus)
exports.getTopics = async (req, res) => {
  try {
    const { sector, district } = req.query;
    const filter = { isActive: true };
    if (sector) filter.sector = sector;
    if (district) filter.district = district;

    const topics = await ParliamentTopic.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    res.json({ success: true, topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single topic
exports.getTopic = async (req, res) => {
  try {
    const topic = await ParliamentTopic.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('expertOpinions.expertId', 'name expertise');
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    res.json({ success: true, topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create parliament topic (Admin only)
exports.createTopic = async (req, res) => {
  try {
    const topic = new ParliamentTopic({
      ...req.body,
      createdBy: req.user.id
    });
    await topic.save();
    res.status(201).json({ success: true, topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vote on topic (Citizens)
exports.voteOnTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 'approve' or 'disapprove'

    const topic = await ParliamentTopic.findById(id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    // Check if citizen already voted
    const existingVote = topic.publicVotes.find(
      v => v.citizenId.toString() === req.user.id
    );

    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You already voted on this topic' });
    }

    topic.publicVotes.push({
      citizenId: req.user.id,
      vote
    });

    // Recalculate percentages
    const totalVotes = topic.publicVotes.length;
    const approveVotes = topic.publicVotes.filter(v => v.vote === 'approve').length;
    topic.approvalPercentage = totalVotes > 0 ? (approveVotes / totalVotes) * 100 : 0;

    await topic.save();
    res.json({
      success: true,
      message: 'Vote recorded',
      approvalPercentage: topic.approvalPercentage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Expert opinion on topic
exports.addExpertOpinion = async (req, res) => {
  try {
    const { id } = req.params;
    const { opinion } = req.body;

    if (req.user.role !== 'expert') {
      return res.status(403).json({ success: false, message: 'Only experts can give opinions' });
    }

    const topic = await ParliamentTopic.findById(id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    topic.expertOpinions.push({
      expertId: req.user.id,
      opinion
    });

    await topic.save();
    res.json({ success: true, message: 'Expert opinion added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// This controller is designed to manage One Health parliament 
// topics—from creating and retrieving topics to collecting citizen votes, 
// recording expert opinions, and measuring public approval.