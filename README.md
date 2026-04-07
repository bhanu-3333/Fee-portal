# 🎓 FeeManager | Premium College Fees Management System

A robust, full-stack solution for managing student fees across multiple colleges. Built with a focus on modern aesthetics, security, and administrative efficiency.

## 🚀 Key Features

- **Premium UI/UX**: Modern glassmorphism design with smooth transitions and responsive layouts.
- **Role-Based Access**: Dedicated portals for Students and Administrators.
- **Bulk Operations**: High-performance Excel-based student data upload with optimized conflict checking.
- **Secure Authentication**: JWT-based security with rate limiting and password complexity enforcement.
- **Dynamic Fee Structure**: Flexible fee categories (Tuition, Exam, Transport, Hostel, etc.).
- **Interactive Dashboards**: Real-time stats and automated due tracking.
- **Health Monitoring**: Built-in API health check endpoints.

## 🛠 Tech Stack

- **Frontend**: React.js, Vite, Lucide Icons, Vanilla CSS (Design System)
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Security**: Helmet.js, Express Rate Limit, JWT, BcryptJS
- **Data Handling**: XLSX, Multer

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas or local instance

### Setup
1. Clone the repository
2. **Backend**:
   ```bash
   cd backend
   npm install
   # Create a .env file with PORT, MONGO_URI, and JWT_SECRET
   npm start
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   # Create a .env file with VITE_API_URL
   npm run dev
   ```

## 🔒 Security & Performance
- **Rate Limiting**: Protects against brute-force attacks on API endpoints.
- **Helmet**: Secures HTTP headers to prevent common web vulnerabilities.
- **Optimized Uploads**: Bulk student imports use batch insertion and pre-fetched existence checks for maximum performance.
- **Error Handling**: Centralized global error middleware with detailed development logging.

## 📄 License
Distributed under the MIT License.
