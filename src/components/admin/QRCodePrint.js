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

const isMobileBrowser = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));

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
      @page { size: A4; margin: 0; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
      .qr-print-sheet { position: static !important; left: auto !important; visibility: visible !important; width: 100% !important; box-sizing: border-box !important; background: #fff; color: #000; }
      .qr-print-grid { display: flex; flex-wrap: wrap; padding: 0; width: 100%; box-sizing: border-box; }
      .qr-print-label { width: calc(25% - 2px); height: 11.1mm; border: 0.5px solid #ccc; margin: 0.5mm 1px; padding: 0.3mm 1mm; font-size: 6px; page-break-inside: avoid; break-inside: avoid; display: flex; flex-direction: row; align-items: center; justify-content: space-between; background: #fff; box-sizing: border-box; overflow: visible; }
      .qr-print-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; overflow: hidden; padding-right: 1mm; }
      .qr-print-qr { width: 9mm !important; height: 9mm !important; min-width: 9mm !important; min-height: 9mm !important; display: block; border: none; object-fit: contain; flex-shrink: 0; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; }
      .qr-print-no-qr { width: 9mm !important; height: 9mm !important; min-width: 9mm; display: flex; align-items: center; justify-content: center; background: #f0f0f0; color: #999; font-size: 4px; flex-shrink: 0; }
      .qr-print-shop { font-weight: bold; font-size: 5.5px; line-height: 1.2; margin-bottom: 0.2mm; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #000; }
      .qr-print-detail { font-size: 4.5px; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; color: #333; }
    `,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        const el = printRef.current;
        if (!el) {
          resolve();
          return;
        }
        const imgs = el.querySelectorAll('img');
        if (imgs.length === 0) {
          setTimeout(resolve, 50);
          return;
        }
        let done = 0;
        const onDone = () => {
          done += 1;
          if (done >= imgs.length) setTimeout(resolve, 50);
        };
        imgs.forEach((img) => {
          if (img.complete) onDone();
          else {
            img.onload = onDone;
            img.onerror = onDone;
          }
        });
      });
    }
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

  const buildQRPrintHTML = (items) => {
    const labels = items.map(item => {
      const qrImg = item.qrCode
        ? `<img src="data:image/png;base64,${item.qrCode}" style="width:9mm;height:9mm;min-width:9mm;min-height:9mm;display:block;border:none;object-fit:contain;flex-shrink:0;image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges;" />`
        : `<div style="width:9mm;height:9mm;min-width:9mm;display:flex;align-items:center;justify-content:center;background:#f0f0f0;color:#999;font-size:4px;flex-shrink:0;">No QR</div>`;
      return `<div style="width:calc(25% - 2px);height:11.1mm;border:0.5px solid #ccc;margin:0.5mm 1px;padding:0.3mm 1mm;font-size:6px;page-break-inside:avoid;break-inside:avoid;display:flex;flex-direction:row;align-items:center;justify-content:space-between;background:#fff;box-sizing:border-box;overflow:visible;">
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;overflow:hidden;padding-right:1mm;">
          <div style="font-weight:bold;font-size:5.5px;line-height:1.2;margin-bottom:0.2mm;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#000;">GangaJewellers</div>
          <div style="font-size:4.5px;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333;">SKU Code - ${item.articleCode || item.id}</div>
          <div style="font-size:4.5px;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333;">SKU Name - ${item.articleName}</div>
          <div style="font-size:4.5px;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333;">Gross. WT - ${item.weightGrams ? item.weightGrams + 'g' : '-'}</div>
          <div style="font-size:4.5px;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333;">Karat - ${item.carat ? item.carat + 'K' : '-'}</div>
        </div>${qrImg}</div>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QR Codes - Print</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .toolbar { padding: 12px 16px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .toolbar button { padding: 10px 20px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .btn-print { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
  .btn-close { background: #f1f5f9; color: #475569; }
  .toolbar p { color: #64748b; font-size: 13px; margin-left: auto; }
  .sheet { width: 210mm; min-height: 297mm; margin: 10px auto; background: #fff; padding: 0; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
  .grid { display: flex; flex-wrap: wrap; padding: 0; width: 100%; }
  @media print { .toolbar { display: none !important; } .sheet { margin: 0; box-shadow: none; } body { background: #fff; } }
  @media (max-width: 600px) { .sheet { width: 100%; min-height: auto; } }
</style></head><body>
<div class="toolbar">
  <button class="btn-print" onclick="window.print()">🖨️ Print</button>
  <button class="btn-close" onclick="window.close()">✕ Close</button>
  <p>${items.length} label(s) · Tap Print, then use your browser's Print or Share → Print</p>
</div>
<div class="sheet"><div class="grid">${labels}</div></div>
</body></html>`;
  };

  const openQRPrintInNewTab = () => {
    const items = selectedStock;
    if (items.length === 0) return;
    const html = buildQRPrintHTML(items);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const onPrintClick = () => {
    if (selectedItems.size === 0) {
      setError('Please select at least one item to print');
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (isMobileBrowser()) {
      window.print();
    } else {
      handlePrint();
    }
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
      <div className="qr-screen-only">
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
            <button
              onClick={openQRPrintInNewTab}
              className="price-action-btn secondary"
              disabled={selectedItems.size === 0}
              style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
              title="Opens print-ready page in a new tab — use this if printing doesn't work directly"
            >
              📱 Open in new tab
            </button>
          </div>
        </div>

        <div className="price-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📋 Stock Items ({totalElements})</h3>
          {paginatedStock.length > 0 ? (
            <>
              <div className="price-table-scroll">
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
              </div>
              <div className="admin-list-cards">
                {paginatedStock.map(item => (
                  <div key={item.id} className={`admin-list-card ${selectedItems.has(item.id) ? 'row-selected' : ''}`} style={{ borderColor: selectedItems.has(item.id) ? 'var(--adm-gold)' : undefined }}>
                    <div className="admin-list-card-main">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.25rem' }}>
                        <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleSelection(item.id)} style={{ width: '20px', height: '20px', accentColor: '#667eea' }} />
                        <span className="admin-list-card-title" style={{ color: '#667eea' }}>{item.articleCode || 'N/A'}</span>
                      </label>
                      <div className="admin-list-card-meta">{item.articleName} · {item.weightGrams || 'N/A'}g · {item.purityPercentage ? `${item.purityPercentage}%` : '-'} · {formatCurrency(item.sellingPrice)}</div>
                      <span className={`status-badge status-${item.status?.toLowerCase()}`}>{item.status}</span>
                    </div>
                    <div className="admin-list-card-actions">
                      {item.qrCode ? (
                        <img src={getQRCodeImageUrl(item)} alt="QR" style={{ width: '48px', height: '48px', border: '2px solid var(--adm-border-gold)', borderRadius: '8px', background: '#fff' }} />
                      ) : (
                        <span style={{ color: '#e74c3c', fontSize: '0.8rem' }}>❌ No QR</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
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
                  <option value={84}>84 per page</option>
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
      </div>
      </div>

      {/* Printable QR sheet – hidden on screen, visible when printing */}
      <div ref={printRef} className="qr-print-sheet">
        <div className="qr-print-grid">
          {selectedStock.map(item => (
            <div key={item.id} className="qr-print-label">
              <div className="qr-print-info">
                <div className="qr-print-shop">GangaJewellers</div>
                <div className="qr-print-detail">SKU Code - {item.articleCode || item.id}</div>
                <div className="qr-print-detail">SKU Name - {item.articleName}</div>
                <div className="qr-print-detail">Gross. WT - {item.weightGrams ? `${item.weightGrams}g` : '-'}</div>
                <div className="qr-print-detail">Karat - {item.carat ? `${item.carat}K` : '-'}</div>
              </div>
              {item.qrCode ? (
                <img
                  src={getQRCodeImageUrl(item)}
                  alt=""
                  className="qr-print-qr"
                />
              ) : (
                <div className="qr-print-no-qr">No QR</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QRCodePrint;
