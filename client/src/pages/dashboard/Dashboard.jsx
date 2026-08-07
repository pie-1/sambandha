/**
 * Dashboard Page
 */

import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';
import DraftList from '../../components/drafts/DraftList';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const { drafts, isLoading } = useDrafts();
  const { t } = useTranslation();

  // Filter drafts based on user role
  const getFilteredDrafts = () => {
    if (user.role === 'officer') {
      return drafts.filter(d => d.officerId?._id === user.id);
    }
    return drafts;
  };

  const filteredDrafts = getFilteredDrafts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-bodhi-navy">
          {t('dashboard.welcome')}, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'officer' && 'Manage your policy drafts and collaborate with experts.'}
          {user.role === 'expert' && 'Review and provide feedback on policy drafts.'}
          {user.role === 'citizen' && 'Share your feedback on finalized policies.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-bodhi-navy text-white">
          <h3 className="font-serif text-xl">Total Drafts</h3>
          <p className="text-3xl font-bold text-bodhi-gold">{filteredDrafts.length}</p>
        </div>
        <div className="card bg-bodhi-maroon text-white">
          <h3 className="font-serif text-xl">Your Role</h3>
          <p className="text-2xl font-bold capitalize">{user?.role}</p>
        </div>
        <div className="card bg-bodhi-gold text-white">
          <h3 className="font-serif text-xl">Status</h3>
          <p className="text-2xl font-bold">Active</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-serif text-bodhi-navy mb-4">
          {user.role === 'officer' ? 'Your Drafts' : 'Recent Drafts'}
        </h2>
        <DraftList 
          drafts={filteredDrafts} 
          isLoading={isLoading}
          emptyMessage={user.role === 'officer' 
            ? "You haven't created any drafts yet. Click 'Upload Draft' to get started!"
            : 'No drafts available at the moment.'
          }
        />
      </div>
    </div>
  );
};

export default Dashboard;