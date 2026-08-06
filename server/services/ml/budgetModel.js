/**
 * Multiple linear regression — analyzes how budget allocation affects
 * health outcomes.
 *
 * A separate linear regression is trained per health program on the
 * historical outcome GAIN (coverage points) as a function of budget and
 * remoteness. Each program therefore has its own marginal return per
 * crore, which drives the allocation recommendation.
 */

const {
  standardizeFeatures,
  predictLinear,
  train,
  rSquared,
  mae,
  clamp,
} = require('./core');
const { buildBudgetOutcomeRecords, HEALTH_PROGRAMS, PROVINCE_HEALTH } = require('./data');

let _programModels = null;

function trainProgramModel(records) {
  const X = records.map((r) => [r.budget, r.remoteShare]);
  const y = records.map((r) => r.gain);

  const { normalized, means, stds } = standardizeFeatures(X, 2);
  const { theta, lossHistory } = train(normalized, y, {
    learningRate: 0.1,
    epochs: 4000,
    lambda: 0.01,
    regression: 'linear',
  });

  const preds = predictLinear(normalized.map((r) => [1, ...r]), theta);
  const marginalPerCrore = theta[1] / stds[0];

  return {
    theta,
    means,
    stds,
    marginalPerCrore: +marginalPerCrore.toFixed(3),
    r2: +rSquared(y, preds).toFixed(3),
    mae: +mae(y, preds).toFixed(2),
    sampleSize: records.length,
    finalLoss: +lossHistory[lossHistory.length - 1].toFixed(3),
  };
}

function trainAll() {
  const allRecords = buildBudgetOutcomeRecords();
  const programModels = HEALTH_PROGRAMS.map((program) => {
    const records = allRecords.filter((r) => r.program === program.name);
    return { program: program.name, ...trainProgramModel(records) };
  });

  const avg = (key) =>
    programModels.reduce((s, pm) => s + pm[key], 0) / programModels.length;

  return {
    programModels,
    models: {
      r2: +avg('r2').toFixed(3),
      mae: +avg('mae').toFixed(2),
      marginalPerCrore: +avg('marginalPerCrore').toFixed(3),
      sampleSize: allRecords.length,
      finalLoss: +avg('finalLoss').toFixed(3),
    },
  };
}

function getModels() {
  if (!_programModels) _programModels = trainAll();
  return _programModels;
}

function projectCoverage(program, budget, province) {
  const base = PROVINCE_HEALTH[province];
  const baselineCoverage = base.coverage;
  const remoteShare = base.remote;

  const { programModels, models } = getModels();
  const pm = programModels.find((m) => m.program === program.name);

  const x = [budget, remoteShare].map((v, j) => (v - pm.means[j]) / pm.stds[j]);
  const predictedGain = pm.theta[0] + x.reduce((sum, v, j) => sum + v * pm.theta[j + 1], 0);

  return {
    program: program.name,
    budget,
    baselineCoverage: +baselineCoverage.toFixed(1),
    remoteShare: +remoteShare.toFixed(1),
    currentCoverage: +baselineCoverage.toFixed(1),
    projectedCoverage: +clamp(baselineCoverage + predictedGain, 20, 99).toFixed(1),
    marginalPerCrore: pm.marginalPerCrore,
    programR2: pm.r2,
  };
}

/**
 * Analyze how a budget should be allocated across health programs.
 */
function analyzeBudgetImpact(province, budget) {
  const { models } = getModels();
  const programs = HEALTH_PROGRAMS.map((program) => {
    const projection = projectCoverage(program, budget, province);
    return {
      ...projection,
      gain: +(projection.projectedCoverage - projection.currentCoverage).toFixed(1),
    };
  }).sort((a, b) => b.gain - a.gain);

  return {
    programs,
    best: programs[0],
    model: models,
  };
}

module.exports = {
  getModels,
  analyzeBudgetImpact,
  projectCoverage,
};
