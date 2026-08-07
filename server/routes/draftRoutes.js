/**
 * Draft Routes - Complete with ML integration
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");
const draftController = require("../controllers/draftController");

// ===== PUBLIC ROUTES (Authenticated) =====
router.get("/", verifyToken, draftController.getDrafts);
router.get("/one-health-dashboard", verifyToken, draftController.getOneHealthDashboard);
router.get("/:id", verifyToken, draftController.getDraft);

// ===== 🧠 ML PREDICTION ROUTE =====
router.get("/:id/ml-prediction", verifyToken, draftController.getMLPrediction);

// ===== OFFICER ONLY =====
router.post("/", verifyToken, requireRole('officer'), draftController.createDraft);
router.patch("/:id/finalize", verifyToken, requireRole('officer'), draftController.finalizeDraft);

// ===== OFFICER & EXPERT =====
router.patch("/:id", verifyToken, requireRole(['officer', 'expert']), draftController.updateDraft);

// ===== EXPERT CONSENSUS =====
router.patch("/:id/consensus", verifyToken, requireRole('expert'), draftController.updateConsensus);
router.get("/:id/consensus", verifyToken, draftController.getConsensus);

// ===== IMPLEMENTATION TRACKING =====
router.patch("/:id/implementation", verifyToken, requireRole('officer'), draftController.updateImplementation);
router.get("/:id/implementation", verifyToken, draftController.getImplementation);

// ===== LINK REPORTS TO DRAFT =====
router.patch("/:id/link-reports", verifyToken, requireRole('officer'), draftController.linkReportsToDraft);

module.exports = router;