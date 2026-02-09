import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

export default function GiftVoucherManagement() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellAmount, setSellAmount] = useState('');
  const [selling, setSelling] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState(null);

  const fetchVouchers = () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    setLoading(true);
    axios.get(`${API_URL}/gift-vouchers`, { headers })
      .then((res) => setVouchers(res.data || []))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const handleSell = (e) => {
    e.preventDefault();
    const amount = parseFloat(sellAmount);
    if (!amount || amount <= 0) return;
    setSelling(true);
    setError(null);
    setCreated(null);
    const headers = getAuthHeaders();
    axios.post(`${API_URL}/gift-vouchers/sell`, null, { headers, params: { amount } })
      .then((res) => {
        setCreated(res.data);
        setSellAmount('');
        fetchVouchers();
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to create voucher'))
      .finally(() => setSelling(false));
  };

  if (!AuthService.getCurrentUser()) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="admin-dashboard">
      <AdminNav title="🎁 Gift Vouchers" onLogout={handleLogout} />
      <div className="price-management">
        <div className="price-header">
          <h1>🎁 Gift Vouchers</h1>
          <p className="dashboard-subtitle">Sell vouchers; redeem at billing.</p>
        </div>
        {error && (
          <div className="dashboard-error" style={{ margin: '0 2rem 1rem 2rem' }}>
            ⚠️ {error}
          </div>
        )}
        {created && (
          <div style={{ margin: '0 2rem 1rem 2rem', padding: '1rem', background: 'var(--adm-success)', color: '#1a1814', borderRadius: '8px', border: '1px solid rgba(124,184,124,0.5)' }}>
            ✓ Voucher created: <strong>{created.code}</strong> — ₹{created.amount}. Give this code to the customer; they can redeem it at billing.
          </div>
        )}
        <div className="price-table-container" style={{ margin: '0 2rem 2rem' }}>
          <div className="price-search-card" style={{ marginBottom: '2rem' }}>
            <h3 className="price-table-title">Sell new voucher</h3>
            <form onSubmit={handleSell} className="price-search-row" style={{ alignItems: 'flex-end', gap: '1rem' }}>
              <div>
                <label className="price-table-title" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Amount (₹)</label>
                <input type="number" step="0.01" style={{ width: 140, padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} required placeholder="500" />
              </div>
              <button type="submit" className="stock-btn-edit" style={{ padding: '0.75rem 1.5rem' }} disabled={selling}>Create voucher</button>
            </form>
          </div>
          {loading ? (
            <p className="price-pagination-info">Loading...</p>
          ) : (
            <div className="price-table-scroll">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Amount (₹)</th>
                    <th>Status</th>
                    <th>Sold at</th>
                    <th>Redeemed at</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: '600' }}><code style={{ background: 'var(--adm-bg-elevated)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>{v.code}</code></td>
                      <td>{v.amount}</td>
                      <td>{v.status}</td>
                      <td>{v.soldAt ? new Date(v.soldAt).toLocaleString() : '—'}</td>
                      <td>{v.redeemedAt ? new Date(v.redeemedAt).toLocaleString() : '—'}</td>
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
