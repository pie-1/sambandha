/**
 * Project Routes — public
 * Transparency board: every provincial capital project, no login.
 */

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects);
router.get('/stats', projectController.getProjectStats);

module.exports = router;
