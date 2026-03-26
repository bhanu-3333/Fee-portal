const Student = require('../models/Student');
const College = require('../models/College');
const bcrypt = require('bcryptjs');

// @desc    Add department to college
// @route   POST /api/admin/departments
const addDepartment = async (req, res) => {
    const { name, years } = req.body;
    try {
        const college = await College.findById(req.user.collegeId);
        if (!college) return res.status(404).json({ message: 'College not found' });

        college.departments.push({ name, years });
        await college.save();
        res.status(201).json(college.departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add student
// @route   POST /api/admin/students
const addStudent = async (req, res) => {
    const { regNo, name, department, year, type, fees } = req.body;
    try {
        const studentExists = await Student.findOne({ regNo, collegeId: req.user.collegeId });
        if (studentExists) return res.status(400).json({ message: 'Student already exists' });

        const totalFees = Object.values(fees).reduce((a, b) => a + (Number(b) || 0), 0);

        const student = await Student.create({
            regNo,
            name,
            department,
            year,
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
    const { department, year } = req.query;
    let query = { collegeId: req.user.collegeId };
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

module.exports = { addDepartment, addStudent, getStudents, getDashboardStats, updateStudentFees };
