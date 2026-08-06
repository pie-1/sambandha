/**
 * Feedback Controller
 * Handles public feedback on finalized policies
 */

const Feedback = require("../models/Feedback");
const Draft = require("../models/Draft");
const mongoose = require("mongoose");

exports.submitFeedback = async (req, res) => {
  try {
    const { phone, reaction, comment, district } = req.body;
    const { draftId } = req.params;

    const draft = await Draft.findById(draftId);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    if (draft.status !== 'finalized') {
      return res.status(400).json({ success: false, message: 'Can only give feedback on finalized drafts' });
    }

    const existing = await Feedback.findOne({ draftId, phone });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted feedback for this draft' 
      });
    }

    const feedback = new Feedback({
      draftId,
      phone,
      reaction,
      comment,
      district: district || draft.district
    });

    await feedback.save();

    draft.feedbackCount += 1;
    await draft.save();

    res.status(201).json({ success: true, message: 'Feedback submitted', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeedbackSummary = async (req, res) => {
  try {
    const { draftId } = req.params;

    const results = await Feedback.aggregate([
      { $match: { draftId: new mongoose.Types.ObjectId(draftId) } },
      { $group: { _id: '$reaction', count: { $sum: 1 } } }
    ]);

    const summary = {
      approve: 0,
      disapprove: 0,
      total: 0,
      approvePercentage: 0,
      disapprovePercentage: 0
    };

    results.forEach(result => {
      summary[result._id] = result.count;
      summary.total += result.count;
    });

    if (summary.total > 0) {
      summary.approvePercentage = (summary.approve / summary.total) * 100;
      summary.disapprovePercentage = (summary.disapprove / summary.total) * 100;
    }

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeedbackSummaryByDistrict = async (req, res) => {
  try {
    const { draftId } = req.params;

    const rows = await Feedback.aggregate([
      { $match: { draftId: new mongoose.Types.ObjectId(draftId) } },
      {
        $group: {
          _id: { district: { $ifNull: ['$district', 'Unknown'] }, reaction: '$reaction' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byDistrict = [];
    const districtMap = {};

    rows.forEach((row) => {
      const district = row._id.district;
      if (!districtMap[district]) {
        districtMap[district] = { district, approve: 0, disapprove: 0, total: 0 };
        byDistrict.push(districtMap[district]);
      }
      districtMap[district][row._id.reaction] = row.count;
      districtMap[district].total += row.count;
    });

    byDistrict.forEach((d) => {
      if (d.total > 0) d.approvePercentage = Math.round((d.approve / d.total) * 100);
    });

    byDistrict.sort((a, b) => b.total - a.total);

    res.json({ success: true, byDistrict });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const { draftId } = req.params;
    const feedback = await Feedback.find({ draftId }).sort({ createdAt: -1 });
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};