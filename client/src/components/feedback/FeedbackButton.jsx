/**
 * Feedback Button Component
 */

import React, { useState } from 'react';

const FeedbackButton = ({ onFeedback, isLoading }) => {
  const [selected, setSelected] = useState(null);

  const handleClick = (reaction) => {
    setSelected(reaction);
    onFeedback(reaction);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleClick('approve')}
        disabled={isLoading}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          selected === 'approve'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
        }`}
      >
        👍 Approve
      </button>
      <button
        onClick={() => handleClick('disapprove')}
        disabled={isLoading}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          selected === 'disapprove'
            ? 'bg-red-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
        }`}
      >
        👎 Disapprove
      </button>
    </div>
  );
};

export default FeedbackButton;