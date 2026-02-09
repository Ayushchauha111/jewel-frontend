import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

export default function PromoCodeManagement() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', discountType: 'PERCENT', discountValue: '', minPurchaseAmount: '', validUntil: '', maxUses: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchPromos = () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    setLoading(true);
    axios.get(`${API_URL}/promo-codes`, { headers })
      .then((res) => setPromos(res.data || []))
      .catch(() => setPromos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const headers = getAuthHeaders();
    const body = {
      code: form.code.trim(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue) || 0,
      minPurchaseAmount: form.minPurchaseAmount ? parseFloat(form.minPurchaseAmount) : null,
      validUntil: form.validUntil || null,
      maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
      active: true
    };
    axios.post(`${API_URL}/promo-codes`, body, { headers })
      .then(() => {
        setMessage('Promo code created.');
        setForm({ code: '', discountType: 'PERCENT', discountValue: '', minPurchaseAmount: '', validUntil: '', maxUses: '' });
        fetchPromos();
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to create'))
      .finally(() => setSaving(false));
  };

  if (!AuthService.getCurrentUser()) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="admin-dashboard">
      <AdminNav title="🏷️ Promo Codes" onLogout={handleLogout} />
      <div className="price-management">
        <div className="price-header">
          <h1>🏷️ Promo Codes</h1>
          <p className="dashboard-subtitle">Percentage or fixed discount applied at billing.</p>
        </div>
        {error && (
          <div className="dashboard-error" style={{ margin: '0 2rem 1rem 2rem' }}>
            ⚠️ {error}
          </div>
        )}
        {message && (
          <div style={{ margin: '0 2rem 1rem 2rem', padding: '1rem', background: 'var(--adm-success)', color: '#1a1814', borderRadius: '8px', border: '1px solid rgba(124,184,124,0.5)' }}>
            ✓ {message}
          </div>
        )}
        <div className="price-table-container" style={{ margin: '0 2rem 2rem' }}>
          <div className="price-search-card" style={{ marginBottom: '2rem' }}>
            <h3 className="price-table-title">Add promo code</h3>
            <form onSubmit={handleSubmit}>
              <div className="price-search-row" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="price-table-title" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Code</label>
                  <input type="text" className="price-management" style={{ width: 140, padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required placeholder="SAVE10" />
                </div>
                <div>
                  <label className="price-table-title" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Type</label>
                  <select className="price-management" style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)', minWidth: 100 }} value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
                    <option value="PERCENT">Percent</option>
                    <option value="FIXED">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="price-table-title" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Value</label>
                  <input type="number" step="0.01" className="price-management" style={{ width: 100, padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} required placeholder="10" />
                </div>
                <div>
                  <label className="price-table-title" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Min purchase (₹)</label>
                  <input type="number" step="0.01" className="price-management" style={{ width: 120, padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={form.minPurchaseAmount} onChange={(e) => setForm((f) => ({ ...f, minPurchaseAmount: e.target.value }))} placeholder="Optional" />
                </div>
                <div>
                  <label className="price-table-title" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Valid until</label>
                  <input type="date" className="price-management" style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={form.validUntil} onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))} />
                </div>
                <div>
                  <label className="price-table-title" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Max uses</label>
                  <input type="number" className="price-management" style={{ width: 80, padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <button type="submit" className="stock-btn-edit" style={{ padding: '0.75rem 1.5rem' }} disabled={saving}>Add</button>
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
                    <th>Type</th>
                    <th>Value</th>
                    <th>Used</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '600' }}>{p.code}</td>
                      <td>{p.discountType}</td>
                      <td>{p.discountValue}{p.discountType === 'PERCENT' ? '%' : ' ₹'}</td>
                      <td>{p.usedCount ?? 0}</td>
                      <td>{p.active ? 'Yes' : 'No'}</td>
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
