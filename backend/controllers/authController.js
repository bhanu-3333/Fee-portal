const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const College = require('../models/College');
const Admin = require('../models/Admin');
const Student = require('../models/Student');

/**
 * @desc    Register a new college and admin
 * @route   POST /api/auth/admin/signup
 * @access  Public
 */
const adminSignup = async (req, res) => {
    const { collegeName, collegeId, email, password, adminName, address } = req.body;
    
    // Password complexity check
    if (!password || password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Support both file upload and URL fallback
    let logo = '';
    if (req.file) {
        logo = `uploads/logos/${req.file.filename}`;
    } else if (req.body.logo) {
        logo = req.body.logo;
    }

    try {
        const collegeExists = await College.findOne({ collegeId });
        if (collegeExists) return res.status(400).json({ success: false, message: 'College ID already exists' });

        const college = await College.create({ name: collegeName, collegeId, email, logo, address });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.create({
            collegeId: college._id,
            email,
            password: hashedPassword,
            name: adminName
        });

        res.status(201).json({
            success: true,
            token: generateToken(admin._id, 'admin'),
            collegeId: college.collegeId,
            role: 'admin'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Login admin
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email }).populate('collegeId');
        if (admin && (await bcrypt.compare(password, admin.password))) {
            res.json({
                success: true,
                token: generateToken(admin._id, 'admin'),
                collegeId: admin.collegeId.collegeId,
                role: 'admin'
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Login student
 * @route   POST /api/auth/student/login
 * @access  Public
 */
const studentLogin = async (req, res) => {
    const { regNo, password, collegeId } = req.body;

    try {
        const college = await College.findOne({ collegeId });
        if (!college) return res.status(404).json({ success: false, message: 'College not found' });

        const student = await Student.findOne({ regNo, collegeId: college._id });
        if (!student) return res.status(401).json({ success: false, message: 'Invalid registration number' });

        // First time login - set password
        if (!student.isPasswordSet) {
            if (!password) {
                return res.status(200).json({ success: true, firstTime: true, message: 'Please set your password' });
            }
            if (password.length < 8) {
                return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
            }
            const salt = await bcrypt.genSalt(10);
            student.password = await bcrypt.hash(password, salt);
            student.isPasswordSet = true;
            await student.save();
        }

        if (await bcrypt.compare(password, student.password)) {
            res.json({
                success: true,
                token: generateToken(student._id, 'student'),
                collegeId: college.collegeId,
                role: 'student'
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Generate JWT Token
 */
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { adminSignup, adminLogin, studentLogin };
