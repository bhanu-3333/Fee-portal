const express = require('express');
const router = express.Router();

/**
 * @desc    API Health Check
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
