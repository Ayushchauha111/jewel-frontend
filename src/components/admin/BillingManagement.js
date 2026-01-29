import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

// Standard gold purity (%) for buy-back (customer selling gold). API uses carat: carat = (purity/100)*24
const GOLD_PURITY_OPTIONS = [
  { purity: 41.7, label: '41.7% (10K)' },
  { purity: 50, label: '50% (12K)' },
  { purity: 58.3, label: '58.3% (14K)' },
  { purity: 62.5, label: '62.5% (15K)' },
  { purity: 75, label: '75% (18K)' },
  { purity: 83.3, label: '83.3% (20K)' },
  { purity: 87.5, label: '87.5% (21K)' },
  { purity: 91.6, label: '91.6% (22K)' },
  { purity: 99.9, label: '99.9% (24K)' }
];

function BillingManagement() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stock, setStock] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ stockId: '', quantity: 1 }],
    discountAmount: 0,
    paymentMethod: 'CASH',
    paidAmount: '',
    notes: ''
  });
  // Cache of calculated price from today's gold rate (stockId -> price); used for Gold items when weight+carat present
  const [itemPrices, setItemPrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);
  // Cache of calculated buy-back value (index -> price) when customer sells gold
  const [buyBackPrices, setBuyBackPrices] = useState({});
  const [selectedBill, setSelectedBill] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);

  const isGoldItem = (s) => s && String(s.material || '').toLowerCase() === 'gold' && s.weightGrams && s.carat;

  const openBillDetail = async (billId) => {
    setLoadingBill(true);
    setSelectedBill(null);
    try {
      const res = await axios.get(`${API_URL}/billing/${billId}`, { headers: getAuthHeaders() });
      setSelectedBill(res.data);
    } catch (err) {
      setError('Failed to load bill details');
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoadingBill(false);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchCustomers();
    fetchStock();
  }, [currentPage, pageSize, searchQuery]);

  // Pre-fetch calculated prices for all Gold items when Create Bill form is opened
  useEffect(() => {
    if (!showForm || !stock.length) return;
    const goldItems = stock.filter(isGoldItem);
    if (goldItems.length === 0) return;
    let cancelled = false;
    setPricesLoading(true);
    Promise.allSettled(
      goldItems.map(async (s) => {
        const params = new URLSearchParams({ weightGrams: String(s.weightGrams), carat: String(s.carat) });
        const res = await axios.get(`${API_URL}/stock/calculate-price?${params.toString()}`, { headers: getAuthHeaders() });
        return { id: s.id, price: res.data?.calculatedPrice };
      })
    ).then((results) => {
      if (cancelled) return;
      const next = {};
      let anyFail = false;
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value?.price != null) {
          next[r.value.id] = parseFloat(r.value.price);
        } else {
          anyFail = true;
        }
      });
      setItemPrices(prev => ({ ...prev, ...next }));
      if (anyFail && Object.keys(next).length === 0) {
        setError('Set today\'s gold rate in Price Management to calculate item amounts.');
        setTimeout(() => setError(null), 8000);
      }
      setPricesLoading(false);
    });
    return () => { cancelled = true; };
  }, [showForm, stock]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredBills(bills);
    } else {
      filterBills();
    }
  }, [bills, searchQuery]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchBills = async () => {
    try {
      let url = `${API_URL}/billing`;
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('size', pageSize);
      if (searchQuery) params.append('search', searchQuery);
      url += '?' + params.toString();
      const response = await axios.get(url, {
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
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError('Failed to load bills');
    }
  };

  const filterBills = () => {
    if (!searchQuery) {
      setFilteredBills(bills);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = bills.filter(bill => 
      bill.billNumber?.toLowerCase().includes(query) ||
      bill.customer?.name?.toLowerCase().includes(query) ||
      bill.customer?.phone?.toLowerCase().includes(query)
    );
    setFilteredBills(filtered);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(0);
    await fetchBills();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers?page=0&size=500`, {
        headers: getAuthHeaders()
      });
      const data = response.data?.content ?? response.data;
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchStock = async () => {
    try {
      const response = await axios.get(`${API_URL}/stock?page=0&size=500`);
      const data = response.data?.content ?? response.data;
      const list = Array.isArray(data) ? data : [];
      setStock(list.filter(s => s.status === 'AVAILABLE'));
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Validate stock quantity: total ordered per stock must not exceed available
      const qtyByStockId = {};
      for (const item of formData.items) {
        if (item.isBuyBack || !item.stockId) continue;
        const sid = parseInt(item.stockId, 10);
        qtyByStockId[sid] = (qtyByStockId[sid] || 0) + parseInt(item.quantity || 1, 10);
      }
      for (const sid of Object.keys(qtyByStockId)) {
        const s = stock.find(x => x.id === parseInt(sid, 10));
        const available = s?.quantity != null ? parseInt(s.quantity, 10) : 0;
        if (qtyByStockId[sid] > available) {
          setError(`${s?.articleName || 'Item'} (${s?.articleCode || sid}): only ${available} available, but ${qtyByStockId[sid]} requested.`);
          setLoading(false);
          return;
        }
      }

      const billingItems = formData.items.map((item, index) => {
        if (item.isBuyBack) {
          const price = buyBackPrices[index];
          const p = item.purity;
          const purity = (p != null && p !== '' && p !== 'OTHER' && !isNaN(parseFloat(p))) ? parseFloat(p) : null;
          if (!item.weightGrams || purity == null || price == null) return null;
          const qty = parseInt(item.quantity || 1, 10);
          const carat = purityToCarat(purity);
          return {
            stock: null,
            itemName: `Gold buy-back (${purity}%)`,
            weightGrams: parseFloat(item.weightGrams),
            carat: parseFloat(carat.toFixed(2)),
            quantity: qty,
            unitPrice: -price,
            totalPrice: -(price * qty)
          };
        }
        if (!item.stockId) return null;
        const selectedStock = stock.find(s => s.id === parseInt(item.stockId, 10));
        const unitPrice = getUnitPrice(selectedStock);
        const qty = parseInt(item.quantity, 10);
        return {
          stock: { id: parseInt(item.stockId, 10) },
          itemName: selectedStock?.articleName || '',
          articleCode: selectedStock?.articleCode || null,
          weightGrams: selectedStock?.weightGrams || 0,
          carat: selectedStock?.carat || 0,
          quantity: qty,
          unitPrice,
          totalPrice: unitPrice * qty
        };
      }).filter(Boolean);

      if (billingItems.length === 0) {
        setError('Add at least one item or complete gold buy-back (weight + purity).');
        setLoading(false);
        return;
      }

      const billingData = {
        customer: { id: parseInt(formData.customerId) },
        items: billingItems,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        paymentMethod: formData.paymentMethod,
        paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : 0,
        notes: formData.notes
      };

      await axios.post(`${API_URL}/billing`, billingData, {
        headers: getAuthHeaders()
      });

      setSuccess('Bill created successfully!');
      fetchBills();
      fetchStock();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating bill:', error);
      setError(error.response?.data?.message || 'Failed to create bill');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (billId) => {
    try {
      await axios.post(`${API_URL}/billing/${billId}/send-email`, {}, {
        headers: getAuthHeaders()
      });
      setSuccess('Bill sent via email!');
      fetchBills();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email');
      setTimeout(() => setError(null), 5000);
    }
  };

  const sendWhatsApp = async (billId) => {
    try {
      await axios.post(`${API_URL}/billing/${billId}/send-whatsapp`, {}, {
        headers: getAuthHeaders()
      });
      setSuccess('Bill sent via WhatsApp!');
      fetchBills();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      setError('Failed to send WhatsApp');
      setTimeout(() => setError(null), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      items: [{ stockId: '', quantity: 1 }],
      discountAmount: 0,
      paymentMethod: 'CASH',
      paidAmount: '',
      notes: ''
    });
    setItemPrices({});
    setBuyBackPrices({});
    setShowForm(false);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { stockId: '', quantity: 1 }]
    });
  };

  const addBuyBackItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { isBuyBack: true, weightGrams: '', purity: '', quantity: 1 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    setBuyBackPrices(prev => {
      const next = {};
      newItems.forEach((item, i) => {
        if (!item.isBuyBack) return;
        const oldIdx = formData.items.findIndex(x => x === item);
        if (oldIdx >= 0 && prev[oldIdx] != null) next[i] = prev[oldIdx];
      });
      return next;
    });
  };

  // Unit price for a stock item: from today's gold rate (if Gold + weight+carat) else sellingPrice
  const getUnitPrice = (s) => {
    if (!s) return 0;
    const cached = itemPrices[s.id];
    if (cached != null) return cached;
    const sp = s.sellingPrice;
    return (sp != null && sp > 0) ? parseFloat(sp) : 0;
  };

  const fetchCalculatedPriceForStock = async (stockItem) => {
    if (!isGoldItem(stockItem)) return;
    try {
      const params = new URLSearchParams({
        weightGrams: String(stockItem.weightGrams),
        carat: String(stockItem.carat)
      });
      const response = await axios.get(`${API_URL}/stock/calculate-price?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const price = response.data?.calculatedPrice;
      if (price != null) {
        setItemPrices(prev => ({ ...prev, [stockItem.id]: parseFloat(price) }));
      }
    } catch (err) {
      if (err.response?.status === 400 && !itemPrices[stockItem.id]) {
        setError(err.response?.data?.error || 'Set today\'s gold rate in Price Management to calculate amounts.');
        setTimeout(() => setError(null), 6000);
      }
      console.error('Error fetching calculated price for stock:', err);
    }
  };

  const handleItemSelect = (index, stockId) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], stockId, isBuyBack: false };
    setFormData({ ...formData, items: newItems });
    if (stockId) {
      const s = stock.find(x => x.id === parseInt(stockId, 10));
      if (isGoldItem(s) && itemPrices[s.id] == null) {
        fetchCalculatedPriceForStock(s);
      }
    }
  };

  const purityToCarat = (purity) => (parseFloat(purity) / 100) * 24;

  const fetchBuyBackPrice = async (index, weightGrams, purity) => {
    if (!weightGrams || !purity) return;
    const carat = purityToCarat(purity);
    if (isNaN(carat) || carat <= 0) return;
    try {
      const params = new URLSearchParams({ weightGrams: String(weightGrams), carat: String(carat.toFixed(2)) });
      const response = await axios.get(`${API_URL}/stock/calculate-price?${params.toString()}`, { headers: getAuthHeaders() });
      const price = response.data?.calculatedPrice;
      if (price != null) {
        setBuyBackPrices(prev => ({ ...prev, [index]: parseFloat(price) }));
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Set today\'s gold rate to calculate buy-back value.');
        setTimeout(() => setError(null), 5000);
      }
      console.error('Error fetching buy-back price:', err);
    }
  };

  const handleBuyBackChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
    if (field === 'weightGrams' || field === 'purity') {
      const w = field === 'weightGrams' ? value : newItems[index].weightGrams;
      const p = field === 'purity' ? value : newItems[index].purity;
      if (w && p) fetchBuyBackPrice(index, w, p);
    }
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

  const calculateSubtotalSales = () => {
    return formData.items.reduce((sum, item) => {
      if (item.isBuyBack) return sum;
      const selectedStock = stock.find(s => s.id === parseInt(item.stockId, 10));
      const unitPrice = getUnitPrice(selectedStock);
      return sum + (unitPrice * parseInt(item.quantity || 1, 10));
    }, 0);
  };

  const calculateBuyBackTotal = () => {
    return formData.items.reduce((sum, item, index) => {
      if (!item.isBuyBack) return sum;
      const price = buyBackPrices[index] != null ? buyBackPrices[index] : 0;
      const qty = parseInt(item.quantity || 1, 10);
      return sum + (price * qty);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotalSales() - calculateBuyBackTotal();
  };

  const finalAmount = calculateTotal() - (parseFloat(formData.discountAmount) || 0);
  const paidAmount = parseFloat(formData.paidAmount) || 0;
  const remainingAmount = finalAmount - paidAmount;

  return (
    <div className="admin-dashboard">
      <AdminNav title="🧾 Billing" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>🧾 Billing Management</h1>
          <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>Create and manage invoices</p>
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

        {/* Search Section */}
        <div style={{ margin: '0 2rem 2rem 2rem', background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '250px', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Search by bill number, customer name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px', fontSize: '1rem' }}
              />
              <button type="submit" className="price-action-btn" style={{ padding: '0.75rem 1.5rem' }}>
                🔍 Search
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(0);
                    fetchBills();
                  }}
                  className="price-action-btn secondary"
                  style={{ padding: '0.75rem 1rem' }}
                >
                  ✕ Clear
                </button>
              )}
            </form>
            <button
              onClick={() => setShowForm(!showForm)}
              className="price-action-btn"
            >
              {showForm ? '✕ Cancel' : '+ Create New Bill'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="price-form-card">
            <div className="price-form-header">
              <span style={{ fontSize: '2rem' }}>✨</span>
              <h3>Create New Bill</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="price-form-grid">
                <div className="price-form-group">
                  <label>Customer *</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                    ))}
                  </select>
                </div>
                <div className="price-form-group">
                  <label>Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    required
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CREDIT">Udhari</option>
                  </select>
                </div>
                <div className="price-form-group">
                  <label>Discount Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                {(formData.paymentMethod === 'CASH' || formData.paymentMethod === 'CARD' || formData.paymentMethod === 'UPI' || formData.paymentMethod === 'BANK_TRANSFER') && (
                  <div className="price-form-group">
                    <label>Paid Amount (₹) {formData.paymentMethod === 'CASH' && <span style={{ color: '#e74c3c', fontSize: '0.85rem' }}>* Leave empty for full payment</span>}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={finalAmount}
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                      placeholder={formData.paymentMethod === 'CASH' ? "Leave empty for full payment" : "0.00"}
                    />
                    {formData.paidAmount && paidAmount < finalAmount && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fff3cd', borderRadius: '4px', fontSize: '0.9rem', color: '#856404' }}>
                        ⚠️ Remaining amount (₹{remainingAmount.toFixed(2)}) will be added to udhari
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="price-form-group">
                <label>Items *</label>
                {formData.items.map((item, index) => (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    {item.isBuyBack ? (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <span style={{ fontWeight: 600, color: '#0369a1', width: '100%', marginBottom: '0.25rem' }}>🪙 Customer selling gold (buy-back)</span>
                        <div style={{ flex: '1 1 100px' }}>
                          <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Weight (g)</label>
                          <input
                            type="number"
                            step="0.001"
                            value={item.weightGrams || ''}
                            onChange={(e) => handleBuyBackChange(index, 'weightGrams', e.target.value)}
                            placeholder="e.g. 10"
                            style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px' }}
                          />
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
                          <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Purity (%)</label>
                          <select
                            value={item.purity === '' || item.purity === undefined ? '' : (item.purity === 'OTHER' || !GOLD_PURITY_OPTIONS.some(o => Number(item.purity) === o.purity) ? '__OTHER__' : String(item.purity))}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === '__OTHER__') {
                                handleBuyBackChange(index, 'purity', 'OTHER');
                                return;
                              }
                              handleBuyBackChange(index, 'purity', v);
                            }}
                            style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px', marginBottom: (item.purity === 'OTHER' || (item.purity !== '' && item.purity !== undefined && item.purity !== 'OTHER' && !GOLD_PURITY_OPTIONS.some(o => Number(item.purity) === o.purity))) ? '0.5rem' : 0 }}
                          >
                            <option value="">Select</option>
                            {GOLD_PURITY_OPTIONS.map(({ purity, label }) => (
                              <option key={purity} value={purity}>{label}</option>
                            ))}
                            <option value="__OTHER__">Other (enter %)</option>
                          </select>
                          {(item.purity === 'OTHER' || (item.purity !== '' && item.purity !== undefined && item.purity !== 'OTHER' && !GOLD_PURITY_OPTIONS.some(o => Number(item.purity) === o.purity))) && (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={item.purity === 'OTHER' ? '' : (item.purity ?? '')}
                              onChange={(e) => handleBuyBackChange(index, 'purity', e.target.value)}
                              placeholder="e.g. 70"
                              style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px', marginTop: '0.25rem', boxSizing: 'border-box' }}
                            />
                          )}
                        </div>
                        <div style={{ flex: '0 0 70px' }}>
                          <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => handleBuyBackChange(index, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px' }}
                          />
                        </div>
                        <div style={{ flex: '0 0 100px' }}>
                          <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Value</label>
                          <div style={{ padding: '0.75rem', fontWeight: 600, color: '#0d9488' }}>
                            {buyBackPrices[index] != null ? formatCurrency(buyBackPrices[index] * parseInt(item.quantity || 1, 10)) : '—'}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="stock-btn-delete" style={{ padding: '0.75rem 1rem' }}>🗑️</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ flex: '2 1 200px' }}>
                          <select
                            value={item.stockId || ''}
                            onChange={(e) => handleItemSelect(index, e.target.value)}
                            required={!item.isBuyBack}
                            style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px' }}
                          >
                            <option value="">Select Item</option>
                            {stock.map(s => (
                              <option key={s.id} value={s.id}>
                                {[s.articleCode || `#${s.id}`, s.articleName, `${s.weightGrams}g`, `${s.carat}K`, formatCurrency(getUnitPrice(s))].filter(Boolean).join(' · ')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: '0 1 100px', minWidth: '80px' }}>
                          {(() => {
                            const sel = stock.find(s => s.id === parseInt(item.stockId, 10));
                            const available = sel?.quantity != null ? parseInt(sel.quantity, 10) : 999;
                            const qtyNum = parseInt(item.quantity, 10) || 0;
                            const over = qtyNum > available;
                            return (
                              <>
                                <input
                                  type="number"
                                  placeholder="Qty"
                                  value={item.quantity ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const num = parseInt(val, 10);
                                    const capped = (available < 999 && !isNaN(num) && num > available) ? String(available) : val;
                                    const newItems = [...formData.items];
                                    newItems[index] = { ...newItems[index], quantity: capped };
                                    setFormData({...formData, items: newItems});
                                  }}
                                  min={1}
                                  max={available}
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: `2px solid ${over ? '#e74c3c' : '#ecf0f1'}`,
                                    borderRadius: '8px',
                                    boxSizing: 'border-box'
                                  }}
                                />
                                {item.stockId && (
                                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: over ? '#e74c3c' : '#64748b' }}>
                                    Available: {available}{over ? ` — max ${available}` : ''}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="stock-btn-delete" style={{ padding: '0.75rem 1rem', flexShrink: 0 }}>🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={addItem} className="price-action-btn secondary">+ Add Item</button>
                  <button type="button" onClick={addBuyBackItem} className="price-action-btn secondary" style={{ background: '#e0f2fe', color: '#0369a1' }}>🪙 Customer selling gold (buy-back)</button>
                </div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal (items):</span>
                  <strong>{formatCurrency(calculateSubtotalSales())}</strong>
                </div>
                {calculateBuyBackTotal() > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#0d9488' }}>
                    <span>Gold buy-back:</span>
                    <strong>-{formatCurrency(calculateBuyBackTotal())}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Discount:</span>
                  <strong>-{formatCurrency(formData.discountAmount || 0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #ecf0f1', marginBottom: '0.5rem' }}>
                  <span>Total:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>{formatCurrency(finalAmount)}</span>
                </div>
                {(formData.paymentMethod === 'CASH' || formData.paymentMethod === 'CARD' || formData.paymentMethod === 'UPI' || formData.paymentMethod === 'BANK_TRANSFER') && paidAmount > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #ddd' }}>
                      <span>Paid Amount:</span>
                      <strong style={{ color: '#27ae60' }}>{formatCurrency(paidAmount)}</strong>
                    </div>
                    {remainingAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #ddd' }}>
                        <span>Remaining (Udhari):</span>
                        <strong style={{ color: '#e74c3c', fontSize: '1.1rem' }}>{formatCurrency(remainingAmount)}</strong>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="price-form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <button type="submit" className="price-action-btn" disabled={loading}>
                {loading ? '⏳ Creating...' : '💾 Create Bill'}
              </button>
            </form>
          </div>
        )}

        <div className="price-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📋 Bills</h3>
          {filteredBills.length > 0 ? (
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
                    onClick={() => openBillDetail(bill.id)}
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
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); sendEmail(bill.id); }}
                          disabled={bill.emailSent}
                          className="stock-btn-edit"
                          style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                        >
                          {bill.emailSent ? '✅ Email' : '📧 Email'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); sendWhatsApp(bill.id); }}
                          disabled={bill.whatsappSent}
                          className="stock-btn-edit"
                          style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                        >
                          {bill.whatsappSent ? '✅ WhatsApp' : '💬 WhatsApp'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">🧾</div>
              <h3>No Bills Yet</h3>
              <p>Start by creating your first bill</p>
            </div>
          )}

          {/* Bill detail modal */}
          {(loadingBill || selectedBill) && (
            <div
              className="stock-modal-overlay"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
              onClick={() => !loadingBill && setSelectedBill(null)}
            >
              <div
                className="stock-modal-content"
                style={{ maxWidth: '560px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                {loadingBill ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>⏳ Loading bill...</div>
                ) : selectedBill ? (
                  <div className="price-form-card" style={{ margin: 0 }}>
                    <div className="price-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>Bill #{selectedBill.billNumber}</h3>
                      <button type="button" onClick={() => setSelectedBill(null)} className="stock-modal-close" aria-label="Close">✕</button>
                    </div>
                    <div style={{ padding: '0 1rem 1rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Customer:</strong> {selectedBill.customer?.name || '-'}<br />
                        {selectedBill.customer?.phone && <><strong>Phone:</strong> {selectedBill.customer.phone}<br /></>}
                        <strong>Date:</strong> {formatDate(selectedBill.createdAt)}<br />
                        <strong>Payment:</strong> {selectedBill.paymentMethod || '-'} · <span className={`status-badge status-${selectedBill.paymentStatus?.toLowerCase()}`}>{selectedBill.paymentStatus}</span>
                      </div>
                      <table className="price-table" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Article Code</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedBill.items || []).map((item, i) => (
                            <tr key={i}>
                              <td>{item.itemName || '-'}</td>
                              <td>{item.articleCode || (item.stock?.articleCode) || '–'}</td>
                              <td>{item.quantity ?? 1}</td>
                              <td>{formatCurrency(item.unitPrice)}</td>
                              <td>{formatCurrency(item.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Subtotal</span><strong>{formatCurrency(selectedBill.totalAmount)}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Discount</span><strong>-{formatCurrency(selectedBill.discountAmount || 0)}</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Total</span><strong style={{ color: '#667eea', fontSize: '1.1rem' }}>{formatCurrency(selectedBill.finalAmount)}</strong></div>
                        {selectedBill.paidAmount != null && selectedBill.paidAmount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Paid</span><strong style={{ color: '#27ae60' }}>{formatCurrency(selectedBill.paidAmount)}</strong></div>
                        )}
                      </div>
                      {selectedBill.notes && (
                        <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '6px', fontSize: '0.9rem' }}>
                          <strong>Notes:</strong> {selectedBill.notes}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <button type="button" onClick={async () => { await sendEmail(selectedBill.id); openBillDetail(selectedBill.id); }} disabled={selectedBill.emailSent} className="stock-btn-edit">{selectedBill.emailSent ? '✅ Email sent' : '📧 Send Email'}</button>
                        <button type="button" onClick={async () => { await sendWhatsApp(selectedBill.id); openBillDetail(selectedBill.id); }} disabled={selectedBill.whatsappSent} className="stock-btn-edit">{selectedBill.whatsappSent ? '✅ WhatsApp sent' : '💬 Send WhatsApp'}</button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Pagination bar - Showing X-Y of Z, per page, First/Prev/Page X of Y/Next/Last */}
          {totalElements > 0 && (
            <div className="price-pagination-bar">
              <div className="price-pagination-info">
                Showing {filteredBills.length > 0 ? (currentPage * pageSize + 1) : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} bills
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
                  Page {currentPage + 1} of {totalPages || 1}
                </span>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage >= (totalPages || 1) - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="price-pagination-btn"
                  disabled={currentPage >= (totalPages || 1) - 1}
                  onClick={() => handlePageChange((totalPages || 1) - 1)}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingManagement;
