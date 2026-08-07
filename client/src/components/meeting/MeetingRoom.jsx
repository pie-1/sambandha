/**
 * Meeting Room Component - For Officers & Experts Collaboration
 */

import React from 'react';
import { useMeeting } from '../../hooks/useMeeting';
import { useAuth } from '../../hooks/useAuth';

const MeetingRoom = ({ draftId }) => {
  const { user } = useAuth();
  const { meeting, isLoading, createMeeting, deleteMeeting, hasMeeting, meetingLink } = useMeeting(draftId);

  // Only show for Officers and Experts
  if (!user || (user.role !== 'officer' && user.role !== 'expert')) {
    return null;
  }

  const handleCreateMeeting = () => {
    createMeeting.mutate();
  };

  const handleDeleteMeeting = () => {
    if (window.confirm('Are you sure you want to end this meeting?')) {
      deleteMeeting.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-center p-4">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-l-4 border-l-sambandh-brass">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg">🎥</span>
        <h3 className="font-semibold text-bodhi-navy">Live Collaboration</h3>
        <span className="text-xs bg-sambandh-brass/10 text-sambandh-brass px-2 py-0.5 rounded-full">Officers & Experts</span>
      </div>
      
      {hasMeeting ? (
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-sambandh-brass text-white rounded-lg font-semibold hover:bg-sambandh-brass-light transition inline-block"
            >
              Join Meeting
            </a>
            {user?.role === 'officer' && (
              <button
                onClick={handleDeleteMeeting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                End Meeting
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Created: {new Date(meeting?.meetingCreatedAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Officers + Experts discussion
          </p>
        </div>
      ) : (
        <div>
          <button
            onClick={handleCreateMeeting}
            className="px-5 py-2.5 bg-bodhi-navy text-white rounded-lg font-semibold hover:bg-bodhi-navy-deep transition"
          >
            Start Discussion
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Start a live discussion with officers and experts
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;