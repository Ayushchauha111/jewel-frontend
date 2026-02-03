import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

function OrderManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders?page=${currentPage}&size=${pageSize}`, {
        headers: getAuthHeaders()
      });
      if (response.data?.content) {
        const sorted = response.data.content.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
        setTotalPages(response.data.totalPages ?? 0);
        setTotalElements(response.data.totalElements ?? 0);
      } else {
        const data = Array.isArray(response.data) ? response.data : [];
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
        setTotalPages(0);
        setTotalElements(sorted.length);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Backend expects the status enum value as a JSON string
      // Spring Boot will deserialize the JSON string to the enum
      await axios.put(`${API_URL}/orders/${orderId}/status`, JSON.stringify(status), {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      setSuccess('Order status updated successfully!');
      fetchOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredOrders = statusFilter === 'ALL' 
    ? orders 
    : orders.filter(order => order.orderStatus === statusFilter);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const stats = {
    total: totalElements,
    pending: orders.filter(o => o.orderStatus === 'PENDING').length,
    confirmed: orders.filter(o => o.orderStatus === 'CONFIRMED').length,
    processing: orders.filter(o => o.orderStatus === 'PROCESSING').length,
    shipped: orders.filter(o => o.orderStatus === 'SHIPPED').length,
    delivered: orders.filter(o => o.orderStatus === 'DELIVERED').length,
    cancelled: orders.filter(o => o.orderStatus === 'CANCELLED').length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + parseFloat(o.finalAmount || 0), 0)
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="🛒 Orders" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>🛒 Order Management</h1>
          <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>Manage customer orders</p>
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
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">📦</div>
            </div>
            <div className="price-label">Total Orders</div>
            <p className="price-value">{stats.total}</p>
          </div>
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">⏳</div>
            </div>
            <div className="price-label">Pending</div>
            <p className="price-value" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {stats.pending}
            </p>
          </div>
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">✅</div>
            </div>
            <div className="price-label">Delivered</div>
            <p className="price-value" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {stats.delivered}
            </p>
          </div>
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">💰</div>
            </div>
            <div className="price-label">Total Revenue</div>
            <p className="price-value" style={{ fontSize: '1.75rem' }}>{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div style={{ margin: '0 2rem 2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleStatusFilterChange('ALL')}
              className={`price-action-btn ${statusFilter === 'ALL' ? '' : 'secondary'}`}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => handleStatusFilterChange('PENDING')}
              className={`price-action-btn ${statusFilter === 'PENDING' ? '' : 'secondary'}`}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => handleStatusFilterChange('DELIVERED')}
              className={`price-action-btn ${statusFilter === 'DELIVERED' ? '' : 'secondary'}`}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Delivered ({stats.delivered})
            </button>
          </div>
        </div>

        <div className="price-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📋 Orders ({filteredOrders.length})</h3>
          {filteredOrders.length > 0 ? (
            <>
              <div className="price-table-scroll">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Shipping</th>
                      <th>Total</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 'bold', color: '#667eea' }}>{order.orderNumber}</td>
                        <td style={{ fontWeight: '600' }}>{order.customer?.name || '-'}</td>
                        <td>{formatCurrency(order.totalAmount)}</td>
                        <td>{formatCurrency(order.shippingCharge)}</td>
                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(order.finalAmount)}</td>
                        <td>
                          <span className={`status-badge status-${order.paymentStatus?.toLowerCase()}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={loading}
                            style={{
                              padding: '0.5rem',
                              border: '2px solid #ecf0f1',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <Link
                            to={`/order/${order.id}`}
                            className="stock-btn-edit"
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                          >
                            👁️ View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-list-cards">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="admin-list-card">
                    <div className="admin-list-card-main">
                      <div className="admin-list-card-title" style={{ color: '#667eea' }}>#{order.orderNumber}</div>
                      <div className="admin-list-card-meta">
                        {order.customer?.name || '-'} · {formatCurrency(order.finalAmount)} · {formatDate(order.createdAt)}
                      </div>
                      <span className={`status-badge status-${order.paymentStatus?.toLowerCase()}`}>{order.paymentStatus}</span>
                    </div>
                    <div className="admin-list-card-actions">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={loading}
                        style={{ padding: '0.5rem', border: '2px solid var(--adm-border-gold)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <Link to={`/order/${order.id}`} className="stock-btn-edit" style={{ textDecoration: 'none' }}>👁️ View</Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">🛒</div>
              <h3>No Orders Found</h3>
              <p>{statusFilter !== 'ALL' ? 'No orders with this status' : 'Orders will appear here when customers place them'}</p>
            </div>
          )}

          {totalElements > 0 && (
            <div className="price-pagination-bar">
              <div className="price-pagination-info">
                Showing {filteredOrders.length > 0 ? currentPage * pageSize + 1 : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} orders
              </div>
              <div className="price-pagination-controls">
                <select
                  className="price-pagination-select"
                  value={pageSize}
                  onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(0); }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <button type="button" className="price-pagination-btn" disabled={currentPage === 0} onClick={() => handlePageChange(0)}>First</button>
                <button type="button" className="price-pagination-btn" disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                <span style={{ color: '#2c3e50', padding: '0 0.5rem', fontWeight: 600 }}>Page {currentPage + 1} of {totalPages || 1}</span>
                <button type="button" className="price-pagination-btn" disabled={currentPage >= (totalPages || 1) - 1} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                <button type="button" className="price-pagination-btn" disabled={currentPage >= (totalPages || 1) - 1} onClick={() => handlePageChange((totalPages || 1) - 1)}>Last</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderManagement;
