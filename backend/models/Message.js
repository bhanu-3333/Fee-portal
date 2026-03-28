const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    subject: { type: String, default: 'General Issue' },
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
