import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

export default function CustomerLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    setLoading(true);
    axios.get(`${API_URL}/customers/${id}/ledger`, { headers })
      .then((res) => setLedger(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load ledger'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  if (!AuthService.getCurrentUser()) {
    window.location.href = '/login';
    return null;
  }

  if (loading) {
    return (
      <div className="admin-dashboard customer-ledger-page">
        <AdminNav title="📒 Customer Ledger" onLogout={handleLogout} />
        <div className="price-management">
          <div className="price-header">
            <h1>📒 Customer Ledger</h1>
          </div>
          <div className="price-table-container" style={{ margin: '0 2rem 2rem' }}>
            <p className="price-pagination-info">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ledger) {
    return (
      <div className="admin-dashboard customer-ledger-page">
        <AdminNav title="📒 Customer Ledger" onLogout={handleLogout} />
        <div className="price-management">
          <div className="price-header">
            <h1>📒 Customer Ledger</h1>
          </div>
          <div className="price-table-container" style={{ margin: '0 2rem 2rem' }}>
            <div className="dashboard-error" style={{ marginBottom: '1rem' }}>⚠️ {error || 'Not found'}</div>
            <Link to="/admin/customers" className="stock-btn-edit" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none', color: 'inherit' }}>← Back to Customers</Link>
          </div>
        </div>
      </div>
    );
  }

  const { customer, bills, credits } = ledger;

  return (
    <div className="admin-dashboard customer-ledger-page">
      <AdminNav title="📒 Customer Ledger" onLogout={handleLogout} />
      <div className="price-management">
        <div className="price-header">
          <h1>📒 Customer Ledger</h1>
          <p className="dashboard-subtitle">
            <Link to="/admin/customers" style={{ color: 'var(--adm-gold)', textDecoration: 'none' }}>← Back to Customers</Link>
          </p>
        </div>
        <div className="price-table-container" style={{ margin: '0 2rem 2rem' }}>
          <div className="price-search-card" style={{ marginBottom: '2rem' }}>
            <h3 className="price-table-title">{customer?.name}</h3>
            <p className="price-pagination-info" style={{ marginBottom: '0.25rem' }}>Phone: {customer?.phone} | Email: {customer?.email || '—'}</p>
            <p className="price-pagination-info">Loyalty points: {customer?.loyaltyPoints ?? 0}</p>
          </div>
          <h3 className="price-table-title">Bills</h3>
          {bills?.length === 0 ? (
            <p className="price-pagination-info" style={{ marginBottom: '2rem' }}>No bills.</p>
          ) : (
            <div className="price-table-scroll" style={{ marginBottom: '2rem' }}>
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Bill #</th>
                    <th>Final (₹)</th>
                    <th>Paid (₹)</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bills?.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: '600' }}><Link to="/admin/billing" style={{ color: 'var(--adm-gold)' }}>{b.billNumber}</Link></td>
                      <td>{b.finalAmount}</td>
                      <td>{b.paidAmount}</td>
                      <td>{b.paymentStatus}</td>
                      <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <h3 className="price-table-title">Credits (Udhari)</h3>
          {credits?.length === 0 ? (
            <p className="price-pagination-info">No credits.</p>
          ) : (
            <div className="price-table-scroll">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Bill</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {credits?.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '600' }}>₹{c.creditAmount}</td>
                      <td>₹{c.paidAmount}</td>
                      <td>₹{c.remainingAmount}</td>
                      <td>{c.status}</td>
                      <td>{c.billNumber || '—'}</td>
                      <td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
