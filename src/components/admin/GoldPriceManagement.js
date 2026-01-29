import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

function GoldPriceManagement() {
  const navigate = useNavigate();
  const [goldPrices, setGoldPrices] = useState([]);
  const [todayPrice, setTodayPrice] = useState(null);
  const [latestPrice, setLatestPrice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    priceDate: new Date().toISOString().split('T')[0],
    pricePerGram: '',
    price22Carat: '',
    price24Carat: '',
    notes: ''
  });

  useEffect(() => {
    fetchGoldPrices();
    fetchTodayPrice();
    fetchLatestPrice();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchGoldPrices = async () => {
    try {
      const response = await axios.get(`${API_URL}/gold-price`);
      setGoldPrices(response.data.sort((a, b) => new Date(b.priceDate) - new Date(a.priceDate)));
    } catch (error) {
      console.error('Error fetching gold prices:', error);
      setError('Failed to load gold prices');
    }
  };

  const fetchTodayPrice = async () => {
    try {
      const response = await axios.get(`${API_URL}/gold-price/today`);
      if (response.data) {
        setTodayPrice(response.data);
      }
    } catch (error) {
      console.error('Error fetching today\'s gold price:', error);
    }
  };

  const fetchLatestPrice = async () => {
    try {
      const response = await axios.get(`${API_URL}/gold-price/latest`);
      if (response.data) {
        setLatestPrice(response.data);
      }
    } catch (error) {
      console.error('Error fetching latest gold price:', error);
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
        price22Carat: formData.price22Carat ? parseFloat(formData.price22Carat) : null,
        price24Carat: formData.price24Carat ? parseFloat(formData.price24Carat) : null
      };

      await axios.post(`${API_URL}/gold-price`, data, {
        headers: getAuthHeaders()
      });

      setSuccess('Gold price saved successfully!');
      fetchGoldPrices();
      fetchTodayPrice();
      fetchLatestPrice();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving gold price:', error);
      setError(error.response?.data?.message || 'Failed to save gold price');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      priceDate: new Date().toISOString().split('T')[0],
      pricePerGram: '',
      price22Carat: '',
      price24Carat: '',
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
      <AdminNav title="🥇 Gold Price" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>💰 Gold Price Management</h1>
          <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>Track and manage daily gold prices</p>
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
            <div className="price-card">
              <div className="price-card-header">
                <div className="price-icon">🥇</div>
                <span className="price-badge today">Today</span>
              </div>
              <div className="price-label">Price per Gram</div>
              <p className="price-value gold">{formatCurrency(todayPrice.pricePerGram)}</p>
              {todayPrice.price22Carat && (
                <>
                  <div className="price-label" style={{ marginTop: '1rem' }}>22 Carat</div>
                  <p className="price-value gold" style={{ fontSize: '1.5rem' }}>{formatCurrency(todayPrice.price22Carat)}</p>
                </>
              )}
              {todayPrice.price24Carat && (
                <>
                  <div className="price-label" style={{ marginTop: '1rem' }}>24 Carat</div>
                  <p className="price-value gold" style={{ fontSize: '1.5rem' }}>{formatCurrency(todayPrice.price24Carat)}</p>
                </>
              )}
              <div className="price-date">{formatDate(todayPrice.priceDate)}</div>
            </div>
          )}

          {latestPrice && latestPrice.priceDate !== todayPrice?.priceDate && (
            <div className="price-card">
              <div className="price-card-header">
                <div className="price-icon">⭐</div>
                <span className="price-badge latest">Latest</span>
              </div>
              <div className="price-label">Price per Gram</div>
              <p className="price-value gold">{formatCurrency(latestPrice.pricePerGram)}</p>
              {latestPrice.price22Carat && (
                <>
                  <div className="price-label" style={{ marginTop: '1rem' }}>22 Carat</div>
                  <p className="price-value gold" style={{ fontSize: '1.5rem' }}>{formatCurrency(latestPrice.price22Carat)}</p>
                </>
              )}
              {latestPrice.price24Carat && (
                <>
                  <div className="price-label" style={{ marginTop: '1rem' }}>24 Carat</div>
                  <p className="price-value gold" style={{ fontSize: '1.5rem' }}>{formatCurrency(latestPrice.price24Carat)}</p>
                </>
              )}
              <div className="price-date">{formatDate(latestPrice.priceDate)}</div>
            </div>
          )}

          <div className="price-card" style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: 'white' }}>
            <div className="price-card-header">
              <div className="price-icon" style={{ background: 'rgba(255,255,255,0.3)' }}>📊</div>
            </div>
            <div className="price-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Records</div>
            <p className="price-value" style={{ color: 'white', fontSize: '3rem', WebkitTextFillColor: 'white' }}>{goldPrices.length}</p>
            <div className="price-date" style={{ color: 'rgba(255,255,255,0.8)' }}>Price History</div>
          </div>
        </div>

        <div style={{ margin: '0 2rem 2rem 2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            className="price-action-btn"
            style={{ marginRight: showForm ? '1rem' : '0' }}
          >
            {showForm ? '✕ Cancel' : '+ Add Gold Price'}
          </button>
        </div>

        {showForm && (
          <div className="price-form-card">
            <div className="price-form-header">
              <span style={{ fontSize: '2rem' }}>✨</span>
              <h3>Add/Update Gold Price</h3>
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
                    placeholder="e.g., 6500.00"
                  />
                </div>
                <div className="price-form-group">
                  <label>22 Carat Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price22Carat}
                    onChange={(e) => setFormData({...formData, price22Carat: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
                <div className="price-form-group">
                  <label>24 Carat Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price24Carat}
                    onChange={(e) => setFormData({...formData, price24Carat: e.target.value})}
                    placeholder="Optional"
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
                {loading ? '⏳ Saving...' : '💾 Save Gold Price'}
              </button>
            </form>
          </div>
        )}

        <div className="price-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📜 Price History</h3>
          {goldPrices.length > 0 ? (
            <table className="price-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Price per Gram</th>
                  <th>22 Carat</th>
                  <th>24 Carat</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {goldPrices.map((price) => (
                  <tr key={price.id}>
                    <td>
                      {formatDate(price.priceDate)}
                      {isToday(price.priceDate) && (
                        <span className="price-badge today" style={{ marginLeft: '0.5rem' }}>Today</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 'bold', color: '#f6a500' }}>{formatCurrency(price.pricePerGram)}</td>
                    <td>{price.price22Carat ? formatCurrency(price.price22Carat) : '-'}</td>
                    <td>{price.price24Carat ? formatCurrency(price.price24Carat) : '-'}</td>
                    <td>{price.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">📊</div>
              <h3>No Gold Prices Yet</h3>
              <p>Start by adding your first gold price entry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoldPriceManagement;
