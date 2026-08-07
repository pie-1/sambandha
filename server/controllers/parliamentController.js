/**
 * Parliament Controller - One Health Topics Management
 * Handles creation, voting, and expert opinions on parliament topics
 */

const ParliamentTopic = require("../models/ParliamentTopic");

// Get all parliament topics
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

// Create parliament topic
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

// ✅ FIXED: Vote on topic - Properly increment count
exports.voteOnTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;

    const topic = await ParliamentTopic.findById(id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    // Check if citizen already voted
    const existingVote = topic.publicVotes.find(
      v => v.citizenId.toString() === req.user.id
    );

    if (existingVote) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already voted on this topic' 
      });
    }

    // ✅ Add vote
    topic.publicVotes.push({
      citizenId: req.user.id,
      vote: vote || 'approve',
      votedAt: new Date()
    });

    // ✅ Update total votes count
    topic.totalVotes = topic.publicVotes.length;
    
    // ✅ Update approval percentage (if needed)
    const approveVotes = topic.publicVotes.filter(v => v.vote === 'approve').length;
    topic.approvalPercentage = topic.totalVotes > 0 ? (approveVotes / topic.totalVotes) * 100 : 0;

    await topic.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully!',
      totalVotes: topic.totalVotes,
      approvalPercentage: topic.approvalPercentage
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Expert opinion on topic
exports.addExpertOpinion = async (req, res) => {
  try {
    const { id } = req.params;
    const { opinion } = req.body;

    if (req.user.role !== 'expert') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only experts can give opinions' 
      });
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

/**
 * This controller handles all parliament topic operations including creating topics, 
 * public voting, and expert opinions. It enables citizens to engage with parliamentary 
 * discussions and allows experts to provide professional insights.
 */