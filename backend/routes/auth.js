const express = require('express'); // verified
const router = express.Router();
const { adminSignup, adminLogin, studentLogin } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `logo_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post('/admin/signup', upload.single('logo'), adminSignup);
router.post('/admin/login', adminLogin);
router.post('/student/login', studentLogin);

module.exports = router;
