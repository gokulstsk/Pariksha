const express = require('express');
const router = express.Router();
const questionBankController = require('../controllers/questionBankController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Category Routes
router.get('/categories', requireRole(['teacher']), questionBankController.getCategories);
router.post('/categories', requireRole(['teacher']), questionBankController.createCategory);
router.delete('/categories/:id', requireRole(['teacher']), questionBankController.deleteCategory);

// Question Bank Routes
router.get('/questions', requireRole(['teacher']), questionBankController.getBankQuestions);
router.post('/questions', requireRole(['teacher']), questionBankController.createBankQuestion);
router.post('/import-to-test', requireRole(['teacher']), questionBankController.importFromBankToTest);
router.post('/add-random-pool', requireRole(['teacher']), questionBankController.addRandomPoolToTest);
router.get('/export', requireRole(['teacher']), questionBankController.exportQuestions);

module.exports = router;
