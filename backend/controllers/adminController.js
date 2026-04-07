const Student = require('../models/Student');
const College = require('../models/College');
const Department = require('../models/Department');
const Year = require('../models/Year');
const Payment = require('../models/Payment');
const Message = require('../models/Message');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');

const asyncHandler = require('express-async-handler');

/**
 * @desc    Get departments for the current college
 * @route   GET /api/admin/departments
 * @access  Private (Admin)
 */
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ collegeId: req.user.collegeId });
  res.json({ success: true, data: departments });
});

/**
 * @desc    Add a new department
 * @route   POST /api/admin/departments
 * @access  Private (Admin)
 */
const addDepartment = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const dept = await Department.create({ name, collegeId: req.user.collegeId });
    res.status(201).json({ success: true, data: dept });
});

/**
 * @desc    Update department name
 * @route   PUT /api/admin/departments/:id
 * @access  Private (Admin)
 */
const updateDepartment = asyncHandler(async (req, res) => {
    const dept = await Department.findOneAndUpdate(
        { _id: req.params.id, collegeId: req.user.collegeId },
        { name: req.body.name },
        { new: true }
    );
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: dept });
});

/**
 * @desc    Delete department and its associated years/students
 * @route   DELETE /api/admin/departments/:id
 * @access  Private (Admin)
 */
const deleteDepartment = asyncHandler(async (req, res) => {
    const dept = await Department.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
    if (dept) {
        await Year.deleteMany({ departmentId: dept._id });
        await Student.deleteMany({ departmentId: dept._id });
    }
    res.json({ success: true, message: 'Department and associated data removed' });
});

/**
 * @desc    Get years by department
 * @route   GET /api/admin/departments/:deptId/years
 * @access  Private (Admin)
 */
const getYears = asyncHandler(async (req, res) => {
    const years = await Year.find({ departmentId: req.params.deptId, collegeId: req.user.collegeId });
    res.json({ success: true, data: years });
});

/**
 * @desc    Add a year to a department
 * @route   POST /api/admin/departments/:deptId/years
 * @access  Private (Admin)
 */
const addYear = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const year = await Year.create({ name, departmentId: req.params.deptId, collegeId: req.user.collegeId });
    res.status(201).json({ success: true, data: year });
});

/**
 * @desc    Update year name
 * @route   PUT /api/admin/years/:id
 * @access  Private (Admin)
 */
const updateYear = asyncHandler(async (req, res) => {
    const year = await Year.findOneAndUpdate(
        { _id: req.params.id, collegeId: req.user.collegeId },
        { name: req.body.name },
        { new: true }
    );
    if (!year) return res.status(404).json({ success: false, message: 'Year not found' });
    res.json({ success: true, data: year });
});

/**
 * @desc    Delete year and its associated students
 * @route   DELETE /api/admin/years/:id
 * @access  Private (Admin)
 */
const deleteYear = asyncHandler(async (req, res) => {
    const year = await Year.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
    if (year) {
        await Student.deleteMany({ yearId: year._id });
    }
    res.json({ success: true, message: 'Year and associated students removed' });
});

/**
 * @desc    Add a single student
 * @route   POST /api/admin/students
 * @access  Private (Admin)
 */
const addStudent = asyncHandler(async (req, res) => {
    const { regNo, name, type, fees, departmentId, yearId } = req.body;
    const studentExists = await Student.findOne({ regNo, collegeId: req.user.collegeId });
    if (studentExists) return res.status(400).json({ success: false, message: 'Student already exists' });

    let deptName = req.body.department || 'Unknown';
    let yearName = req.body.year || 'Unknown';

    if (departmentId && yearId) {
        const dept = await Department.findById(departmentId);
        const yearObj = await Year.findById(yearId);
        if (!dept || !yearObj) return res.status(404).json({ success: false, message: 'Invalid department or year' });
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

    res.status(201).json({ success: true, data: student });
});

/**
 * @desc    Get all students with optional filters
 * @route   GET /api/admin/students
 * @access  Private (Admin)
 */
const getStudents = asyncHandler(async (req, res) => {
    const { departmentId, yearId, department, year } = req.query;
    let query = { collegeId: req.user.collegeId };
    if (departmentId) query.departmentId = departmentId;
    if (yearId) query.yearId = yearId;
    if (department) query.department = department;
    if (year) query.year = year;

    const students = await Student.find(query);
    res.json({ success: true, data: students });
});

/**
 * @desc    Get summary statistics for dashboard
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalStudents = await Student.countDocuments({ collegeId: req.user.collegeId });
    const paidStudents = await Student.countDocuments({ collegeId: req.user.collegeId, pendingAmount: 0 });
    const pendingStudents = await Student.countDocuments({ collegeId: req.user.collegeId, pendingAmount: { $gt: 0 } });
    const totalDepartments = await Department.countDocuments({ collegeId: req.user.collegeId });
    const college = await College.findById(req.user.collegeId).lean();
    
    res.json({ 
        success: true,
        data: {
            totalStudents, 
            paidStudents, 
            pendingStudents,
            totalDepartments,
            dueFinished: paidStudents,
            dueNotFinished: pendingStudents,
            college: college ? { 
                name: college.name, 
                logo: college.logo, 
                collegeCode: college.collegeId 
            } : null
        }
    });
});

/**
 * @desc    Update student fees structure
 * @route   PUT /api/admin/students/:id
 * @access  Private (Admin)
 */
const updateStudentFees = asyncHandler(async (req, res) => {
    const { fees } = req.body;
    const student = await Student.findOne({ _id: req.params.id, collegeId: req.user.collegeId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const getFeeVal = (category) => {
        if (!fees[category]) return 0;
        if (typeof fees[category] === 'object' && fees[category] !== null) {
            return Number(fees[category].total) || 0;
        }
        return Number(fees[category]) || 0;
    };

    const tuitionTotal = getFeeVal('tuition');
    const examTotal = getFeeVal('exam');
    const transportTotal = getFeeVal('transport');
    const hostelTotal = getFeeVal('hostel');
    const breakageTotal = getFeeVal('breakage');

    const newTotalFees = tuitionTotal + examTotal + transportTotal + hostelTotal + breakageTotal;
    const newPendingAmount = newTotalFees - (student.paidAmount || 0);

    const updatedStudent = await Student.findByIdAndUpdate(
        student._id,
        { 
            $set: { 
                'fees.tuition.total': tuitionTotal,
                'fees.exam.total': examTotal,
                'fees.transport.total': transportTotal,
                'fees.hostel.total': hostelTotal,
                'fees.breakage.total': breakageTotal,
                'fees.total': newTotalFees,
                'pendingAmount': newPendingAmount
            } 
        },
        { new: true }
    );

    res.json({ success: true, data: updatedStudent });
});

/**
 * @desc    Delete a student and their payments
 * @route   DELETE /api/admin/students/:id
 * @access  Private (Admin)
 */
const deleteStudent = asyncHandler(async (req, res) => {
    await Student.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
    await Payment.deleteMany({ studentId: req.params.id }); 
    res.json({ success: true, message: 'Student and associated payments removed' });
});

/**
 * @desc    Get recently successful payments
 * @route   GET /api/admin/payments/recent
 * @access  Private (Admin)
 */
const getRecentPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ collegeId: req.user.collegeId, status: 'success' })
        .sort({ date: -1 })
        .limit(15)
        .populate('studentId', 'name pendingAmount');
    res.json({ success: true, data: payments });
});

