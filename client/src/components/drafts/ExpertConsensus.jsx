/**
 * Expert Consensus Component - Only Experts can vote
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle, XCircle, Users, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';

const ExpertConsensus = ({ consensus, draftId, onConsensus, isExpert }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [selected, setSelected] = useState(null);

  if (!consensus) return null;

  const { totalExperts, approvedCount, approvalPercentage, expertReviews } = consensus;

  const handleConsensus = async (approved) => {
    setSelected(approved);
    await onConsensus(approved, comment);
    setComment('');
  };

  // Check if current user already reviewed
  const hasReviewed = expertReviews?.some(r => r.expertId?._id === user?.id);

  return (
    <div className="card border-l-4 border-sdg-gold">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-5 h-5 text-sdg-gold" />
        <h3 className="font-semibold text-sdg-blue">🔬 Expert Consensus</h3>
        <span className="text-xs bg-sdg-gold/10 text-sdg-gold px-2 py-0.5 rounded-full">STEP 4</span>
      </div>

      {/* Overall Consensus */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold ${
            approvalPercentage >= 70 ? 'text-green-600' :
            approvalPercentage >= 40 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {approvalPercentage.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-500">
            {approvedCount} of {totalExperts} experts approve
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-500 ${
            approvalPercentage >= 70 ? 'bg-green-500' :
            approvalPercentage >= 40 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${approvalPercentage}%` }}
        />
      </div>

      {/* Expert Voting - Only for Experts who haven't voted */}
      {isExpert && !hasReviewed && (
        <div className="mb-4 p-4 bg-sdg-blue/5 rounded-lg">
          <p className="text-sm font-medium text-sdg-blue mb-3">Cast Your Expert Vote</p>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => handleConsensus(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                selected === true ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              <ThumbsUp className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => handleConsensus(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                selected === false ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <ThumbsDown className="w-4 h-4" /> Disapprove
            </button>
          </div>
          <textarea
            className="input-field text-sm"
            placeholder="Add your expert comment (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="2"
          />
        </div>
      )}

      {hasReviewed && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">✅ You have already reviewed this policy</p>
        </div>
      )}

      {/* Expert Reviews */}
      {expertReviews && expertReviews.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-sdg-blue">Expert Reviews</p>
          {expertReviews.map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-sdg-blue">
                    {review.expertId?.name || 'Expert'}
                  </span>
                  {review.approved ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${review.approved ? 'text-green-600' : 'text-red-600'}`}>
                    {review.approved ? 'Approved' : 'Disapproved'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.reviewedAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mt-1">💬 {review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpertConsensus;