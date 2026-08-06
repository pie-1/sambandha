/**
 * Simulator Page — draft-linked or standalone
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDrafts } from '../../hooks/useDrafts';
import PolicyImpactSimulator from '../../components/simulator/PolicyImpactSimulator';
import { resolveInitialInputsFromDraft } from '../../lib/simulation/mappings';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SimulatorPage = ({ standalone = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useDraft } = useDrafts();
  const { data: draft, isLoading } = useDraft(standalone ? undefined : id);

  if (!standalone && isLoading) return <LoadingSpinner />;
  if (!standalone && !draft) {
    return <div className="py-12 text-center">Draft not found</div>;
  }

  const initial = resolveInitialInputsFromDraft(standalone ? null : draft);

  return (
    <PolicyImpactSimulator
      draftId={standalone ? null : id}
      draftTitle={standalone ? null : draft.title}
      initialProvince={initial.province}
      initialSectorIdx={initial.sectorIdx}
      initialBudget={initial.budget}
      onBack={
        standalone
          ? () => navigate('/dashboard')
          : () => navigate(`/drafts/${id}`)
      }
    />
  );
};

export default SimulatorPage;
