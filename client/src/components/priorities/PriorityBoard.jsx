/**
 * PriorityBoard — citizen engagement depth
 * Left: live district priorities ranking ("what do neighbors prioritize?").
 * Right: vote form — pick your district and top 3 sectors (no login).
 */

import { useState } from 'react';
import { usePriorities } from '../../hooks/usePriorities';

const SECTORS = [
  { name: 'Roads & Bridges', icon: '🛣' },
  { name: 'Education Infrastructure', icon: '🏫' },
  { name: 'Health & Nutrition', icon: '🏥' },
  { name: 'Agriculture & Irrigation', icon: '🌾' },
  { name: 'Water & Sanitation', icon: '💧' },
  { name: 'Rural Electrification', icon: '⚡' },
  { name: 'Local Governance Capacity', icon: '🏛' },
  { name: 'Tourism & Culture', icon: '🏔' },
];

const DISTRICTS = [
  'Ilam', 'Jhapa', 'Sunsari', 'Solukhumbu', 'Sarlahi', 'Bara', 'Rautahat',
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Nuwakot', 'Rasuwa', 'Kaski', 'Lamjung',
  'Manang', 'Rupandehi', 'Banke', 'Palpa', 'Gulmi', 'Humla', 'Jumla', 'Surkhet',
  'Mugu', 'Bajhang', 'Darchula', 'Achham', 'Doti',
];

const PriorityBoard = () => {
  const { ranking, isLoading, submitVote } = usePriorities();
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [selected, setSelected] = useState([]);

  const toggleSector = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name].slice(0, 3)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone || !district || selected.length === 0) {
      return;
    }
    submitVote.mutate({ phone, district, sectors: selected });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🗳️</span>
        <div>
          <h3 className="text-xl font-serif text-bodhi-navy">District Priorities</h3>
          <p className="text-xs text-gray-500">
            What do citizens across Nepal want their provinces to build first?
          </p>
        </div>
      </div>

      {/* Ranking */}
      {isLoading ? (
        <div className="text-sm text-gray-400 py-4">Loading priorities…</div>
      ) : (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Community ranking</span>
            <span>{ranking?.totalVotes} votes · {ranking?.districtCount} districts</span>
          </div>
          <ol className="space-y-2">
            {(ranking?.ranking || []).slice(0, 5).map((row, idx) => (
              <li key={row.sector} className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-bodhi-gold">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700">{row.sector}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {row.points} pts
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Vote form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
        <h4 className="font-medium text-bodhi-navy text-sm mb-3">
          ✋ Add your voice — pick your top 3 for {district || 'your district'}
        </h4>
        <div className="flex gap-3 mb-3">
          <input
            type="tel"
            placeholder="Phone (98XXXXXXXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field flex-1"
            required
          />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="input-field flex-1"
            required
          >
            <option value="">Select district</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {SECTORS.map((s) => {
            const active = selected.includes(s.name);
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => toggleSector(s.name)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  active
                    ? 'bg-bodhi-gold text-white border-bodhi-gold'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-bodhi-gold'
                }`}
              >
                {s.icon} {s.name}
              </button>
            );
          })}
        </div>
        <button
          type="submit"
          disabled={!phone || !district || selected.length === 0 || submitVote.isPending}
          className="btn-primary text-sm px-4 py-2 w-full disabled:opacity-50"
        >
          {selected.length}/3 selected — Submit vote
        </button>
      </form>
    </div>
  );
};

export default PriorityBoard;
