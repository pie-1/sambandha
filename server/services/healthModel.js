/**
 * Health ML Model — orchestrates the three trained models and produces a
 * combined policy report:
 *   1. Predict health policy success (logistic regression)
 *   2. Analyze budget allocation impact (linear regression)
 *   3. Forecast health insurance claims (multiple regression)
 *
 * Also auto-tags health policies with relevant health indicators and
 * generates an expert consensus informed by historical outcomes.
 */

const Draft = require('../models/Draft');
const { districtToProvince } = require('../utils/simulationMappings');
const { PROVINCES, PROVINCE_HEALTH, HEALTH_PROGRAMS, SOURCES } = require('./ml/data');
const { predictPolicySuccess } = require('./ml/logisticRegression');
const { analyzeBudgetImpact } = require('./ml/budgetModel');
const { predictClaims } = require('./ml/claimsModel');
const { clamp } = require('./ml/core');

const PROGRAM_KEYWORDS = [
  { program: 'Immunization', keywords: ['immuniz', 'vaccin', 'polio', 'measles', 'child health', 'dpv', 'bcg'] },
  { program: 'Maternal & Neonatal', keywords: ['maternal', 'neonatal', 'birth', 'reproductive', 'antenatal', 'skilled birth', 'midwife'] },
  { program: 'Nutrition', keywords: ['nutrition', 'malnutrition', 'micronutrient', 'feeding', 'stunting', 'vitamin'] },
  { program: 'Water & Sanitation', keywords: ['water', 'sanitation', 'hygiene', 'wash', 'toilet', 'drinking'] },
  { program: 'Primary Care', keywords: ['primary care', 'health post', 'health center', 'health centre', 'outpatient', 'basic health'] },
  { program: 'Emergency Services', keywords: ['emergency', 'ambulance', 'trauma', 'critical care', 'first response'] },
  { program: 'Mental Health', keywords: ['mental', 'psycholog', 'psychiatr', 'counsel', 'depression', 'wellbeing'] },
  { program: 'NCD / Diabetes', keywords: ['diabetes', 'ncd', 'non-communicable', 'hypertension', 'cancer', 'heart', 'kidney'] },
];

const DEFAULT_PROGRAM = 'Primary Care';
const DEFAULT_PROVINCE = 'Bagmati';

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function detectProgram(text) {
  const haystack = (text || '').toLowerCase();
  let best = null;
  let bestScore = 0;
  PROGRAM_KEYWORDS.forEach(({ program, keywords }) => {
    const score = keywords.reduce((acc, kw) => (acc + (haystack.includes(kw) ? 1 : 0)), 0);
    if (score > bestScore) {
      bestScore = score;
      best = program;
    }
  });
  return best || DEFAULT_PROGRAM;
}

function detectKeywords(text) {
  const haystack = (text || '').toLowerCase();
  return PROGRAM_KEYWORDS.flatMap(({ program, keywords }) =>
    keywords.filter((kw) => haystack.includes(kw)).map((kw) => kw)
  );
}

function deriveIndicators({ province, program, text, district }) {
  const base = PROVINCE_HEALTH[province] || PROVINCE_HEALTH[DEFAULT_PROVINCE];
  const salt = hashString((text || '') + '|' + (district || ''));
  const jitter = (amount) => (salt % amount) - amount / 2;

  return {
    budget: 3,
    coverageGap: +clamp(base.gap + jitter(8), 5, 70).toFixed(1),
    remoteShare: +clamp(base.remote + jitter(10), 0, 85).toFixed(1),
    infraIndex: +clamp(base.infra + jitter(10), 15, 98).toFixed(1),
    diseaseBurden: +clamp(base.burden + jitter(10), 10, 95).toFixed(1),
    priorTrack: +clamp(55 + jitter(20), 20, 95).toFixed(1),
  };
}

