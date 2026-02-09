import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

export default function LayawayManagement() {
  const navigate = useNavigate();
  const [layaways, setLayaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    axios.get(`${API_URL}/layaways`, { headers, params })
      .then((res) => setLayaways(res.data || []))
      .catch(() => setLayaways([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

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
      <AdminNav title="📦 Layaway" onLogout={handleLogout} />
      <div className="price-management">
        <div className="price-header">
          <h1>📦 Layaway</h1>
          <p className="dashboard-subtitle">Reserve items with part payment; complete payment later. Create via API: POST /api/layaways.</p>
        </div>
        <div className="price-table-container" style={{ margin: '0 2rem 2rem' }}>
          <div className="price-search-card" style={{ marginBottom: '1.5rem' }}>
            <div className="price-search-row">
              <label className="price-table-title" style={{ marginRight: '0.75rem', marginBottom: 0 }}>Filter by status</label>
              <select style={{ width: 160, padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border-gold)', borderRadius: 8, background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="RESERVED">Reserved</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          {loading ? (
            <p className="price-pagination-info">Loading...</p>
          ) : layaways.length === 0 ? (
            <p className="price-pagination-info">No layaways.</p>
          ) : (
            <div className="price-table-scroll">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Total (₹)</th>
                    <th>Paid (₹)</th>
                    <th>Due date</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {layaways.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td style={{ fontWeight: '600' }}>{l.customer?.name}</td>
                      <td>{l.totalAmount}</td>
                      <td>{l.paidAmount ?? 0}</td>
                      <td>{l.dueDate || '—'}</td>
                      <td>{l.status}</td>
                      <td>{l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</td>
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
