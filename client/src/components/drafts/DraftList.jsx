/**
 * Draft List Component
 */

import DraftCard from './DraftCard';
import LoadingSpinner from '../common/LoadingSpinner';

const DraftList = ({ drafts, isLoading, emptyMessage = 'No drafts found' }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!drafts || drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {drafts.map((draft) => (
        <DraftCard key={draft._id} draft={draft} />
      ))}
    </div>
  );
};

export default DraftList;