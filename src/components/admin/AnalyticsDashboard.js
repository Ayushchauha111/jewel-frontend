import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('daily');
  const [analytics, setAnalytics] = useState(null);
  const [completedStock, setCompletedStock] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchDailyAnalytics();
    } else if (viewMode === 'range') {
      fetchRangeAnalytics();
    } else if (viewMode === 'completed-stock') {
      fetchCompletedStock();
    } else if (viewMode === 'udhari-history') {
      fetchCreditHistory();
    }
  }, [viewMode, selectedDate, startDate, endDate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchDailyAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/analytics/daily/${selectedDate}`, {
        headers: getAuthHeaders()
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching daily analytics:', err);
      setError('Failed to load daily analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRangeAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/analytics/range`, {
        params: { startDate, endDate },
        headers: getAuthHeaders()
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching range analytics:', err);
      setError('Failed to load range analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/analytics/completed-stock/${selectedDate}`, {
        headers: getAuthHeaders()
      });
      setCompletedStock(response.data);
    } catch (err) {
      console.error('Error fetching completed stock:', err);
      setError('Failed to load completed stock');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/analytics/credit-history`, {
        params: { startDate, endDate },
        headers: getAuthHeaders()
      });
      setCreditHistory(response.data);
    } catch (err) {
      console.error('Error fetching credit history:', err);
      setError('Failed to load credit history');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="📊 Analytics" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>📊 Analytics & Reports</h1>
          <p>Comprehensive business insights and analytics</p>
        </div>

        {error && (
          <div style={{ margin: '0 2rem 1rem 2rem', padding: '1rem', background: '#fee', color: '#c33', borderRadius: '8px', border: '1px solid #fcc' }}>
            {error}
          </div>
        )}

        <div style={{ margin: '0 2rem 2rem 2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`price-action-btn ${viewMode === 'daily' ? '' : 'secondary'}`}
            onClick={() => setViewMode('daily')}
            style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
          >
            📅 Daily Analytics
          </button>
          <button
            className={`price-action-btn ${viewMode === 'range' ? '' : 'secondary'}`}
            onClick={() => setViewMode('range')}
            style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
          >
            📆 Date Range
          </button>
          <button
            className={`price-action-btn ${viewMode === 'completed-stock' ? '' : 'secondary'}`}
            onClick={() => setViewMode('completed-stock')}
            style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
          >
            ✅ Completed Stock
          </button>
          <button
            className={`price-action-btn ${viewMode === 'udhari-history' ? '' : 'secondary'}`}
            onClick={() => setViewMode('udhari-history')}
            style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
          >
            💳 Udhari History
          </button>
        </div>

        {viewMode === 'daily' && (
          <div style={{ margin: '0 2rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#fff' }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>⏳ Loading analytics...</div>
            ) : analytics ? (
              <div>
                <div className="price-cards" style={{ marginBottom: '2rem' }}>
                  <div className="price-card">
                    <div className="price-card-header">
                      <div className="price-icon">💰</div>
                    </div>
                    <div className="price-label">Total Sales</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(analytics.totalSales)}
                    </p>
                  </div>
                  <div className="price-card">
                    <div className="price-card-header">
                      <div className="price-icon">🧾</div>
                    </div>
                    <div className="price-label">Bills Count</div>
                    <p className="price-value">{analytics.billCount || 0}</p>
                  </div>
                  <div className="price-card">
                    <div className="price-card-header">
                      <div className="price-icon">🛒</div>
                    </div>
                    <div className="price-label">Online Sales</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(analytics.totalOnlineSales)}
                    </p>
                  </div>
                  <div className="price-card">
                    <div className="price-card-header">
                      <div className="price-icon">📦</div>
                    </div>
                    <div className="price-label">Orders Count</div>
                    <p className="price-value">{analytics.orderCount || 0}</p>
                  </div>
                  <div className="price-card">
                    <div className="price-card-header">
                      <div className="price-icon">💳</div>
                    </div>
                    <div className="price-label">Udhari Given</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(analytics.totalCreditGiven)}
                    </p>
                  </div>
                  <div className="price-card">
                    <div className="price-card-header">
                      <div className="price-icon">✅</div>
                    </div>
                    <div className="price-label">Udhari Paid</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(analytics.totalCreditPaid)}
                    </p>
                  </div>
                  <div className="price-card">
                    <div className="price-card-header">
                      <div className="price-icon">📊</div>
                    </div>
                    <div className="price-label">Sold Stock Items</div>
                    <p className="price-value">{analytics.soldStockCount || 0}</p>
                  </div>
                  <div className="price-card price-card--success">
                    <div className="price-card-header">
                      <div className="price-icon">💵</div>
                    </div>
                    <div className="price-label">Total Income</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(analytics.totalIncome)}
                    </p>
                  </div>
                  <div className="price-card price-card--danger">
                    <div className="price-card-header">
                      <div className="price-icon">📉</div>
                    </div>
                    <div className="price-label">Total Expenses</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(analytics.totalExpenses)}
                    </p>
                  </div>
                  <div className="price-card price-card--info">
                    <div className="price-card-header">
                      <div className="price-icon">📈</div>
                    </div>
                    <div className="price-label">Net Income</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(analytics.netIncome)}
                    </p>
                  </div>
                </div>

                {analytics.soldStocks && analytics.soldStocks.length > 0 && (
                  <div className="price-table-container">
                    <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>📦 Sold Stock Items</h3>
                    <div className="price-table-scroll">
                      <table className="price-table">
                        <thead>
                          <tr>
                            <th>Article Name</th>
                            <th>Article Code</th>
                            <th>Selling Price</th>
                            <th>Sold Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.soldStocks.map((stock) => (
                            <tr key={stock.id}>
                              <td>{stock.articleName}</td>
                              <td>{stock.articleCode || '-'}</td>
                              <td>{formatCurrency(stock.sellingPrice)}</td>
                              <td>{formatDate(stock.soldDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="admin-list-cards">
                      {analytics.soldStocks.map((stock) => (
                        <div key={stock.id} className="admin-list-card">
                          <div className="admin-list-card-main">
                            <div className="admin-list-card-title">{stock.articleName}</div>
                            <div className="admin-list-card-meta">{stock.articleCode || '-'} · {formatCurrency(stock.sellingPrice)} · {formatDate(stock.soldDate)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {viewMode === 'range' && (
          <div style={{ margin: '0 2rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ marginRight: '0.5rem', fontWeight: '600', color: '#fff' }}>Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ marginRight: '0.5rem', fontWeight: '600', color: '#fff' }}>End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>⏳ Loading analytics...</div>
            ) : analytics ? (
              <div className="price-cards">
                <div className="price-card">
                  <div className="price-card-header">
                    <div className="price-icon">💰</div>
                  </div>
                  <div className="price-label">Total Sales</div>
                  <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {formatCurrency(analytics.totalSales)}
                  </p>
                </div>
                <div className="price-card">
                  <div className="price-card-header">
                    <div className="price-icon">🧾</div>
                  </div>
                  <div className="price-label">Bills Count</div>
                  <p className="price-value">{analytics.billCount || 0}</p>
                </div>
                <div className="price-card price-card--success">
                  <div className="price-card-header">
                    <div className="price-icon">💵</div>
                  </div>
                  <div className="price-label">Total Income</div>
                  <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {formatCurrency(analytics.totalIncome)}
                  </p>
                </div>
                <div className="price-card price-card--danger">
                  <div className="price-card-header">
                    <div className="price-icon">📉</div>
                  </div>
                  <div className="price-label">Total Expenses</div>
                  <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {formatCurrency(analytics.totalExpenses)}
                  </p>
                </div>
                <div className="price-card price-card--info">
                  <div className="price-card-header">
                    <div className="price-icon">📈</div>
                  </div>
                  <div className="price-label">Net Income</div>
                  <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {formatCurrency(analytics.netIncome)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {viewMode === 'completed-stock' && (
          <div style={{ margin: '0 2rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#fff' }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>⏳ Loading completed stock...</div>
            ) : (
              <div className="price-table-container">
                <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>✅ Completed Stock</h3>
                {completedStock.length > 0 ? (
                  <>
                    <div className="price-table-scroll">
                      <table className="price-table">
                        <thead>
                          <tr>
                            <th>Article Name</th>
                            <th>Article Code</th>
                            <th>Weight (g)</th>
                            <th>Carat</th>
                            <th>Purity %</th>
                            <th>Selling Price</th>
                            <th>Quantity</th>
                            <th>Sold Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedStock.map((stock) => (
                            <tr key={stock.id}>
                              <td>{stock.articleName}</td>
                              <td>{stock.articleCode || '-'}</td>
                              <td>{stock.weightGrams || '-'}</td>
                              <td>{stock.carat || '-'}</td>
                              <td>{stock.purityPercentage ? `${stock.purityPercentage}%` : '-'}</td>
                              <td>{formatCurrency(stock.sellingPrice)}</td>
                              <td>{stock.quantity || 1}</td>
                              <td>{formatDate(stock.soldDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="admin-list-cards">
                      {completedStock.map((stock) => (
                        <div key={stock.id} className="admin-list-card">
                          <div className="admin-list-card-main">
                            <div className="admin-list-card-title">{stock.articleName}</div>
                            <div className="admin-list-card-meta">{stock.articleCode || '-'} · {stock.weightGrams || '-'}g · {formatCurrency(stock.sellingPrice)} · {formatDate(stock.soldDate)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="price-empty-state">
                    <div className="price-empty-state-icon">📦</div>
                    <h3>No Completed Stock</h3>
                    <p>No completed stock items found for this date</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {viewMode === 'udhari-history' && (
          <div style={{ margin: '0 2rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ marginRight: '0.5rem', fontWeight: '600', color: '#f5f0e8' }}>Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(201, 162, 39, 0.35)',
                    background: 'rgba(36, 32, 25, 0.9)',
                    color: '#f5f0e8',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ marginRight: '0.5rem', fontWeight: '600', color: '#f5f0e8' }}>End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid rgba(201, 162, 39, 0.35)',
                    background: 'rgba(36, 32, 25, 0.9)',
                    color: '#f5f0e8',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#f5f0e8' }}>⏳ Loading udhari history...</div>
            ) : (
              <div className="price-table-container udhari-history-table">
                <h3 style={{ marginBottom: '1.5rem', color: '#f5f0e8' }}>💳 Udhari History</h3>
                {creditHistory.length > 0 ? (
                  <>
                    <div className="price-table-scroll">
                      <table className="price-table">
                        <thead>
                          <tr>
                            <th>Customer Name</th>
                            <th>Udhari Amount</th>
                            <th>Paid Amount</th>
                            <th>Remaining Amount</th>
                            <th>Status</th>
                            <th>Description</th>
                            <th>Created Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {creditHistory.map((credit) => (
                            <tr key={credit.id}>
                              <td>{credit.customerName}</td>
                          <td>{formatCurrency(credit.creditAmount)}</td>
                          <td>{formatCurrency(credit.paidAmount)}</td>
                          <td>{formatCurrency(credit.remainingAmount)}</td>
                          <td>
                            <span className={`status-badge status-${credit.status?.toLowerCase()}`}>
                              {credit.status}
                            </span>
                          </td>
                          <td>{credit.description || '-'}</td>
                          <td>{formatDate(credit.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
                    <div className="admin-list-cards">
                      {creditHistory.map((credit) => (
                        <div key={credit.id} className="admin-list-card">
                          <div className="admin-list-card-main">
                            <div className="admin-list-card-title">{credit.customerName}</div>
                            <div className="admin-list-card-meta">{formatCurrency(credit.creditAmount)} · Paid: {formatCurrency(credit.paidAmount)} · Remaining: {formatCurrency(credit.remainingAmount)} · {formatDate(credit.createdAt)}</div>
                            <span className={`status-badge status-${credit.status?.toLowerCase()}`}>{credit.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="price-empty-state">
                    <div className="price-empty-state-icon">💳</div>
                    <h3>No Udhari History</h3>
                    <p>No udhari history found for this date range</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
