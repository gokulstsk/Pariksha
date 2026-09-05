const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Announcements
router.get('/announcements', communicationController.getAnnouncements);
router.post('/announcements', requireRole(['teacher']), communicationController.createAnnouncement);

// Discussion Forums
router.get('/forums', communicationController.getForumTopics);
router.get('/forums/:id', communicationController.getTopicById);
router.post('/forums', communicationController.createTopic);
router.post('/forums/:id/reply', communicationController.replyToTopic);
router.post('/forums/posts/:postId/accept', communicationController.markPostAsAccepted);

// Notifications
router.get('/notifications', communicationController.getMyNotifications);
router.post('/notifications/mark-read', communicationController.markAllNotificationsRead);

module.exports = router;
