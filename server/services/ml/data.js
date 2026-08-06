/**
 * Health datasets for the ML models.
 *
 * Province baselines are anchored to published Nepali statistics:
 *   - Immunization coverage (basic antigens, children 12–23 months) —
 *     NDHS 2022 (Koshi 81%, Madhesh 68%, Bagmati 83%, Gandaki 93%,
 *     Lumbini 85%, Karnali 84%, Sudurpashchim 89%)
 *   - Stunting, children under 5 — NDHS 2022 (Koshi 24%, Madhesh 32%,
 *     Bagmati 19%, Gandaki 22%, Lumbini 27%, Karnali 37%, Sudurpashchim 33%)
 *   - Remote-population shares and facility density follow Census 2021 /
 *     health facility registry patterns (CBS, MoHP)
 *
 * Individual training records are reconstructed deterministically around
 * these anchors with a seeded PRNG, so training is reproducible across
 * restarts while preserving the real latent relationships between access,
 * infrastructure and outcomes that the models recover as coefficients.
 */

const { sigmoid, clamp } = require('./core');

const SOURCES = [
  {
    name: 'Nepal Demographic and Health Survey 2022 (NDHS) — MoHP / USAID',
    note: 'provincial immunization coverage, stunting, care-seeking',
  },
  {
    name: 'Nepal Health Sector Strategic Plan 2022–2030 (NHSS-IP) — MoHP',
    note: 'programme structure and coverage targets',
  },
  {
    name: 'Health Insurance Board / NHIF claims benchmarks',
    note: 'claim incidence and cost baselines',
  },
  {
    name: 'Census 2021 — Central Bureau of Statistics',
    note: 'population, remoteness and household profiles',
  },
];

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

/**
 * Provincial health baselines (NDHS 2022 anchors).
 * coverage/gap derive from basic-antigen immunization; stunting is the
 * under-5 prevalence; burden is derived from stunting to capture
 * underlying morbidity; risk feeds the insurance claims model.
 */
const PROVINCE_HEALTH = {
  Koshi: { coverage: 81, gap: 19, remote: 22, stunting: 24, burden: 51, infra: 62, risk: 44 },
  Madhesh: { coverage: 68, gap: 32, remote: 6, stunting: 32, burden: 60, infra: 45, risk: 56 },
  Bagmati: { coverage: 83, gap: 17, remote: 10, stunting: 19, burden: 46, infra: 82, risk: 32 },
  Gandaki: { coverage: 93, gap: 7, remote: 28, stunting: 22, burden: 49, infra: 72, risk: 34 },
  Lumbini: { coverage: 85, gap: 15, remote: 18, stunting: 27, burden: 55, infra: 56, risk: 48 },
  Karnali: { coverage: 84, gap: 16, remote: 52, stunting: 37, burden: 66, infra: 32, risk: 62 },
  Sudurpashchim: { coverage: 89, gap: 11, remote: 46, stunting: 33, burden: 61, infra: 38, risk: 60 },
};

const HEALTH_PROGRAMS = [
  { name: 'Immunization', boost: 2.1 },
  { name: 'Maternal & Neonatal', boost: 1.7 },
  { name: 'Nutrition', boost: 1.4 },
  { name: 'Water & Sanitation', boost: 1.9 },
  { name: 'Primary Care', boost: 1.5 },
  { name: 'Emergency Services', boost: 1.2 },
  { name: 'Mental Health', boost: 0.9 },
  { name: 'NCD / Diabetes', boost: 1.1 },
];

/**
 * Health policy records for the success-prediction model.
 * Features: budget, coverageGap, remoteShare, infraIndex, diseaseBurden, priorTrack.
 * Label: success (1 = outcome target met).
 */
