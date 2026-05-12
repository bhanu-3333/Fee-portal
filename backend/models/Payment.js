const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    studentId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    collegeId:             { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    razorpay_order_id:     { type: String, required: true },   // Razorpay order identifier
    razorpay_payment_id:   { type: String },                   // Razorpay payment identifier (set after success)
    razorpay_signature:    { type: String },                   // HMAC signature for verification
    amount:                { type: Number, required: true },   // Amount in INR (not paisa)
    category:              { type: String, required: true },   // Fee category (tuition, exam, etc.)
    status:                { type: String, default: 'success' },
    date:                  { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