async function simulateHealthPolicy({ draftId, inputs }) {
  let draft = null;
  if (draftId) {
    draft = await Draft.findById(draftId).lean();
    if (!draft || draft.isDeleted) throw new Error('Draft not found');
  }

  const text = [
    draft?.title,
    draft?.description,
    draft?.currentVersionText,
    inputs?.title,
    inputs?.description,
    inputs?.text,
  ]
    .filter(Boolean)
    .join(' ');
  const province =
    PROVINCES.includes(inputs?.province)
      ? inputs.province
      : draft
        ? (PROVINCES.includes(draft.district) ? draft.district : districtToProvince(draft.district))
        : DEFAULT_PROVINCE;

  const programName =
    HEALTH_PROGRAMS.find((p) => p.name === inputs?.program)?.name || detectProgram(text);

  const budget = clamp(+inputs?.budget || 3, 0.5, 10);

  const indicators = deriveIndicators({
    province,
    program: programName,
    text,
    district: draft?.district || inputs?.district,
  });
  indicators.budget = budget;

  const success = await predictPolicySuccess(indicators);
  const impact = await analyzeBudgetImpact(province, budget);
  const claims = await predictClaims({
    age: +inputs?.age || 35,
    familySize: +inputs?.familySize || 4,
    incomeBand: +inputs?.incomeBand || 2,
    regionRisk: PROVINCE_HEALTH[province]?.risk || 45,
    preExisting: inputs?.preExisting ? 1 : 0,
    healthIndex: +inputs?.healthIndex || 70,
  });

  const consensus = buildConsensus({ province, programName, budget, success, impact, indicators });

  const tagging = {
    province,
    program: programName,
    district: draft?.district || null,
    keywords: detectKeywords(text),
    autoTagged: Boolean(draft || inputs?.title || inputs?.text),
    indicators,
  };

  return {
    inputs: { province, programName, budget },
    tagging,
    successModel: success,
    impactModel: impact,
    claimsModel: claims,
    consensus,
    sources: SOURCES,
  };
}

function buildConsensus({ province, programName, budget, success, impact, indicators }) {
  const list = [];

  if (success.probability >= 0.7) {
    list.push({
      level: 'positive',
      text: `Historical records for ${programName} in ${province} support a high likelihood of success (${Math.round(success.probability * 100)}%). Continued funding along proven delivery channels is warranted.`,
    });
  } else if (success.probability >= 0.45) {
    list.push({
      level: 'neutral',
      text: `Success odds are moderate (${Math.round(success.probability * 100)}%). Historical ${province} records for ${programName} show mixed results — sequencing funds against delivery capacity would reduce risk.`,
    });
  } else {
    list.push({
      level: 'negative',
      text: `Success odds are low (${Math.round(success.probability * 100)}%). Prior ${programName} efforts in comparable areas struggled; revisit scope, access planning and baseline conditions before committing the full budget.`,
    });
  }

  const topDriver = success.drivers[0];
  const topNegative = success.drivers.find((d) => d.direction === 'negative');
  if (topDriver && Math.abs(topDriver.impact) > 0.2) {
    const verb = topDriver.direction === 'positive' ? 'supports' : 'works against';
    list.push({
      level: topDriver.direction === 'positive' ? 'positive' : 'negative',
      text: `The strongest model driver is "${topDriver.label}" (${topDriver.value}) and it ${verb} the draft — normalized coefficient ${topDriver.coefficient}.`,
    });
  }
  if (topNegative && topNegative.key !== topDriver?.key) {
    list.push({
      level: 'neutral',
      text: `Watch "${topNegative.label}" (${topNegative.value}) — it is the largest countervailing factor in the model.`,
    });
  }

  if (impact.best) {
    const best = impact.best;
    const gainTxt = `${best.gain > 0 ? '+' : ''}${best.gain}`;
    list.push({
      level: 'positive',
      text: `At a ${budget} crore budget, the model projects the strongest outcome improvement for ${best.program} (${gainTxt} coverage points, from ${best.currentCoverage}% to ${best.projectedCoverage}%) — the marginal gain is ${best.marginalPerCrore} points per crore.`,
    });
    const runnerUp = impact.programs[1];
    if (runnerUp && best.gain - runnerUp.gain > 2) {
      list.push({
        level: 'neutral',
        text: `There is a meaningful gap to ${runnerUp.program} (${runnerUp.gain > 0 ? '+' : ''}${runnerUp.gain} points). A phased reallocation toward ${best.program} may lift aggregate outcomes.`,
      });
    }
  }

  if (indicators.coverageGap > 30 && indicators.remoteShare > 30) {
    list.push({
      level: 'negative',
      text: `The ${province} operating context combines a wide coverage gap (${indicators.coverageGap}%) with a remote population share of ${indicators.remoteShare}% — historical budgets in this profile tend to overrun on delivery logistics.`,
    });
  }

  if (success.baseRate < 0.55) {
    list.push({
      level: 'neutral',
      text: `Only ${Math.round(success.baseRate * 100)}% of historical health policies in the training set met their targets — treat headline projections as an upper bound.`,
    });
  }

  return list;
}

module.exports = {
  simulateHealthPolicy,
  detectProgram,
  detectKeywords,
  deriveIndicators,
  PROGRAM_KEYWORDS,
};
