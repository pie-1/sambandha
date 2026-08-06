/**
 * Simulator Service
 * Runs the nearest-neighbour impact model against synthetic ledger data
 */

const Draft = require('../models/Draft');
const { runSimulation, buildInsights } = require('./simulationModel');
const { resolveSimulationInputs } = require('../utils/simulationMappings');

const simulatePolicyImpact = async ({ draftId, province, sectorName, budget }) => {
  let draft = null;

  if (draftId) {
    draft = await Draft.findById(draftId).lean();
    if (!draft || draft.isDeleted) {
      throw new Error('Draft not found');
    }
  }

  const inputs = resolveSimulationInputs({ province, sectorName, budget, draft });
  const result = runSimulation(inputs.province, inputs.sectorName, inputs.budget);
  const insights = buildInsights(inputs.province, inputs.sectorName, result);

  await new Promise((resolve) => setTimeout(resolve, 650));

  return {
    ...result,
    insights,
    inputs,
    draftId: draft?._id || null,
    draftTitle: draft?.title || null,
  };
};

module.exports = {
  simulatePolicyImpact,
};
