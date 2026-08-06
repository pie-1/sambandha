/**
 * Simulator Service
 * Orchestrates the unified policy analysis:
 *   1. Ledger-based development impact projection
 *   2. Live community consensus (comments + feedback) for the linked draft
 *   3. Health ML analysis when the sector is health
 *   4. Narrative summary + structured insights
 */

const Draft = require('../models/Draft');
const { runSimulation, buildInsights, computeSectorTrend, computeAggregates, SOURCES } = require('./simulationModel');
const { resolveSimulationInputs } = require('../utils/simulationMappings');
const { simulateHealthPolicy } = require('./healthModel');
const { collectDraftInsights } = require('./liveInsights');
const { buildSummary } = require('./reportBuilder');

const HEALTH_SECTOR = 'Health & Nutrition';

const simulatePolicyImpact = async ({ draftId, province, sectorName, budget, program, claimant }) => {
  let draft = null;

  if (draftId) {
    draft = await Draft.findById(draftId).lean();
    if (!draft || draft.isDeleted) {
      throw new Error('Draft not found');
    }
  }

  const inputs = resolveSimulationInputs({ province, sectorName, budget, draft });
  const result = await runSimulation(inputs.province, inputs.sectorName, inputs.budget);
  const insights = buildInsights(inputs.province, inputs.sectorName, result);
  const [trend, aggregates] = await Promise.all([
    computeSectorTrend(inputs.sectorName),
    computeAggregates(inputs.sectorName),
  ]);
  const historical = {
    datasetSize: result.datasetSize,
    period: '2078/79–2080/81',
    sectorAvg: result.sectorAvg,
    provinceBenchmark: result.provinceBenchmark,
    trend,
    aggregates,
  };

  const [live, health] = await Promise.all([
    collectDraftInsights(draft),
    inputs.sectorName === HEALTH_SECTOR
      ? simulateHealthPolicy({
          draftId,
          inputs: {
            province: inputs.province,
            budget: inputs.budget,
            program,
            title: draft?.title,
            text: draft?.currentVersionText,
            age: claimant?.age,
            familySize: claimant?.familySize,
            incomeBand: claimant?.incomeBand,
            healthIndex: claimant?.healthIndex,
            preExisting: claimant?.preExisting,
          },
        })
      : Promise.resolve(null),
  ]);

  const summary = buildSummary({ scenario: inputs, projections: result, historical, live, health });

  // Small delay to keep the run action perceptible.
  await new Promise((resolve) => setTimeout(resolve, 650));

  return {
    scenario: inputs,
    projections: {
      jobs: result.jobs,
      efficiency: result.efficiency,
      completion: result.completion,
      overrun: result.overrun,
      confidence: result.confidence,
      matches: result.matches,
      sectorAvg: result.sectorAvg,
      sameProvinceSector: result.sameProvinceSector,
    },
    historical,
    live,
    health,
    insights,
    summary,
    sources: SOURCES,
    draftId: draft?._id || null,
    draftTitle: draft?.title || null,
  };
};

module.exports = {
  simulatePolicyImpact,
};
