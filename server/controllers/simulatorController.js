/**
 * Simulator Controller
 */

const simulatorService = require('../services/simulatorService');
const { PROVINCES, SECTORS, DATASET } = require('../services/simulationModel');

exports.getMetadata = (_req, res) => {
  res.json({
    success: true,
    data: {
      provinces: PROVINCES,
      sectors: SECTORS,
      datasetSize: DATASET.length,
    },
  });
};

exports.simulate = async (req, res) => {
  try {
    const { draftId, province, sectorName, sector, budget, budgetAmount, program, claimant } = req.body;

    const data = await simulatorService.simulatePolicyImpact({
      draftId,
      province,
      sectorName: sectorName || sector,
      budget: budget ?? (budgetAmount ? budgetAmount / 10_000_000 : undefined),
      program,
      claimant,
    });

    res.json({
      success: true,
      message: 'Simulation complete',
      data,
    });
  } catch (error) {
    const status = error.message === 'Draft not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};
