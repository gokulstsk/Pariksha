const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate, requireRole } = require('../middleware/auth');

// Student submits test
router.post('/test/:testId', authenticate, requireRole('student'), submissionController.submitTest);

// Student views own submission history
router.get('/my-history', authenticate, requireRole('student'), submissionController.getMySubmissions);

// Teacher views all submissions for a test
router.get('/test/:testId', authenticate, requireRole('teacher'), submissionController.getTestSubmissions);

// Get single submission report by ID (student or teacher)
router.get('/:id', authenticate, submissionController.getSubmissionById);

module.exports = router;
