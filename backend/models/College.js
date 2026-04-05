const mongoose = require('mongoose'); // verified

const collegeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: { type: String },
    collegeId: { type: String, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    departments: [{
        name: { type: String, required: true },
        years: [{ type: String, required: true }] // e.g. ["1st Year", "2nd Year"]
    }],
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
