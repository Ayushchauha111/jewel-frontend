import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

function formatCurrency(amount) {
  if (amount == null || isNaN(parseFloat(amount))) return '₹0';
  return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function BillingHistory() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('size', pageSize);
      if (searchQuery) params.append('search', searchQuery);
      const response = await axios.get(`${API_URL}/billing?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (response.data.content) {
        const sortedBills = response.data.content.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBills(sortedBills);
        setFilteredBills(sortedBills);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        const data = Array.isArray(response.data) ? response.data : [];
        const sortedBills = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBills(sortedBills);
        setFilteredBills(sortedBills);
        setTotalPages(0);
        setTotalElements(sortedBills.length);
      }
    } catch (err) {
      console.error('Error fetching billing history:', err);
      setError('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [currentPage, pageSize, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchBills();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBillInBilling = (billId) => {
    navigate('/admin/billing', { state: { openBillId: billId } });
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="📜 Billing History" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>📜 Billing History</h1>
          <p>View and search all past bills</p>
        </div>

        {error && (
          <div style={{ margin: '0 2rem 1rem 2rem', padding: '1rem', background: '#fee', color: '#c33', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <div className="price-search-card">
          <form onSubmit={handleSearch} className="billing-search-form" style={{ flex: 1, minWidth: 0, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by bill number, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="price-action-btn" style={{ padding: '0.75rem 1.5rem' }}>
              🔍 Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCurrentPage(0); fetchBills(); }}
                className="price-action-btn secondary"
                style={{ padding: '0.75rem 1rem' }}
              >
                ✕ Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/admin/billing')}
              className="price-action-btn"
            >
              ➕ Create New Bill
            </button>
          </form>
        </div>

        <div className="price-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>All Bills</h3>
          {loading ? (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">⏳</div>
              <h3>Loading...</h3>
            </div>
          ) : filteredBills.length > 0 ? (
            <>
              <div className="price-table-scroll">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Bill Number</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr
                        key={bill.id}
                        onClick={() => openBillInBilling(bill.id)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view bill details"
                      >
                        <td style={{ fontWeight: 'bold', color: '#667eea' }}>{bill.billNumber}</td>
                        <td>{bill.customer?.name || '-'}</td>
                        <td style={{ fontWeight: 'bold' }}>{formatCurrency(bill.finalAmount)}</td>
                        <td>{bill.paymentMethod || '-'}</td>
                        <td>
                          <span className={`status-badge status-${bill.paymentStatus?.toLowerCase()}`}>
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td>{formatDate(bill.createdAt)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => openBillInBilling(bill.id)}
                            className="stock-btn-edit"
                            style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                          >
                            View / Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-list-cards">
                {filteredBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="admin-list-card"
                    onClick={() => openBillInBilling(bill.id)}
                    style={{ cursor: 'pointer' }}
                    title="Tap to view bill details"
                  >
                    <div className="admin-list-card-main">
                      <div className="admin-list-card-title" style={{ color: '#667eea' }}>#{bill.billNumber}</div>
                      <div className="admin-list-card-meta">
                        {bill.customer?.name || '-'} · {formatCurrency(bill.finalAmount)} · {bill.paymentMethod || '-'} · {formatDate(bill.createdAt)}
                      </div>
                      <span className={`status-badge status-${bill.paymentStatus?.toLowerCase()}`}>{bill.paymentStatus}</span>
                    </div>
                    <div className="admin-list-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => openBillInBilling(bill.id)} className="stock-btn-edit" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                        View / Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {totalElements > 0 && (
                <div className="price-pagination-bar">
                  <div className="price-pagination-info">
                    Showing {filteredBills.length > 0 ? (currentPage * pageSize + 1) : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} bills
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
            </>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">📜</div>
              <h3>No Bills Found</h3>
              <p>Create your first bill from the Billing page</p>
              <button type="button" onClick={() => navigate('/admin/billing')} className="price-action-btn" style={{ marginTop: '1rem' }}>
                Go to Billing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingHistory;
