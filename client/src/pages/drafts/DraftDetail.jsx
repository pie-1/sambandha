/**
 * Draft Detail Page - Full Feature Integration
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';
import { useComments } from '../../hooks/useComments';
import { useFeedback } from '../../hooks/useFeedback';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ExpertConsensus from '../../components/drafts/ExpertConsensus';
import ImplementationTracker from '../../components/drafts/ImplementationTracker';
import MeetingRoom from '../../components/meeting/MeetingRoom';
import { format } from 'date-fns';

const DraftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useDraft, updateDraft, finalizeDraft, updateConsensus } = useDrafts();
  const { data: draft, isLoading } = useDraft(id);
  const { comments, addComment } = useComments(id);
  const { summary, submitFeedback } = useFeedback(id);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [consensusComment, setConsensusComment] = useState('');

  if (isLoading) return <LoadingSpinner />;
  if (!draft) return <div className="text-center py-12">Draft not found</div>;

  const canEdit = user?.role === 'officer' || user?.role === 'expert';
  const canFinalize = user?.role === 'officer' && draft.officerId?._id === user.id;
  const isFinalized = draft.status === 'finalized';
  const isExpert = user?.role === 'expert';
  const isOfficer = user?.role === 'officer';

  const handleUpdate = async () => {
    await updateDraft.mutateAsync({ id, currentVersionText: editText });
    setIsEditing(false);
  };

  const handleFinalize = async () => {
    if (window.confirm('Are you sure you want to finalize this draft?')) {
      await finalizeDraft.mutateAsync(id);
    }
  };

  const handleConsensus = async (approved) => {
    await updateConsensus.mutateAsync({
      id,
      approved,
      comment: consensusComment || undefined,
    });
    setConsensusComment('');
  };

  const handleFeedback = async (reaction) => {
    const phone = prompt('Enter your phone number for verification:');
    if (!phone) return;
    if (!/^[0-9]{10}$/.test(phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    await submitFeedback.mutateAsync({ phone, reaction });
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment.mutateAsync({ text: newComment });
    setNewComment('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-bodhi-navy hover:text-sambandh-brass transition text-sm"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-serif text-bodhi-navy">{draft.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                draft.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                draft.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {draft.status.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">{draft.sector}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{draft.district}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && !isFinalized && (
              <button
                onClick={() => { setIsEditing(true); setEditText(draft.currentVersionText); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Edit Draft
              </button>
            )}
            {canFinalize && !isFinalized && (
              <button
                onClick={handleFinalize}
                className="px-4 py-2 bg-bodhi-navy text-white rounded-lg text-sm hover:bg-bodhi-navy-deep transition"
              >
                Finalize
              </button>
            )}
            {(isOfficer || isExpert) && (
              <button
                onClick={() => navigate(`/simulator/${id}`)}
                className="px-4 py-2 bg-sambandh-brass text-white rounded-lg text-sm hover:bg-sambandh-brass-light transition"
              >
                Run Simulation
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <span>By {draft.officerId?.name || 'Unknown'}</span>
          <span className="mx-2">•</span>
          <span>{format(new Date(draft.createdAt), 'MMM d, yyyy')}</span>
          <span className="mx-2">•</span>
          <span>{draft.viewCount || 0} views</span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {isEditing ? (
          <div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass min-h-[200px]"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <button onClick={handleUpdate} className="px-4 py-2 bg-bodhi-navy text-white rounded-lg hover:bg-bodhi-navy-deep transition">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {draft.currentVersionText}
            </p>
            {draft.budgetAmount && (
              <div className="mt-4 p-3 bg-sambandh-brass/10 rounded-lg border border-sambandh-brass/20">
                <p className="text-bodhi-navy font-medium">
                  Budget: NPR {draft.budgetAmount.toLocaleString()}
                </p>
              </div>
            )}
            {draft.expectedImpact && (draft.expectedImpact.healthImpact || draft.expectedImpact.environmentalImpact || draft.expectedImpact.communityImpact) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {draft.expectedImpact.healthImpact && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-medium">Health Impact</p>
                    <p className="text-sm text-gray-700">{draft.expectedImpact.healthImpact}</p>
                  </div>
                )}
                {draft.expectedImpact.environmentalImpact && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">Environmental Impact</p>
                    <p className="text-sm text-gray-700">{draft.expectedImpact.environmentalImpact}</p>
                  </div>
                )}
                {draft.expectedImpact.communityImpact && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">Community Impact</p>
                    <p className="text-sm text-gray-700">{draft.expectedImpact.communityImpact}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Expert Matching & Meeting */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-serif text-lg text-bodhi-navy mb-4">👨‍🔬 Expert Matching</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-bodhi-navy">Find Experts</p>
            <p className="text-xs text-gray-500 mt-1">Match experts based on policy sector</p>
            <button className="mt-2 px-4 py-1.5 bg-bodhi-navy text-white text-sm rounded-lg hover:bg-bodhi-navy-deep transition">
              Find Matching Experts
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-bodhi-navy">Start Meeting</p>
            <p className="text-xs text-gray-500 mt-1">Begin live discussion with experts</p>
            <button 
              onClick={() => {
                const meetingSection = document.getElementById('meeting-section');
                if (meetingSection) {
                  meetingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="mt-2 px-4 py-1.5 bg-sambandh-brass text-white text-sm rounded-lg hover:bg-sambandh-brass-light transition"
            >
              Start Meeting
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          💡 Experts will be notified when you start a meeting
        </div>
      </div>

      {/* Expert Consensus */}
      <ExpertConsensus
        consensus={draft.expertConsensus}
        draftId={draft._id}
        onConsensus={handleConsensus}
        isExpert={isExpert}
      />

      {/* Meeting Room */}
      <div id="meeting-section">
        <MeetingRoom draftId={draft._id} />
      </div>

      {/* Implementation Tracking */}
      {draft.status === 'finalized' && (
        <ImplementationTracker
          implementation={draft.implementationStatus}
          draftId={draft._id}
          isOfficer={canFinalize}
        />
      )}

      {/* Versions */}
      {draft.versions?.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-serif text-lg text-bodhi-navy mb-4">Version History</h3>
          <div className="space-y-3">
            {draft.versions.map((v, i) => (
              <div key={i} className="pl-4 pb-4 border-l-2 border-gray-200 last:border-0">
                <p className="font-medium text-bodhi-navy">Version {v.versionNumber}</p>
                <p className="text-sm text-gray-600 mt-1">{v.text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  By {v.editedBy?.name || 'Unknown'} • {format(new Date(v.editedAt), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-serif text-lg text-bodhi-navy mb-4">
          Comments ({comments.length})
        </h3>
        
        {(user?.role === 'officer' || user?.role === 'expert') && (
          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="px-4 py-2 bg-bodhi-navy text-white rounded-lg hover:bg-bodhi-navy-deep transition">
              Post
            </button>
          </form>
        )}

        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-bodhi-navy">{comment.authorId?.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    comment.authorRole === 'officer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {comment.authorRole}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feedback */}
      {isFinalized && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-serif text-lg text-bodhi-navy mb-4">Public Feedback</h3>
          {user?.role === 'citizen' && (
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleFeedback('approve')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Approve
              </button>
              <button
                onClick={() => handleFeedback('disapprove')}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Disapprove
              </button>
            </div>
          )}
          
          {summary && (
            <div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{summary.approve || 0}</div>
                  <div className="text-xs text-gray-500">Approve</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{summary.disapprove || 0}</div>
                  <div className="text-xs text-gray-500">Disapprove</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-bodhi-navy">{summary.total || 0}</div>
                  <div className="text-xs text-gray-500">Total Votes</div>
                </div>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${summary.approvePercentage || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{summary.approvePercentage?.toFixed(0)}% Approve</span>
                <span>{summary.disapprovePercentage?.toFixed(0)}% Disapprove</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ ADD DEFAULT EXPORT AT THE BOTTOM
export default DraftDetail;