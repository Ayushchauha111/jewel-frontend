import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

function CreditManagement() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(null);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState({});
  const [paymentAmount, setPaymentAmount] = useState('');
  const [creditFormData, setCreditFormData] = useState({
    customerId: '',
    creditAmount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchCredits();
    fetchCustomers();
  }, [currentPage, pageSize]);

  const fetchCredits = async () => {
    try {
      const response = await axios.get(`${API_URL}/credits?page=${currentPage}&size=${pageSize}`, {
        headers: getAuthHeaders()
      });
      if (response.data?.content) {
        const sorted = response.data.content.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCredits(sorted);
        setTotalPages(response.data.totalPages ?? 0);
        setTotalElements(response.data.totalElements ?? 0);
      } else {
        const data = Array.isArray(response.data) ? response.data : [];
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCredits(sorted);
        setTotalPages(0);
        setTotalElements(sorted.length);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setError('Failed to load udhari records');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers?page=0&size=500`, {
        headers: getAuthHeaders()
      });
      const data = response.data?.content ?? response.data;
      const customersData = Array.isArray(data) ? data : (data?.data || []);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handlePayment = async (creditId) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid payment amount');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${API_URL}/credits/${creditId}/payment`, 
        { amount: parseFloat(paymentAmount) },
        { headers: getAuthHeaders() }
      );
      setSuccess('Payment recorded successfully!');
      fetchCredits();
      setShowPaymentForm(null);
      setPaymentAmount('');
      // Refresh payment history if it's currently being shown
      if (showPaymentHistory === creditId) {
        fetchPaymentHistory(creditId);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error.response?.data?.message || 'Failed to process payment');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (creditId) => {
    try {
      const response = await axios.get(`${API_URL}/credits/${creditId}/payment-history`, {
        headers: getAuthHeaders()
      });
      setPaymentHistory({ ...paymentHistory, [creditId]: response.data });
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const togglePaymentHistory = (creditId) => {
    if (showPaymentHistory === creditId) {
      setShowPaymentHistory(null);
    } else {
      setShowPaymentHistory(creditId);
      if (!paymentHistory[creditId]) {
        fetchPaymentHistory(creditId);
      }
    }
  };

  const handleCreateCredit = async (e) => {
    e.preventDefault();
    
    if (!creditFormData.customerId || !creditFormData.creditAmount || parseFloat(creditFormData.creditAmount) <= 0) {
      setError('Please fill in all required fields with valid values');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const creditData = {
        customer: { id: parseInt(creditFormData.customerId) },
        creditAmount: parseFloat(creditFormData.creditAmount),
        paidAmount: 0,
        description: creditFormData.description || ''
      };

      await axios.post(`${API_URL}/credits`, creditData, {
        headers: getAuthHeaders()
      });
      
      setSuccess('Udhari record created successfully!');
      fetchCredits();
      setShowCreditForm(false);
      setCreditFormData({
        customerId: '',
        creditAmount: '',
        description: ''
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating credit:', error);
      setError(error.response?.data?.message || 'Failed to create udhari record');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (creditId) => {
    const credit = credits.find(c => c.id === creditId);
    const customerName = credit?.customer?.name || 'this udhari';
    const creditAmount = formatCurrency(credit?.creditAmount || 0);
    
    if (!window.confirm(`Are you sure you want to delete the udhari record for ${customerName} (${creditAmount})? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete(`${API_URL}/credits/${creditId}`, {
        headers: getAuthHeaders()
      });
      if (response.data?.success || response.status === 200) {
        setSuccess(response.data?.message || 'Udhari record deleted successfully!');
        fetchCredits();
        // Clear payment history if it was being shown
        if (showPaymentHistory === creditId) {
          setShowPaymentHistory(null);
        }
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting credit:', error);
      if (error.response?.status === 404) {
        setError('Udhari record not found. It may have already been deleted.');
      } else {
        setError(error.response?.data?.message || error.response?.data || 'Failed to delete udhari record. Please try again.');
      }
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalCredit = credits.reduce((sum, c) => sum + parseFloat(c.creditAmount || 0), 0);
  const totalPaid = credits.reduce((sum, c) => sum + parseFloat(c.paidAmount || 0), 0);
  const totalRemaining = credits.reduce((sum, c) => sum + parseFloat(c.remainingAmount || 0), 0);
  const pendingCount = credits.filter(c => c.status === 'PENDING' || c.status === 'PARTIAL').length;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="💳 Udhari" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>💳 Udhari Management</h1>
          <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>Track and manage udhari (customer credit)</p>
        </div>

        {error && (
          <div style={{ margin: '0 2rem 1rem 2rem', padding: '1rem', background: '#fee', color: '#c33', borderRadius: '8px', border: '1px solid #fcc' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ margin: '0 2rem 1rem 2rem', padding: '1rem', background: '#efe', color: '#3c3', borderRadius: '8px', border: '1px solid #cfc' }}>
            {success}
          </div>
        )}

        <div className="price-cards">
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">💳</div>
            </div>
            <div className="price-label">Total Udhari Given</div>
            <p className="price-value">{formatCurrency(totalCredit)}</p>
          </div>
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">✅</div>
            </div>
            <div className="price-label">Total Paid</div>
            <p className="price-value" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">⏳</div>
            </div>
            <div className="price-label">Total Remaining</div>
            <p className="price-value" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {formatCurrency(totalRemaining)}
            </p>
          </div>
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">📋</div>
            </div>
            <div className="price-label">Pending Udhari</div>
            <p className="price-value">{pendingCount}</p>
          </div>
        </div>

        <div className="price-table-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>📋 Udhari Records</h3>
            <button
              onClick={() => setShowCreditForm(!showCreditForm)}
              className="stock-btn-edit"
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600' }}
            >
              {showCreditForm ? '✕ Cancel' : '➕ Add New Udhari'}
            </button>
          </div>

          {showCreditForm && (
            <div style={{ 
              background: '#fff', 
              padding: '2rem', 
              borderRadius: '12px', 
              marginBottom: '2rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>➕ Add New Udhari</h4>
              <form onSubmit={handleCreateCredit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                      Customer <span style={{ color: '#e74c3c' }}>*</span>
                    </label>
                    <select
                      value={creditFormData.customerId}
                      onChange={(e) => setCreditFormData({ ...creditFormData, customerId: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ecf0f1',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                      Udhari Amount (₹) <span style={{ color: '#e74c3c' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={creditFormData.creditAmount}
                      onChange={(e) => setCreditFormData({ ...creditFormData, creditAmount: e.target.value })}
                      required
                      placeholder="Enter udhari amount"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ecf0f1',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={creditFormData.description}
                    onChange={(e) => setCreditFormData({ ...creditFormData, description: e.target.value })}
                    placeholder="Enter description for this udhari..."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreditForm(false);
                      setCreditFormData({
                        customerId: '',
                        creditAmount: '',
                        description: ''
                      });
                    }}
                    className="stock-btn-delete"
                    style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="stock-btn-edit"
                    style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: '600' }}
                  >
                    {loading ? '⏳ Creating...' : '✅ Create Udhari'}
                  </button>
                </div>
              </form>
            </div>
          )}
          {credits.length > 0 ? (
            <>
              <div className="price-table-scroll">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Udhari Amount</th>
                      <th>Paid Amount</th>
                      <th>Remaining</th>
                      <th>Status</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credits.map((credit) => (
                      <React.Fragment key={credit.id}>
                        <tr>
                          <td style={{ fontWeight: '600' }}>{credit.customer?.name || '-'}</td>
                          <td style={{ fontWeight: 'bold', color: '#667eea' }}>{formatCurrency(credit.creditAmount)}</td>
                          <td style={{ color: '#27ae60' }}>{formatCurrency(credit.paidAmount)}</td>
                          <td style={{ fontWeight: 'bold', color: '#e74c3c' }}>{formatCurrency(credit.remainingAmount)}</td>
                          <td>
                            <span className={`status-badge status-${credit.status?.toLowerCase()}`}>
                              {credit.status}
                            </span>
                          </td>
                          <td>{credit.description || '-'}</td>
                          <td>{formatDate(credit.createdAt)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {showPaymentForm === credit.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    style={{ width: '120px', padding: '0.5rem', border: '2px solid #ecf0f1', borderRadius: '8px' }}
                                  />
                                  <button
                                    onClick={() => handlePayment(credit.id)}
                                    disabled={loading}
                                    className="stock-btn-edit"
                                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                  >
                                    {loading ? '⏳' : '✅ Pay'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowPaymentForm(null);
                                      setPaymentAmount('');
                                    }}
                                    className="stock-btn-delete"
                                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setShowPaymentForm(credit.id)}
                                    className="stock-btn-edit"
                                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                  >
                                    💰 Add Payment
                                  </button>
                                  <button
                                    onClick={() => togglePaymentHistory(credit.id)}
                                    className="stock-btn-edit"
                                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', background: '#667eea', color: '#fff' }}
                                  >
                                    {showPaymentHistory === credit.id ? '📋 Hide History' : '📋 View History'}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(credit.id)}
                                    disabled={loading}
                                    className="stock-btn-delete"
                                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                    title="Delete this udhari record"
                                  >
                                    🗑️ Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {showPaymentHistory === credit.id && paymentHistory[credit.id] && (
                      <tr>
                        <td colSpan="8" style={{ background: '#f8f9fa', padding: '1rem' }}>
                          <div style={{ marginLeft: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#2c3e50' }}>💳 Payment History</h4>
                            {paymentHistory[credit.id].length > 0 ? (
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ background: '#ecf0f1' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Payment Date</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Amount</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paymentHistory[credit.id].map((payment) => (
                                    <tr key={payment.id}>
                                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                                        {formatDateTime(payment.paymentDate)}
                                      </td>
                                      <td style={{ padding: '0.75rem', border: '1px solid #ddd', fontWeight: 'bold', color: '#27ae60' }}>
                                        {formatCurrency(payment.paymentAmount)}
                                      </td>
                                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                                        {payment.notes || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No payment history available</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
              </div>
              <div className="admin-list-cards">
                {credits.map((credit) => (
                  <div key={credit.id} className="admin-list-card">
                    <div className="admin-list-card-main">
                      <div className="admin-list-card-title">{credit.customer?.name || '-'}</div>
                      <div className="admin-list-card-meta">
                        Udhari: {formatCurrency(credit.creditAmount)} · Paid: {formatCurrency(credit.paidAmount)} · Remaining: {formatCurrency(credit.remainingAmount)} · {formatDate(credit.createdAt)}
                      </div>
                      <span className={`status-badge status-${credit.status?.toLowerCase()}`}>{credit.status}</span>
                    </div>
                    <div className="admin-list-card-actions">
                      {showPaymentForm === credit.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input type="number" step="0.01" placeholder="Amount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} style={{ width: '100px', padding: '0.5rem', border: '2px solid var(--adm-border-gold)', borderRadius: '8px', background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} />
                          <button onClick={() => handlePayment(credit.id)} disabled={loading} className="stock-btn-edit" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>{loading ? '⏳' : '✅ Pay'}</button>
                          <button onClick={() => { setShowPaymentForm(null); setPaymentAmount(''); }} className="stock-btn-delete" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>✕</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setShowPaymentForm(credit.id)} className="stock-btn-edit" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>💰 Add Payment</button>
                          <button onClick={() => togglePaymentHistory(credit.id)} className="stock-btn-edit" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', background: '#667eea', color: '#fff' }}>{showPaymentHistory === credit.id ? '📋 Hide' : '📋 History'}</button>
                          <button onClick={() => handleDelete(credit.id)} disabled={loading} className="stock-btn-delete" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>🗑️ Delete</button>
                        </>
                      )}
                    </div>
                    {showPaymentHistory === credit.id && paymentHistory[credit.id] && paymentHistory[credit.id].length > 0 && (
                      <div style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <strong>💳 Payment History</strong>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                          {paymentHistory[credit.id].map((p) => (
                            <li key={p.id}>{formatDateTime(p.paymentDate)} — {formatCurrency(p.paymentAmount)}{p.notes ? ` · ${p.notes}` : ''}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">💳</div>
              <h3>No Udhari Records</h3>
              <p>Udhari records will appear here when customers buy on udhari</p>
            </div>
          )}

          {totalElements > 0 && (
            <div className="price-pagination-bar">
              <div className="price-pagination-info">
                Showing {credits.length > 0 ? currentPage * pageSize + 1 : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} udhari
              </div>
              <div className="price-pagination-controls">
                <select
                  className="price-pagination-select"
                  value={pageSize}
                  onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(0); }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <button type="button" className="price-pagination-btn" disabled={currentPage === 0} onClick={() => handlePageChange(0)}>First</button>
                <button type="button" className="price-pagination-btn" disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                <span style={{ color: '#2c3e50', padding: '0 0.5rem', fontWeight: 600 }}>Page {currentPage + 1} of {totalPages || 1}</span>
                <button type="button" className="price-pagination-btn" disabled={currentPage >= (totalPages || 1) - 1} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                <button type="button" className="price-pagination-btn" disabled={currentPage >= (totalPages || 1) - 1} onClick={() => handlePageChange((totalPages || 1) - 1)}>Last</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreditManagement;
