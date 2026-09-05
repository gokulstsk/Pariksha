const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', requireRole(['teacher']), courseController.createCourse);
router.put('/:id', requireRole(['teacher']), courseController.updateCourse);
router.delete('/:id', requireRole(['teacher']), courseController.deleteCourse);
router.post('/:courseId/enroll', requireRole(['student']), courseController.enrollInCourse);

module.exports = router;
