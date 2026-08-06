/**
 * Main App Component
 */

import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import PublicPolicyList from './pages/public/PublicPolicyList';
import PublicDraftDetail from './pages/public/PublicDraftDetail';
import ProjectTracking from './pages/public/ProjectTracking';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard';
import DraftList from './pages/drafts/DraftList';
import DraftDetail from './pages/drafts/DraftDetail';
import DraftUpload from './pages/drafts/DraftUpload';
import PublicFeedback from './pages/feedback/PublicFeedback';
import SimulatorPage from './pages/simulator/SimulatorPage';

function HealthSimulatorRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/drafts/${id}/simulate?model=health` : '/simulator?model=health'} replace />;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bodhi-cream">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bodhi-cream">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/policies" element={<PublicPolicyList />} />
          <Route path="/policies/:id" element={<PublicDraftDetail />} />
          <Route path="/tracking" element={<ProjectTracking />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-drafts" element={<DraftList />} />
            <Route path="/drafts/:id" element={<DraftDetail />} />
            <Route path="/upload" element={<DraftUpload />} />
            <Route path="/feedback" element={<PublicFeedback />} />
            <Route path="/simulator" element={<SimulatorPage standalone />} />
            <Route path="/drafts/:id/simulate" element={<SimulatorPage />} />
            <Route path="/ml/simulator" element={<HealthSimulatorRedirect />} />
            <Route path="/drafts/:id/ml-simulate" element={<HealthSimulatorRedirect />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;