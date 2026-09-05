const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');

// All student management endpoints are restricted to teachers
router.get('/students', authenticate, requireRole('teacher'), userController.getAllStudents);
router.post('/students', authenticate, requireRole('teacher'), userController.createStudent);
router.put('/students/:id', authenticate, requireRole('teacher'), userController.updateStudent);
router.delete('/students/:id', authenticate, requireRole('teacher'), userController.deleteStudent);

module.exports = router;
