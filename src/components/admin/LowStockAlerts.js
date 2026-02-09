import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

export default function LowStockAlerts() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    setLoading(true);
    axios.get(`${API_URL}/stock/low-stock`, { headers, params: { threshold } })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [threshold]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  if (!AuthService.getCurrentUser()) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="admin-dashboard">
      <AdminNav title="⚠️ Low Stock" onLogout={handleLogout} />
      <div className="price-management">
        <div className="price-header">
          <h1>⚠️ Low Stock Alerts</h1>
          <p className="dashboard-subtitle">Items with quantity at or below the threshold.</p>
        </div>
        <div className="price-table-container" style={{ margin: '0 2rem 2rem' }}>
          <div className="price-search-card" style={{ marginBottom: '1.5rem' }}>
            <div className="price-search-row">
              <label className="price-table-title" style={{ marginRight: '0.75rem', marginBottom: 0 }}>Alert when quantity ≤</label>
              <input type="number" min="0" style={{ width: 100, padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 0)} />
            </div>
          </div>
          {loading ? (
            <p className="price-pagination-info">Loading...</p>
          ) : items.length === 0 ? (
            <p className="price-pagination-info">No items below threshold.</p>
          ) : (
            <div className="price-table-scroll">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.articleName}</td>
                      <td>{s.articleCode}</td>
                      <td>{s.category}</td>
                      <td>{s.quantity ?? 0}</td>
                      <td>{s.status}</td>
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
