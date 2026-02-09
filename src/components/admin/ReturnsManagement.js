import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

export default function ReturnsManagement() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return;
    setLoading(true);
    axios.get(`${API_URL}/billing-returns`, { headers, params: { page, size: 20 } })
      .then((res) => {
        setReturns(res.data?.content ?? []);
        setTotalPages(res.data?.totalPages ?? 0);
      })
      .catch(() => setReturns([]))
      .finally(() => setLoading(false));
  }, [page]);

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
      <AdminNav title="↩️ Returns" onLogout={handleLogout} />
      <div className="price-management">
        <div className="price-header">
          <h1>↩️ Returns / Exchange</h1>
          <p className="dashboard-subtitle">Create a return from Billing (open a bill and use &quot;Create Return&quot;). Listed below are recent returns.</p>
        </div>
        <div className="price-table-container" style={{ margin: '0 2rem 2rem' }}>
          {loading ? (
            <p className="price-pagination-info">Loading...</p>
          ) : returns.length === 0 ? (
            <p className="price-pagination-info">No returns yet.</p>
          ) : (
            <>
              <div className="price-table-scroll">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Return #</th>
                      <th>Original Bill</th>
                      <th>Type</th>
                      <th>Refund (₹)</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: '600' }}>{r.returnNumber}</td>
                        <td>{r.originalBilling?.billNumber}</td>
                        <td>{r.returnType}</td>
                        <td>{r.totalRefundAmount ?? 0}</td>
                        <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="price-pagination-bar" style={{ marginTop: '1.5rem' }}>
                  <span className="price-pagination-info">Page {page + 1} of {totalPages}</span>
                  <div className="price-pagination-controls">
                    <button type="button" className="price-pagination-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
                    <button type="button" className="price-pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
