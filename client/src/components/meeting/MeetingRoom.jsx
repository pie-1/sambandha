/**
 * Meeting Room Component
 */

import { useMeeting } from '../../hooks/useMeeting';

const MeetingRoom = ({ draftId }) => {
  const { meeting, isLoading, createMeeting, hasMeeting, meetingLink } = useMeeting(draftId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h4 className="font-serif text-lg text-bodhi-navy mb-4">Meeting Room</h4>
      
      {hasMeeting ? (
        <div>
          <div className="mb-4">
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              Join Meeting 
            </a>
          </div>
          <p className="text-xs text-gray-500">
            Created: {new Date(meeting?.meetingCreatedAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <button
          onClick={createMeeting}
          className="btn-primary"
        >
          Start Meeting 
        </button>
      )}
    </div>
  );
};

export default MeetingRoom;