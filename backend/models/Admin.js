const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
