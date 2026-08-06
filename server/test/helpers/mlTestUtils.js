/**
 * ML test utilities — shared by the authenticity tests and the demo script.
 * Pure in-memory training on the deterministic generator records, so the
 * suite is repeatable anywhere (no MongoDB required). The same code path
 * trains on the `healthrecords` collection when it has been seeded.
 */

const core = require('../../services/ml/core');
const { buildHealthPolicyRecords } = require('../../services/ml/data');

const FEATURES = ['budget', 'coverageGap', 'remoteShare', 'infraIndex', 'diseaseBurden', 'priorTrack'];
const HYP = { learningRate: 0.15, epochs: 4000, lambda: 0.02, regression: 'logistic' };
const INPUT = { budget: 8.0, coverageGap: 12, remoteShare: 15, infraIndex: 85, diseaseBurden: 30, priorTrack: 75 };

function trainFromRecords(records, hyp = HYP) {
  const X = records.map((r) => FEATURES.map((f) => r[f]));
  const y = records.map((r) => r.success);
  const { normalized, means, stds } = core.standardizeFeatures(X, FEATURES.length);
  const { theta, lossHistory } = core.train(normalized, y, hyp);
  const preds = core.predictLogistic(normalized.map((r) => [1, ...r]), theta);
  return {
    theta,
    means,
    stds,
    lossHistory,
    finalLoss: lossHistory[lossHistory.length - 1],
    accuracy: core.binaryAccuracy(y, preds),
    baseRate: y.reduce((a, b) => a + b, 0) / y.length,
  };
}

function predictLocal(model, inputs) {
  const x = FEATURES.map((f, j) => (inputs[f] - model.means[j]) / model.stds[j]);
  return core.sigmoid(model.theta[0] + x.reduce((s, v, j) => s + v * model.theta[j + 1], 0));
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(records, seed = 20260807) {
  const rng = mulberry32(seed);
  const idx = records.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.map((i) => records[i]);
}

function makeRecords() {
  return buildHealthPolicyRecords();
}

module.exports = { FEATURES, HYP, INPUT, trainFromRecords, predictLocal, mulberry32, shuffle, makeRecords };
