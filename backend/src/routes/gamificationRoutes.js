const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authenticateToken } = require('../middleware/auth');

// Public verification
router.get('/verify-certificate/:code', gamificationController.verifyCertificate);

// Protected routes
router.use(authenticateToken);
router.get('/my-certificates', gamificationController.getMyCertificates);
router.get('/my-badges', gamificationController.getMyBadges);

module.exports = router;
