import React, { useState, useEffect, useRef } from 'react'; // verified
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  LayoutDashboard, CreditCard, History, MessageSquare,
  LogOut, CheckCircle2, AlertCircle, Download, Send, User, Bell, Search,
  TrendingUp, Clock, ChevronRight, IndianRupee
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ---------- Custom Green Select Component ----------
const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: '8px', 
          border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`, 
          background: 'var(--surface)', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-bg)' : 'none',
          transition: 'all 0.2s ease', color: 'var(--text)'
        }}
      >
        <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', color: 'var(--text-muted)' }}><path d="m6 9 6 6 6-6"/></svg>
      </div>
      
      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, 
            marginTop: '4px', background: 'var(--surface)', 
            border: '1px solid var(--border)', borderRadius: '8px', 
            boxShadow: 'var(--shadow-lg)', zIndex: 100,
            overflow: 'hidden'
          }}>
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                style={{
                  padding: '12px 16px', cursor: 'pointer', transition: 'all 0.1s ease',
                  background: value === opt.value ? 'var(--primary-bg)' : 'transparent',
                  color: value === opt.value ? 'var(--primary)' : 'var(--text)',
                  fontWeight: value === opt.value ? 600 : 400,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = value === opt.value ? 'var(--primary-bg)' : 'transparent'; 
                  e.currentTarget.style.color = value === opt.value ? 'var(--primary)' : 'var(--text)'; 
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ---------- Layout Wrapper ----------
const StudentLayout = ({ student, handleLogout }) => {
  const location = useLocation();
  const menuItems = [
    { name: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Fees', path: '/student/fees', icon: IndianRupee },
    { name: 'Payments', path: '/student/payments', icon: History },
    { name: 'Messages', path: '/student/messages', icon: MessageSquare },
  ];

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>Fee Portal</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student</p>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px',
                  borderRadius: '8px', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s',
                  background: active ? 'var(--primary-bg)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                  <item.icon size={18} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Profile at bottom of sidebar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{student?.name || 'Student'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student?.regNo}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'center', color: 'var(--error)', border: 'none', background: '#fef2f2', fontSize: '0.85rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="main-wrapper">
        <div className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {student?.collegeId?.logo && (
              <img src={`${import.meta.env.VITE_BACKEND_URL || 'https://fee-portal-1.onrender.com'}/${student.collegeId.logo}`} alt="logo"
                style={{ height: '52px', borderRadius: '8px', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {student?.collegeId?.name || 'College Portal'}
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Student Dashboard</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', textAlign: 'right' }}>
              <p style={{ fontWeight: 600, margin: 0 }}>{student?.department}</p>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>{student?.year} • {student?.type}</p>
            </div>
          </div>
        </div>
        <div className="content-area">
          <Routes>
            <Route path="dashboard" element={<OverviewPage />} />
            <Route path="fees" element={<FeesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// ---------- Shared Data Hook ----------
const useStudentData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await api.get('/student/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);
  return { data, loading, refetch: fetchDashboard };
};

// ---------- Root Component ----------
const StudentDashboard = () => {
  const { data, loading } = useStudentData();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--background)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        Loading your dashboard...
      </div>
    </div>
  );
  if (!data) return <div style={{ padding: '40px', color: 'red' }}>Error loading data. Please refresh.</div>;

  return <StudentLayout student={data.student} handleLogout={handleLogout} />;
};

// ===================== PAGE: OVERVIEW =====================
const OverviewPage = () => {
  const { data, loading, refetch } = useStudentData();
  const [payCategory, setPayCategory] = useState('tuition');
  const [payAmount, setPayAmount] = useState('');

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) return alert('Enter a valid amount');
    const { student } = data;
    const rawCatFee = student.fees[payCategory];
    const catTotal = typeof rawCatFee === 'object' ? rawCatFee.total : (Number(rawCatFee) || 0);
    const catPaid = typeof rawCatFee === 'object' ? rawCatFee.paid : 0;
    const maxAllowed = catTotal - catPaid;
    if (Number(payAmount) > maxAllowed) return alert(`Max allowed for ${payCategory} is ₹${maxAllowed}`);

    const res = await loadRazorpay();
    if (!res) return alert('Razorpay SDK failed to load.');

    try {
      const { data: order } = await api.post('/payment/create-order', { amount: Number(payAmount), category: payCategory });
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: student.collegeId.name,
        description: `${payCategory} Fee Payment`,
        image: student.collegeId.logo,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/payment/verify-payment', { ...response, amount: Number(payAmount), category: payCategory });
            alert('Payment Successful!');
            refetch();
          } catch { alert('Payment Verification Failed'); }
        },
        prefill: { name: student.name, email: student.email },
        theme: { color: '#059669' },
      };
      new window.Razorpay(options).open();
    } catch { alert('Error creating order'); }
  };

  if (loading || !data) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  const { student, payments } = data;
  const recentPayments = payments.slice(0, 3);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Welcome back, {student.name}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Here's your fee overview</p>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Total Fees', value: `₹${(student.fees.total || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: '#6366f1', bg: '#eff0ff' },
          { label: 'Paid Amount', value: `₹${(student.paidAmount || 0).toLocaleString('en-IN')}`, icon: CheckCircle2, color: '#059669', bg: '#ecfdf5' },
          { label: 'Pending', value: `₹${(student.pendingAmount || 0).toLocaleString('en-IN')}`, icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px' }}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Quick Pay */}
        <div className="card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Quick Payment</h3>
          {student.pendingAmount === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={40} color="var(--success)" style={{ marginBottom: '10px' }} />
              <p style={{ fontWeight: 600, color: 'var(--success)' }}>All Fees Paid! 🎉</p>
            </div>
          ) : (
            <>
              <div className="input-group" style={{ position: 'relative', zIndex: 10 }}>
                <label>Fee Category</label>
                <CustomSelect 
                  value={payCategory} 
                  onChange={(val) => { setPayCategory(val); setPayAmount(''); }}
                  options={['tuition', 'exam', 'transport', 'hostel', 'breakage'].map(cat => {
                    const f = student.fees[cat];
                    const t = typeof f === 'object' ? f.total : (Number(f) || 0);
                    const p = typeof f === 'object' ? f.paid : 0;
                    return { value: cat, label: `${cat.charAt(0).toUpperCase() + cat.slice(1)} — Pending ₹${t - p}` };
                  })}
                />
              </div>
              <div className="input-group">
                <label>Amount (₹)</label>
                <input type="number" placeholder="Enter amount..." value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={handlePayment} disabled={!payAmount} style={{ width: '100%', justifyContent: 'center' }}>
                Pay Now →
              </button>
            </>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Payments</h3>
            <Link to="/student/payments" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          </div>
          {recentPayments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No payments yet</p>
          ) : recentPayments.map(p => (
            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{p.category}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.date).toLocaleDateString('en-IN')}</p>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>+₹{p.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== PAGE: FEES =====================
const FeesPage = () => {
  const { data, loading } = useStudentData();
  if (loading || !data) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  const { student } = data;

  const categories = ['tuition', 'exam', 'transport', 'hostel', 'breakage'];

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Fee Breakdown</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Your detailed fee structure across all categories</p>

      {/* Summary Bar */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--primary)', border: 'none', color: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { label: 'Total Fees', value: student.fees.total || 0 },
            { label: 'Total Paid', value: student.paidAmount || 0 },
            { label: 'Total Pending', value: student.pendingAmount || 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{label}</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹{value.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {categories.map(cat => {
          const f = student.fees[cat];
          const total = typeof f === 'object' ? f.total : (Number(f) || 0);
          const paid = typeof f === 'object' ? f.paid : 0;
          const pending = total - paid;
          const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
          const isComplete = pending === 0 && total > 0;

          return (
            <div key={cat} className="card" style={{ margin: 0, position: 'relative' }}>
              {isComplete && (
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <span className="badge badge-success">Paid</span>
                </div>
              )}
              <p style={{ textTransform: 'capitalize', fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>{cat}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>₹{paid.toLocaleString('en-IN')} paid</span>
                <span>₹{total.toLocaleString('en-IN')} total</span>
              </div>
              {/* Progress Bar */}
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: isComplete ? 'var(--success)' : 'var(--primary)', borderRadius: '99px', transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                <span style={{ color: isComplete ? 'var(--success)' : 'var(--error)' }}>
                  {isComplete ? '✓ Complete' : `₹${pending.toLocaleString('en-IN')} pending`}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===================== PAGE: PAYMENTS =====================
const PaymentsPage = () => {
  const { data, loading } = useStudentData();
  const downloadReceipt = async (payment) => {
    const element = document.getElementById(`receipt-${payment._id}`);
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Receipt-${payment.razorpay_payment_id}.pdf`);
  };

  if (loading || !data) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  const { student, payments } = data;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Payment History</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>All successful transactions</p>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No payments found</td></tr>
            )}
            {payments.map(p => (
              <tr key={p._id}>
                <td>{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td><span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{p.category || '—'}</span></td>
                <td><span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{p.amount.toLocaleString('en-IN')}</span></td>
                <td><span className="badge badge-success">Success</span></td>
                <td>
                  <button className="btn" onClick={() => downloadReceipt(p)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    <Download size={14} /> Download
                  </button>
                  {/* Hidden receipt template */}
                  <div id={`receipt-${p._id}`} style={{ position: 'fixed', left: '-9999px', width: '800px', background: 'white', color: '#1a1a1a', padding: '50px', fontFamily: '"Inter", sans-serif' }}>
                    <div style={{ display: 'flex', borderBottom: '2px solid #334155', paddingBottom: '30px', marginBottom: '30px' }}>
                      <div style={{ flex: 1 }}>
                        <h1 style={{ color: '#1e293b', fontSize: '28px', margin: '0 0 5px 0', fontWeight: 800 }}>{student.collegeId.name}</h1>
                        <p style={{ color: '#64748b', margin: 0 }}>{student.collegeId.address}</p>
                      </div>
                    </div>
                    <h2 style={{ textAlign: 'center', letterSpacing: '2px', color: '#334155', marginBottom: '40px' }}>PAYMENT RECEIPT</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '40px' }}>
                      <div>
                        <p><strong>Student:</strong> {student.name}</p>
                        <p><strong>Reg No:</strong> {student.regNo}</p>
                        <p><strong>Course:</strong> {student.department} - {student.year}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p><strong>Payment ID:</strong> {p.razorpay_payment_id}</p>
                        <p><strong>Date:</strong> {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p><strong>Category:</strong> <span style={{ textTransform: 'capitalize' }}>{p.category}</span></p>
                      </div>
                    </div>
                    <div style={{ borderTop: '2px solid #f1f5f9', padding: '20px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>Amount Paid:</strong></span>
                        <span style={{ fontSize: '24px', fontWeight: 800 }}>₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '60px', textAlign: 'center', fontWeight: 600, fontStyle: 'italic' }}>Thank you for your payment!</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== PAGE: MESSAGES =====================
const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msgData, setMsgData] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/student/messages');
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/student/messages', msgData);
      setMsgData({ subject: '', message: '' });
      setShowForm(false);
      fetchMessages();
    } catch { alert('Failed to send message'); }
    finally { setSending(false); }
  };

  const unread = messages.filter(m => m.reply && m.status !== 'read').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Messages</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {unread > 0 ? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{unread} new reply{unread > 1 ? 'ies' : ''}</span> : 'Communicate with the administration'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Send size={16} /> {showForm ? 'Cancel' : 'New Message'}
        </button>
      </div>

      {/* Compose Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
          <h4 style={{ marginBottom: '16px', color: 'var(--text)' }}>Send a message to Admin</h4>
          <form onSubmit={handleSend}>
            <div className="input-group">
              <label>Subject</label>
              <input type="text" placeholder="e.g. Fee Correction Request" value={msgData.subject}
                onChange={e => setMsgData({ ...msgData, subject: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Message *</label>
              <textarea required rows={4} placeholder="Describe your issue..."
                value={msgData.message} onChange={e => setMsgData({ ...msgData, message: e.target.value })}
                style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      )}

      {/* Message Thread List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading messages...</p>
      ) : messages.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <MessageSquare size={40} color="var(--border)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>No messages yet. Send one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map(msg => (
            <div key={msg._id} className="card" style={{ margin: 0, borderLeft: msg.reply ? '4px solid var(--primary)' : '4px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>{msg.subject || 'General Issue'}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <span className={`badge ${msg.status === 'replied' ? 'badge-success' : ''}`}
                  style={msg.status !== 'replied' ? { background: '#f1f5f9', color: 'var(--text-muted)' } : {}}>
                  {msg.status === 'replied' ? '✓ Replied' : msg.status}
                </span>
              </div>

              {/* Student message bubble */}
              <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '14px', marginBottom: msg.reply ? '12px' : 0 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>You</p>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{msg.message}</p>
              </div>

              {/* Admin reply bubble */}
              {msg.reply && (
                <div style={{ background: 'var(--primary-bg)', borderRadius: '12px', padding: '14px', borderLeft: '3px solid var(--primary)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px' }}>Admin Reply</p>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{msg.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
