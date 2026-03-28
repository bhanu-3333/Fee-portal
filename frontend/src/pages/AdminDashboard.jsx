import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  LayoutDashboard, Users, Building, Calculator, 
  LogOut, Plus, Search, Filter, Edit3, Trash2, CheckCircle, Clock,
  Folder, FolderOpen, ChevronRight, ArrowLeft, MoreVertical, Activity, AlertCircle, MessageSquare, Download, Upload
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
    { name: 'Activity', path: '/admin/activity', icon: Activity },
    { name: 'Departments', path: '/admin/departments', icon: Building },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
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
          <Route path="activity" element={<RecentPayments />} />
          <Route path="departments" element={<DepartmentManagement college={stats.college} />} />
          <Route path="messages" element={<AdminMessages />} />
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
      <Link to="/admin/departments" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="glass card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: 'var(--text-muted)' }}>Total Departments</p>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--text)' }}>{stats.totalDepartments}</h2>
            </div>
            <Folder color="var(--text-muted)" size={40} />
          </div>
        </div>
      </Link>
      <div className="glass card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Fees Completed</p>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>{stats.dueFinished}</h2>
          </div>
          <CheckCircle color="var(--success)" size={40} />
        </div>
      </div>
      <div className="glass card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Fees Pending</p>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--error)' }}>{stats.dueNotFinished}</h2>
          </div>
          <AlertCircle color="var(--error)" size={40} />
        </div>
      </div>
    </div>
  </div>
);

const RecentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/admin/recent-payments');
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Recent Payments Activity</h1>
      </div>

      <div className="glass card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
            <tr>
              <th style={{ padding: '16px' }}>Student Name</th>
              <th>Date & Time</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th>Pending Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{p.studentId?.name || 'Unknown'}</td>
                <td>{new Date(p.date).toLocaleString()}</td>
                <td><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{p.amount.toLocaleString('en-IN')}</span></td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                    background: p.status === 'completed' || p.status === 'pending' ? '#ffffff22' : '#ffffff05',
                    color: p.status === 'completed' || p.status === 'pending' ? 'var(--text)' : 'var(--text-muted)'
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ color: 'var(--error)' }}>₹{(p.studentId?.pendingAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent payments.</td></tr>
            )}
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
              <p style={{ margin: '5px 0', color: 'var(--success)' }}>✅ Successfully Added: {uploadResult.successCount} students</p>
              <p style={{ margin: '5px 0', color: 'var(--error)' }}>⚠️ Skipped / Failed: {uploadResult.skippedCount} rows</p>
              
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
                  <input type="number" required value={editingStudent.fees[fee] || 0} onChange={(e) => setEditingStudent({...editingStudent, fees: { ...editingStudent.fees, [fee]: e.target.value }})} />
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
                <td>₹{s.paidAmount}</td>
                <td>₹{s.pendingAmount}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                    background: s.pendingAmount === 0 ? '#ffffff22' : '#ffffff05',
                    color: s.pendingAmount === 0 ? 'var(--text)' : 'var(--text-muted)'
                  }}>
                    {s.pendingAmount === 0 ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setEditingStudent({...s})} className="btn" style={{ padding: '6px', background: 'transparent', color: 'var(--primary)', border: 'none' }} title="Edit Fees"><Edit3 size={18} /></button>
                  <button onClick={() => handleDeleteStudent(s._id)} className="btn" style={{ padding: '6px', background: 'transparent', color: 'var(--error)', border: 'none' }} title="Delete Student"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No students found in this active year.</td></tr>
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

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/admin/messages');
      setMessages(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/admin/messages/${id}/read`);
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message forever?")) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Student Messages</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map(m => (
          <div key={m._id} className="glass card" style={{ 
            borderLeft: m.status === 'unread' ? '4px solid var(--primary)' : '1px solid var(--glass-border)',
            background: m.status === 'unread' ? '#ffffff11' : 'var(--glass)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0 }}>{m.subject}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
                  From: <strong>{m.studentId?.name}</strong> ({m.studentId?.regNo}) • {m.studentId?.department} {m.studentId?.year} 
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(m.createdAt).toLocaleString()}</span>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  {m.status === 'unread' && (
                    <button onClick={() => markAsRead(m._id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}><CheckCircle size={14} style={{ marginRight: '5px' }}/> Mark as Read</button>
                  )}
                  <button onClick={() => deleteMessage(m._id)} className="btn" style={{ padding: '6px', background: 'transparent', color: 'var(--error)', border: 'none' }}><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
            <p style={{ margin: 0, background: '#00000033', borderRadius: '8px', padding: '15px', lineHeight: '1.5' }}>
              {m.message}
            </p>
          </div>
        ))}
        {messages.length === 0 && !loading && <p style={{ color: 'var(--text-muted)' }}>No messages found.</p>}
        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
