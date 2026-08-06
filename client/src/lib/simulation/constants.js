export const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

export const SECTORS = [
  { name: 'Roads & Bridges', min: 2, max: 40, icon: '🛣' },
  { name: 'Education Infrastructure', min: 0.5, max: 8, icon: '🏫' },
  { name: 'Health & Nutrition', min: 0.5, max: 10, icon: '🏥' },
  { name: 'Agriculture & Irrigation', min: 1, max: 15, icon: '🌾' },
  { name: 'Water & Sanitation', min: 0.5, max: 10, icon: '💧' },
  { name: 'Rural Electrification', min: 2, max: 25, icon: '⚡' },
  { name: 'Local Governance Capacity', min: 0.3, max: 5, icon: '🏛' },
  { name: 'Tourism & Culture', min: 1, max: 12, icon: '🏔' },
];

export const SIM_COLORS = {
  bg: '#12172B',
  bgPanel: '#181F38',
  bgCard: '#1D2542',
  crimson: '#C8323C',
  crimsonDeep: '#8E2029',
  gold: '#D9A441',
  parchment: '#EDE8DC',
  muted: '#9BA0B8',
  line: '#2C3556',
  green: '#4C9A6A',
  amber: '#D9A441',
  red: '#C8323C',
};

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function scoreColor(v, kind) {
  if (kind === 'good-high') {
    if (v >= 78) return SIM_COLORS.green;
    if (v >= 60) return SIM_COLORS.amber;
    return SIM_COLORS.red;
  }
  if (v <= 12) return SIM_COLORS.green;
  if (v <= 24) return SIM_COLORS.amber;
  return SIM_COLORS.red;
}
