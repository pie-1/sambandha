import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/public/Home';
import PublicPolicyList from './pages/public/PublicPolicyList';
import PublicDraftDetail from './pages/public/PublicDraftDetail';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard from './pages/dashboard/Dashboard';
import DraftList from './pages/drafts/DraftList';
import DraftDetail from './pages/drafts/DraftDetail';
import DraftUpload from './pages/drafts/DraftUpload';
import ReportProblem from './pages/reports/ReportProblem';
import ParliamentTopics from './pages/parliament/ParliamentTopics';
import SimulatorPage from './pages/simulator/SimulatorPage';


function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 w-full">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/policies" element={<PublicPolicyList />} />
          <Route path="/policies/:id" element={<PublicDraftDetail />} />
          
          
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-drafts" element={<DraftList />} />
            <Route path="/drafts/:id" element={<DraftDetail />} />
            <Route path="/upload" element={<DraftUpload />} />
            <Route path="/report" element={<ReportProblem />} />
            <Route path="/parliament" element={<ParliamentTopics />} />
            <Route path="/simulator/:id" element={<SimulatorPage />} />
          </Route>
          
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;