/**
 * @desc    Get all messages/queries for the college
 * @route   GET /api/admin/messages
 * @access  Private (Admin)
 */
const getMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find({ collegeId: req.user.collegeId })
        .sort({ createdAt: -1 })
        .populate('studentId', 'name regNo department year');
    res.json({ success: true, data: messages });
});

/**
 * @desc    Mark a message as read
 * @route   PATCH /api/admin/messages/:id/read
 * @access  Private (Admin)
 */
const markMessageRead = asyncHandler(async (req, res) => {
    const message = await Message.findOneAndUpdate(
        { _id: req.params.id, collegeId: req.user.collegeId },
        { status: 'read' },
        { new: true }
    );
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: message });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/admin/messages/:id
 * @access  Private (Admin)
 */
const deleteMessage = asyncHandler(async (req, res) => {
    const msg = await Message.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
});

/**
 * @desc    Upload students in bulk from Excel
 * @route   POST /api/admin/students/upload
 * @access  Private (Admin)
 */
const uploadStudents = asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    const { departmentId, yearId } = req.body;
    const dept = await Department.findById(departmentId);
    const yearObj = await Year.findById(yearId);
    
    if (!dept || !yearObj || String(dept.collegeId) !== String(req.user.collegeId)) {
        return res.status(400).json({ success: false, message: 'Invalid department or year parameters' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Optimization: Pre-fetch all registration numbers for this college to avoid N+1 queries
    const existingStudents = await Student.find({ collegeId: req.user.collegeId }, 'regNo').lean();
    const existingRegNos = new Set(existingStudents.map(s => String(s.regNo)));

    let successCount = 0;
    let skippedCount = 0;
    const errors = [];
    const studentsToCreate = [];

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

        if (existingRegNos.has(regNo)) {
            skippedCount++;
            errors.push(`Row ${i + 2}: RegNo already exists (${regNo})`);
            continue;
        }

        const totalFees = tuition + exam + transport + hostel + breakage;
        studentsToCreate.push({
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
        existingRegNos.add(regNo); // Avoid duplicates within the same file
    }

    if (studentsToCreate.length > 0) {
        try {
            await Student.insertMany(studentsToCreate);
            successCount = studentsToCreate.length;
        } catch (err) {
            return res.status(500).json({ success: false, message: `Insertion failed: ${err.message}` });
        }
    }

    res.json({ success: true, successCount, skippedCount, errors });
});

/**
 * @desc    Reply to a student query
 * @route   PATCH /api/admin/messages/:id/reply
 * @access  Private (Admin)
 */
const replyToMessage = asyncHandler(async (req, res) => {
    const { reply } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message || String(message.collegeId) !== String(req.user.collegeId)) {
        return res.status(404).json({ success: false, message: 'Message not found' });
    }
    message.reply = reply;
    message.status = 'replied';
    await message.save();
    res.json({ success: true, data: message });
});

module.exports = { 
    getDepartments, addDepartment, updateDepartment, deleteDepartment, 
    getYears, addYear, updateYear, deleteYear, 
    addStudent, getStudents, updateStudentFees, deleteStudent, 
    getDashboardStats, getRecentPayments,
    getMessages, markMessageRead, deleteMessage, replyToMessage,
    uploadStudents
};