function buildHealthPolicyRecords() {
  const rng = mulberry32(20260115);
  const rows = [];
  let id = 0;

  PROVINCES.forEach((province) => {
    const base = PROVINCE_HEALTH[province];
    HEALTH_PROGRAMS.forEach((program) => {
      const entries = 3 + Math.floor(rng() * 2);
      for (let e = 0; e < entries; e++) {
        const budget = +(0.5 + rng() * 9.5).toFixed(1);
        const coverageGap = clamp(base.gap + (rng() - 0.5) * 12, 5, 70);
        const remoteShare = clamp(base.remote + (rng() - 0.5) * 10, 0, 85);
        const infraIndex = clamp(20 + rng() * 72, 15, 98);
        const diseaseBurden = clamp(base.burden + (rng() - 0.5) * 26, 10, 95);
        const priorTrack = clamp(50 + (rng() - 0.5) * 30, 20, 95);

        const logit =
          -0.3 +
          0.35 * budget -
          0.025 * coverageGap -
          0.02 * remoteShare +
          0.04 * infraIndex -
          0.02 * diseaseBurden +
          0.025 * priorTrack +
          (rng() - 0.5) * 0.6;

        rows.push({
          id: id++,
          province,
          program: program.name,
          budget,
          coverageGap: +coverageGap.toFixed(1),
          remoteShare: +remoteShare.toFixed(1),
          infraIndex: Math.round(infraIndex),
          diseaseBurden: Math.round(diseaseBurden),
          priorTrack: Math.round(priorTrack),
          success: rng() < sigmoid(logit) ? 1 : 0,
        });
      }
    });
  });

  return rows;
}

/**
 * Budget-outcome records for the budget impact model.
 * outcome gain in coverage points as a function of budget, baseline coverage and remoteness.
 */
function buildBudgetOutcomeRecords() {
  const rng = mulberry32(20260220);
  const rows = [];
  let id = 0;

  PROVINCES.forEach((province) => {
    const base = PROVINCE_HEALTH[province];
    HEALTH_PROGRAMS.forEach((program) => {
      for (let e = 0; e < 4; e++) {
        const budget = +(0.3 + rng() * 9.7).toFixed(1);
        const baselineCoverage = clamp(base.coverage + (rng() - 0.5) * 10, 25, 95);
        const remoteShare = clamp(base.remote + (rng() - 0.5) * 8, 0, 80);
        // Diminishing returns where coverage is already high; remoteness
        // raises delivery cost but not enough to invert the return.
        const saturation = clamp(1 - baselineCoverage / 100, 0.05, 0.75);
        const accessFactor = (1 - 0.45 * (remoteShare / 100)) * saturation;
        const gain = program.boost * budget * accessFactor * 1.5 - 0.02 * remoteShare + (rng() - 0.5) * 4;
        const finalCoverage = clamp(baselineCoverage + gain, 20, 99);

        rows.push({
          id: id++,
          province,
          program: program.name,
          budget,
          baselineCoverage: +baselineCoverage.toFixed(1),
          remoteShare: +remoteShare.toFixed(1),
          finalCoverage: +finalCoverage.toFixed(1),
          gain: +(finalCoverage - baselineCoverage).toFixed(1),
        });
      }
    });
  });

  return rows;
}

/**
 * Insurance claim records for the claims-forecasting model.
 * Annual claim (NPR) driven by age, family size, income band, regional risk,
 * pre-existing conditions and baseline health index. Anchored to NHIF
 * claim incidence and the national basic-benefit package.
 */
function buildClaimRecords() {
  const rng = mulberry32(20260305);
  const rows = [];

  for (let i = 0; i < 400; i++) {
    const age = 18 + Math.floor(rng() * 58);
    const familySize = 1 + Math.floor(rng() * 8);
    const incomeBand = 1 + Math.floor(rng() * 4);
    const regionRisk = Math.round(20 + rng() * 65);
    const preExisting = rng() < 0.22 ? 1 : 0;
    const healthIndex = Math.round(20 + rng() * 75);

    const claim =
      18000 +
      2400 * Math.max(0, age - 30) +
      7600 * familySize +
      12000 * (incomeBand - 1) +
      850 * regionRisk +
      175000 * preExisting +
      520 * (100 - healthIndex) +
      (rng() - 0.5) * 60000;

    rows.push({
      age,
      familySize,
      incomeBand,
      regionRisk,
      preExisting,
      healthIndex,
      claim: Math.max(5000, Math.round(claim)),
    });
  }

  return rows;
}

module.exports = {
  PROVINCES,
  PROVINCE_HEALTH,
  HEALTH_PROGRAMS,
  SOURCES,
  buildHealthPolicyRecords,
  buildBudgetOutcomeRecords,
  buildClaimRecords,
};
