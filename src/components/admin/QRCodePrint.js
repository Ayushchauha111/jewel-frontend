import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';
import './QRCodePrint.css';

const API_URL = '/api';

function QRCodePrint() {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [stock, setStock] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'QR_Codes_Articles',
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `
  });

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const headers = getAuthHeaders();
      // Request a large size so we get all items for QR print selection (API returns paginated { content, ... })
      const response = await axios.get(`${API_URL}/stock?page=0&size=5000`, { headers });
      const data = response.data?.content ?? response.data;
      setStock(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stock:', error);
      setError('Failed to load stock items');
    }
  };

  const regenerateAllQRCodes = async () => {
    if (!window.confirm('This will regenerate QR codes for all stock items. Continue?')) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${API_URL}/stock/regenerate-all-qr`, {}, { headers });
      setSuccess(`Successfully regenerated QR codes for ${response.data.count} items`);
      fetchStock();
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error regenerating QR codes:', error);
      setError('Failed to regenerate QR codes: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const onPrintClick = () => {
    if (selectedItems.size === 0) {
      setError('Please select at least one item to print');
      setTimeout(() => setError(null), 3000);
      return;
    }
    handlePrint();
  };

  const getQRCodeImageUrl = (item) => {
    if (!item.qrCode) {
      return null;
    }
    try {
      const dataUrl = `data:image/png;base64,${item.qrCode}`;
      return dataUrl;
    } catch (error) {
      console.error('Error creating QR code data URL:', error);
      return null;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const stockList = Array.isArray(stock) ? stock : [];
  const getFilteredStock = () => {
    if (filterStatus === 'ALL') return stockList;
    return stockList.filter(item => item.status === filterStatus);
  };

  const filteredStock = getFilteredStock();
  const totalElements = filteredStock.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const paginatedStock = filteredStock.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const selectedStock = Array.isArray(filteredStock) ? filteredStock.filter(item => selectedItems.has(item.id)) : [];

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(0);
  };

  const selectAll = () => {
    const pageIds = paginatedStock.map(item => item.id);
    const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selectedItems.has(id));
    if (allOnPageSelected) {
      const next = new Set(selectedItems);
      pageIds.forEach(id => next.delete(id));
      setSelectedItems(next);
    } else {
      const next = new Set(selectedItems);
      pageIds.forEach(id => next.add(id));
      setSelectedItems(next);
    }
  };
  
  const stats = {
    total: stockList.length,
    available: stockList.filter(s => s.status === 'AVAILABLE').length,
    sold: stockList.filter(s => s.status === 'SOLD').length,
    withQR: stockList.filter(s => s.qrCode).length,
    withoutQR: stockList.filter(s => !s.qrCode).length
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="📱 QR Print" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>📱 QR Code Printing</h1>
          <p>Select and print QR codes for stock items</p>
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
            <div className="price-label">Total Stock</div>
            <p className="price-value">{stats.total}</p>
          </div>
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">✅</div>
            </div>
            <div className="price-label">Available</div>
            <p className="price-value price-value-success">{stats.available}</p>
          </div>
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">📱</div>
            </div>
            <div className="price-label">With QR Code</div>
            <p className="price-value">{stats.withQR}</p>
          </div>
          <div className="price-card">
            <div className="price-card-header">
              <div className="price-icon">⚠️</div>
            </div>
            <div className="price-label">Without QR Code</div>
            <p className="price-value price-value-danger">{stats.withoutQR}</p>
          </div>
        </div>

        <div style={{ margin: '0 2rem 2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleFilterChange('ALL')}
              className={`price-action-btn ${filterStatus === 'ALL' ? '' : 'secondary'}`}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => handleFilterChange('AVAILABLE')}
              className={`price-action-btn ${filterStatus === 'AVAILABLE' ? '' : 'secondary'}`}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Available ({stats.available})
            </button>
            <button
              onClick={() => handleFilterChange('SOLD')}
              className={`price-action-btn ${filterStatus === 'SOLD' ? '' : 'secondary'}`}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Sold ({stats.sold})
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={regenerateAllQRCodes}
              className="price-action-btn secondary"
              disabled={loading}
              style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
            >
              {loading ? '⏳ Regenerating...' : '🔄 Regenerate All QR Codes'}
            </button>
            <button
              onClick={selectAll}
              className="price-action-btn secondary"
              style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
            >
              {selectedItems.size === paginatedStock.length && paginatedStock.length > 0 ? '☐ Deselect All' : '☑ Select All'}
            </button>
            <button
              onClick={onPrintClick}
              className="price-action-btn"
              disabled={selectedItems.size === 0}
              style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem'}}
            >
              🖨️ Print Selected ({selectedItems.size})
            </button>
          </div>
        </div>

        <div className="price-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📋 Stock Items ({totalElements})</h3>
          {paginatedStock.length > 0 ? (
            <table className="price-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Select</th>
                  <th>Article Code</th>
                  <th>Article Name</th>
                  <th>Weight (g)</th>
                  <th>Carat</th>
                  <th>Purity %</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>QR Code</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStock.map(item => (
                  <tr key={item.id} className={selectedItems.has(item.id) ? 'row-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: '#667eea'
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 'bold', color: '#667eea' }}>{item.articleCode || 'N/A'}</td>
                    <td style={{ fontWeight: '600' }}>{item.articleName}</td>
                    <td>{item.weightGrams || 'N/A'}</td>
                    <td>{item.carat || 'N/A'}</td>
                    <td>{item.purityPercentage ? `${item.purityPercentage}%` : '-'}</td>
                    <td style={{ fontWeight: 'bold' }}>{formatCurrency(item.sellingPrice)}</td>
                    <td>
                      <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.qrCode ? (
                        <img
                          src={getQRCodeImageUrl(item)}
                          alt="QR Code"
                          style={{
                            width: '60px',
                            height: '60px',
                            border: '2px solid #ecf0f1',
                            borderRadius: '8px',
                            padding: '4px',
                            background: '#fff'
                          }}
                        />
                      ) : (
                        <span style={{ color: '#e74c3c', fontWeight: '600' }}>❌ No QR Code</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">📱</div>
              <h3>No Stock Items Found</h3>
              <p>No stock items match the selected filter</p>
            </div>
          )}

          {/* Pagination bar - same style as Billing/Stock */}
          {totalElements > 0 && (
            <div className="price-pagination-bar">
              <div className="price-pagination-info">
                Showing {paginatedStock.length > 0 ? currentPage * pageSize + 1 : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} items
              </div>
              <div className="price-pagination-controls">
                <select
                  className="price-pagination-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(0);
                  }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(0)}
                >
                  First
                </button>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <span style={{ color: '#2c3e50', padding: '0 0.5rem', fontWeight: 600 }}>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(totalPages - 1)}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Printable QR sheet – small labels for sticking on articles (hidden on screen) */}
        <div ref={printRef} className="qr-print-sheet">
          <div className="qr-print-grid">
            {selectedStock.map(item => (
              <div key={item.id} className="qr-print-label">
                {item.qrCode ? (
                  <img
                    src={getQRCodeImageUrl(item)}
                    alt=""
                    className="qr-print-qr"
                  />
                ) : (
                  <div className="qr-print-no-qr">No QR</div>
                )}
                <div className="qr-print-code">{item.articleCode || item.id}</div>
                <div className="qr-print-name">{item.articleName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRCodePrint;
