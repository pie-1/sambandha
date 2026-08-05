/**
 * Comment Thread Component
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

const CommentThread = ({ comments, onAddComment, isLoading }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment({ text: newComment, parentCommentId: replyingTo });
    setNewComment('');
    setReplyingTo(null);
  };

  const renderComment = (comment, depth = 0) => {
    const isReply = depth > 0;
    
    return (
      <div key={comment._id} className={`${isReply ? 'comment-thread' : ''} mb-4`}>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-bodhi-navy">{comment.authorId?.name}</span>
            <span className={`badge badge-${comment.authorRole}`}>
              {comment.authorRole}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
            </span>
          </div>
          <p className="text-gray-700">{comment.text}</p>
          
          {user && (user.role === 'officer' || user.role === 'expert') && (
            <button
              onClick={() => setReplyingTo(comment._id)}
              className="text-xs text-bodhi-gold hover:underline mt-2"
            >
              Reply
            </button>
          )}
        </div>
        
        {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      {(user?.role === 'officer' || user?.role === 'expert') && (
        <form onSubmit={handleSubmit} className="mb-6">
          {replyingTo && (
            <div className="mb-2 text-sm text-bodhi-gold">
              Replying to comment...
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comment..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary" disabled={isLoading}>
              Post
            </button>
          </div>
        </form>
      )}

      {/* Comments */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No comments yet</p>
      ) : (
        comments.map((comment) => renderComment(comment))
      )}
    </div>
  );
};

export default CommentThread;