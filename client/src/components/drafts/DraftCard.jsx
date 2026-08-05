/**
 * Draft Card Component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const DraftCard = ({ draft }) => {
  const getStatusBadge = (status) => {
    const classes = {
      draft: 'badge-draft',
      under_review: 'badge-review',
      finalized: 'badge-finalized',
    };
    return classes[status] || 'badge-draft';
  };

  return (
    <Link to={`/drafts/${draft._id}`}>
      <div className="card card-hover">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-serif text-bodhi-navy">{draft.title}</h3>
          <span className={`badge ${getStatusBadge(draft.status)}`}>
            {draft.status.replace('_', ' ')}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {draft.description || draft.currentVersionText?.slice(0, 150)}...
        </p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Sector: {draft.sector}</span>
          <span>District: {draft.district}</span>
          <span>{draft.viewCount || 0} views</span>
          <span>{draft.commentCount || 0} comments</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            By {draft.officerId?.name || 'Unknown'}
          </span>
          <span className="text-xs text-gray-500">
            {format(new Date(draft.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default DraftCard;