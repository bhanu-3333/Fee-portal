import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { LogIn, GraduationCap, Building2 } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ email: '', password: '', regNo: '', collegeId: '' });
  const [error, setError] = useState('');
  const [firstTime, setFirstTime] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/student/login';
      const body = role === 'admin' 
        ? { email: formData.email, password: formData.password }
        : { regNo: formData.regNo, password: formData.password, collegeId: formData.collegeId };

      const { data } = await api.post(endpoint, body);

      if (data.firstTime) {
        setFirstTime(true);
        return;
      }

      localStorage.setItem('user', JSON.stringify(data));
      navigate(data.role === 'admin' ? '/admin/dashboard' : '/student');
      window.location.reload(); // Quick refresh to update App state
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #ffffff11, transparent), radial-gradient(circle at bottom left, #ffffff05, transparent)'
    }}>
      <div className="glass card" style={{ width: '400px', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem', fontWeight: 800 }}>
          {role === 'admin' ? 'Admin Login' : 'Student Login'}
        </h2>

        <div style={{ display: 'flex', background: 'var(--glass)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          <button 
            onClick={() => setRole('student')}
            style={{ 
              flex: 1, padding: '10px', border: 'none', borderRadius: '8px', 
              background: role === 'student' ? 'var(--primary)' : 'transparent',
              color: 'white', cursor: 'pointer', transition: '0.3s'
            }}
          >
            <GraduationCap size={18} style={{ marginRight: 8 }} /> Student
          </button>
          <button 
            onClick={() => setRole('admin')}
            style={{ 
              flex: 1, padding: '10px', border: 'none', borderRadius: '8px', 
              background: role === 'admin' ? 'var(--primary)' : 'transparent',
              color: 'white', cursor: 'pointer', transition: '0.3s'
            }}
          >
            <Building2 size={18} style={{ marginRight: 8 }} /> Admin
          </button>
        </div>

        {error && <p style={{ color: 'var(--error)', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
        {firstTime && <p style={{ color: 'var(--success)', marginBottom: '16px', textAlign: 'center' }}>First time? Enter a new password to set up your account.</p>}

        <form onSubmit={handleSubmit}>
          {role === 'admin' ? (
            <div className="input-group">
              <label>Email</label>
              <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          ) : (
            <>
              <div className="input-group">
                <label>College ID</label>
                <input type="text" required onChange={(e) => setFormData({...formData, collegeId: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Register Number</label>
                <input type="text" required onChange={(e) => setFormData({...formData, regNo: e.target.value})} />
              </div>
            </>
          )}
          
          <div className="input-group">
            <label>{firstTime ? 'Set New Password' : 'Password'}</label>
            <input type="password" required={!firstTime || (firstTime && formData.password)} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
            <LogIn size={20} /> {firstTime ? 'Set Password & Login' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Don't have a college account? <Link to="/signup" style={{ color: 'var(--primary)' }}>Register College</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
