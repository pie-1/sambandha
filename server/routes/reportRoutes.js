/**
 * Report Routes - One Health Problem Reporting
 * Handles citizen-reported health and environmental issues
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

router.post("/", verifyToken, reportController.createReport);
router.get("/stats", verifyToken, reportController.getReportStats);
router.get("/top-districts", verifyToken, reportController.getTopProblemDistricts);
router.get("/one-health-summary", verifyToken, reportController.getOneHealthSummary);
router.get("/", verifyToken, reportController.getAllReports);
router.get("/district/:district", verifyToken, reportController.getReportsByDistrict);
router.get("/category/:category", verifyToken, reportController.getReportsByCategory);
router.get("/:id", verifyToken, reportController.getReportWithImages);

module.exports = router;

/**
 * This route file handles citizen problem reporting. Citizens can report health and environmental issues
 * in their communities, and the data is used to generate statistics and identify problem hotspots across districts. 
 * All routes are authenticated to ensure only registered citizens can submit reports.
 */