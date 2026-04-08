import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminSignup from './pages/AdminSignup';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <div className="app-container">
        <div className="fade-in">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<AdminSignup />} />
            <Route path="/admin/*" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/student/*" element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
            <Route path="/student" element={<Navigate to="/student/dashboard" />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
