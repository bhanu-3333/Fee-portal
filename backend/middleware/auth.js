const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.role === 'admin') {
                req.user = await Admin.findById(decoded.id).select('-password').lean();
            } else if (decoded.role === 'student') {
                req.user = await Student.findById(decoded.id).select('-password').lean();
            }
            
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user.role = decoded.role;
            console.log(`🔐 [Auth] User Authenticated: ${req.user.name} (${decoded.role})`);
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        console.warn(`🚫 [Auth] Forbidden: Admin access required. Current role: ${req.user?.role || 'none'}`);
        res.status(403).json({ message: 'Admin access required' });
    }
};

module.exports = { protect, adminOnly };
