const express = require('express');
const router = express.Router();
const { getStudentDashboard, sendMessage, getMyMessages } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getStudentDashboard);
router.get('/messages', protect, getMyMessages);
router.post('/messages', protect, sendMessage);

module.exports = router;
