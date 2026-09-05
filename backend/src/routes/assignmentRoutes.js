const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', assignmentController.getAllAssignments);
router.get('/:id', assignmentController.getAssignmentById);
router.post('/', requireRole(['teacher']), assignmentController.createAssignment);
router.post('/:id/submit', requireRole(['student']), assignmentController.submitAssignment);
router.post('/grade/:submissionId', requireRole(['teacher']), assignmentController.gradeSubmission);

module.exports = router;
