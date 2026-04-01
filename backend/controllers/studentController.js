const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Message = require('../models/Message');

// @desc    Get student profile and fee info
// @route   GET /api/student/dashboard
const getStudentDashboard = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).populate('collegeId', 'name logo address');
        const payments = await Payment.find({ studentId: req.user._id, status: 'success' }).sort({ date: -1 });
        
        res.json({ student, payments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message/report to admin
// @route   POST /api/student/messages
const sendMessage = async (req, res) => {
    const { subject, message } = req.body;
    try {
        const student = await Student.findById(req.user._id);
        const newMessage = await Message.create({
            studentId: req.user._id,
            collegeId: req.user.collegeId,
            name: student?.name || '',
            regNo: student?.regNo || '',
            subject,
            message
        });
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all messages for the logged-in student
// @route   GET /api/student/messages
const getMyMessages = async (req, res) => {
    try {
        const messages = await Message.find({ studentId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStudentDashboard, sendMessage, getMyMessages };
