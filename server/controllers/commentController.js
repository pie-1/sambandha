/**
 * Comment Controller
 * Handles comments on drafts
 */

const Comment = require("../models/Comment");
const Draft = require("../models/Draft");

exports.addComment = async (req, res) => {
  try {
    const { text, parentCommentId } = req.body;
    const { draftId } = req.params;

    const draft = await Draft.findById(draftId);
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    const comment = new Comment({
      draftId,
      authorId: req.user.id,
      authorRole: req.user.role,
      text,
      parentCommentId: parentCommentId || null
    });

    await comment.save();

    draft.commentCount += 1;
    await draft.save();

    await comment.populate('authorId', 'name email');

    res.status(201).json({ success: true, message: 'Comment added', comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { draftId } = req.params;

    const comments = await Comment.find({ 
      draftId, 
      isDeleted: false 
    })
      .populate('authorId', 'name email role')
      .sort({ createdAt: 1 });

    // Build thread structure
    const threads = [];
    const commentMap = {};

    comments.forEach(comment => {
      const obj = comment.toObject();
      obj.replies = [];
      commentMap[obj._id] = obj;

      if (obj.parentCommentId) {
        const parent = commentMap[obj.parentCommentId];
        if (parent) {
          parent.replies.push(obj);
        } else {
          threads.push(obj);
        }
      } else {
        threads.push(obj);
      }
    });

    res.json({ success: true, comments: threads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};