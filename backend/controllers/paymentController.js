const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Student = require('../models/Student');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createOrder = async (req, res) => {
    const { amount, category } = req.body;

    if (!category || !['tuition', 'exam', 'transport', 'hostel', 'breakage'].includes(category)) {
        return res.status(400).json({ message: 'Valid payment category is required' });
    }

    try {
        const options = {
            amount: amount * 100, // amount in paisa
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Store pending payment in DB
        await Payment.create({
            studentId: req.user._id,
            collegeId: req.user.collegeId,
            razorpay_order_id: order.id,
            amount,
            category,
            status: 'pending'
        });

        res.json({
            ...order,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify-payment
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest === razorpay_signature) {
        try {
            const payment = await Payment.findOne({ razorpay_order_id });
            if (!payment) return res.status(404).json({ message: 'Order not found' });

            payment.razorpay_payment_id = razorpay_payment_id;
            payment.razorpay_signature = razorpay_signature;
            payment.status = 'completed';
            await payment.save();

            // Update student record
            const student = await Student.findById(payment.studentId);
            
            if (student.fees[payment.category]) {
                student.fees[payment.category].paid += payment.amount;
            }

            student.paidAmount += payment.amount;
            student.pendingAmount = student.fees.total - student.paidAmount;
            
            await student.save();

            res.json({ success: true, message: 'Payment verified and updated' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(400).json({ success: false, message: 'Invalid signature' });
    }
};

module.exports = { createOrder, verifyPayment };
