const Draft = require("../models/Draft");

const generateMeetingLink = (draftId) => {
  const roomName = `Sambandh-${draftId}-${Date.now()}`;
  return `https://meet.jit.si/${roomName}`;
};

exports.createMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const draft = await Draft.findById(id);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

if (!['officer', 'expert'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only officers and experts can create meetings' 
      });
    }

    if (draft.meetingLink) {
      return res.json({ 
        success: true, 
        message: 'Meeting already exists', 
        meetingLink: draft.meetingLink 
      });
    }

    const meetingLink = generateMeetingLink(draft._id);

    draft.meetingLink = meetingLink;
    draft.meetingCreatedAt = new Date();
    draft.meetingCreatedBy = req.user.id;
    await draft.save();

    res.json({ 
      success: true, 
      message: 'Meeting created successfully', 
      meetingLink 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const draft = await Draft.findById(id);

    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    res.json({ 
      success: true, 
      meetingLink: draft.meetingLink,
      meetingCreatedAt: draft.meetingCreatedAt,
      meetingCreatedBy: draft.meetingCreatedBy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const draft = await Draft.findById(id);

    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }
 
    if (draft.officerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    draft.meetingLink = null;
    draft.meetingCreatedAt = null;
    draft.meetingCreatedBy = null;
    await draft.save();

    res.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};