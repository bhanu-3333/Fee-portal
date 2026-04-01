import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { LogIn, GraduationCap, Building2, Lock, Mail, Hash, UserCircle2 } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ email: '', password: '', regNo: '', collegeId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/student/login';
      const body = role === 'admin' 
        ? { email: formData.email, password: formData.password }
        : { regNo: formData.regNo, password: formData.password, collegeId: formData.collegeId };

      const { data } = await api.post(endpoint, body);

      if (data.firstTime) {
        setFirstTime(true);
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(data));
      navigate(data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '48px', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Logo/Icon Area */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'var(--primary-bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--primary)'
          }}>
            <GraduationCap size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
            {role === 'admin' ? 'Admin Portal' : 'Student Portal'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ 
          display: 'flex', 
          background: 'var(--background)', 
          borderRadius: '12px', 
          padding: '4px', 
          marginBottom: '28px',
          border: '1px solid var(--border)'
        }}>
          <button 
            type="button"
            onClick={() => { setRole('student'); setError(''); setFirstTime(false); }}
            style={{ 
              flex: 1, padding: '10px', border: 'none', borderRadius: '8px', 
              background: role === 'student' ? 'var(--surface)' : 'transparent',
              color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer', transition: '0.2s',
              fontWeight: 600, fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <UserCircle2 size={18} /> Student
          </button>
          <button 
            type="button"
            onClick={() => { setRole('admin'); setError(''); setFirstTime(false); }}
            style={{ 
              flex: 1, padding: '10px', border: 'none', borderRadius: '8px', 
              background: role === 'admin' ? 'var(--surface)' : 'transparent',
              color: role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer', transition: '0.2s',
              fontWeight: 600, fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Building2 size={18} /> Admin
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '12px 16px', 
            marginBottom: '20px', 
            color: '#dc2626',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {firstTime && (
          <div style={{ 
            background: 'var(--primary-bg)', 
            border: '1px solid var(--primary)', 
            borderRadius: '8px', 
            padding: '12px 16px', 
            marginBottom: '20px', 
            color: 'var(--primary)',
            fontSize: '0.9rem'
          }}>
            ✨ First time login? Set a new password to activate your account.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {role === 'admin' ? (
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  required 
                  placeholder="admin@college.com"
                  style={{ paddingLeft: '40px' }}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
            </div>
          ) : (
            <>
              <div className="input-group">
                <label>College ID</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter College ID"
                    style={{ paddingLeft: '40px' }}
                    onChange={(e) => setFormData({...formData, collegeId: e.target.value})} 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Register Number</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter Reg No"
                    style={{ paddingLeft: '40px' }}
                    onChange={(e) => setFormData({...formData, regNo: e.target.value})} 
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="input-group">
            <label>{firstTime ? 'Set New Password' : 'Password'}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                style={{ paddingLeft: '40px' }}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '12px' }}
          >
            {loading ? 'Processing...' : (
              <><LogIn size={20} /> {firstTime ? 'Activate Account' : 'Sign In'}</>
            )}
          </button>
        </form>

        {role === 'admin' && (
          <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Don't have a college account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Register Institution</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
