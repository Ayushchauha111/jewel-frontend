import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

function SilverPriceManagement() {
  const navigate = useNavigate();
  const [silverPrices, setSilverPrices] = useState([]);
  const [todayPrice, setTodayPrice] = useState(null);
  const [latestPrice, setLatestPrice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    priceDate: new Date().toISOString().split('T')[0],
    pricePerGram: '',
    pricePerKg: '',
    notes: ''
  });

  useEffect(() => {
    fetchSilverPrices();
    fetchTodayPrice();
    fetchLatestPrice();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchSilverPrices = async () => {
    try {
      const response = await axios.get(`${API_URL}/silver-price`);
      setSilverPrices(response.data.sort((a, b) => new Date(b.priceDate) - new Date(a.priceDate)));
    } catch (error) {
      console.error('Error fetching silver prices:', error);
      setError('Failed to load silver prices');
    }
  };

  const fetchTodayPrice = async () => {
    try {
      const response = await axios.get(`${API_URL}/silver-price/today`);
      if (response.data) {
        setTodayPrice(response.data);
      }
    } catch (error) {
      console.error('Error fetching today\'s silver price:', error);
    }
  };

  const fetchLatestPrice = async () => {
    try {
      const response = await axios.get(`${API_URL}/silver-price/latest`);
      if (response.data) {
        setLatestPrice(response.data);
      }
    } catch (error) {
      console.error('Error fetching latest silver price:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = {
        ...formData,
        pricePerGram: parseFloat(formData.pricePerGram),
        pricePerKg: formData.pricePerKg ? parseFloat(formData.pricePerKg) : null
      };

      await axios.post(`${API_URL}/silver-price`, data, {
        headers: getAuthHeaders()
      });

      setSuccess('Silver price saved successfully!');
      fetchSilverPrices();
      fetchTodayPrice();
      fetchLatestPrice();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving silver price:', error);
      setError(error.response?.data?.message || 'Failed to save silver price');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      priceDate: new Date().toISOString().split('T')[0],
      pricePerGram: '',
      pricePerKg: '',
      notes: ''
    });
    setShowForm(false);
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

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="🥈 Silver Price" onLogout={handleLogout} />

      <div className="price-management" style={{ background: 'linear-gradient(135deg, #c0c0c0 0%, #8b8b8b 100%)' }}>
        <div className="price-header">
          <h1>🥈 Silver Price Management</h1>
          <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>Track and manage daily silver prices</p>
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
          {todayPrice && (
            <div className="price-card silver">
              <div className="price-card-header">
                <div className="price-icon silver">🥈</div>
                <span className="price-badge today">Today</span>
              </div>
              <div className="price-label">Price per Gram</div>
              <p className="price-value silver">{formatCurrency(todayPrice.pricePerGram)}</p>
              {todayPrice.pricePerKg && (
                <>
                  <div className="price-label" style={{ marginTop: '1rem' }}>Price per Kilogram</div>
                  <p className="price-value silver" style={{ fontSize: '1.5rem' }}>{formatCurrency(todayPrice.pricePerKg)}</p>
                </>
              )}
              <div className="price-date">{formatDate(todayPrice.priceDate)}</div>
            </div>
          )}

          {latestPrice && latestPrice.priceDate !== todayPrice?.priceDate && (
            <div className="price-card silver">
              <div className="price-card-header">
                <div className="price-icon silver">⭐</div>
                <span className="price-badge latest">Latest</span>
              </div>
              <div className="price-label">Price per Gram</div>
              <p className="price-value silver">{formatCurrency(latestPrice.pricePerGram)}</p>
              {latestPrice.pricePerKg && (
                <>
                  <div className="price-label" style={{ marginTop: '1rem' }}>Price per Kilogram</div>
                  <p className="price-value silver" style={{ fontSize: '1.5rem' }}>{formatCurrency(latestPrice.pricePerKg)}</p>
                </>
              )}
              <div className="price-date">{formatDate(latestPrice.priceDate)}</div>
            </div>
          )}

          <div className="price-card silver" style={{ background: 'linear-gradient(135deg, #c0c0c0 0%, #8b8b8b 100%)', color: 'white' }}>
            <div className="price-card-header">
              <div className="price-icon silver" style={{ background: 'rgba(255,255,255,0.3)' }}>📊</div>
            </div>
            <div className="price-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Records</div>
            <p className="price-value" style={{ color: 'white', fontSize: '3rem', WebkitTextFillColor: 'white' }}>{silverPrices.length}</p>
            <div className="price-date" style={{ color: 'rgba(255,255,255,0.8)' }}>Price History</div>
          </div>
        </div>

        <div style={{ margin: '0 2rem 2rem 2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            className="price-action-btn"
            style={{ marginRight: showForm ? '1rem' : '0' }}
          >
            {showForm ? '✕ Cancel' : '+ Add Silver Price'}
          </button>
        </div>

        {showForm && (
          <div className="price-form-card">
            <div className="price-form-header">
              <span style={{ fontSize: '2rem' }}>✨</span>
              <h3>Add/Update Silver Price</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="price-form-grid">
                <div className="price-form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.priceDate}
                    onChange={(e) => setFormData({...formData, priceDate: e.target.value})}
                    required
                  />
                </div>
                <div className="price-form-group">
                  <label>Price per Gram (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerGram}
                    onChange={(e) => setFormData({...formData, pricePerGram: e.target.value})}
                    required
                    placeholder="e.g., 85.50"
                  />
                </div>
                <div className="price-form-group">
                  <label>Price per Kilogram (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                    placeholder="Optional (auto-calculated if not provided)"
                  />
                </div>
              </div>
              <div className="price-form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes or remarks..."
                />
              </div>
              <button type="submit" className="price-action-btn" disabled={loading}>
                {loading ? '⏳ Saving...' : '💾 Save Silver Price'}
              </button>
            </form>
          </div>
        )}

        <div className="price-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📜 Price History</h3>
          {silverPrices.length > 0 ? (
            <>
              <div className="price-table-scroll">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Price per Gram</th>
                      <th>Price per Kilogram</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {silverPrices.map((price) => (
                      <tr key={price.id}>
                        <td>
                          {formatDate(price.priceDate)}
                          {isToday(price.priceDate) && (
                            <span className="price-badge today" style={{ marginLeft: '0.5rem' }}>Today</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 'bold', color: '#8b8b8b' }}>{formatCurrency(price.pricePerGram)}</td>
                        <td>{price.pricePerKg ? formatCurrency(price.pricePerKg) : '-'}</td>
                        <td>{price.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-list-cards">
                {silverPrices.map((price) => (
                  <div key={price.id} className="admin-list-card">
                    <div className="admin-list-card-main">
                      <div className="admin-list-card-title">{formatDate(price.priceDate)}{isToday(price.priceDate) && <span className="price-badge today" style={{ marginLeft: '0.5rem' }}>Today</span>}</div>
                      <div className="admin-list-card-meta" style={{ color: '#8b8b8b' }}>{formatCurrency(price.pricePerGram)}/g · {price.pricePerKg ? formatCurrency(price.pricePerKg) : '-'}/kg{price.notes ? ` · ${price.notes}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">📊</div>
              <h3>No Silver Prices Yet</h3>
              <p>Start by adding your first silver price entry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SilverPriceManagement;
