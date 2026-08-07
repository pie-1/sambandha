/**
 * Draft Controller
 * Handles CRUD operations for drafts with ML integration
 */

const Draft = require("../models/Draft");

// ===== BASIC CRUD =====

exports.getDrafts = async (req, res) => {
  try {
    const { status, sector, district } = req.query;
    
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (sector) filter.sector = sector;
    if (district) filter.district = district;

    const drafts = await Draft.find(filter)
      .populate('officerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, drafts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id)
      .populate('officerId', 'name email')
      .populate('versions.editedBy', 'name');

    if (!draft || draft.isDeleted) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    draft.viewCount += 1;
    await draft.save();

    res.json({ success: true, draft });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDraft = async (req, res) => {
  try {
    const { title, sector, currentVersionText, district, description, budgetAmount } = req.body;

    const draft = new Draft({
      title,
      sector,
      currentVersionText,
      officerId: req.user.id,
      district,
      description,
      budgetAmount,
      _lastEditorId: req.user.id
    });

    await draft.save();

    res.status(201).json({ success: true, message: 'Draft created', draft });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDraft = async (req, res) => {
  try {
    const { currentVersionText } = req.body;
    const draft = await Draft.findById(req.params.id);

    if (!draft || draft.isDeleted) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    const isOfficer = req.user.role === 'officer' && draft.officerId.toString() === req.user.id;
    const isExpert = req.user.role === 'expert';

    if (!isOfficer && !isExpert) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this draft' });
    }

    draft.currentVersionText = currentVersionText;
    draft._lastEditorId = req.user.id;
    
    await draft.save();

    res.json({ success: true, message: 'Draft updated', draft });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.finalizeDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);

    if (!draft || draft.isDeleted) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    if (draft.officerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the creator can finalize this draft' });
    }

    draft.status = 'finalized';
    await draft.save();

    res.json({ success: true, message: 'Draft finalized', draft });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== EXPERT CONSENSUS =====

exports.updateConsensus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, comment } = req.body;

    const draft = await Draft.findById(id);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    if (req.user.role !== 'expert') {
      return res.status(403).json({ success: false, message: 'Only experts can provide consensus' });
    }

    const existingReview = draft.expertConsensus.expertReviews.find(
      r => r.expertId.toString() === req.user.id
    );

    if (existingReview) {
      existingReview.approved = approved;
      existingReview.comment = comment || existingReview.comment;
      existingReview.reviewedAt = new Date();
    } else {
      draft.expertConsensus.expertReviews.push({
        expertId: req.user.id,
        approved,
        comment
      });
    }

    const reviews = draft.expertConsensus.expertReviews;
    const total = reviews.length;
    const approvedCount = reviews.filter(r => r.approved).length;
    draft.expertConsensus.totalExperts = total;
    draft.expertConsensus.approvedCount = approvedCount;
    draft.expertConsensus.approvalPercentage = total > 0 ? (approvedCount / total) * 100 : 0;

    await draft.save();
    res.json({
      success: true,
      message: 'Consensus updated',
      consensus: draft.expertConsensus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConsensus = async (req, res) => {
  try {
    const { id } = req.params;
    const draft = await Draft.findById(id)
      .populate('expertConsensus.expertReviews.expertId', 'name email expertise');
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }
    res.json({ success: true, consensus: draft.expertConsensus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== IMPLEMENTATION TRACKING =====

exports.updateImplementation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, budgetSpent, impactScore, notes } = req.body;

    const draft = await Draft.findById(id);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    if (draft.officerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (status) draft.implementationStatus.status = status;
    if (progress !== undefined) draft.implementationStatus.progress = progress;
    if (budgetSpent !== undefined) draft.implementationStatus.budgetSpent = budgetSpent;
    if (impactScore !== undefined) draft.implementationStatus.impactScore = impactScore;
    if (notes) draft.implementationStatus.notes = notes;

    if (status === 'in_progress' && !draft.implementationStatus.startDate) {
      draft.implementationStatus.startDate = new Date();
    }
    if (status === 'completed' && !draft.implementationStatus.completionDate) {
      draft.implementationStatus.completionDate = new Date();
    }

    await draft.save();
    res.json({
      success: true,
      message: 'Implementation updated',
      implementationStatus: draft.implementationStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getImplementation = async (req, res) => {
  try {
    const { id } = req.params;
    const draft = await Draft.findById(id);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }
    res.json({ success: true, implementationStatus: draft.implementationStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== LINK REPORTS =====

exports.linkReportsToDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportIds } = req.body;

    const draft = await Draft.findById(id);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    if (draft.officerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    reportIds.forEach(reportId => {
      if (!draft.citizenReports.includes(reportId)) {
        draft.citizenReports.push(reportId);
      }
    });

    await draft.save();
    res.json({ success: true, message: 'Reports linked', draft });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ONE HEALTH DASHBOARD =====

exports.getOneHealthDashboard = async (req, res) => {
  try {
    const totalDrafts = await Draft.countDocuments({ isDeleted: false });
    const healthDrafts = await Draft.countDocuments({ sector: 'health', isDeleted: false });
    const environmentDrafts = await Draft.countDocuments({ sector: 'environment', isDeleted: false });
    const oneHealthDrafts = await Draft.countDocuments({ sector: 'one_health', isDeleted: false });
    const finalizedDrafts = await Draft.countDocuments({ status: 'finalized', isDeleted: false });
    const underReview = await Draft.countDocuments({ status: 'under_review', isDeleted: false });

    const consensusResult = await Draft.aggregate([
      { $match: { isDeleted: false } },
      { $group: {
        _id: null,
        avgConsensus: { $avg: '$expertConsensus.approvalPercentage' }
      }}
    ]);

    res.json({
      success: true,
      dashboard: {
        totalDrafts: totalDrafts || 0,
        healthDrafts: healthDrafts || 0,
        environmentDrafts: environmentDrafts || 0,
        oneHealthDrafts: oneHealthDrafts || 0,
        finalizedDrafts: finalizedDrafts || 0,
        underReview: underReview || 0,
        averageConsensus: consensusResult[0]?.avgConsensus || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ===== ===== ===== =====
// 🧠 ML PREDICTION - USING FRIEND'S MODEL
// ===== ===== ===== ===== =====

/**
 * Get ML prediction for a draft using friend's health model
 */
exports.getMLPrediction = async (req, res) => {
  try {
    const { id } = req.params;
    const draft = await Draft.findById(id);
    
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    // Import friend's health model
    const healthModel = require('../services/healthModel');
    
    // Run simulation using friend's ML system
    const result = await healthModel.simulateHealthPolicy({
      draftId: id,
      inputs: {
        province: draft.district,
        budget: draft.budgetAmount ? draft.budgetAmount / 10000000 : 3,
        program: draft.subCategory || draft.sector || 'Primary Care',
        description: draft.description || '',
        text: draft.currentVersionText || '',
        title: draft.title || '',
      }
    });
    
    res.json({
      success: true,
      prediction: result,
    });
  } catch (error) {
    console.error('ML Prediction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};