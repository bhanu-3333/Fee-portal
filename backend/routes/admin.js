const express = require('express');
const router = express.Router();
const { addDepartment, addStudent, getStudents, getDashboardStats, updateStudentFees } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.post('/departments', addDepartment);
router.post('/students', addStudent);
router.get('/students', getStudents);
router.get('/dashboard', getDashboardStats);
router.put('/students/:id', updateStudentFees);

module.exports = router;
