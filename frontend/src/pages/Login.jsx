import React, { useState } from 'react'; // verified
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { LogIn, GraduationCap, Building2, Lock, Mail, Hash, UserCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ email: '', password: '', regNo: '', collegeId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="app-container" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at top right, var(--primary-bg), transparent), radial-gradient(circle at bottom left, var(--primary-bg), transparent), var(--background)',
      padding: '24px'
    }}>
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '460px', padding: '48px' }}>
        
        {/* Logo/Icon Area */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }} className="slide-up">
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '18px', 
            background: 'var(--primary-bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--primary)',
            boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.2)',
            animation: 'float 4s ease-in-out infinite'
          }}>
            <GraduationCap size={36} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {role === 'admin' ? 'Admin Gateway' : 'Student Hub'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
            Secure portal for college fee ecosystem
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0, 0, 0, 0.03)', 
          borderRadius: '14px', 
          padding: '4px', 
          marginBottom: '32px',
          border: '1px solid var(--border)'
        }}>
          <button 
            type="button"
            onClick={() => { setRole('student'); setError(''); setFirstTime(false); }}
            style={{ 
              flex: 1, padding: '12px', border: 'none', borderRadius: '10px', 
              background: role === 'student' ? 'var(--surface)' : 'transparent',
              color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer', transition: 'var(--transition-fast)',
              fontWeight: 600, fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <UserCircle2 size={18} /> Student
          </button>
          <button 
            type="button"
            onClick={() => { setRole('admin'); setError(''); setFirstTime(false); }}
            style={{ 
              flex: 1, padding: '12px', border: 'none', borderRadius: '10px', 
              background: role === 'admin' ? 'var(--surface)' : 'transparent',
              color: role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer', transition: 'var(--transition-fast)',
              fontWeight: 600, fontSize: '0.95rem',
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
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••"
                style={{ paddingLeft: '40px', paddingRight: '44px' }}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '14px', borderRadius: '12px' }}
          >
            {loading ? (
              <Loader2 size={20} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
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
