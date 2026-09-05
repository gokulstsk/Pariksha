const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticate, requireRole } = require('../middleware/auth');

// All question modifying routes are teacher only
router.post('/test/:testId', authenticate, requireRole('teacher'), questionController.createQuestion);
router.post('/test/:testId/bulk', authenticate, requireRole('teacher'), questionController.bulkImportQuestions);
router.put('/:id', authenticate, requireRole('teacher'), questionController.updateQuestion);
router.delete('/:id', authenticate, requireRole('teacher'), questionController.deleteQuestion);

module.exports = router;
