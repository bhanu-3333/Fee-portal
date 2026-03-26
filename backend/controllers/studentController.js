const Student = require('../models/Student');
const Payment = require('../models/Payment');

// @desc    Get student profile and fee info
// @route   GET /api/student/dashboard
const getStudentDashboard = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).populate('collegeId', 'name logo address');
        const payments = await Payment.find({ studentId: req.user._id, status: 'completed' }).sort({ date: -1 });
        
        res.json({ student, payments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStudentDashboard };
