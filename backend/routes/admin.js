const express = require('express');
const router = express.Router();
const { 
    getDepartments, addDepartment, updateDepartment, deleteDepartment,
    getYears, addYear, updateYear, deleteYear,
    addStudent, getStudents, updateStudentFees, deleteStudent,
    getDashboardStats, getRecentPayments
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/recent-payments', getRecentPayments);

router.get('/departments', getDepartments);
router.post('/departments', addDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

router.get('/departments/:deptId/years', getYears);
router.post('/departments/:deptId/years', addYear);
router.put('/years/:id', updateYear);
router.delete('/years/:id', deleteYear);

router.post('/students', addStudent);
router.get('/students', getStudents);
router.put('/students/:id', updateStudentFees);
router.delete('/students/:id', deleteStudent);

module.exports = router;
