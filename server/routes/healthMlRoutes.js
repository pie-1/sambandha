/**
 * Health ML Routes
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const healthMlController = require("../controllers/healthMlController");

router.get("/metadata", verifyToken, healthMlController.getMetadata);
router.post("/simulate", verifyToken, healthMlController.simulate);

module.exports = router;
