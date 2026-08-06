/**
 * Simulator Page — unified single-page simulation lab.
 * Draft-linked or standalone; the health sector can be pre-selected
 * via ?model=health (legacy deep links).
 */

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDrafts } from '../../hooks/useDrafts';
import UnifiedSimulator from '../../components/simulator/UnifiedSimulator';
import { resolveInitialInputsFromDraft } from '../../lib/simulation/mappings';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SimulatorPage = ({ standalone = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { useDraft } = useDrafts();
  const { data: draft, isLoading } = useDraft(standalone ? undefined : id);

  if (!standalone && isLoading) return <LoadingSpinner />;
  if (!standalone && !draft) {
    return <div className="py-12 text-center">Draft not found</div>;
  }

  const initial = resolveInitialInputsFromDraft(standalone ? null : draft);
  const preferHealth =
    searchParams.get('model') === 'health' || (!standalone && draft?.sector === 'health');

  return (
    <UnifiedSimulator
      draftId={standalone ? null : id}
      draftTitle={standalone ? null : draft.title}
      initialProvince={initial.province}
      initialSectorIdx={initial.sectorIdx}
      initialBudget={initial.budget}
      preferHealth={preferHealth}
      onBack={standalone ? () => navigate('/dashboard') : () => navigate(`/drafts/${id}`)}
    />
  );
};

export default SimulatorPage;
