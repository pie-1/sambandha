/**
 * Feedback Routes
 * 
 * Handles public feedback on finalized drafts
 */

const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");

// const { validateFeedback } = require("../middleware/validation");
const feedbackController = require("../controllers/feedbackController");


router.post("/", verifyToken, requireRole('citizen'), feedbackController.submitFeedback);
router.get("/summary", verifyToken, feedbackController.getFeedbackSummary);
router.get("/", verifyToken, feedbackController.getFeedback);

module.exports = router;
