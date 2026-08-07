/**
 * ML Core — pure-JavaScript machine learning primitives
 * Used by the health policy models. No external dependencies.
 */

const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const std = (arr) => {
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((v) => (v - m) ** 2)));
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const sigmoid = (z) => 1 / (1 + Math.exp(-z));

/**
 * Z-score standardize each feature column of a row-major matrix.
 * Returns the normalized matrix plus the per-column mean/std needed
 * to standardize new samples at inference time.
 */
function standardizeFeatures(rows, featureCount) {
  const means = [];
  const stds = [];
  for (let j = 0; j < featureCount; j++) {
    const col = rows.map((r) => r[j]);
    const m = mean(col);
    const s = std(col) || 1;
    means.push(m);
    stds.push(s);
  }
  const normalized = rows.map((r) => r.map((v, j) => (v - means[j]) / stds[j]));
  return { normalized, means, stds };
}

const addBias = (X) => X.map((row) => [1, ...row]);

const predictLinear = (X, theta) =>
  X.map((row) => row.reduce((sum, v, j) => sum + v * theta[j], 0));

const predictLogistic = (X, theta) => predictLinear(X, theta).map(sigmoid);

/**
 * Full-batch gradient descent with L2 regularization.
 * lossHistory tracks the cost after each epoch.
 */
function train(X, y, { learningRate = 0.1, epochs = 3000, lambda = 0.01, regression = 'linear' } = {}) {
  const Xb = addBias(X);
  const n = Xb.length;
  const p = Xb[0].length;
  let theta = new Array(p).fill(0);
  const lossHistory = [];

  for (let epoch = 0; epoch < epochs; epoch++) {
    const preds = regression === 'logistic' ? predictLogistic(Xb, theta) : predictLinear(Xb, theta);

    const gradient = new Array(p).fill(0);
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += (preds[i] - y[i]) * Xb[i][j];
      }
      gradient[j] = sum / n + (lambda * theta[j]) / n;
    }
    theta = theta.map((t, j) => t - learningRate * gradient[j]);

    const loss =
      regression === 'logistic'
        ? -mean(y.map((yi, i) => yi * Math.log(preds[i] + 1e-9) + (1 - yi) * Math.log(1 - preds[i] + 1e-9)))
        : mean(y.map((yi, i) => (yi - preds[i]) ** 2));
    lossHistory.push(loss);
  }

  return { theta, lossHistory };
}

function rSquared(y, preds) {
  const m = mean(y);
  const ssRes = mean(y.map((yi, i) => (yi - preds[i]) ** 2));
  const ssTot = mean(y.map((yi) => (yi - m) ** 2));
  return 1 - ssRes / (ssTot || 1e-9);
}

function binaryAccuracy(y, preds, threshold = 0.5) {
  const correct = y.reduce((acc, yi, i) => {
    const predicted = preds[i] >= threshold ? 1 : 0;
    return acc + (predicted === yi ? 1 : 0);
  }, 0);
  return correct / y.length;
}

/**
 * Area under the ROC curve via rank-based (Mann-Whitney) estimator.
 */
function auc(y, scores) {
  const pairs = y.map((label, i) => ({ label, score: scores[i] })).sort((a, b) => a.score - b.score);
  let rankSum = 0;
  let posCount = 0;
  let negCount = 0;
  pairs.forEach((p, i) => {
    if (p.label === 1) {
      posCount++;
      rankSum += i + 1;
    } else {
      negCount++;
    }
  });
  if (posCount === 0 || negCount === 0) return 0.5;
  return (rankSum - (posCount * (posCount + 1)) / 2) / (posCount * negCount);
}

function mae(y, preds) {
  return mean(y.map((yi, i) => Math.abs(yi - preds[i])));
}

module.exports = {
  mean,
  std,
  clamp,
  sigmoid,
  standardizeFeatures,
  addBias,
  predictLinear,
  predictLogistic,
  train,
  rSquared,
  binaryAccuracy,
  auc,
  mae,
};
