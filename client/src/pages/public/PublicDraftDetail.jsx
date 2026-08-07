/**
 * Public Draft Detail - No Login Required
 * Read-only view for non-logged in users
 */

import { useParams, Link } from 'react-router-dom';
import { useDrafts } from '../../hooks/useDrafts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FeedbackSummary from '../../components/feedback/FeedbackSummary';
import { useFeedback } from '../../hooks/useFeedback';

const PublicDraftDetail = () => {
  const { id } = useParams();
  const { useDraft } = useDrafts();
  const { data: draft, isLoading } = useDraft(id);
  const { summary } = useFeedback(id);

  if (isLoading) return <LoadingSpinner />;
  if (!draft) return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-serif text-bodhi-navy mb-2">Policy Not Found</h2>
      <p className="text-gray-500 mb-4">The policy you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/policies" className="btn-primary inline-block">
        Browse All Policies
      </Link>
    </div>
  );

  const getStatusBadge = (status) => {
    const classes = {
      draft: 'badge-draft',
      under_review: 'badge-review',
      finalized: 'badge-finalized',
    };
    return classes[status] || 'badge-draft';
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link to="/policies" className="text-bodhi-gold hover:underline mb-4 inline-flex items-center gap-2">
        ← Back to Policies
      </Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif text-bodhi-navy">{draft.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`badge ${getStatusBadge(draft.status)}`}>
                {draft.status.replace('_', ' ')}
              </span>
              <span className="badge badge-officer">{draft.sector}</span>
              <span className="text-sm text-gray-500">📍 {draft.district}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500 text-right">
            <div>By {draft.officerId?.name || 'Unknown'}</div>
            <div>{new Date(draft.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-serif text-lg text-bodhi-navy mb-3">Policy Content</h3>
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {draft.currentVersionText}
          </p>
        </div>
        {draft.budgetAmount && (
          <div className="mt-4 p-4 bg-bodhi-gold/10 rounded-lg border border-bodhi-gold/20">
            <p className="text-bodhi-navy font-medium">
              💰 Budget: NPR {draft.budgetAmount.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {draft.status === 'finalized' && (
        <div className="card">
          <h3 className="font-serif text-lg text-bodhi-navy mb-4">🗳️ Public Feedback</h3>
          <FeedbackSummary summary={summary} />
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              💡 Want to vote on this policy? 
              <Link to="/login" className="text-bodhi-gold hover:underline ml-1">
                Login
              </Link>
              {' or '}
              <Link to="/register" className="text-bodhi-gold hover:underline">
                Register
              </Link>
              {' as a citizen to share your voice.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDraftDetail;