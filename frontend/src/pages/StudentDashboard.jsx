import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  CreditCard, Download, History, LogOut, CheckCircle2, 
  AlertCircle, Receipt as ReceiptIcon, User as UserIcon, MessageSquare
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const receiptRef = useRef();
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgData, setMsgData] = useState({ subject: '', message: '' });
  const [payCategory, setPayCategory] = useState('tuition');
  const [payAmount, setPayAmount] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/student/dashboard');
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const submitMessage = async (e) => {
    e.preventDefault();
    if (!msgData.message) return;
    try {
      await api.post('/student/messages', msgData);
      alert('Message sent successfully to administration.');
      setShowMsgModal(false);
      setMsgData({ subject: '', message: '' });
    } catch (err) {
      alert('Error sending message');
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) return alert('Enter a valid amount');
    
    // Determine category limits flexibly for old and new data structures
    const rawCatFee = data.student.fees[payCategory];
    const catTotal = typeof rawCatFee === 'object' ? rawCatFee.total : (Number(rawCatFee) || 0);
    const catPaid = typeof rawCatFee === 'object' ? rawCatFee.paid : 0;
    const maxAllowed = catTotal - catPaid;

    if (Number(payAmount) > maxAllowed) {
      return alert(`Maximum allowed payment for ${payCategory} is ₹${maxAllowed}`);
    }

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // Create order in backend
      const { data: order } = await api.post('/payment/create-order', { 
        amount: Number(payAmount),
        category: payCategory
      });

      const options = {
        key: order.key_id, // Dynamically sourced from backend
        amount: order.amount,
        currency: order.currency,
        name: data.student.collegeId.name,
        description: 'Fee Payment',
        image: data.student.collegeId.logo,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/payment/verify-payment', {
                ...response,
                amount: Number(payAmount),
                category: payCategory
            });
            alert('Payment Successful!');
            fetchDashboard();
          } catch (err) {
            alert('Payment Verification Failed');
          }
        },
        prefill: {
          name: data.student.name,
          email: data.student.email,
        },
        theme: { color: '#111111' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Error creating order');
    }
  };

  const downloadReceipt = async (payment) => {
    // Hidden receipt template will be rendered and captured
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

  if (loading) return <div style={{ color: 'white', padding: '40px' }}>Loading...</div>;
  if (!data) return <div style={{ color: 'white', padding: '40px' }}>Error loading data</div>;

  const { student, payments } = data;

  return (
    <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {student.collegeId.logo && <img src={student.collegeId.logo} alt="logo" style={{ width: '60px', borderRadius: '12px' }} />}
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>{student.collegeId.name}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Student Dashboard</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-primary" onClick={() => setShowMsgModal(true)} style={{ background: '#ffffff22', color: 'white', border: '1px solid #ffffff44' }}>
            <MessageSquare size={20} /> Report Issue
          </button>
          <button className="btn" onClick={handleLogout} style={{ color: 'var(--error)' }}><LogOut size={20} /> Logout</button>
        </div>
      </div>

      {showMsgModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass card" style={{ width: '500px', position: 'relative' }}>
            <button onClick={() => setShowMsgModal(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>Close</button>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquare size={24} color="var(--primary)" /> Reach out to Admin</h3>
            <form onSubmit={submitMessage}>
              <div className="input-group">
                <label>Subject</label>
                <input type="text" value={msgData.subject} onChange={e => setMsgData({...msgData, subject: e.target.value})} placeholder="e.g., Fee Correction Request" />
              </div>
              <div className="input-group">
                <label>Message Details *</label>
                <textarea required rows="5" value={msgData.message} onChange={e => setMsgData({...msgData, message: e.target.value})} placeholder="Describe your issue..." style={{ padding: '12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text)', width: '100%', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}>Send Message</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Profile Card */}
        <div>
          <div className="glass card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--glass)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon size={40} color="var(--primary)" />
              </div>
              <h3>{student.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Reg No: {student.regNo}</p>
            </div>
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
              <p style={{ marginBottom: '8px' }}><strong>Dept:</strong> {student.department}</p>
              <p style={{ marginBottom: '8px' }}><strong>Year:</strong> {student.year}</p>
              <p><strong>Type:</strong> {student.type}</p>
            </div>
          </div>

          <div className="glass card" style={{ background: student.pendingAmount === 0 ? '#ffffff11' : '#ffffff05' }}>
            {student.pendingAmount === 0 ? (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle2 size={40} color="var(--success)" style={{ marginBottom: '10px' }} />
                <h3 style={{ color: 'var(--success)' }}>Fees Fully Paid</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '5px' }}>Total: ₹{student.fees.total}</p>
              </div>
            ) : (
              <div>
                <h3 style={{ marginBottom: '15px' }}>Make a Payment</h3>
                
                <div className="input-group" style={{ marginBottom: '15px' }}>
                  <label>Select Fee Category</label>
                  <select value={payCategory} onChange={e => { setPayCategory(e.target.value); setPayAmount(''); }}>
                    {['tuition', 'exam', 'transport', 'hostel', 'breakage'].map(cat => {
                       const catFee = student.fees[cat];
                       const total = typeof catFee === 'object' ? catFee.total : (Number(catFee) || 0);
                       const paid = typeof catFee === 'object' ? catFee.paid : 0;
                       const max = total - paid;
                       return <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)} (Pending: ₹{max})</option>
                    })}
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: '15px' }}>
                  <label>Amount to Pay</label>
                  <input type="number" placeholder="Enter Amount" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', marginTop: '10px' }}>
                  <span>Total Due Overall:</span>
                  <span>₹{student.pendingAmount}</span>
                </div>
                
                <button className="btn btn-primary" onClick={handlePayment} disabled={!payAmount} style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
                  <CreditCard size={20} /> Pay Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fee Details & History */}
        <div>
          <div className="glass card">
            <h3 style={{ marginBottom: '20px' }}>Fee Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
              {['tuition', 'exam', 'transport', 'hostel', 'breakage'].map((key) => {
                const catFee = student.fees[key];
                const total = typeof catFee === 'object' ? catFee.total : (Number(catFee) || 0);
                const paid = typeof catFee === 'object' ? catFee.paid : 0;

                return (
                  <div key={key} className="glass" style={{ padding: '15px', borderRadius: '12px' }}>
                    <p style={{ color: 'var(--text-muted)', textTransform: 'capitalize', fontSize: '0.8rem', margin: 0 }}>{key}</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '5px 0' }}>₹{total}</p>
                    <p style={{ fontSize: '0.8rem', color: paid >= total && total > 0 ? 'var(--success)' : 'var(--error)', margin: 0 }}>
                      Paid: ₹{paid}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass card">
            <h3 style={{ marginBottom: '20px' }}>Payment History</h3>
            {payments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No transactions found</p>
            ) : (
              payments.map(p => (
                <div key={p._id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '15px', borderBottom: '1px solid var(--glass-border)'
                }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>₹{p.amount}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.date).toLocaleDateString()}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {p.razorpay_payment_id}</p>
                  </div>
                  <button onClick={() => downloadReceipt(p)} className="btn" style={{ background: 'var(--glass)', padding: '8px' }}>
                    <Download size={18} /> Receipt
                  </button>

                  {/* Professional Receipt Template */}
                  <div id={`receipt-${p._id}`} style={{ 
                    position: 'fixed', left: '-10000px', width: '800px', 
                    background: 'white', color: '#1a1a1a', padding: '50px',
                    fontFamily: '"Inter", sans-serif', border: '1px solid #eee'
                  }}>
                    <div style={{ display: 'flex', borderBottom: '2px solid #334155', paddingBottom: '30px', marginBottom: '30px' }}>
                      <div style={{ width: '100px', height: '100px', marginRight: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {student.collegeId.logo ? (
                          <img src={student.collegeId.logo} alt="clg-logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '8px' }}>LOGO</div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h1 style={{ color: '#1e293b', fontSize: '28px', margin: '0 0 5px 0', fontWeight: 800 }}>{student.collegeId.name}</h1>
                        <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>{student.collegeId.address || 'College Campus, Education Hub'}</p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                      <h2 style={{ fontSize: '22px', letterSpacing: '2px', color: '#334155', borderBottom: '1px solid #e2e8f0', display: 'inline-block', paddingBottom: '5px' }}>PAYMENT RECEIPT</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '40px' }}>
                      <div>
                        <div style={{ marginBottom: '15px' }}>
                          <span style={{ color: '#64748b', fontSize: '14px', display: 'block' }}>Student Name:</span>
                          <span style={{ fontSize: '16px', fontWeight: 600 }}>{student.name}</span>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <span style={{ color: '#64748b', fontSize: '14px', display: 'block' }}>Register No:</span>
                          <span style={{ fontSize: '16px', fontWeight: 600 }}>{student.regNo}</span>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '14px', display: 'block' }}>Course:</span>
                          <span style={{ fontSize: '16px', fontWeight: 600 }}>{student.department} - {student.year}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <span style={{ color: '#64748b', fontSize: '14px', display: 'block' }}>Payment ID:</span>
                          <span style={{ fontSize: '16px', fontWeight: 600 }}>{p.razorpay_payment_id}</span>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <span style={{ color: '#64748b', fontSize: '14px', display: 'block' }}>Payment Date:</span>
                          <span style={{ fontSize: '16px', fontWeight: 600 }}>{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '14px', display: 'block' }}>Payment Status:</span>
                          <span style={{ color: '#000000', fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                            SUCCESS <div style={{ background: '#000000', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '2px solid #f1f5f9', borderBottom: '2px solid #f1f5f9', padding: '20px 0', marginBottom: '50px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>Fee Type: <span style={{ color: '#111111', fontStyle: 'italic', textTransform: 'capitalize' }}>{p.category || 'Tuition / Academic Fees'}</span></span>
                        <span style={{ fontSize: '20px', fontWeight: 800 }}>₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '100px', height: '100px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                          <div style={{ color: '#cbd5e1', fontSize: '12px' }}>QR CODE</div>
                        </div>
                        <p style={{ fontSize: '10px', color: '#94a3b8' }}>Transaction ID: {p.razorpay_order_id}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #334155', width: '150px', marginBottom: '10px' }}>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.png" alt="signature" style={{ height: '40px', opacity: 0.8 }} />
                        </div>
                        <p style={{ fontWeight: 600, color: '#334155', margin: 0 }}>Accounts Office</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Authorized Signatory</p>
                      </div>
                    </div>

                    <div style={{ marginTop: '60px', textAlign: 'center', color: '#111111', fontWeight: 600, fontSize: '18px', fontStyle: 'italic' }}>
                      Thank you for your payment!
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
