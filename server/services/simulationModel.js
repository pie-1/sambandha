/**
 * Policy impact simulation model
 * Nearest-neighbour matching on synthetic historical ledger data
 */

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

const PROVINCE_FACTOR = {
  Koshi: { mult: 1.0, overrun: 0 },
  Madhesh: { mult: 0.97, overrun: 2 },
  Bagmati: { mult: 1.08, overrun: -3 },
  Gandaki: { mult: 1.05, overrun: -2 },
  Lumbini: { mult: 1.0, overrun: 1 },
  Karnali: { mult: 0.82, overrun: 9 },
  Sudurpashchim: { mult: 0.85, overrun: 7 },
};

const SECTORS = [
  { name: 'Roads & Bridges', jobsPerCrore: 28, eff: 68, comp: 72, overrun: 22, min: 2, max: 40, icon: '🛣' },
  { name: 'Education Infrastructure', jobsPerCrore: 14, eff: 82, comp: 88, overrun: 9, min: 0.5, max: 8, icon: '🏫' },
  { name: 'Health & Nutrition', jobsPerCrore: 10, eff: 79, comp: 85, overrun: 12, min: 0.5, max: 10, icon: '🏥' },
  { name: 'Agriculture & Irrigation', jobsPerCrore: 22, eff: 71, comp: 76, overrun: 17, min: 1, max: 15, icon: '🌾' },
  { name: 'Water & Sanitation', jobsPerCrore: 18, eff: 80, comp: 87, overrun: 10, min: 0.5, max: 10, icon: '💧' },
  { name: 'Rural Electrification', jobsPerCrore: 16, eff: 64, comp: 66, overrun: 28, min: 2, max: 25, icon: '⚡' },
  { name: 'Local Governance Capacity', jobsPerCrore: 6, eff: 90, comp: 95, overrun: 4, min: 0.3, max: 5, icon: '🏛' },
  { name: 'Tourism & Culture', jobsPerCrore: 20, eff: 66, comp: 70, overrun: 19, min: 1, max: 12, icon: '🏔' },
];

function buildDataset() {
  const rng = mulberry32(20260806);
  const rows = [];
  let id = 0;

  PROVINCES.forEach((province) => {
    SECTORS.forEach((sector) => {
      const entries = 1 + Math.floor(rng() * 2);
      for (let e = 0; e < entries; e++) {
        const year = 2079 + Math.floor(rng() * 3);
        const span = sector.max - sector.min;
        const budget = +(sector.min + rng() * span).toFixed(1);
        const pf = PROVINCE_FACTOR[province];
        const noise = () => (rng() - 0.5) * 8;
        const efficiency = clamp(sector.eff * pf.mult + noise(), 30, 98);
        const completion = clamp(sector.comp * pf.mult + noise(), 30, 99);
        const overrun = clamp(sector.overrun + pf.overrun + (rng() - 0.5) * 10, 0, 60);
        const jobsPerCrore = clamp(sector.jobsPerCrore * (0.85 + rng() * 0.3), 3, 60);
        rows.push({
          id: id++,
          province,
          sector: sector.name,
          icon: sector.icon,
          year,
          budget,
          jobsPerCrore: +jobsPerCrore.toFixed(1),
          jobs: Math.round(jobsPerCrore * budget),
          efficiency: Math.round(efficiency),
          completion: Math.round(completion),
          overrun: Math.round(overrun),
        });
      }
    });
  });

  return rows;
}

const DATASET = buildDataset();

function runSimulation(province, sectorName, budget) {
  const pool = DATASET.filter((d) => d.sector === sectorName);
  const logB = Math.log(budget);

  const scored = pool.map((d) => {
    const budgetDist = Math.abs(Math.log(d.budget) - logB) / 3;
    const provincePenalty = d.province === province ? 0 : 0.35;
    const distance = budgetDist * 0.65 + provincePenalty;
    return { ...d, distance };
  });

  scored.sort((a, b) => a.distance - b.distance);
  const matches = scored.slice(0, 6);
  const weights = matches.map((m) => 1 / (m.distance + 0.08));
  const wSum = weights.reduce((a, b) => a + b, 0);
  const wavg = (key) => matches.reduce((sum, m, i) => sum + m[key] * weights[i], 0) / wSum;

  const jobsPerCrore = wavg('jobsPerCrore');
  const efficiency = Math.round(wavg('efficiency'));
  const completion = Math.round(wavg('completion'));
  const overrun = Math.round(wavg('overrun'));
  const jobs = Math.round(jobsPerCrore * budget);

  const sameProvinceSector = matches.filter((m) => m.province === province).length;
  const avgDistance = matches.reduce((s, m) => s + m.distance, 0) / matches.length;
  let confidence = Math.round(100 - avgDistance * 140);
  confidence = clamp(confidence + sameProvinceSector * 6, 20, 96);

  const sectorAll = DATASET.filter((d) => d.sector === sectorName);
  const sectorAvg = {
    efficiency: Math.round(sectorAll.reduce((s, d) => s + d.efficiency, 0) / sectorAll.length),
    completion: Math.round(sectorAll.reduce((s, d) => s + d.completion, 0) / sectorAll.length),
    overrun: Math.round(sectorAll.reduce((s, d) => s + d.overrun, 0) / sectorAll.length),
  };

  return {
    jobs,
    efficiency,
    completion,
    overrun,
    confidence,
    matches: matches.slice(0, 4).map(({ distance, ...rest }) => rest),
    sectorAvg,
    sameProvinceSector,
    datasetSize: DATASET.length,
  };
}

function buildInsights(province, sectorName, result) {
  const list = [];

  if (result.overrun >= 22) {
    list.push(
      `Similar ${sectorName.toLowerCase()} budgets historically overran costs by ~${result.overrun}% — consider phased disbursement or a contingency reserve.`
    );
  }
  if ((province === 'Karnali' || province === 'Sudurpashchim') && result.completion < 78) {
    list.push(
      `${province} projects in this sector show lower completion rates historically, likely tied to logistics and terrain — plan buffer time into the schedule.`
    );
  }
  if (result.sameProvinceSector === 0) {
    list.push(
      `No prior ${sectorName.toLowerCase()} record found for ${province} at this scale — this estimate leans on comparable budgets from other provinces.`
    );
  }
  if (result.confidence >= 75) {
    list.push('Strong precedent exists for this combination of sector, province and budget size — confidence is high.');
  }
  if (list.length === 0) {
    list.push(
      `This draft sits close to typical historical patterns for ${sectorName.toLowerCase()} in ${province} — no major red flags.`
    );
  }

  return list;
}

function getSectorByName(name) {
  return SECTORS.find((s) => s.name === name);
}

module.exports = {
  PROVINCES,
  SECTORS,
  DATASET,
  runSimulation,
  buildInsights,
  getSectorByName,
  clamp,
};
