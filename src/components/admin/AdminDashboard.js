import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';

const API_URL = '/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStock: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalCredits: 0,
    todayGoldPrice: null,
    todaySilverPrice: null,
    availableStock: 0,
    soldStock: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.error('No token found');
        setError('Not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${API_URL}/admin/dashboard`, { headers });

      setRecentOrders(Array.isArray(data.recentOrders) ? data.recentOrders : []);
      setStats({
        totalStock: data.totalStock ?? 0,
        totalCustomers: data.totalCustomers ?? 0,
        totalOrders: data.totalOrders ?? 0,
        totalCredits: data.totalCredits ?? 0,
        todayGoldPrice: data.todayGoldPrice ?? null,
        todaySilverPrice: data.todaySilverPrice ?? null,
        availableStock: data.availableStock ?? 0,
        soldStock: data.soldStock ?? 0,
        totalRevenue: data.totalRevenue ?? 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="💎 Jewelry Shop Admin" onLogout={handleLogout} />

      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
          </div>
          <button 
            onClick={fetchDashboardStats} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
        
        {error && (
          <div className="dashboard-error">
            ⚠️ {error}
          </div>
        )}
        
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Stock</h3>
              <p className="stat-number">{stats.totalStock}</p>
              <div className="stat-details">
                <span className="stat-badge stat-badge-success">{stats.availableStock} Available</span>
                <span className="stat-badge stat-badge-danger">{stats.soldStock} Sold</span>
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card-info">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Customers</h3>
              <p className="stat-number">{stats.totalCustomers}</p>
              <div className="stat-details">
                <span className="stat-badge stat-badge-info">Active</span>
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card-success">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-number">{stats.totalOrders}</p>
              <div className="stat-details">
                <span className="stat-badge stat-badge-success">All Time</span>
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <h3>Pending Udhari</h3>
              <p className="stat-number">{stats.totalCredits}</p>
              <div className="stat-details">
                <span className="stat-badge stat-badge-warning">Outstanding</span>
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-card-gold">
            <div className="stat-icon">🥇</div>
            <div className="stat-content">
              <h3>Gold Price</h3>
              <p className="stat-number">
                {stats.todayGoldPrice ? formatCurrency(stats.todayGoldPrice) : 'Not Set'}
              </p>
              <div className="stat-details">
                <span className="stat-badge stat-badge-gold">Per Gram</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-card-silver">
            <div className="stat-icon">🥈</div>
            <div className="stat-content">
              <h3>Silver Price</h3>
              <p className="stat-number">
                {stats.todaySilverPrice ? formatCurrency(stats.todaySilverPrice) : 'Not Set'}
              </p>
              <div className="stat-details">
                <span className="stat-badge stat-badge-silver">Per Gram</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-card-revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-number">{formatCurrency(stats.totalRevenue)}</p>
              <div className="stat-details">
                <span className="stat-badge stat-badge-success">All Time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section quick-actions-section">
            <div className="section-header">
              <h2>⚡ Quick Actions</h2>
              <p>Common tasks at your fingertips</p>
            </div>
            <div className="quick-actions-grid">
              <Link to="/admin/stock" className="quick-action-card">
                <div className="quick-action-icon">📦</div>
                <h3>Add Stock</h3>
                <p>Add new jewelry items</p>
              </Link>
              <Link to="/admin/billing" className="quick-action-card">
                <div className="quick-action-icon">🧾</div>
                <h3>Create Bill</h3>
                <p>Generate invoice</p>
              </Link>
              <Link to="/admin/customers" className="quick-action-card">
                <div className="quick-action-icon">👤</div>
                <h3>Add Customer</h3>
                <p>Register new customer</p>
              </Link>
              <Link to="/admin/gold-price" className="quick-action-card">
                <div className="quick-action-icon">🥇</div>
                <h3>Gold Price</h3>
                <p>Update gold rates</p>
              </Link>
              <Link to="/admin/silver-price" className="quick-action-card">
                <div className="quick-action-icon">🥈</div>
                <h3>Silver Price</h3>
                <p>Update silver rates</p>
              </Link>
              <Link to="/admin/analytics" className="quick-action-card">
                <div className="quick-action-icon">📊</div>
                <h3>Analytics</h3>
                <p>View reports</p>
              </Link>
            </div>
          </div>

          {recentOrders.length > 0 && (
            <div className="dashboard-section recent-orders-section">
              <div className="section-header">
                <h2>📋 Recent Orders</h2>
                <Link to="/admin/orders" className="view-all-link">View All →</Link>
              </div>
              <div className="recent-orders-list">
                {recentOrders.map((order) => (
                  <div key={order.id} className="recent-order-item">
                    <div className="order-info">
                      <div className="order-number">{order.orderNumber}</div>
                      <div className="order-customer">{order.customer?.name || 'N/A'}</div>
                    </div>
                    <div className="order-details">
                      <div className="order-amount">{formatCurrency(order.finalAmount)}</div>
                      <div className={`order-status order-status-${order.paymentStatus?.toLowerCase()}`}>
                        {order.paymentStatus}
                      </div>
                    </div>
                    <div className="order-date">{formatDate(order.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
