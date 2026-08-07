/**
 * ProjectTracking — transparency dashboard (public)
 * Every provincial capital project, no login: status mix, capital by
 * province/sector, completion health, and a filterable ledger.
 */

import { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

const SECTORS = [
  'Roads & Bridges', 'Education Infrastructure', 'Health & Nutrition',
  'Agriculture & Irrigation', 'Water & Sanitation', 'Rural Electrification',
  'Local Governance Capacity', 'Tourism & Culture',
];

const STATUS_COLORS = { Completed: '#16a34a', Ongoing: '#d97706', Delayed: '#dc2626' };
const BAR_COLORS = ['#b8860b', '#1e3a8a', '#0d9488', '#7c3aed', '#db2777', '#65a30d', '#c2410c'];

const ProjectTracking = () => {
  const [filters, setFilters] = useState({});
  const { projects, stats, projectsLoading, statsLoading } = useProjects(filters);

  const statusData = stats?.byStatus?.map((s) => ({
    name: s.status,
    value: s.count,
  })) || [];

  const provinceData = stats?.byProvince?.map((p, idx) => ({
    name: p.province,
    budget: p.budget,
    completion: p.completion,
    color: BAR_COLORS[idx % BAR_COLORS.length],
  })) || [];

  const sectorData = stats?.bySector?.map((s, idx) => ({
    name: s.sector.split(' ')[0],
    budget: s.budget,
    completion: s.completion,
    color: BAR_COLORS[idx % BAR_COLORS.length],
  })) || [];

  const statCards = stats?.stats ? [
    { label: 'Total Projects', value: stats.stats.totalProjects, icon: '🏗' },
    { label: 'Capital (NPR crore)', value: stats.stats.totalCapital?.toFixed(0), icon: '💰' },
    { label: 'Avg Completion', value: `${stats.stats.avgCompletion?.toFixed(1)}%`, icon: '✅' },
    { label: 'Avg Cost Overrun', value: `${stats.stats.avgOverrun?.toFixed(1)}%`, icon: '⚠️' },
    { label: 'Jobs Created', value: stats.stats.totalJobs?.toLocaleString(), icon: '👷' },
  ] : [];

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif text-bodhi-navy">📊 Project Tracking Board</h1>
        <p className="text-gray-600 mt-2">
          Every provincial capital project, sourced from the MoF Red Book and provincial
          budget statements (FY 2078/79–2080/81). No login required.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-xl font-bold text-bodhi-navy">{card.value}</div>
            <div className="text-xs text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="font-serif text-lg text-bodhi-navy mb-4">Project Status Mix</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            {statusData.map((s) => (
              <span key={s.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.name] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-serif text-lg text-bodhi-navy mb-4">Capital by Province (NPR crore)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={provinceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="budget" name="Budget (crore)" radius={[4, 4, 0, 0]}>
                {provinceData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector health */}
      <div className="card p-6 mb-8">
        <h3 className="font-serif text-lg text-bodhi-navy mb-4">Sector Health — avg completion by sector</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sectorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="completion" name="Avg completion %" radius={[4, 4, 0, 0]} fill="#1e3a8a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="card mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-bodhi-navy">Filter:</span>
          <select
            value={filters.province || ''}
            onChange={(e) => setFilters({ ...filters, province: e.target.value || undefined })}
            className="input-field w-44"
          >
            <option value="">All Provinces</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={filters.sector || ''}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value || undefined })}
            className="input-field w-52"
          >
            <option value="">All Sectors</option>
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
            className="input-field w-36"
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Delayed">Delayed</option>
          </select>
          <button onClick={() => setFilters({})} className="text-sm text-bodhi-gold hover:underline">
            Clear
          </button>
          {statsLoading && <span className="text-xs text-gray-400">Refreshing…</span>}
        </div>
      </div>

      {/* Ledger table */}
      {projectsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bodhi-navy text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Project</th>
                  <th className="text-left px-4 py-3 font-medium">Province</th>
                  <th className="text-left px-4 py-3 font-medium">Year</th>
                  <th className="text-right px-4 py-3 font-medium">Budget (crore)</th>
                  <th className="text-right px-4 py-3 font-medium">Completion</th>
                  <th className="text-right px-4 py-3 font-medium">Overrun</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="mr-1">{p.icon}</span>
                      {p.sector}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.province}</td>
                    <td className="px-4 py-3 text-gray-600">{p.year}</td>
                    <td className="px-4 py-3 text-right font-medium">{p.budget}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.completion >= 80 ? 'text-green-600' : p.completion >= 60 ? 'text-amber-600' : 'text-red-600'}>
                        {p.completion}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">{p.overrun}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        p.status === 'Completed' ? 'bg-green-100 text-green-700'
                        : p.status === 'Ongoing' ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTracking;
