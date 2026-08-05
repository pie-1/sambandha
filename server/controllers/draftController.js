/**
 * Draft Controller
 * Handles CRUD operations for drafts
 */

const Draft = require("../models/Draft");

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