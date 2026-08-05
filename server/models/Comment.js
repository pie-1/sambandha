/**
 * Comment Model
 * Threaded comments on drafts
 */

const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  draftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draft', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, enum: ['officer', 'expert'], required: true },
  text: { type: String, required: true, trim: true },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);