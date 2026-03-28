const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    regNo: { type: String, required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    name: { type: String, required: true },
    email: { type: String }, // optional but good to have
    password: { type: String },
    isPasswordSet: { type: Boolean, default: false },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    yearId: { type: mongoose.Schema.Types.ObjectId, ref: 'Year' },
    department: { type: String, required: true },
    year: { type: String, required: true },
    type: { type: String, enum: ['Counselling', 'Management', 'Scholarship'], required: true },
    fees: {
        tuition: { type: Number, default: 0 },
        exam: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
        hostel: { type: Number, default: 0 },
        breakage: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure unique regNo within a college
studentSchema.index({ regNo: 1, collegeId: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
