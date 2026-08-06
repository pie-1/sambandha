/**
 * Public Policy List - No Login Required
 * Browse all policies
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDrafts } from '../../hooks/useDrafts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PriorityBoard from '../../components/priorities/PriorityBoard';

const PublicPolicyList = () => {
  const [filters, setFilters] = useState({});
  const { drafts, isLoading } = useDrafts(filters);

  const getStatusBadge = (status) => {
    const classes = {
      draft: 'badge-draft',
      under_review: 'badge-review',
      finalized: 'badge-finalized',
    };
    return classes[status] || 'badge-draft';
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif text-bodhi-navy">📋 Policies</h1>
        <p className="text-gray-600 mt-2">
          Browse and review policy drafts and finalized policies from across Nepal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-bodhi-navy">Filter by:</span>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
            className="input-field w-40"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="under_review">Under Review</option>
            <option value="finalized">Finalized</option>
          </select>
          
          <select
            value={filters.sector || ''}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value || undefined })}
            className="input-field w-40"
          >
            <option value="">All Sectors</option>
            <option value="budget">Budget</option>
            <option value="development">Development</option>
            <option value="agriculture">Agriculture</option>
            <option value="education">Education</option>
            <option value="health">Health</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="tourism">Tourism</option>
          </select>

          <button
            onClick={() => setFilters({})}
            className="text-sm text-bodhi-gold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner />
      ) : drafts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500">No policies found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drafts.map((draft) => (
            <Link to={`/policies/${draft._id}`} key={draft._id}>
              <div className="card card-hover">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-serif text-bodhi-navy line-clamp-1">
                    {draft.title}
                  </h3>
                  <span className={`badge ${getStatusBadge(draft.status)}`}>
                    {draft.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {draft.description || draft.currentVersionText?.slice(0, 150)}...
                </p>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">📂 {draft.sector}</span>
                  <span>📍 {draft.district}</span>
                  <span>👁️ {draft.viewCount || 0}</span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    By {draft.officerId?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(draft.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
        </div>

        {/* District priorities board */}
        <div>
          <PriorityBoard />
        </div>
      </div>
    </div>
  );
};

export default PublicPolicyList;