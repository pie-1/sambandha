/**
 * Comment Routes
 */

const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");

// const { validateComment } = require("../middleware/validation");
const commentController = require("../controllers/commentController");

router.get("/", verifyToken, commentController.getComments);

router.post("/", verifyToken, requireRole(['officer', 'expert']), commentController.addComment);

module.exports = router;