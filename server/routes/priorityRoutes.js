/**
 * Priority Routes — public
 * No login required (citizen voice is open on this platform).
 */

const express = require('express');
const router = express.Router();
const priorityController = require('../controllers/priorityController');

router.post('/', priorityController.submitPriorityVote);
router.get('/ranking', priorityController.getPriorityRanking);

module.exports = router;
