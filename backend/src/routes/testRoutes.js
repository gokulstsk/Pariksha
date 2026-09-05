const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { authenticate, requireRole } = require('../middleware/auth');

// Both teacher and student can view tests (behavior customized by role)
router.get('/', authenticate, testController.getAllTests);
router.get('/:id', authenticate, testController.getTestById);

// Teacher-only routes
router.post('/', authenticate, requireRole('teacher'), testController.createTest);
router.put('/:id', authenticate, requireRole('teacher'), testController.updateTest);
router.patch('/:id/toggle-publish', authenticate, requireRole('teacher'), testController.togglePublish);
router.delete('/:id', authenticate, requireRole('teacher'), testController.deleteTest);

module.exports = router;
