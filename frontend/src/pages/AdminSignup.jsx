import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Building2, Mail, Lock, User, Plus, Upload, Image } from 'lucide-react';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    collegeName: '', collegeId: '', email: '', password: '', adminName: '', address: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Use FormData to support file upload
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => payload.append(key, val));
      if (logoFile) payload.append('logo', logoFile);

      const { data } = await api.post('/auth/admin/signup', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/admin/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
      background: 'var(--background)', padding: '40px 20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '620px', padding: '48px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '14px', background: 'var(--primary-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Building2 size={28} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>Register College</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.95rem' }}>
            Create your institution account to get started
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group">
              <label>College Name</label>
              <input type="text" required placeholder="e.g. MIT University" onChange={(e) => setFormData({...formData, collegeName: e.target.value})} />
            </div>
            <div className="input-group">
              <label>College ID (Unique)</label>
              <input type="text" required placeholder="e.g. MIT001" onChange={(e) => setFormData({...formData, collegeId: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Admin Name</label>
              <input type="text" required placeholder="Your full name" onChange={(e) => setFormData({...formData, adminName: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Admin Email</label>
              <input type="email" required placeholder="admin@college.edu" onChange={(e) => setFormData({...formData, email: e.target.value})} />
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

          {/* Logo Upload */}
          <div className="input-group">
            <label>College Logo</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              {/* Upload Button Area */}
              <label htmlFor="logo-upload" style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '20px', border: '2px dashed var(--border)', borderRadius: '12px',
                cursor: 'pointer', background: 'var(--background)', transition: 'all 0.2s ease',
                color: 'var(--text-muted)', fontSize: '0.9rem'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <Upload size={22} color="var(--primary)" />
                <span style={{ fontWeight: 500 }}>Click to upload logo</span>
                <span style={{ fontSize: '0.8rem' }}>PNG, JPG, JPEG (max 5MB)</span>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png, image/jpg, image/jpeg"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                />
              </label>

              {/* Preview Box */}
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '12px', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--background)', flexShrink: 0, overflow: 'hidden'
              }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                ) : (
                  <Image size={28} color="var(--border)" />
                )}
              </div>
            </div>
            {logoFile && (
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--primary)' }}>
                ✓ {logoFile.name} selected
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}
          >
            {loading ? 'Creating Account...' : <><Plus size={20} /> Create College Account</>}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
