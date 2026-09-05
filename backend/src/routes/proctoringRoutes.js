const express = require('express');
const router = express.Router();
const proctoringController = require('../controllers/proctoringController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Student logs violation during active exam
router.post('/violation/:testId', requireRole(['student']), proctoringController.logProctoringViolation);

// Teacher live monitoring & actions
router.get('/session/:testId', requireRole(['teacher']), proctoringController.getLiveTestSession);
router.post('/extra-time/:submissionId', requireRole(['teacher']), proctoringController.grantExtraTime);
router.post('/force-submit/:submissionId', requireRole(['teacher']), proctoringController.forceSubmitSession);

module.exports = router;
