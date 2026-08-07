/**
 * Parliament Routes - One Health Topics
 * Manages parliament topics, public voting, and expert opinions
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");
const parliamentController = require("../controllers/parliamentController");

// ===== PUBLIC ROUTES (Authenticated) =====
router.get("/", verifyToken, parliamentController.getTopics);
router.get("/:id", verifyToken, parliamentController.getTopic);

// ===== ADMIN ONLY (Create topics) =====
router.post("/", verifyToken, requireRole('officer'), parliamentController.createTopic);

// ===== CITIZEN VOTING =====
router.post("/:id/vote", verifyToken, requireRole('citizen'), parliamentController.voteOnTopic);

// ===== EXPERT OPINIONS =====
router.post("/:id/expert-opinion", verifyToken, requireRole('expert'), parliamentController.addExpertOpinion);

module.exports = router;

/**
 * This route file connects parliament discussions with public participation.
 * It allows citizens to see what topics are being discussed in parliament, vote on them, and allows experts 
 * to provide their professional opinions. This bridges the gap between legislative discussions and public sentiment.
 */