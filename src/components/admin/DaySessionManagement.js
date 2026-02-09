import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

export default function DaySessionManagement() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [openingCash, setOpeningCash] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [mismatchReason, setMismatchReason] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchCurrent = () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    setLoading(true);
    axios.get(`${API_URL}/day-session/current`, { headers })
      .then((res) => {
        if (res.status === 204 || !res.data) setSession(null);
        else setSession(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 404 || err.response?.status === 204) setSession(null);
        else setError(err.response?.data?.message || 'Failed to load session');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const handleOpenDay = (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    setMessage(null);
    const headers = getAuthHeaders();
    const amount = openingCash === '' ? undefined : parseFloat(openingCash);
    axios.post(`${API_URL}/day-session/open`, null, { headers, params: { openingCash: amount } })
      .then((res) => {
        setSession(res.data);
        setMessage('Day opened successfully.');
        setOpeningCash('');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to open day'))
      .finally(() => setActionLoading(false));
  };

  const handleCloseDay = (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    setMessage(null);
    const headers = getAuthHeaders();
    const params = {};
    if (actualCash !== '') params.actualCashAtClose = parseFloat(actualCash);
    if (mismatchReason.trim()) params.mismatchReason = mismatchReason.trim();
    axios.post(`${API_URL}/day-session/close`, null, { headers, params })
      .then((res) => {
        setSession(res.data);
        setMessage('Day closed successfully.');
        setActualCash('');
        setMismatchReason('');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to close day'))
      .finally(() => setActionLoading(false));
  };

  if (!AuthService.getCurrentUser()) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="admin-dashboard">
      <AdminNav title="📅 Day Open/Close" onLogout={handleLogout} />
      <div className="price-management">
        <div className="price-header">
          <h1>📅 Day Open / Close</h1>
          <p className="dashboard-subtitle">Open the day with opening cash; close with actual count and optional mismatch reason.</p>
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
          {loading ? (
            <p className="price-pagination-info">Loading...</p>
          ) : session?.status === 'OPEN' ? (
            <>
              <div className="price-cards" style={{ marginBottom: '2rem' }}>
                <div className="price-card">
                  <div className="price-card-header"><div className="price-icon">📅</div></div>
                  <div className="price-label">Session status</div>
                  <p className="price-value">OPEN</p>
                </div>
                <div className="price-card">
                  <div className="price-card-header"><div className="price-icon">💰</div></div>
                  <div className="price-label">Opening cash</div>
                  <p className="price-value">₹{session.openingCash ?? 0}</p>
                </div>
                <div className="price-card">
                  <div className="price-card-header"><div className="price-icon">📆</div></div>
                  <div className="price-label">Session date</div>
                  <p className="price-value">{session.sessionDate}</p>
                </div>
              </div>
              <h3 className="price-table-title">Close day</h3>
              <form onSubmit={handleCloseDay} className="price-search-card">
                <div className="price-search-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                  <div>
                    <label className="price-table-title" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Actual cash at close (₹)</label>
                    <input type="number" step="0.01" style={{ width: '100%', maxWidth: 200, padding: '0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={actualCash} onChange={(e) => setActualCash(e.target.value)} placeholder="Counted cash" />
                  </div>
                  <div>
                    <label className="price-table-title" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Mismatch reason (optional)</label>
                    <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={mismatchReason} onChange={(e) => setMismatchReason(e.target.value)} placeholder="If count differs from expected" />
                  </div>
                  <button type="submit" className="stock-btn-edit" style={{ padding: '0.75rem 1.5rem', alignSelf: 'flex-start' }} disabled={actionLoading}>Close day</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <p className="price-pagination-info" style={{ marginBottom: '1.5rem' }}>No open session for today. Open the day to start.</p>
              <form onSubmit={handleOpenDay} className="price-search-card">
                <div className="price-search-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                  <div>
                    <label className="price-table-title" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Opening cash (₹)</label>
                    <input type="number" step="0.01" style={{ width: '100%', maxWidth: 200, padding: '0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} placeholder="0" />
                  </div>
                  <button type="submit" className="stock-btn-edit" style={{ padding: '0.75rem 1.5rem', alignSelf: 'flex-start' }} disabled={actionLoading}>Open day</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
