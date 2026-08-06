/**
 * Python ML bridge — routes health-model inference to the scikit-learn
 * microservice (ml-service/) with an automatic fallback to the reference
 * JS implementations when the service is unreachable.
 *
 * Response shapes are normalized to exactly what the JS models returned,
 * so the rest of the pipeline (healthModel.js, controllers, UI) is
 * engine-agnostic. Every result is tagged with `engine`:
 *   'python'      — predicted by the sklearn service
 *   'js-fallback' — predicted by the in-process JS reference models
 */

const HealthRecord = require('../../models/HealthRecord');
const { buildHealthPolicyRecords, buildBudgetOutcomeRecords, buildClaimRecords } = require('./data');
const jsSuccess = require('./logisticRegression');
const jsBudget = require('./budgetModel');
const jsClaims = require('./claimsModel');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const TIMEOUT_MS = Number(process.env.ML_TIMEOUT_MS || 4000);

let _warnedAt = 0;
function warnOnce(msg) {
  const now = Date.now();
  if (now - _warnedAt > 30000) {
    console.warn(`[ml-python] ${msg} — using JS reference models (engine: js-fallback)`);
    _warnedAt = now;
  }
}

async function pythonFetch(path, body, method = 'POST') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ML_SERVICE_URL + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`timed out after ${TIMEOUT_MS}ms`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function loadRecords(kind, fallbackBuilder) {
  try {
    const rows = await HealthRecord.find({ kind }).lean();
    if (rows.length > 0) return rows;
  } catch (err) {
    console.warn(`[ml-python] DB unavailable for ${kind} records (${err.message})`);
  }
  return fallbackBuilder();
}

async function exportAllRecords() {
  const [policy, budget, claims] = await Promise.all([
    loadRecords('policy', buildHealthPolicyRecords),
    loadRecords('budget', buildBudgetOutcomeRecords),
    loadRecords('claim', buildClaimRecords),
  ]);
  return { policy, budget, claims };
}

/**
 * Train the Python service from the same records the JS models use.
 * Fire-and-forget: never throws, safe to call at server startup.
 */
async function warmUp() {
  try {
    const health = await pythonFetch('/health', null, 'GET');
    if (!health.trained) {
      const records = await exportAllRecords();
      const res = await pythonFetch('/train', records);
      console.log(
        `[ml-python] trained sklearn models: ` +
          `${res.data.models.success.sampleSize} policy / ${res.data.models.impact.sampleSize} budget / ` +
          `${res.data.models.claims.sampleSize} claims records`
      );
    } else {
      console.log('[ml-python] sklearn models already trained (artifacts loaded from disk)');
    }
  } catch (err) {
    warnOnce(`ML service unreachable (${err.message})`);
  }
}

async function predictPolicySuccess(inputs) {
  try {
    const res = await pythonFetch('/predict/policy', inputs);
    return { ...res.data, engine: 'python' };
  } catch (err) {
    warnOnce(`policy prediction via Python failed (${err.message})`);
    return { ...(await jsSuccess.predictPolicySuccess(inputs)), engine: 'js-fallback' };
  }
}

async function analyzeBudgetImpact(province, budget) {
  try {
    const res = await pythonFetch('/predict/budget', { province, budget });
    return { ...res.data, engine: 'python' };
  } catch (err) {
    warnOnce(`budget impact via Python failed (${err.message})`);
    return { ...(await jsBudget.analyzeBudgetImpact(province, budget)), engine: 'js-fallback' };
  }
}

async function predictClaims(inputs) {
  try {
    const res = await pythonFetch('/predict/claims', inputs);
    return { ...res.data, engine: 'python' };
  } catch (err) {
    warnOnce(`claims forecast via Python failed (${err.message})`);
    return { ...(await jsClaims.predictClaims(inputs)), engine: 'js-fallback' };
  }
}

async function getSuccessModel() {
  try {
    const res = await pythonFetch('/metadata', null, 'GET');
    const m = res.models.success;
    return {
      sampleSize: m.sampleSize,
      holdout: { accuracy: m.accuracy, auc: m.auc },
      finalLoss: m.finalLoss,
      epochs: m.epochs,
      engine: res.engine,
      features: jsSuccess.FEATURES,
    };
  } catch (err) {
    warnOnce(`metadata via Python failed (${err.message})`);
    return jsSuccess.getModel();
  }
}

async function getBudgetModels() {
  try {
    const res = await pythonFetch('/metadata', null, 'GET');
    const m = res.models.impact;
    return {
      models: {
        sampleSize: m.sampleSize,
        r2: m.r2,
        marginalPerCrore: m.marginalPerCrore,
        mae: m.mae,
        engine: res.engine,
      },
    };
  } catch (err) {
    warnOnce(`budget metadata via Python failed (${err.message})`);
    return jsBudget.getModels();
  }
}

async function getClaimsModel() {
  try {
    const res = await pythonFetch('/metadata', null, 'GET');
    const m = res.models.claims;
    return {
      sampleSize: m.sampleSize,
      r2: m.r2,
      mae: m.mae,
      finalLoss: m.finalLoss,
      epochs: m.epochs,
      engine: res.engine,
      features: jsClaims.FEATURES,
    };
  } catch (err) {
    warnOnce(`claims metadata via Python failed (${err.message})`);
    return jsClaims.getModel();
  }
}

module.exports = {
  ML_SERVICE_URL,
  warmUp,
  exportAllRecords,
  predictPolicySuccess,
  analyzeBudgetImpact,
  predictClaims,
  getSuccessModel,
  getBudgetModels,
  getClaimsModel,
};
