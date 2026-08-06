/**
 * Logistic regression — predicts probability a health policy succeeds.
 * Trained with full-batch gradient descent on synthetic historical
 * health policy records. Model is trained once and cached.
 */

const {
  sigmoid,
  standardizeFeatures,
  predictLogistic,
  train,
  binaryAccuracy,
  auc,
} = require('./core');
const { buildHealthPolicyRecords, HEALTH_PROGRAMS } = require('./data');
const HealthRecord = require('../../models/HealthRecord');

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FEATURES = [
  { key: 'budget', label: 'Budget (NPR crore)', direction: 'more budget helps implementation scale' },
  { key: 'coverageGap', label: 'Coverage gap (%)', direction: 'deep gaps make targets harder to hit' },
  { key: 'remoteShare', label: 'Remote population share (%)', direction: 'remote access raises delivery cost' },
  { key: 'infraIndex', label: 'Health facility index (0–100)', direction: 'stronger facilities improve odds' },
  { key: 'diseaseBurden', label: 'Disease burden index (0–100)', direction: 'high burden raises failure risk' },
  { key: 'priorTrack', label: 'Prior program success (%)', direction: 'proven approaches succeed more often' },
];

let _model = null;

function holdoutEvaluation(records) {
  const rng = mulberry32(20260412);
  const idx = records.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const split = Math.floor(idx.length * 0.8);
  const trainIdx = idx.slice(0, split);
  const valIdx = idx.slice(split);

  const Xt = trainIdx.map((i) => FEATURES.map((f) => records[i][f.key]));
  const yt = trainIdx.map((i) => records[i].success);
  const Xv = valIdx.map((i) => FEATURES.map((f) => records[i][f.key]));
  const yv = valIdx.map((i) => records[i].success);

  const { normalized } = standardizeFeatures(Xt, FEATURES.length);
  const { theta } = train(normalized, yt, {
    learningRate: 0.15,
    epochs: 4000,
    lambda: 0.02,
    regression: 'logistic',
  });

  const standardizedVal = Xv.map((row) =>
    row.map((v, j) => {
      const col = Xt.map((r) => r[j]);
      const m = col.reduce((a, b) => a + b, 0) / col.length;
      const s = Math.sqrt(col.reduce((a, b) => a + (b - m) ** 2, 0) / col.length) || 1;
      return (v - m) / s;
    })
  );
  const preds = predictLogistic(standardizedVal.map((r) => [1, ...r]), theta);

  return {
    accuracy: binaryAccuracy(yv, preds),
    auc: auc(yv, preds),
    size: yv.length,
  };
}

function trainModel(records = buildHealthPolicyRecords()) {
  const X = records.map((r) => FEATURES.map((f) => r[f.key]));
  const y = records.map((r) => r.success);

  const { normalized, means, stds } = standardizeFeatures(X, FEATURES.length);
  const { theta, lossHistory } = train(normalized, y, {
    learningRate: 0.15,
    epochs: 4000,
    lambda: 0.02,
    regression: 'logistic',
  });

  const evalResult = holdoutEvaluation(records);
  const standardizedPreds = predictLogistic(
    normalized.map((r) => [1, ...r]),
    theta
  );
  const fullAccuracy = binaryAccuracy(y, standardizedPreds);

  const baseRate = y.reduce((a, b) => a + b, 0) / y.length;

  _model = {
    records,
    theta,
    means,
    stds,
    features: FEATURES,
    sampleSize: records.length,
    finalLoss: lossHistory[lossHistory.length - 1],
    epochs: lossHistory.length,
    fullAccuracy,
    holdout: evalResult,
    baseRate,
  };
  return _model;
}

/**
 * Load policy-success records — from MongoDB when seeded (`npm run seed:sim`),
 * otherwise from the embedded deterministic generator.
 */
async function loadPolicyRecords() {
  try {
    const rows = await HealthRecord.find({ kind: 'policy' }).lean();
    if (rows.length > 0) return rows;
    console.warn('[ml] No health policy records in DB — using embedded generator. Run: npm run seed:sim');
  } catch (err) {
    console.warn(`[ml] DB unavailable for health records (${err.message}) — using embedded generator.`);
  }
  return buildHealthPolicyRecords();
}

async function ensureModel() {
  if (!_model) {
    const records = await loadPolicyRecords();
    _model = trainModel(records);
  }
  return _model;
}

/**
 * Predict the success probability for a health policy given its indicators.
 */
async function predictPolicySuccess(inputs) {
  const m = await ensureModel();
  const x = FEATURES.map((f, j) => (inputs[f.key] - m.means[j]) / m.stds[j]);
  const z = m.theta[0] + x.reduce((sum, v, j) => sum + v * m.theta[j + 1], 0);
  const probability = sigmoid(z);

  // Drivers ranked by standardized coefficient magnitude × direction relative to input.
  const drivers = FEATURES.map((f, j) => {
    const coefficient = m.theta[j + 1];
    const standardizedValue = (inputs[f.key] - m.means[j]) / m.stds[j];
    const impact = coefficient * standardizedValue;
    return {
      key: f.key,
      label: f.label,
      value: inputs[f.key],
      coefficient: +coefficient.toFixed(3),
      impact: +impact.toFixed(3),
      direction: impact >= 0 ? 'positive' : 'negative',
      interpretation: f.direction,
    };
  }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    probability: +probability.toFixed(3),
    prediction: probability >= 0.5 ? 'High' : 'Low',
    drivers,
    coefficients: FEATURES.map((f, j) => ({ key: f.key, label: f.label, value: +m.theta[j + 1].toFixed(3) })),
    holdout: m.holdout,
    sampleSize: m.sampleSize,
    finalLoss: +m.finalLoss.toFixed(4),
    epochs: m.epochs,
    baseRate: +m.baseRate.toFixed(3),
  };
}

module.exports = {
  FEATURES,
  HEALTH_PROGRAMS,
  getModel: ensureModel,
  predictPolicySuccess,
};
