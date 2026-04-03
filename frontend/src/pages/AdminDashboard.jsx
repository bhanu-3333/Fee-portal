import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  LayoutDashboard, Users, Building, Calculator, 
  LogOut, Plus, Search, Filter, Edit3, Trash2, CheckCircle, Clock,
  Folder, FolderOpen, ChevronRight, ArrowLeft, MoreVertical, Activity, AlertCircle, MessageSquare, Download, Upload, Bell, User
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ 
    totalStudents: 0, paidStudents: 0, pendingStudents: 0,
    totalDepartments: 0, dueFinished: 0, dueNotFinished: 0
  });

  useEffect(() => {
    fetchStats();
  }, [location.pathname]);

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
    { name: 'Activity', path: '/admin/activity', icon: Activity },
    { name: 'Departments', path: '/admin/departments', icon: Building },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
  ];

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div style={{ padding: '0 0 20px 0', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text)', fontWeight: 800 }}>{stats.college?.name || 'FeeManager'}</h2>
        </div>
        
        {menuItems.map((item) => (
          <Link 
            key={item.name}
            to={item.path} 
            className={`btn ${location.pathname === item.path ? 'btn-primary' : ''}`}
            style={{ 
              justifyContent: 'flex-start', 
              background: location.pathname === item.path ? 'var(--primary-bg)' : 'transparent',
              color: location.pathname === item.path ? 'var(--primary)' : 'var(--text-muted)',
              padding: '12px 16px',
              border: 'none',
              boxShadow: 'none'
            }}
          >
            <item.icon size={20} /> {item.name}
          </Link>
        ))}

        <button 
          onClick={handleLogout} 
          className="btn" 
          style={{ marginTop: 'auto', justifyContent: 'flex-start', color: 'var(--error)', background: 'transparent', border: 'none', boxShadow: 'none' }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="main-wrapper">
        <div className="top-navbar">
          <div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px' }}>
              {stats.college?.logo && (
                <img src={`${import.meta.env.VITE_BACKEND_URL || 'https://fee-portal-1.onrender.com'}/${stats.college.logo}`} alt="logo"
                  style={{ height: '52px', borderRadius: '8px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="content-area">
          <Routes>
            <Route path="dashboard" element={<Overview stats={stats} />} />
            <Route path="activity" element={<RecentPayments />} />
            <Route path="departments" element={<DepartmentManagement college={stats.college} />} />
            <Route path="messages" element={<AdminMessages />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon: Icon, bg, color, trend }) => (
  <div style={{
    background: bg,
    borderRadius: '24px',
    padding: '28px',
    color: color,
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.4)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)'; }}
  >
    <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.08, transform: 'scale(2.5)', pointerEvents: 'none' }}>
      <Icon size={100} color={color} />
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
        <Icon size={26} color={color} />
      </div>
      {trend && (
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.3)', padding: '6px 12px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
          {trend}
        </span>
      )}
    </div>
    
    <h3 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-1px', lineHeight: 1 }}>{value}</h3>
    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, opacity: 0.9 }}>{title}</p>
    {subtext && <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', opacity: 0.7, fontWeight: 500 }}>{subtext}</p>}
  </div>
);

const Overview = ({ stats }) => (
  <div>
    <div style={{ marginBottom: '28px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Dashboard Overview</h1>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>Institution metrics and status at a glance</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
      <StatCard 
        title="Total Students" 
        value={stats.totalStudents} 
        icon={Users} 
        bg="linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)"
        color="#3730a3"
        subtext="Across all departments"
      />
      <StatCard 
        title="Paid Students" 
        value={stats.paidStudents} 
        icon={CheckCircle} 
        bg="linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
        color="#065f46"
        trend="Cleared"
      />
      <StatCard 
        title="Unpaid Students" 
        value={stats.pendingStudents} 
        icon={Clock} 
        bg="linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)"
        color="#991b1b"
        trend="Action Needed"
      />
      <Link to="/admin/departments" style={{ textDecoration: 'none' }}>
        <StatCard 
          title="Departments" 
          value={stats.totalDepartments} 
          icon={Folder} 
          bg="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          color="#92400e"
          subtext="Click to manage →"
        />
      </Link>
    </div>
  </div>
);

const RecentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/admin/recent-payments');
      setPayments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Payment Activity</h1>
        <p style={{ color: 'var(--text-muted)' }}>All successful transactions across departments</p>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Category</th>
              <th>Date &amp; Time</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</td></tr>}
            {!loading && payments.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No recent payments found.</td></tr>
            )}
            {payments.map(p => (
              <tr key={p._id}>
                <td style={{ fontWeight: 600 }}>{p.studentId?.name || 'Unknown'}</td>
                <td>
                  <span style={{ textTransform: 'capitalize', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {p.category || 'general'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(p.date).toLocaleString('en-IN')}</td>
                <td><span style={{ color: 'var(--success)', fontWeight: 700 }}>&#8377;{p.amount.toLocaleString('en-IN')}</span></td>
                <td><span className="badge badge-success">{p.status}</span></td>
                <td style={{ color: 'var(--error)' }}>&#8377;{(p.studentId?.pendingAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DepartmentManagement = ({ college }) => {
  const [departments, setDepartments] = useState([]);
  const [activeDepartment, setActiveDepartment] = useState(null);
  const [years, setYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [newYearName, setNewYearName] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null, type: '' });

  useEffect(() => {
    fetchDepartments();
    const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, item, type });
  };

  const handleEdit = async () => {
    const { item, type } = contextMenu;
    const newName = prompt(`Enter new name for ${type}:`, item.name);
    if (!newName || newName === item.name) return;
    try {
      if (type === 'department') {
        await api.put(`/admin/departments/${item._id}`, { name: newName });
        fetchDepartments();
      } else {
        await api.put(`/admin/years/${item._id}`, { name: newName });
        fetchYears(activeDepartment._id);
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    const { item, type } = contextMenu;
    if (!window.confirm(`Are you sure you want to delete this ${type} and all its contents?`)) return;
    try {
      if (type === 'department') {
        await api.delete(`/admin/departments/${item._id}`);
        fetchDepartments();
        if (activeDepartment?._id === item._id) setActiveDepartment(null);
      } else {
        await api.delete(`/admin/years/${item._id}`);
        fetchYears(activeDepartment._id);
      }
    } catch (err) { console.error(err); }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/admin/departments');
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchYears = async (deptId) => {
    try {
      const { data } = await api.get(`/admin/departments/${deptId}/years`);
      setYears(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName) return;
    try {
      await api.post('/admin/departments', { name: newDeptName });
      setNewDeptName('');
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddYear = async (e) => {
    e.preventDefault();
    if (!newYearName || !activeDepartment) return;
    try {
      await api.post(`/admin/departments/${activeDepartment._id}/years`, { name: newYearName });
      setNewYearName('');
      fetchYears(activeDepartment._id);
    } catch (err) {
      console.error(err);
    }
  };

  const openDepartment = (dept) => {
    setActiveDepartment(dept);
    setActiveYear(null);
    fetchYears(dept._id);
  };

  const openYear = (year) => {
    setActiveYear(year);
  };

  if (activeYear) {
    return (
      <YearStudentList 
        department={activeDepartment} 
        year={activeYear} 
        college={college}
        onBack={() => setActiveYear(null)} 
      />
    );
  }

  if (activeDepartment) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setActiveDepartment(null)} className="btn" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <h1>{activeDepartment.name} <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 400 }}>/ Years</span></h1>
        </div>

        <form onSubmit={handleAddYear} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input type="text" placeholder="New Year (e.g., 1st Year)" value={newYearName} onChange={(e) => setNewYearName(e.target.value)} style={{ width: '300px' }} />
          <button type="submit" className="btn btn-primary"><Plus size={20} /> Add Year</button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {years.map(y => (
            <div key={y._id} onClick={() => openYear(y)} onContextMenu={(e) => handleContextMenu(e, y, 'year')} className="glass card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <FolderOpen size={30} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>{y.name}</h3>
            </div>
          ))}
          {years.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No years configured yet.</p>}
        </div>

        {contextMenu.visible && (
          <div style={{
            position: 'absolute', top: contextMenu.y, left: contextMenu.x,
            background: 'var(--glass)', border: '1px solid var(--glass-border)',
            borderRadius: '8px', padding: '5px 0', zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '150px'
          }}>
            <button onClick={handleEdit} style={{ width: '100%', padding: '10px 15px', background: 'transparent', border: 'none', color: 'var(--text)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Edit3 size={16} /> Edit {contextMenu.type}
            </button>
            <button onClick={handleDelete} style={{ width: '100%', padding: '10px 15px', background: 'transparent', border: 'none', color: 'var(--error)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 size={16} /> Delete {contextMenu.type}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Departments</h1>
      
      <form onSubmit={handleAddDepartment} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input type="text" placeholder="New Department Name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} style={{ width: '300px' }} />
        <button type="submit" className="btn btn-primary"><Plus size={20} /> Add Department</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {departments.map(d => (
          <div key={d._id} onClick={() => openDepartment(d)} onContextMenu={(e) => handleContextMenu(e, d, 'department')} className="glass card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s', ':hover': { borderColor: 'var(--primary)' } }}>
            <Folder size={30} color="var(--primary)" />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{d.name}</h3>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        ))}
        {departments.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No departments available. Create one above.</p>}
      </div>

      {contextMenu.visible && (
        <div style={{
          position: 'absolute', top: contextMenu.y, left: contextMenu.x,
          background: 'var(--glass)', border: '1px solid var(--glass-border)',
          borderRadius: '8px', padding: '5px 0', zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '150px'
        }}>
          <button onClick={handleEdit} style={{ width: '100%', padding: '10px 15px', background: 'transparent', border: 'none', color: 'var(--text)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit3 size={16} /> Edit {contextMenu.type}
          </button>
          <button onClick={handleDelete} style={{ width: '100%', padding: '10px 15px', background: 'transparent', border: 'none', color: 'var(--error)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trash2 size={16} /> Delete {contextMenu.type}
          </button>
        </div>
      )}
    </div>
  );
};

const YearStudentList = ({ department, year, college, onBack }) => {
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [formData, setFormData] = useState({
    regNo: '', name: '', type: 'Counselling',
    fees: { tuition: 0, exam: 0, transport: 0, hostel: 0, breakage: 0 }
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get(`/admin/students?departmentId=${department._id}&yearId=${year._id}`);
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', {
        ...formData,
        departmentId: department._id,
        yearId: year._id
      });
      setShowAddForm(false);
      fetchStudents();
      setFormData({ ...formData, regNo: '', name: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await api.delete(`/admin/students/${id}`);
      fetchStudents();
    } catch (err) { console.error(err); }
  };

  const submitEditFee = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/students/${editingStudent._id}`, { fees: editingStudent.fees });
      setEditingStudent(null);
      fetchStudents();
    } catch (err) { alert(err.response?.data?.message || 'Error updating fees'); }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('student-pdf-content');
    element.style.display = 'block';
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Students-${department.name}-${year.name}.pdf`);
    element.style.display = 'none';
  };

  const downloadTemplate = () => {
    const headers = ['Name', 'RegNo', 'Type', 'Tuition', 'Exam', 'Transport', 'Hostel', 'Breakage'];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + "John Doe,21CSE001,Counselling,50000,1500,0,0,0";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('departmentId', department._id);
    formData.append('yearId', year._id);

    try {
      const { data } = await api.post('/admin/students/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(data);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
        <button onClick={onBack} className="btn" style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ flex: 1 }}>{department.name} <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 400 }}>/ {year.name} / Students</span></h1>
        
        <button className="btn" onClick={downloadPDF} style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
          <Download size={20} /> Download PDF
        </button>
        <button className="btn" onClick={() => setShowUploadModal(true)} style={{ background: 'var(--primary)', color: 'white', border: '1px solid var(--glass-border)' }}>
          <Upload size={20} /> Upload Students
        </button>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={20} /> Add Student
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div className="input-group" style={{ flex: 1, margin: 0, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or reg no..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '35px', margin: 0 }}
          />
        </div>
        <div className="input-group" style={{ width: '200px', margin: 0, position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ paddingLeft: '35px', margin: 0 }}
          >
            <option value="All">All Types</option>
            <option value="Counselling">Counselling</option>
            <option value="Management">Management</option>
            <option value="Scholarship">Scholarship</option>
          </select>
        </div>
      </div>

      {showUploadModal && (
        <div className="glass card" style={{ position: 'relative', marginBottom: '40px' }}>
          <button onClick={() => { setShowUploadModal(false); setUploadResult(null); setUploadFile(null); }} style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>Close</button>
          <h3>Bulk Upload Students</h3>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px', marginBottom: '20px' }}>
            <button type="button" onClick={downloadTemplate} className="btn" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
              <Download size={16} style={{ marginRight: '5px' }} /> Download Excel/CSV Template
            </button>
          </div>

          <form onSubmit={handleFileUpload}>
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label>Select CSV or Excel file</label>
              <input type="file" required accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={(e) => setUploadFile(e.target.files[0])} />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Processing file...' : 'Upload Data Data'}
            </button>
          </form>

          {uploadResult && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#ffffff11', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Upload Summary</h4>
              <p style={{ margin: '5px 0', color: 'var(--success)' }}>Successfully Added: {uploadResult.successCount} students</p>
              <p style={{ margin: '5px 0', color: 'var(--error)' }}>Skipped / Failed: {uploadResult.skippedCount} rows</p>
              
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div style={{ marginTop: '15px', maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
                  <p style={{ fontSize: '0.85em', color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Error Details:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85em', color: 'var(--error)' }}>
                    {uploadResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="glass card" style={{ position: 'relative', marginBottom: '40px' }}>
          <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>Close</button>
          <h3>Add Student to {department.name} - {year.name}</h3>
          <form onSubmit={handleAddStudent} style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div className="input-group">
                <label>Register No</label>
                <input type="text" required value={formData.regNo} onChange={(e) => setFormData({...formData, regNo: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="Counselling">Counselling</option>
                  <option value="Management">Management</option>
                  <option value="Scholarship">Scholarship</option>
                </select>
              </div>
            </div>
            
            <h4 style={{ margin: '20px 0 10px 0' }}>Fee Structure</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {Object.keys(formData.fees).map(fee => (
                <div key={fee} className="input-group">
                  <label style={{ textTransform: 'capitalize' }}>{fee}</label>
                  <input type="number" required value={formData.fees[fee]} onChange={(e) => setFormData({...formData, fees: { ...formData.fees, [fee]: e.target.value }})} />
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary">Save Student</button>
          </form>
        </div>
      )}

      {editingStudent && (
        <div className="glass card" style={{ position: 'relative', marginBottom: '40px' }}>
          <button onClick={() => setEditingStudent(null)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>Close</button>
          <h3>Edit Fees for {editingStudent.name}</h3>
          <form onSubmit={submitEditFee} style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {['tuition', 'exam', 'transport', 'hostel', 'breakage'].map(fee => (
                <div key={fee} className="input-group">
                  <label style={{ textTransform: 'capitalize' }}>{fee}</label>
                  <input 
                    type="number" 
                    required 
                    value={typeof editingStudent.fees[fee] === 'object' ? editingStudent.fees[fee].total : editingStudent.fees[fee] || 0} 
                    onChange={(e) => setEditingStudent({
                      ...editingStudent, 
                      fees: { 
                        ...editingStudent.fees, 
                        [fee]: { 
                          ...editingStudent.fees[fee], 
                          total: Number(e.target.value) 
                        } 
                      }
                    })} 
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>Update Fees</button>
          </form>
        </div>
      )}

      <div className="glass card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
            <tr>
              <th style={{ padding: '16px' }}>Reg No</th>
              <th>Name</th>
              <th>Total Fee</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.filter(s => {
              const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    s.regNo.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesType = filterType === 'All' || s.type === filterType;
              return matchesSearch && matchesType;
            }).map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px' }}>{s.regNo}</td>
                <td>{s.name}</td>
                <td>₹{s.fees.total}</td>
                <td style={{ color: 'var(--success)' }}>₹{s.paidAmount}</td>
                <td style={{ color: 'var(--error)' }}>₹{s.pendingAmount}</td>
                <td>
                  {s.pendingAmount === 0 ? 
                    <span style={{ background: '#22c55e22', color: '#22c55e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Paid</span> : 
                    <span style={{ background: '#eab30822', color: '#eab308', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Pending</span>
                  }
                </td>
                <td style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setEditingStudent({...s})} className="btn" style={{ padding: '6px', background: 'transparent', color: 'var(--primary)', border: 'none' }} title="Edit Fees"><Edit3 size={18} /></button>
                  <button onClick={() => handleDeleteStudent(s._id)} className="btn" style={{ padding: '6px', background: 'transparent', color: 'var(--error)', border: 'none' }} title="Delete Student"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No students found in this active year.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div id="student-pdf-content" style={{ display: 'none', padding: '40px', background: 'white', color: 'black', width: '800px', fontFamily: '"Inter", sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '20px' }}>
          {college?.logo && <img src={college.logo} alt="logo" style={{ width: '80px', height: '80px', objectFit: 'contain', marginRight: '20px' }} />}
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>{college?.name || 'College Register'}</h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#666' }}>Student Fee Registry Page</p>
          </div>
        </div>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <p style={{ margin: 0 }}><strong>Department:</strong> {department.name}</p>
          <p style={{ margin: 0 }}><strong>Year:</strong> {year.name}</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black' }}>
              <th style={{ padding: '8px' }}>Name</th>
              <th style={{ padding: '8px' }}>RegNo</th>
              <th style={{ padding: '8px' }}>Type</th>
              <th style={{ padding: '8px' }}>Total Fee</th>
              <th style={{ padding: '8px' }}>Paid</th>
              <th style={{ padding: '8px' }}>Pending</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: '8px' }}>{s.regNo}</td>
                <td style={{ padding: '8px' }}>{s.type}</td>
                <td style={{ padding: '8px' }}>₹{s.fees.total}</td>
                <td style={{ padding: '8px', color: 'green' }}>₹{s.paidAmount}</td>
                <td style={{ padding: '8px', color: 'red' }}>₹{s.pendingAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/admin/messages');
      setMessages(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleReply = async (messageId) => {
    if (!replyText[messageId]?.trim()) return;
    try {
      await api.patch(`/admin/messages/${messageId}/reply`, { reply: replyText[messageId] });
      setReplyText({ ...replyText, [messageId]: '' });
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Student Messages</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {loading ? 'Loading...' : unreadCount > 0
            ? <><span style={{ color: 'var(--error)', fontWeight: 600 }}>{unreadCount} unread</span> message{unreadCount > 1 ? 's' : ''}</>
            : 'All messages reviewed'}
        </p>
      </div>

      {!loading && messages.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <MessageSquare size={40} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: 'var(--text-muted)' }}>No student messages yet.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(m => (
          <div key={m._id} className="card" style={{
            margin: 0,
            borderLeft: m.status === 'unread' ? '4px solid var(--error)'
              : m.reply ? '4px solid var(--primary)'
              : '4px solid var(--border)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{m.subject || 'General Issue'}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>From: <strong>{m.studentId?.name || 'Unknown Student'}</strong> {m.studentId?.regNo && `(${m.studentId.regNo})`}</span>
                  {m.studentId?.department && m.studentId?.year && (
                    <span style={{ fontSize: '0.75rem' }}>{m.studentId.department} — {m.studentId.year}</span>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(m.createdAt).toLocaleString('en-IN')}
                </span>
                {m.status === 'unread' && (
                  <span style={{ background: '#fef2f2', color: 'var(--error)', padding: '3px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>Unread</span>
                )}
                {m.status === 'replied' && (
                  <span className="badge badge-success">Replied</span>
                )}
                <button onClick={() => deleteMessage(m._id)} className="btn" style={{ padding: '5px', background: 'transparent', color: 'var(--error)', border: 'none' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Student message bubble */}
            <div style={{ background: 'var(--background)', borderRadius: '10px', padding: '14px', marginBottom: m.reply ? '12px' : '0' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>{m.studentId?.name || 'Student'}</p>
              <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.9rem' }}>{m.message}</p>
            </div>

            {/* Existing admin reply */}
            {m.reply && (
              <div style={{ background: 'var(--primary-bg)', borderRadius: '10px', padding: '14px', borderLeft: '3px solid var(--primary)', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>Your Reply</p>
                <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.9rem' }}>{m.reply}</p>
              </div>
            )}

            {/* Reply textarea */}
            <div style={{ marginTop: '12px' }}>
              <textarea
                rows={2}
                placeholder={m.reply ? 'Edit reply...' : 'Type a reply to this student...'}
                value={replyText[m._id] || ''}
                onChange={(e) => setReplyText({ ...replyText, [m._id]: e.target.value })}
                style={{ width: '100%', resize: 'vertical', marginBottom: '8px', fontSize: '0.9rem' }}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleReply(m._id)}
                disabled={!replyText[m._id]?.trim()}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <MessageSquare size={15} /> {m.reply ? 'Update Reply' : 'Send Reply'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
