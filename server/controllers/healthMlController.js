/**
 * Health ML Controller
 */

const healthModel = require('../services/healthModel');
const {
  PROVINCES,
  PROVINCE_HEALTH,
  HEALTH_PROGRAMS,
} = require('../services/ml/data');
const { getSuccessModel, getBudgetModels, getClaimsModel } = require('../services/ml/pythonBridge');

exports.getMetadata = async (_req, res) => {
  try {
    const successModel = await getSuccessModel();
    const budgetModel = await getBudgetModels();
    const claimsModel = await getClaimsModel();

    res.json({
      success: true,
      data: {
        provinces: PROVINCES,
        programs: HEALTH_PROGRAMS.map((p) => p.name),
        provinceHealth: PROVINCE_HEALTH,
        models: {
          success: {
            sampleSize: successModel.sampleSize,
            accuracy: +successModel.holdout.accuracy.toFixed(3),
            auc: +successModel.holdout.auc.toFixed(3),
            finalLoss: successModel.finalLoss,
            epochs: successModel.epochs,
          },
          impact: {
            sampleSize: budgetModel.models.sampleSize,
            r2: budgetModel.models.r2,
            marginalPerCrore: budgetModel.models.marginalPerCrore,
            mae: budgetModel.models.mae,
          },
          claims: {
            sampleSize: claimsModel.sampleSize,
            r2: claimsModel.r2,
            mae: claimsModel.mae,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.simulate = async (req, res) => {
  try {
    const { draftId } = req.body;
    const data = await healthModel.simulateHealthPolicy({
      draftId,
      inputs: req.body,
    });

    res.json({
      success: true,
      message: 'Health policy analysis complete',
      data,
    });
  } catch (error) {
    const status = error.message === 'Draft not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};
