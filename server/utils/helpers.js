/**
 * Helper Utilities
 * 
 * Common helper functions used across the app
 */

// Generate random meeting ID
const generateMeetingId = (draftId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `Sambandh-${draftId}-${timestamp}-${random}`;
};

// Format response data
const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Get role display name
const getRoleDisplay = (role) => {
  const roleMap = {
    officer: 'Government Officer',
    expert: 'Subject Matter Expert',
    citizen: 'Citizen'
  };
  return roleMap[role] || role;
};

// Get status display name
const getStatusDisplay = (status) => {
  const statusMap = {
    draft: 'Draft',
    under_review: 'Under Review',
    finalized: 'Finalized'
  };
  return statusMap[status] || status;
};

// Get reaction display
const getReactionDisplay = (reaction) => {
  const reactionMap = {
    approve: '👍 Approved',
    disapprove: '👎 Disapproved'
  };
  return reactionMap[reaction] || reaction;
};

// Generate version number
const getNextVersionNumber = (versions) => {
  return versions ? versions.length + 1 : 1;
};

module.exports = {
  generateMeetingId,
  formatResponse,
  getRoleDisplay,
  getStatusDisplay,
  getReactionDisplay,
  getNextVersionNumber,
};