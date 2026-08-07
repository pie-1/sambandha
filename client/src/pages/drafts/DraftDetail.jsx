/**
 * Draft Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDrafts } from '../../hooks/useDrafts';
import { useComments } from '../../hooks/useComments';
import { useFeedback } from '../../hooks/useFeedback';
import { useAuth } from '../../hooks/useAuth';
import CommentThread from '../../components/drafts/CommentThread';
import FeedbackSummary from '../../components/feedback/FeedbackSummary';
import FeedbackButton from '../../components/feedback/FeedbackButton';
import MeetingRoom from '../../components/meeting/MeetingRoom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DraftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useDraft, updateDraft, finalizeDraft } = useDrafts();
  const { data: draft, isLoading: draftLoading } = useDraft(id);
  const { comments, isLoading: commentsLoading, addComment } = useComments(id);
  const { summary, submitFeedback } = useFeedback(id);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  if (draftLoading) return <LoadingSpinner />;
  if (!draft) return <div className="text-center py-12">Draft not found</div>;

  const canEdit = user.role === 'officer' || user.role === 'expert';
  const canFinalize = user.role === 'officer' && draft.officerId?._id === user.id;
  const isFinalized = draft.status === 'finalized';

  const handleUpdate = async () => {
    const result = await updateDraft.mutateAsync({ id, currentVersionText: editText });
    if (result) {
      setIsEditing(false);
    }
  };

  const handleFinalize = async () => {
    if (window.confirm('Are you sure you want to finalize this draft?')) {
      await finalizeDraft.mutateAsync(id);
    }
  };

  const handleFeedback = async (reaction) => {
    const phone = prompt('Please enter your phone number for verification:');
    if (!phone) return;
    
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    await submitFeedback.mutateAsync({ phone, reaction });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif text-bodhi-navy">{draft.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge badge-${draft.status}`}>
              {draft.status.replace('_', ' ')}
            </span>
            <span className="text-sm text-gray-500">Sector: {draft.sector}</span>
            <span className="text-sm text-gray-500">District: {draft.district}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && !isFinalized && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditText(draft.currentVersionText);
              }}
              className="btn-secondary"
            >
              Edit Draft
            </button>
          )}
          {canFinalize && !isFinalized && (
            <button onClick={handleFinalize} className="btn-success">
              Finalize
            </button>
          )}
          {(user.role === 'officer' || user.role === 'expert') && (
            <button
              onClick={() =>
                navigate(
                  `/drafts/${id}/simulate${draft.sector === 'health' ? '?model=health' : ''}`
                )
              }
              className="btn-outline"
            >
              Run Simulation
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card">
        {isEditing ? (
          <div>
            <textarea
              className="input-field min-h-[200px]"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <button onClick={handleUpdate} className="btn-primary">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="whitespace-pre-wrap text-gray-700">{draft.currentVersionText}</p>
            {draft.budgetAmount && (
              <p className="mt-4 text-bodhi-navy font-medium">
                Budget: NPR {draft.budgetAmount.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Versions */}
      {draft.versions?.length > 0 && (
        <div className="card">
          <h3 className="font-serif text-lg text-bodhi-navy mb-4">Version History</h3>
          <div className="space-y-4">
            {draft.versions.map((version, index) => (
              <div key={index} className="timeline-item">
                <p className="font-medium text-bodhi-navy">Version {version.versionNumber}</p>
                <p className="text-sm text-gray-600 mt-1">{version.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Edited by {version.editedBy?.name || 'Unknown'} on{' '}
                  {format(new Date(version.editedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meeting */}
      <MeetingRoom draftId={id} />

      {/* Comments */}
      <div className="card">
        <h3 className="font-serif text-lg text-bodhi-navy mb-4">
          Comments ({comments.length})
        </h3>
        <CommentThread
          comments={comments}
          onAddComment={addComment.mutateAsync}
          isLoading={commentsLoading}
        />
      </div>

      {/* Feedback */}
      {isFinalized && (
        <div className="card">
          <h3 className="font-serif text-lg text-bodhi-navy mb-4">Public Feedback</h3>
          {user.role === 'citizen' && (
            <div className="mb-6">
              <FeedbackButton onFeedback={handleFeedback} />
            </div>
          )}
          <FeedbackSummary summary={summary} />
        </div>
      )}
    </div>
  );
};

export default DraftDetail;