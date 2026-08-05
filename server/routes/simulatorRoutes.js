/**
 * Simulator Routes
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const simulatorController = require("../controllers/simulatorController");


router.post("/", verifyToken, simulatorController.simulate);

module.exports = router;