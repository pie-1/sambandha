/**
 * ML data-sensitivity suite — run with: npm test
 *
 * Repeatable, dependency-free proofs that the health ML model is genuinely
 * trained from data (not hardcoded):
 *   - deterministic training (same data -> identical model)
 *   - gradient descent actually converges
 *   - weights are recovered from a known ground truth
 *   - predictions respond to the CONTENT of the training data
 *   - control: row order alone changes nothing
 *   - response is graded (harsher edit -> bigger move)
 *   - every feature carries a learned (nonzero) weight
 *
 * Uses the deterministic seeded generator records so it runs anywhere;
 * the same code path trains on the `healthrecords` collection when seeded.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { buildHealthPolicyRecords } = require('../services/ml/data');
const { FEATURES, INPUT, trainFromRecords, predictLocal, shuffle, makeRecords } = require('./helpers/mlTestUtils');

const W_STAR = { budget: 0.35, coverageGap: -0.025, remoteShare: -0.02, infraIndex: 0.04, diseaseBurden: -0.02, priorTrack: 0.025 };

const records = makeRecords();
const baseline = trainFromRecords(records);

test('training is deterministic — same data yields an identical model', () => {
  const again = trainFromRecords(records);
  assert.ok(Math.abs(again.finalLoss - baseline.finalLoss) < 1e-12, 'final loss should be identical to 12 decimals');
  assert.ok(again.theta.every((v, j) => Math.abs(v - baseline.theta[j]) < 1e-12), 'weights should be identical to 12 decimals');
  assert.ok(Math.abs(predictLocal(again, INPUT) - predictLocal(baseline, INPUT)) < 1e-12);
});

test('gradient descent converges — final loss is far below the initial loss', () => {
  const initial = baseline.lossHistory[0];
  const final = baseline.finalLoss;
  assert.ok(final < initial, `loss should decrease (${final} vs ${initial})`);
  assert.ok(final < initial * 0.5, `loss should at least halve (${final} vs ${initial})`);
});

test('weights are recovered from a known ground truth (not hardcoded)', () => {
  let seed = 4242;
  const srand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const synth = [];
  for (let i = 0; i < 400; i++) {
    const row = {
      budget: 0.5 + srand() * 9.5,
      coverageGap: 5 + srand() * 65,
      remoteShare: srand() * 85,
      infraIndex: 20 + srand() * 72,
      diseaseBurden: 10 + srand() * 85,
      priorTrack: 20 + srand() * 75,
    };
    const logit = -0.3 + FEATURES.reduce((s, f) => s + W_STAR[f] * row[f], 0);
    row.success = srand() < 1 / (1 + Math.exp(-logit)) ? 1 : 0;
    synth.push(row);
  }
  const model = trainFromRecords(synth);
  const signsMatch = FEATURES.filter((f, j) => Math.sign(W_STAR[f]) === Math.sign(model.theta[j + 1])).length;
  assert.equal(signsMatch, FEATURES.length, `all ${FEATURES.length} weight signs should match the ground truth`);
  assert.ok(model.accuracy > 0.8, `training accuracy should be high (got ${model.accuracy})`);
});

test('prediction is sensitive to training data content', () => {
  const pBefore = predictLocal(baseline, INPUT);
  const poisoned = records.map((r) => ({ ...r, success: r.budget >= 6 ? 0 : r.success }));
  const pAfter = predictLocal(trainFromRecords(poisoned), INPUT);
  assert.ok(pBefore > 0.8, `baseline probability should be high (got ${pBefore})`);
  assert.ok(pAfter < pBefore - 0.3, `poisoned data should drop the probability (${pAfter} vs ${pBefore})`);
});

test('inverting the labels inverts the prediction', () => {
  const pBefore = predictLocal(baseline, INPUT);
  const inverted = records.map((r) => ({ ...r, success: r.success ? 0 : 1 }));
  const pInverted = predictLocal(trainFromRecords(inverted), INPUT);
  assert.ok(pInverted < 0.2, `inverted labels should invert the prediction (got ${pInverted})`);
  assert.ok(pInverted < pBefore - 0.6, `inversion should move the probability sharply (${pInverted} vs ${pBefore})`);
});

test('control: row order alone does not change the model', () => {
  const shuffled = trainFromRecords(shuffle(records));
  assert.ok(Math.abs(predictLocal(shuffled, INPUT) - predictLocal(baseline, INPUT)) < 1e-9);
  assert.ok(Math.abs(shuffled.finalLoss - baseline.finalLoss) < 1e-12);
});

test('response is graded — a harsher data edit moves the probability further', () => {
  const pPoisoned = predictLocal(trainFromRecords(records.map((r) => ({ ...r, success: r.budget >= 6 ? 0 : r.success }))), INPUT);
  const pAllFail = predictLocal(trainFromRecords(records.map((r) => ({ ...r, success: 0 }))), INPUT);
  assert.ok(pAllFail < pPoisoned, `all-fail data should predict lower than partial poisoning (${pAllFail} vs ${pPoisoned})`);
});

test('every feature carries a learned, nonzero weight', () => {
  FEATURES.forEach((f, j) => {
    assert.ok(Math.abs(baseline.theta[j + 1]) > 0.01, `feature "${f}" should have a nonzero learned weight`);
  });
});

test('dataset sanity — records are deterministic and balanced enough to train on', () => {
  assert.equal(records.length, buildHealthPolicyRecords().length);
  assert.ok(records.some((r) => r.success === 1) && records.some((r) => r.success === 0));
  assert.ok(baseline.baseRate > 0.05 && baseline.baseRate < 0.95, `base rate should be non-trivial (got ${baseline.baseRate})`);
});
