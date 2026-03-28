const Student = require('../models/Student');
const College = require('../models/College');
const Department = require('../models/Department');
const Year = require('../models/Year');
const bcrypt = require('bcryptjs');

// @desc    Get departments
// @route   GET /api/admin/departments
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ collegeId: req.user.collegeId });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add department
// @route   POST /api/admin/departments
const addDepartment = async (req, res) => {
    const { name } = req.body;
    try {
        const dept = await Department.create({ name, collegeId: req.user.collegeId });
        res.status(201).json(dept);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get years by department
// @route   GET /api/admin/departments/:deptId/years
const getYears = async (req, res) => {
    try {
        const years = await Year.find({ departmentId: req.params.deptId, collegeId: req.user.collegeId });
        res.json(years);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add year
// @route   POST /api/admin/departments/:deptId/years
const addYear = async (req, res) => {
    const { name } = req.body;
    try {
        const year = await Year.create({ name, departmentId: req.params.deptId, collegeId: req.user.collegeId });
        res.status(201).json(year);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add student
// @route   POST /api/admin/students
const addStudent = async (req, res) => {
    const { regNo, name, type, fees, departmentId, yearId } = req.body;
    try {
        const studentExists = await Student.findOne({ regNo, collegeId: req.user.collegeId });
        if (studentExists) return res.status(400).json({ message: 'Student already exists' });

        let deptName = req.body.department || 'Unknown';
        let yearName = req.body.year || 'Unknown';

        if (departmentId && yearId) {
            const dept = await Department.findById(departmentId);
            const yearObj = await Year.findById(yearId);
            if (!dept || !yearObj) return res.status(404).json({ message: 'Invalid department or year' });
            deptName = dept.name;
            yearName = yearObj.name;
        }

        const totalFees = Object.values(fees).reduce((a, b) => a + (Number(b) || 0), 0);

        const student = await Student.create({
            regNo,
            name,
            department: deptName,
            year: yearName,
            departmentId,
            yearId,
            type,
            collegeId: req.user.collegeId,
            fees: { ...fees, total: totalFees },
            pendingAmount: totalFees
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students for the college
// @route   GET /api/admin/students
const getStudents = async (req, res) => {
    const { departmentId, yearId, department, year } = req.query;
    let query = { collegeId: req.user.collegeId };
    if (departmentId) query.departmentId = departmentId;
    if (yearId) query.yearId = yearId;
    if (department) query.department = department;
    if (year) query.year = year;

    try {
        const students = await Student.find(query);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments({ collegeId: req.user.collegeId });
        const paidStudents = await Student.countDocuments({ collegeId: req.user.collegeId, pendingAmount: 0 });
        const pendingStudents = await Student.countDocuments({ collegeId: req.user.collegeId, pendingAmount: { $gt: 0 } });

        res.json({ totalStudents, paidStudents, pendingStudents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student fees
// @route   PUT /api/admin/students/:id
const updateStudentFees = async (req, res) => {
    const { fees } = req.body;
    try {
        const student = await Student.findOne({ _id: req.params.id, collegeId: req.user.collegeId });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const totalFees = Object.values(fees).reduce((a, b) => a + (Number(b) || 0), 0);
        student.fees = { ...fees, total: totalFees };
        student.pendingAmount = totalFees - student.paidAmount;

        await student.save();
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDepartments, addDepartment, getYears, addYear, addStudent, getStudents, getDashboardStats, updateStudentFees };
