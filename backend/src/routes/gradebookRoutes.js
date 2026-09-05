const express = require('express');
const router = express.Router();
const gradebookController = require('../controllers/gradebookController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole(['teacher']));

router.get('/overview', gradebookController.getGradebookOverview);
router.post('/grade-answer/:answerId', gradebookController.gradeSubmissionAnswer);
router.get('/export-csv', gradebookController.exportGradebookCSV);

module.exports = router;
