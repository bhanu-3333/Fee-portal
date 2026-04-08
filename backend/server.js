const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const path = require('path');

// Body parser
app.use(express.json());

// Security headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests or specific ones
app.use('/api/', limiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const authRoutes = require('./routes/auth.js');
const adminRoutes = require('./routes/admin.js');
const studentRoutes = require('./routes/student.js');
const paymentRoutes = require('./routes/payment.js');
const healthRoute = require('./routes/health.js');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/health', healthRoute);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Root Route
app.get('/', (req, res) => {
  res.send('College Fee Management API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
