/**
 * Multiple linear regression — forecasts annual health insurance claims
 * from demographic and health indicators. Trained with gradient descent
 * on historical claims records.
 */

const {
  standardizeFeatures,
  predictLinear,
  train,
  rSquared,
  mae,
} = require('./core');
const { buildClaimRecords } = require('./data');

const FEATURES = [
  { key: 'age', label: 'Age (years)' },
  { key: 'familySize', label: 'Household size' },
  { key: 'incomeBand', label: 'Income band (1–4)' },
  { key: 'regionRisk', label: 'Regional risk index (0–100)' },
  { key: 'preExisting', label: 'Pre-existing condition' },
  { key: 'healthIndex', label: 'Self-rated health index (0–100)' },
];

let _model = null;

function trainModel() {
  const records = buildClaimRecords();
  const X = records.map((r) => FEATURES.map((f) => r[f.key]));
  const y = records.map((r) => r.claim);

  const { normalized, means, stds } = standardizeFeatures(X, FEATURES.length);
  const { theta, lossHistory } = train(normalized, y, {
    learningRate: 0.08,
    epochs: 6000,
    lambda: 0.005,
    regression: 'linear',
  });

  const preds = predictLinear(normalized.map((r) => [1, ...r]), theta);
  const score = rSquared(y, preds);

  _model = {
    records,
    theta,
    means,
    stds,
    features: FEATURES,
    sampleSize: records.length,
    finalLoss: +lossHistory[lossHistory.length - 1].toFixed(2),
    epochs: lossHistory.length,
    r2: +score.toFixed(3),
    mae: +mae(y, preds).toFixed(0),
  };
  return _model;
}

function getModel() {
  if (!_model) _model = trainModel();
  return _model;
}

function predictClaims(inputs) {
  const m = getModel();
  const x = FEATURES.map((f, j) => (inputs[f.key] - m.means[j]) / m.stds[j]);
  const predicted = m.theta[0] + x.reduce((sum, v, j) => sum + v * m.theta[j + 1], 0);

  // Per-factor contribution vs. the population baseline (predict with all means).
  const baseline = m.theta[0];
  const breakdown = FEATURES.map((f, j) => {
    const atValue = baseline + m.theta[j + 1] * ((inputs[f.key] - m.means[j]) / m.stds[j]);
    return {
      key: f.key,
      label: f.label,
      value: inputs[f.key],
      contribution: +(atValue - baseline).toFixed(0),
    };
  }).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  const risk =
    predicted >= 400000 ? 'High' : predicted >= 220000 ? 'Elevated' : predicted >= 120000 ? 'Moderate' : 'Low';

  return {
    forecast: Math.round(predicted),
    risk,
    baseline: Math.round(baseline),
    breakdown,
    model: {
      r2: m.r2,
      mae: m.mae,
      sampleSize: m.sampleSize,
      finalLoss: m.finalLoss,
      epochs: m.epochs,
    },
  };
}

module.exports = {
  FEATURES,
  getModel,
  predictClaims,
};
