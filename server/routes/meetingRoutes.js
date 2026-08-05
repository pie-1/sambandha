/**
 * Meeting Routes
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const meetingController = require("../controllers/meetingController");

router.post("/drafts/:id", verifyToken, meetingController.createMeeting);
router.get("/drafts/:id", verifyToken, meetingController.getMeeting);
router.delete("/drafts/:id", verifyToken, meetingController.deleteMeeting);

module.exports = router;