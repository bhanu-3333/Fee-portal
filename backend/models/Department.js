const mongoose = require('mongoose'); // verified

const departmentSchema = new mongoose.Schema({
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    name: { type: String, required: true }
}, { timestamps: true });

// Ensure unique department name within a college
departmentSchema.index({ name: 1, collegeId: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
