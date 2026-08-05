/**
 * Draft List Page
 */

import React, { useState } from 'react';
import { useDrafts } from '../../hooks/useDrafts';
import DraftList from '../../components/drafts/DraftList';
import { useTranslation } from 'react-i18next';

const DraftListPage = () => {
  const [filters, setFilters] = useState({});
  const { drafts, isLoading } = useDrafts(filters);
  const { t } = useTranslation();

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif text-bodhi-navy">{t('nav.policies')}</h1>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            name="status"
            onChange={handleFilterChange}
            className="input-field w-40"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="under_review">Under Review</option>
            <option value="finalized">Finalized</option>
          </select>
          
          <select
            name="sector"
            onChange={handleFilterChange}
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
        </div>
      </div>

      <DraftList drafts={drafts} isLoading={isLoading} />
    </div>
  );
};

export default DraftListPage;