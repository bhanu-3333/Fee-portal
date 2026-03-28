const mongoose = require('mongoose');

const yearSchema = new mongoose.Schema({
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    name: { type: String, required: true } // e.g., "1st Year", "2nd Year"
}, { timestamps: true });

// Ensure unique year name within a department
yearSchema.index({ name: 1, departmentId: 1 }, { unique: true });

module.exports = mongoose.model('Year', yearSchema);
