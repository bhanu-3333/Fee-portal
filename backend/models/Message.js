const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    name: { type: String },
    regNo: { type: String },
    subject: { type: String, default: 'General Issue' },
    message: { type: String, required: true },
    reply: { type: String, default: '' },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
