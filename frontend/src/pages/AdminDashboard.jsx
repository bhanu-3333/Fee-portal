import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  LayoutDashboard, Users, Building, Calculator, 
  LogOut, Plus, Search, Filter, Edit3, Trash2, CheckCircle, Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ totalStudents: 0, paidStudents: 0, pendingStudents: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Departments', path: '/admin/departments', icon: Building },
  ];

  return (
    <div className="dashboard">
      <div className="sidebar glass">
        <div style={{ padding: '0 0 20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 800 }}>FeeManager</h2>
        </div>
        
        {menuItems.map((item) => (
          <Link 
            key={item.name}
            to={item.path} 
            className={`btn ${location.pathname === item.path ? 'btn-primary' : ''}`}
            style={{ 
              justifyContent: 'flex-start', 
              background: location.pathname === item.path ? '' : 'transparent',
              padding: '12px 16px'
            }}
          >
            <item.icon size={20} /> {item.name}
          </Link>
        ))}

        <button 
          onClick={handleLogout} 
          className="btn" 
          style={{ marginTop: 'auto', justifyContent: 'flex-start', color: 'var(--error)', background: 'transparent' }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="dashboard" element={<Overview stats={stats} />} />
          <Route path="students" element={<StudentList />} />
          <Route path="departments" element={<DepartmentManagement />} />
        </Routes>
      </div>
    </div>
  );
};

const Overview = ({ stats }) => (
  <div>
    <h1 style={{ marginBottom: '30px' }}>Admin Dashboard</h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
      <div className="glass card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Total Students</p>
            <h2 style={{ fontSize: '2.5rem' }}>{stats.totalStudents}</h2>
          </div>
          <Users color="var(--primary)" size={40} />
        </div>
      </div>
      <div className="glass card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Paid Students</p>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>{stats.paidStudents}</h2>
          </div>
          <CheckCircle color="var(--success)" size={40} />
        </div>
      </div>
      <div className="glass card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Pending Payments</p>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--error)' }}>{stats.pendingStudents}</h2>
          </div>
          <Clock color="var(--error)" size={40} />
        </div>
      </div>
    </div>
  </div>
);

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    regNo: '', name: '', department: '', year: '', type: 'Counselling',
    fees: { tuition: 0, exam: 0, transport: 0, hostel: 0, breakage: 0 }
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/admin/students');
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', formData);
      setShowAddForm(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding student');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Students</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={20} /> Add Student
        </button>
      </div>

      {showAddForm && (
        <div className="glass card" style={{ position: 'relative', marginBottom: '40px' }}>
          <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>Close</button>
          <h3>Add New Student</h3>
          <form onSubmit={handleAddStudent} style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div className="input-group">
                <label>Register No</label>
                <input type="text" required onChange={(e) => setFormData({...formData, regNo: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Type</label>
                <select onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="Counselling">Counselling</option>
                  <option value="Management">Management</option>
                  <option value="Scholarship">Scholarship</option>
                </select>
              </div>
              <div className="input-group">
                <label>Department</label>
                <input type="text" required onChange={(e) => setFormData({...formData, department: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Year</label>
                <input type="text" required onChange={(e) => setFormData({...formData, year: e.target.value})} />
              </div>
            </div>
            
            <h4 style={{ margin: '20px 0 10px 0' }}>Fee Structure</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {Object.keys(formData.fees).map(fee => (
                <div key={fee} className="input-group">
                  <label style={{ textTransform: 'capitalize' }}>{fee}</label>
                  <input type="number" onChange={(e) => setFormData({...formData, fees: { ...formData.fees, [fee]: e.target.value }})} />
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary">Save Student</button>
          </form>
        </div>
      )}

      <div className="glass card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
            <tr>
              <th style={{ padding: '16px' }}>Reg No</th>
              <th>Name</th>
              <th>Dept</th>
              <th>Year</th>
              <th>Total Fee</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px' }}>{s.regNo}</td>
                <td>{s.name}</td>
                <td>{s.department}</td>
                <td>{s.year}</td>
                <td>₹{s.fees.total}</td>
                <td>₹{s.paidAmount}</td>
                <td>₹{s.pendingAmount}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                    background: s.pendingAmount === 0 ? '#22c55e22' : '#ef444422',
                    color: s.pendingAmount === 0 ? 'var(--success)' : 'var(--error)'
                  }}>
                    {s.pendingAmount === 0 ? 'Paid' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DepartmentManagement = () => (
  <div>
    <h1>Department Management</h1>
    <p style={{ color: 'var(--text-muted)' }}>Configure college departments and academic years.</p>
    {/* Implementation similar to StudentList, omitting for brevity or can add if needed */}
    <div className="glass card" style={{ marginTop: '20px' }}>
      <p>Department configuration feature coming soon.</p>
    </div>
  </div>
);

export default AdminDashboard;
