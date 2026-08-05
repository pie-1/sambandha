/**
 * Public Feedback Page
 */

import React, { useState } from 'react';
import { useDrafts } from '../../hooks/useDrafts';
import { useFeedback } from '../../hooks/useFeedback';
import DraftList from '../../components/drafts/DraftList';
import FeedbackSummary from '../../components/feedback/FeedbackSummary';
import FeedbackButton from '../../components/feedback/FeedbackButton';
import toast from 'react-hot-toast';

const PublicFeedback = () => {
  const { drafts, isLoading } = useDrafts({ status: 'finalized' });
  const [selectedDraft, setSelectedDraft] = useState(null);
  const { summary, submitFeedback } = useFeedback(selectedDraft?._id);

  const handleFeedback = async (reaction) => {
    if (!selectedDraft) return;

    const phone = prompt('Please enter your phone number for verification:');
    if (!phone) return;
    
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    await submitFeedback.mutateAsync({ phone, reaction });
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-bodhi-navy mb-6">Public Feedback</h1>
      <p className="text-gray-600 mb-8">
        Review finalized policies and share your opinion by approving or disapproving.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-serif text-bodhi-navy mb-4">Finalized Policies</h2>
          <DraftList 
            drafts={drafts} 
            isLoading={isLoading}
            emptyMessage="No finalized policies available for feedback."
          />
        </div>

        <div>
          {selectedDraft ? (
            <div className="card sticky top-24">
              <h3 className="text-xl font-serif text-bodhi-navy mb-2">
                {selectedDraft.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedDraft.sector} • {selectedDraft.district}
              </p>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 line-clamp-4">
                  {selectedDraft.currentVersionText}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-bodhi-navy mb-3">Submit Your Feedback</h4>
                <FeedbackButton onFeedback={handleFeedback} />
              </div>

              <FeedbackSummary summary={summary} />

              <button
                onClick={() => setSelectedDraft(null)}
                className="mt-4 text-sm text-bodhi-gold hover:underline"
              >
                ← Choose a different policy
              </button>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">
                Select a policy from the list to provide your feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicFeedback;