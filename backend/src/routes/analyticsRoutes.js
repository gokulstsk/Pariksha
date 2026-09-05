const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/teacher-dashboard', authenticate, requireRole('teacher'), analyticsController.getTeacherDashboardStats);

module.exports = router;
