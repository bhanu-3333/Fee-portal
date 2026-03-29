const Student = require('../models/Student');
const College = require('../models/College');
const Department = require('../models/Department');
const Year = require('../models/Year');
const Payment = require('../models/Payment');
const Message = require('../models/Message');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');

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

// @desc    Update department
const updateDepartment = async (req, res) => {
    try {
        const dept = await Department.findOneAndUpdate(
            { _id: req.params.id, collegeId: req.user.collegeId },
            { name: req.body.name },
            { new: true }
        );
        res.json(dept);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Delete department
const deleteDepartment = async (req, res) => {
    try {
        const dept = await Department.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
        if (dept) {
            await Year.deleteMany({ departmentId: dept._id });
            await Student.deleteMany({ departmentId: dept._id });
        }
        res.json({ message: 'Department removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
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

// @desc    Update year
const updateYear = async (req, res) => {
    try {
        const year = await Year.findOneAndUpdate(
            { _id: req.params.id, collegeId: req.user.collegeId },
            { name: req.body.name },
            { new: true }
        );
        res.json(year);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Delete year
const deleteYear = async (req, res) => {
    try {
        const year = await Year.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
        if (year) {
            await Student.deleteMany({ yearId: year._id });
        }
        res.json({ message: 'Year removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
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

        const formattedFees = {
            tuition: { total: Number(fees.tuition) || 0, paid: 0 },
            exam: { total: Number(fees.exam) || 0, paid: 0 },
            transport: { total: Number(fees.transport) || 0, paid: 0 },
            hostel: { total: Number(fees.hostel) || 0, paid: 0 },
            breakage: { total: Number(fees.breakage) || 0, paid: 0 },
            total: totalFees
        };

        const student = await Student.create({
            regNo,
            name,
            department: deptName,
            year: yearName,
            departmentId,
            yearId,
            type,
            collegeId: req.user.collegeId,
            fees: formattedFees,
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
        const totalDepartments = await Department.countDocuments({ collegeId: req.user.collegeId });
        const college = await College.findById(req.user.collegeId);

        res.json({ 
            totalStudents, 
            paidStudents, 
            pendingStudents,
            totalDepartments,
            dueFinished: paidStudents,
            dueNotFinished: pendingStudents,
            college: college ? { name: college.name, logo: college.logo } : null
        });
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
        
        student.fees.tuition.total = Number(fees.tuition) || 0;
        student.fees.exam.total = Number(fees.exam) || 0;
        student.fees.transport.total = Number(fees.transport) || 0;
        student.fees.hostel.total = Number(fees.hostel) || 0;
        student.fees.breakage.total = Number(fees.breakage) || 0;
        student.fees.total = totalFees;

        student.pendingAmount = totalFees - student.paidAmount;

        await student.save();
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
const deleteStudent = async (req, res) => {
    try {
        await Student.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
        await Payment.deleteMany({ studentId: req.params.id }); 
        res.json({ message: 'Student removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get recent payments
const getRecentPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ collegeId: req.user.collegeId, status: 'success' })
            .sort({ date: -1 })
            .limit(15)
            .populate('studentId', 'name pendingAmount');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all messages
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ collegeId: req.user.collegeId })
            .sort({ createdAt: -1 })
            .populate('studentId', 'name regNo department year');
        res.json(messages);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Mark message as read
const markMessageRead = async (req, res) => {
    try {
        const message = await Message.findOneAndUpdate(
            { _id: req.params.id, collegeId: req.user.collegeId },
            { status: 'read' },
            { new: true }
        );
        res.json(message);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Delete message
const deleteMessage = async (req, res) => {
    try {
        await Message.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
        res.json({ message: 'Message deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Upload students in bulk
// @route   POST /api/admin/students/upload
const uploadStudents = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        const { departmentId, yearId } = req.body;
        const dept = await Department.findById(departmentId);
        const yearObj = await Year.findById(yearId);
        if (!dept || !yearObj || String(dept.collegeId) !== String(req.user.collegeId)) {
            return res.status(400).json({ message: 'Invalid department or year parameters' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let successCount = 0;
        let skippedCount = 0;
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const name = row['Name'];
            const regNo = String(row['RegNo'] || '');
            const type = row['Type'] || 'Counselling';
            const tuition = Number(row['Tuition']) || 0;
            const exam = Number(row['Exam']) || 0;
            const transport = Number(row['Transport']) || 0;
            const hostel = Number(row['Hostel']) || 0;
            const breakage = Number(row['Breakage']) || 0;

            if (!name || !regNo) {
                skippedCount++;
                errors.push(`Row ${i + 2}: Missing required fields (Name or RegNo)`);
                continue;
            }

            const exists = await Student.findOne({ regNo, collegeId: req.user.collegeId });
            if (exists) {
                skippedCount++;
                errors.push(`Row ${i + 2}: RegNo already exists (${regNo})`);
                continue;
            }

            const totalFees = tuition + exam + transport + hostel + breakage;

            try {
                await Student.create({
                    regNo,
                    name,
                    department: dept.name,
                    year: yearObj.name,
                    departmentId,
                    yearId,
                    type,
                    collegeId: req.user.collegeId,
                    fees: {
                        tuition: { total: tuition, paid: 0 },
                        exam: { total: exam, paid: 0 },
                        transport: { total: transport, paid: 0 },
                        hostel: { total: hostel, paid: 0 },
                        breakage: { total: breakage, paid: 0 },
                        total: totalFees
                    },
                    pendingAmount: totalFees,
                    paidAmount: 0
                });
                successCount++;
            } catch (err) {
                skippedCount++;
                errors.push(`Row ${i + 2}: Error saving student - ${err.message}`);
            }
        }

        res.json({ successCount, skippedCount, errors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getDepartments, addDepartment, updateDepartment, deleteDepartment, 
    getYears, addYear, updateYear, deleteYear, 
    addStudent, getStudents, updateStudentFees, deleteStudent, 
    getDashboardStats, getRecentPayments,
    getMessages, markMessageRead, deleteMessage,
    uploadStudents
};
