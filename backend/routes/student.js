const express = require('express');
const router = express.Router();
const { getStudentDashboard } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getStudentDashboard);

module.exports = router;
