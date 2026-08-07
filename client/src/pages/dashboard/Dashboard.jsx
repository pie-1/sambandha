/**
 * Dashboard Page - One Health Overview with Better Graphs
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';
import { useReports } from '../../hooks/useReports';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, ComposedChart
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { useOneHealthDashboard } = useDrafts();
  const { data: dashboard, isLoading: dashboardLoading } = useOneHealthDashboard();
  const { summary, summaryLoading, stats, topDistricts, reports } = useReports();

  if (dashboardLoading || summaryLoading) return <LoadingSpinner />;

  const totalDrafts = dashboard?.totalDrafts || 0;
  const healthDrafts = dashboard?.healthDrafts || 0;
  const environmentDrafts = dashboard?.environmentDrafts || 0;
  const oneHealthDrafts = dashboard?.oneHealthDrafts || 0;
  const finalizedDrafts = dashboard?.finalizedDrafts || 0;
  const underReview = dashboard?.underReview || 0;
  const avgConsensus = dashboard?.averageConsensus || 0;
  const totalReports = summary?.totalReports || 0;
  const criticalReports = summary?.criticalReports || 0;
  const districtsAffected = summary?.districtsAffected || 0;

  // Sector Data for Pie Chart
  const sectorData = [
    { name: 'Health', value: healthDrafts || 1, color: '#2E86C1' },
    { name: 'Environment', value: environmentDrafts || 1, color: '#27AE60' },
    { name: 'One Health', value: oneHealthDrafts || 1, color: '#D4AC0D' },
  ];

  // Status Data for Bar Chart
  const statusData = [
    { name: 'Draft', value: totalDrafts - underReview - finalizedDrafts || 1, color: '#7F8C8D' },
    { name: 'Under Review', value: underReview || 1, color: '#F39C12' },
    { name: 'Finalized', value: finalizedDrafts || 1, color: '#27AE60' },
  ];

  // Reports by Category (from stats)
  const reportCategoryData = stats?.length > 0 ? stats.map(s => ({
    name: s._id || 'Other',
    count: s.count || 0,
    critical: s.critical || 0,
  })) : [];

  // District Report Data
  const districtReportData = topDistricts?.slice(0, 8).map(d => ({
    name: d._id || 'Unknown',
    reports: d.count || 0,
    critical: d.critical || 0,
  })) || [];

  // Recent Reports (for activity feed)
  const recentReports = reports?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-bodhi-navy to-bodhi-navy-deep text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-white/70 mt-1 text-sm">
          {user?.role === 'officer' && 'Manage One Health policies and track implementation'}
          {user?.role === 'expert' && 'Review health policies and provide expert consensus'}
          {user?.role === 'citizen' && 'Report problems and vote on policies in your community'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-bodhi-navy">{totalDrafts}</div>
          <div className="text-xs text-gray-500">Total Policies</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-sambandh-brass">{avgConsensus?.toFixed(0) || 0}%</div>
          <div className="text-xs text-gray-500">Expert Consensus</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-600">{totalReports}</div>
          <div className="text-xs text-gray-500">Citizen Reports</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-red-600">{criticalReports}</div>
          <div className="text-xs text-gray-500">Critical Issues</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-bodhi-navy mb-4">Policies by Sector</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-bodhi-navy mb-4">Policies by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1A5276" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by District */}
        {districtReportData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-bodhi-navy mb-4">Reports by District</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtReportData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="reports" fill="#2E86C1" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="critical" fill="#E74C3C" radius={[0, 4, 4, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* One Health Summary */}
        {summary && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-bodhi-navy mb-4">One Health Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{summary.healthReports || 0}</div>
                <div className="text-xs text-gray-500">Health Issues</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{summary.environmentReports || 0}</div>
                <div className="text-xs text-gray-500">Environment Issues</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{summary.criticalReports || 0}</div>
                <div className="text-xs text-gray-500">Critical Issues</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{summary.districtsAffected || 0}</div>
                <div className="text-xs text-gray-500">Districts Affected</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentReports.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-bodhi-navy mb-4">Recent Citizen Reports</h3>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-bodhi-navy">{report.title}</p>
                  <p className="text-xs text-gray-500">{report.district} • {report.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                  report.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {report.urgency || 'Medium'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {user?.role === 'citizen' && (
          <Link to="/report" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="text-2xl mb-1">📢</div>
            <h4 className="font-semibold text-sm">Report Problem</h4>
          </Link>
        )}
        {(user?.role === 'officer' || user?.role === 'expert') && (
          <Link to="/parliament" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="text-2xl mb-1">🏛️</div>
            <h4 className="font-semibold text-sm">Parliament</h4>
          </Link>
        )}
        <Link to="/policies" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
          <div className="text-2xl mb-1">📋</div>
          <h4 className="font-semibold text-sm">All Policies</h4>
        </Link>
        {user?.role === 'officer' && (
          <Link to="/upload" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="text-2xl mb-1">📝</div>
            <h4 className="font-semibold text-sm">Create Draft</h4>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;