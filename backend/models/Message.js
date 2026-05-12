const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    name:      { type: String },                                                          // Denormalized student name for quick display
    regNo:     { type: String },                                                          // Denormalized reg number for quick display
    subject:   { type: String, default: 'General Issue' },
    message:   { type: String, required: true },
    reply:     { type: String, default: '' },                                             // Admin reply text
    status:    { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
