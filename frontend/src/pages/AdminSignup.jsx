import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Building2, Mail, Lock, User, Plus } from 'lucide-react';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    collegeName: '', collegeId: '', email: '', password: '', adminName: '', logo: '', address: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/admin/signup', formData);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/admin/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="signup-page" style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
      background: 'radial-gradient(circle at top left, #ffffff11, transparent), radial-gradient(circle at bottom right, #ffffff05, transparent)'
    }}>
      <div className="glass card" style={{ width: '600px', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem', fontWeight: 800 }}>
          Register College
        </h2>

        {error && <p style={{ color: 'var(--error)', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group">
              <label>College Name</label>
              <input type="text" required onChange={(e) => setFormData({...formData, collegeName: e.target.value})} />
            </div>
            <div className="input-group">
              <label>College ID (Unique)</label>
              <input type="text" required onChange={(e) => setFormData({...formData, collegeId: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Admin Name</label>
              <input type="text" required onChange={(e) => setFormData({...formData, adminName: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Admin Email</label>
              <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label>College Address</label>
            <input type="text" required onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="City, State - Pincode" />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Logo URL (Direct link to image)</label>
            <input type="text" onChange={(e) => setFormData({...formData, logo: e.target.value})} placeholder="https://yourcollege.com/logo.png" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
            <Plus size={20} /> Create College Account
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
