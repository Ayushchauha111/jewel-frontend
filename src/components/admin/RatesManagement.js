import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';
const GOLD_CARATS = [10, 12, 14, 18, 20, 21, 22, 24];

function RatesManagement() {
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [todayRate, setTodayRate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    priceDate: new Date().toISOString().split('T')[0],
    ...Object.fromEntries(GOLD_CARATS.map(c => [`gold${c}K`, ''])),
    silverPerGram: '',
    diamondPerCarat: '',
    notes: ''
  });

  useEffect(() => {
    fetchRates();
    fetchTodayRate();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchRates = async () => {
    try {
      const response = await axios.get(`${API_URL}/rates`);
      const list = Array.isArray(response.data) ? response.data : [];
      setRates(list.sort((a, b) => new Date(b.priceDate) - new Date(a.priceDate)));
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError('Failed to load rates');
    }
  };

  const fetchTodayRate = async () => {
    try {
      const response = await axios.get(`${API_URL}/rates/today`);
      if (response.data) setTodayRate(response.data);
    } catch (err) {
      if (err.response?.status !== 404) console.error('Error fetching today rate:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        priceDate: formData.priceDate,
        gold10K: formData.gold10K ? parseFloat(formData.gold10K) : null,
        gold12K: formData.gold12K ? parseFloat(formData.gold12K) : null,
        gold14K: formData.gold14K ? parseFloat(formData.gold14K) : null,
        gold18K: formData.gold18K ? parseFloat(formData.gold18K) : null,
        gold20K: formData.gold20K ? parseFloat(formData.gold20K) : null,
        gold21K: formData.gold21K ? parseFloat(formData.gold21K) : null,
        gold22K: formData.gold22K ? parseFloat(formData.gold22K) : null,
        gold24K: formData.gold24K ? parseFloat(formData.gold24K) : null,
        silverPerGram: formData.silverPerGram ? parseFloat(formData.silverPerGram) : null,
        diamondPerCarat: formData.diamondPerCarat ? parseFloat(formData.diamondPerCarat) : null,
        notes: formData.notes?.trim() || null
      };
      await axios.post(`${API_URL}/rates`, payload, { headers: getAuthHeaders() });
      setSuccess('Rates saved successfully!');
      fetchRates();
      fetchTodayRate();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving rates:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save rates');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      priceDate: new Date().toISOString().split('T')[0],
      ...Object.fromEntries(GOLD_CARATS.map(c => [`gold${c}K`, ''])),
      silverPerGram: '',
      diamondPerCarat: '',
      notes: ''
    });
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    if (amount == null || amount === '') return '—';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isToday = (dateString) => {
    return dateString === new Date().toISOString().split('T')[0];
  };

  const goldValue = (r, carat) => r[`gold${carat}K`] ?? r[`gold${carat}k`];

  const rateToForm = (r) => {
    if (!r) return {};
    return {
      ...Object.fromEntries(GOLD_CARATS.map(c => [`gold${c}K`, r[`gold${c}K`] != null ? String(r[`gold${c}K`]) : ''])),
      silverPerGram: r.silverPerGram != null ? String(r.silverPerGram) : '',
      diamondPerCarat: r.diamondPerCarat != null ? String(r.diamondPerCarat) : '',
      notes: r.notes?.trim() ?? ''
    };
  };

  useEffect(() => {
    if (!showForm || !formData.priceDate) return;
    let cancelled = false;
    axios.get(`${API_URL}/rates/date/${formData.priceDate}`, { headers: getAuthHeaders() })
      .then((res) => {
        if (!cancelled && res.data) {
          setFormData((prev) => ({ ...prev, ...rateToForm(res.data) }));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [showForm, formData.priceDate]);

  return (
    <div className="admin-dashboard">
      <AdminNav title="📊 Rates (Gold / Silver / Diamond)" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>📊 Gold, Silver & Diamond Rates</h1>
          <p>Set daily rates for all carats and metals. Used for bill creation and stock pricing.</p>
        </div>

        {error && (
          <div className="price-error-banner">
            {error}
          </div>
        )}
        {success && (
          <div className="price-success-banner">
            {success}
          </div>
        )}

        <div className="price-cards">
          {todayRate && (
            <>
              <div className="price-card">
                <div className="price-card-header">
                  <div className="price-icon">🥇</div>
                  <span className="price-badge today">Today – Gold</span>
                </div>
                <div className="price-label">22K (per gram)</div>
                <p className="price-value gold">{formatCurrency(todayRate.gold22K ?? todayRate.gold24K)}</p>
                <div className="price-date">{formatDate(todayRate.priceDate)}</div>
              </div>
              <div className="price-card silver">
                <div className="price-card-header">
                  <div className="price-icon silver">🥈</div>
                  <span className="price-badge today">Today – Silver</span>
                </div>
                <div className="price-label">Per gram</div>
                <p className="price-value silver">{formatCurrency(todayRate.silverPerGram)}</p>
                <div className="price-date">{formatDate(todayRate.priceDate)}</div>
              </div>
              <div className="price-card price-card--info">
                <div className="price-card-header">
                  <div className="price-icon silver">💎</div>
                  <span className="price-badge today">Today – Diamond</span>
                </div>
                <div className="price-label">Per carat</div>
                <p className="price-value">{formatCurrency(todayRate.diamondPerCarat)}</p>
                <div className="price-date">{formatDate(todayRate.priceDate)}</div>
              </div>
            </>
          )}
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">📊</div>
            </div>
            <div className="price-label">Total Records</div>
            <p className="price-value">{rates.length}</p>
            <div className="price-date">Rate History</div>
          </div>
        </div>

        <div style={{ margin: '0 2rem 2rem 2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="price-action-btn"
            style={{ marginRight: showForm ? '1rem' : 0 }}
          >
            {showForm ? '✕ Cancel' : '+ Add / Update Rates'}
          </button>
        </div>

        {showForm && (
          <div className="price-form-card">
            <div className="price-form-header">
              <span style={{ fontSize: '2rem' }}>✨</span>
              <h3>Add / Update Daily Rates</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="price-form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.priceDate}
                  onChange={(e) => setFormData({ ...formData, priceDate: e.target.value })}
                  required
                />
              </div>
              <div className="price-form-group">
                <label>Gold – price per gram (₹) by carat</label>
                <div className="rates-gold-grid">
                  {GOLD_CARATS.map(c => (
                    <div key={c} className="rates-gold-cell">
                      <label>{c}K</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData[`gold${c}K`] ?? ''}
                        onChange={(e) => setFormData({ ...formData, [`gold${c}K`]: e.target.value })}
                        placeholder={`${c}K`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="price-form-grid">
                <div className="price-form-group">
                  <label>Silver – price per gram (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.silverPerGram}
                    onChange={(e) => setFormData({ ...formData, silverPerGram: e.target.value })}
                    placeholder="e.g. 85.50"
                  />
                </div>
                <div className="price-form-group">
                  <label>Diamond – price per carat (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.diamondPerCarat}
                    onChange={(e) => setFormData({ ...formData, diamondPerCarat: e.target.value })}
                    placeholder="e.g. 150000"
                  />
                </div>
              </div>
              <div className="price-form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>
              <button type="submit" className="price-action-btn" disabled={loading}>
                {loading ? '⏳ Saving...' : '💾 Save Rates'}
              </button>
            </form>
          </div>
        )}

        <div className="price-table-container">
          <h3 className="price-table-title">📜 Rate History</h3>
          {rates.length > 0 ? (
            <div className="rates-table-wrap">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    {GOLD_CARATS.map(c => (<th key={c}>{c}K</th>))}
                    <th>Silver/g</th>
                    <th>Diamond/ct</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {formatDate(r.priceDate)}
                        {isToday(r.priceDate) && <span className="price-badge today" style={{ marginLeft: '0.5rem' }}>Today</span>}
                      </td>
                      {GOLD_CARATS.map(c => (
                        <td key={c}>{goldValue(r, c) != null ? formatCurrency(goldValue(r, c)) : '—'}</td>
                      ))}
                      <td>{r.silverPerGram != null ? formatCurrency(r.silverPerGram) : '—'}</td>
                      <td>{r.diamondPerCarat != null ? formatCurrency(r.diamondPerCarat) : '—'}</td>
                      <td>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">📊</div>
              <h3>No Rates Yet</h3>
              <p>Add daily rates for gold (all carats), silver, and diamond. They will be used when creating bills and calculating prices.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RatesManagement;
