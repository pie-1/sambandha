/**
 * Draft Routes
 * 
 * Handles CRUD operations for policy drafts
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");
const { validateDraft } = require("../middleware/validation");
const draftController = require("../controllers/draftController"); // ✅

router.get("/", verifyToken, draftController.getDrafts);
router.get("/:id", verifyToken, draftController.getDraft);
router.post("/", verifyToken, requireRole('officer'), validateDraft, draftController.createDraft);
router.patch("/:id/finalize", verifyToken, requireRole('officer'), draftController.finalizeDraft);
router.patch("/:id", verifyToken, requireRole(['officer', 'expert']), draftController.updateDraft);

module.exports = router;