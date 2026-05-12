const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB using the MONGO_URI environment variable.
 * Exits the process with code 1 if the connection fails.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
