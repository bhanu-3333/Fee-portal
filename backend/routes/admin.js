const express = require('express');
const router = express.Router();
const { getDepartments, addDepartment, getYears, addYear, addStudent, getStudents, getDashboardStats, updateStudentFees } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.get('/departments', getDepartments);
router.post('/departments', addDepartment);
router.get('/departments/:deptId/years', getYears);
router.post('/departments/:deptId/years', addYear);

router.post('/students', addStudent);
router.get('/students', getStudents);
router.get('/dashboard', getDashboardStats);
router.put('/students/:id', updateStudentFees);

module.exports = router;
