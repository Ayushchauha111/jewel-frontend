import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './StockManagement.css';

const API_URL = '/api';

// Predefined article names for jewelry
const ARTICLE_NAMES = [
  'Ring',
  'Necklace',
  'Earrings',
  'Bracelet',
  'Bangle',
  'Chain',
  'Pendant',
  'Anklet',
  'Nose Pin',
  'Toe Ring',
  'Mangalsutra',
  'Kamarband',
  'Tikka',
  'Hairpin',
  'Brooch',
  'Cufflinks',
  'Watch',
  'Locket',
  'Choker',
  'Armlet'
];

const MATERIAL_OPTIONS = ['Gold', 'Silver', 'Diamond', 'Gemstone', 'Other'];

// Standard gold carat -> purity % (and hallmark). Purity is fixed per carat.
const GOLD_CARAT_PURITY = {
  10: { purity: 41.7, hallmark: 417 },
  12: { purity: 50, hallmark: 500 },
  14: { purity: 58.3, hallmark: 583 },
  15: { purity: 62.5, hallmark: 625 },
  18: { purity: 75, hallmark: 750 },
  20: { purity: 83.3, hallmark: 833 },
  21: { purity: 87.5, hallmark: 875 },
  22: { purity: 91.6, hallmark: 916 },
  24: { purity: 99.9, hallmark: 999 }
};
const GOLD_CARAT_OPTIONS = Object.keys(GOLD_CARAT_PURITY).map(Number).sort((a, b) => a - b);

function StockManagement() {
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCustomArticleName, setShowCustomArticleName] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [usePagination, setUsePagination] = useState(true);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const [formData, setFormData] = useState({
    articleName: '',
    category: '',
    material: 'Gold',
    weightGrams: '',
    carat: '',
    purityPercentage: '',
    quantity: 1,
    size: '',
    description: '',
    imageUrl: '',
    sellingPrice: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [salesHistoryItem, setSalesHistoryItem] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingSalesHistory, setLoadingSalesHistory] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  useEffect(() => {
    fetchStock();
    fetchCategories();
    fetchArticleNames();
  }, [currentPage, pageSize, searchQuery, selectedCategory, selectedMaterial]);

  useEffect(() => {
    if (!usePagination) {
      filterStock();
    }
  }, [stock, searchQuery, selectedCategory, selectedMaterial, usePagination]);

  const fetchStock = async () => {
    try {
      let url = `${API_URL}/stock`;
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedMaterial) params.append('material', selectedMaterial);
      if (usePagination) {
        params.append('page', currentPage);
        params.append('size', pageSize);
      }
      if (params.toString()) url += '?' + params.toString();
      
      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      
      // Check if response is paginated
      if (response.data.content) {
        setStock(response.data.content);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setFilteredStock(response.data.content);
      } else {
        // Non-paginated response (array)
        setStock(Array.isArray(response.data) ? response.data : []);
        setFilteredStock(Array.isArray(response.data) ? response.data : []);
        setTotalPages(0);
        setTotalElements(Array.isArray(response.data) ? response.data.length : 0);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      setError('Failed to load stock items');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/stock/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticleNames = async () => {
    try {
      const response = await axios.get(`${API_URL}/stock/article-names`, {
        headers: getAuthHeaders()
      });
      setArticleNames(response.data || []);
    } catch (error) {
      console.error('Error fetching article names:', error);
    }
  };

  const filterStock = () => {
    let filtered = [...stock];
    
    if (selectedMaterial) {
      filtered = filtered.filter(item => item.material === selectedMaterial);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.articleName?.toLowerCase().includes(query) ||
        item.articleCode?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.material?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredStock(filtered);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(0); // Reset to first page on search
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(0); // Reset to first page on category change
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchStock();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let imageUrl = formData.imageUrl;

      // Upload image if a new one is selected
      if (selectedImage) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedImage);
        
        const uploadResponse = await axios.post(`${API_URL}/stock/upload-image`, formDataUpload, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data.imageUrl;
      }

      // Helper function to safely parse float (returns null if NaN or empty)
      const safeParseFloat = (value) => {
        if (!value || value === '') return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      const data = {
        articleName: formData.articleName || null,
        category: formData.category || null,
        material: formData.material || 'Gold',
        // Article code will be auto-generated by backend
        articleCode: null,
        imageUrl: imageUrl || null,
        weightGrams: safeParseFloat(formData.weightGrams),
        carat: safeParseFloat(formData.carat),
        purityPercentage: safeParseFloat(formData.purityPercentage),
        quantity: formData.quantity ? parseInt(formData.quantity) : 1,
        size: (formData.category && (formData.category.toLowerCase() === 'ring' || formData.category.toLowerCase() === 'rings')) ? (formData.size?.trim() || null) : null,
        description: formData.description && formData.description.trim() ? formData.description.trim() : null,
        sellingPrice: safeParseFloat(formData.sellingPrice)
      };

      if (editingId) {
        await axios.put(`${API_URL}/stock/${editingId}`, data, {
          headers: getAuthHeaders()
        });
        setSuccess('Stock item updated successfully!');
      } else {
        await axios.post(`${API_URL}/stock`, data, {
          headers: getAuthHeaders()
        });
        setSuccess('Stock item added successfully!');
      }

      fetchStock();
      fetchCategories();
      fetchArticleNames();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving stock:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error saving stock item';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      articleName: item.articleName || '',
      category: item.category || '',
      material: item.material || 'Gold',
      weightGrams: item.weightGrams ? String(item.weightGrams) : '',
      carat: item.carat ? String(item.carat) : '',
      purityPercentage: item.purityPercentage ? String(item.purityPercentage) : '',
      quantity: item.quantity || 1,
      size: item.size || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      sellingPrice: item.sellingPrice != null ? String(item.sellingPrice) : ''
    });
    setEditingId(item.id);
    setImagePreview(item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${window.location.protocol}//${window.location.hostname}:8000${item.imageUrl}`) : null);
    setSelectedImage(null);
    setShowForm(true);
    setShowCustomArticleName(false);
    setShowCustomCategory(false);
  };

  const handleCalculateFromGoldRate = async () => {
    const weight = formData.weightGrams?.trim();
    const carat = formData.carat?.trim();
    if (!weight || !carat || formData.material !== 'Gold') return;
    setCalculatingPrice(true);
    setError(null);
    try {
      const params = new URLSearchParams({ weightGrams: weight, carat });
      const response = await axios.get(`${API_URL}/stock/calculate-price?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const price = response.data?.calculatedPrice;
      if (price != null) {
        setFormData(prev => ({ ...prev, sellingPrice: String(price) }));
        setSuccess(`Price set from today's gold rate (₹${Number(price).toLocaleString('en-IN')})`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Could not calculate price';
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const openSalesHistory = async (item) => {
    setSalesHistoryItem(item);
    setSalesHistory([]);
    setLoadingSalesHistory(true);
    try {
      const res = await axios.get(`${API_URL}/stock/${item.id}/sales-history`, { headers: getAuthHeaders() });
      setSalesHistory(res.data || []);
    } catch (err) {
      console.error('Error fetching sales history:', err);
      setSalesHistory([]);
    } finally {
      setLoadingSalesHistory(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`${API_URL}/stock/${id}`, {
        headers: getAuthHeaders()
      });
      setSuccess('Stock item deleted successfully!');
      fetchStock();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting stock:', error);
      setError('Error deleting stock item');
      setTimeout(() => setError(null), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      articleName: '',
      category: '',
      material: 'Gold',
      weightGrams: '',
      carat: '',
      purityPercentage: '',
      quantity: 1,
      size: '',
      description: '',
      imageUrl: '',
      sellingPrice: ''
    });
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview(null);
    setShowForm(false);
    setShowCustomArticleName(false);
    setShowCustomCategory(false);
    stopCamera();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stats = {
    total: stock.length,
    available: stock.filter(item => item.status === 'AVAILABLE').length,
    sold: stock.filter(item => item.status === 'SOLD').length,
    reserved: stock.filter(item => item.status === 'RESERVED').length
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="💎 Stock" onLogout={handleLogout} />

      <div className="stock-management">
        <div className="stock-header">
          <h1>💎 Stock Management</h1>
          <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>Manage your jewelry inventory</p>
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

        <div className="stock-stats">
          <div className="stock-stat-card">
            <div className="stock-stat-label">Total Items</div>
            <div className="stock-stat-value">{stats.total}</div>
          </div>
          <div className="stock-stat-card">
            <div className="stock-stat-label">Available</div>
            <div className="stock-stat-value" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {stats.available}
            </div>
          </div>
          <div className="stock-stat-card">
            <div className="stock-stat-label">Sold</div>
            <div className="stock-stat-value" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {stats.sold}
            </div>
          </div>
          <div className="stock-stat-card">
            <div className="stock-stat-label">Reserved</div>
            <div className="stock-stat-value" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {stats.reserved}
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="stock-search-card">
          <div className="stock-search-row">
            <form onSubmit={handleSearch} className="stock-search-form">
              <input
                type="text"
                placeholder="Search by name, code, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="stock-search-input"
              />
              <button type="submit" className="stock-action-btn" style={{ padding: '0.75rem 1.25rem' }}>
                🔍 Search
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedMaterial('');
                    fetchStock();
                  }}
                  className="stock-action-btn secondary"
                  style={{ padding: '0.75rem 1rem' }}
                >
                  ✕
                </button>
              )}
            </form>
            <button onClick={() => setShowForm(!showForm)} className="stock-action-btn">
              {showForm ? '✕ Cancel' : '+ Add New Item'}
            </button>
          </div>
          <div className="stock-filter-group">
            <span className="stock-filter-label">Category:</span>
            <div className="stock-filter-chips">
              <button
                type="button"
                onClick={() => { setSelectedCategory(''); fetchStock(); }}
                className={`stock-filter-chip ${selectedCategory === '' ? 'active' : ''}`}
              >
                All
              </button>
              {(Array.isArray(categories) ? categories : []).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setSelectedCategory(cat); fetchStock(); }}
                  className={`stock-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="stock-filter-group">
            <span className="stock-filter-label">Material:</span>
            <div className="stock-filter-chips">
              <button
                type="button"
                onClick={() => { setSelectedMaterial(''); fetchStock(); }}
                className={`stock-filter-chip ${selectedMaterial === '' ? 'active' : ''}`}
              >
                All
              </button>
              {MATERIAL_OPTIONS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setSelectedMaterial(m); fetchStock(); }}
                  className={`stock-filter-chip ${selectedMaterial === m ? 'active' : ''}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showForm && (
          <div className="stock-modal-overlay" onClick={resetForm}>
            <div className="stock-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="stock-form-card">
                <div className="stock-form-header">
                  <span style={{ fontSize: '2rem' }}>✨</span>
                  <h3>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                  <button
                    type="button"
                    className="stock-modal-close"
                    onClick={resetForm}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
              <div className="stock-form-grid">
                <div className="stock-form-group">
                  <label>Category *</label>
                  {!showCustomCategory ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          if (e.target.value === '__NEW_CATEGORY__') {
                            setShowCustomCategory(true);
                            setFormData({...formData, category: ''});
                          } else {
                            setFormData({...formData, category: e.target.value});
                          }
                        }}
                        required={!showCustomCategory}
                        style={{ flex: 1 }}
                      >
                        <option value="">Select Category</option>
                        {[...new Set([...categories, 'Rings', 'Necklace', 'Earrings', 'Bracelet', 'Bangle', 'Chain', 'Pendant', 'Anklet', 'Mangalsutra', 'Kamarband', 'Tikka', 'Other'])].sort().map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__NEW_CATEGORY__">+ Add new category</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder="Enter new category name"
                        required
                        style={{ flex: 1, padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomCategory(false);
                          setFormData({...formData, category: ''});
                        }}
                        className="stock-action-btn secondary"
                        style={{ padding: '0.75rem 1rem' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div className="stock-form-group">
                  <label>Material / Type *</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({...formData, material: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px' }}
                  >
                    {MATERIAL_OPTIONS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="stock-form-group">
                  <label>Article Name *</label>
                  {!showCustomArticleName ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        value={formData.articleName}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setShowCustomArticleName(true);
                            setFormData({...formData, articleName: ''});
                          } else {
                            setFormData({...formData, articleName: e.target.value});
                          }
                        }}
                        required
                        style={{ flex: 1 }}
                      >
                        <option value="">Select Article Name</option>
                        {[...new Set([...ARTICLE_NAMES, ...(Array.isArray(articleNames) ? articleNames : [])])].map(name => (<option key={name} value={name}>{name}</option>
                        ))}
                        <option value="__CUSTOM__">+ Add Custom Article Name</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={formData.articleName}
                        onChange={(e) => setFormData({...formData, articleName: e.target.value})}
                        placeholder="Enter custom article name"
                        required
                        style={{ flex: 1, padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomArticleName(false);
                          setFormData({...formData, articleName: ''});
                        }}
                        className="stock-action-btn secondary"
                        style={{ padding: '0.75rem 1rem' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div className="stock-form-group">
                  <label>Weight (grams) *</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.weightGrams}
                    onChange={(e) => setFormData({...formData, weightGrams: e.target.value})}
                    required
                    placeholder="e.g., 5.250"
                  />
                </div>
                <div className="stock-form-group">
                  <label>Carat *</label>
                  {formData.material === 'Gold' ? (
                    <>
                      <select
                        value={GOLD_CARAT_OPTIONS.includes(Number(formData.carat)) ? formData.carat : '__OTHER__'}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '__OTHER__') {
                            setFormData({ ...formData, carat: formData.carat || '', purityPercentage: formData.carat ? String(Math.round((Number(formData.carat) / 24) * 1000) / 10) : '' });
                            return;
                          }
                          const info = v ? GOLD_CARAT_PURITY[Number(v)] : null;
                          setFormData({ ...formData, carat: v, purityPercentage: info ? String(info.purity) : '' });
                        }}
                        required={!formData.carat}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px', marginBottom: formData.carat && !GOLD_CARAT_OPTIONS.includes(Number(formData.carat)) ? '0.5rem' : 0 }}
                      >
                        <option value="">Select Carat</option>
                        {GOLD_CARAT_OPTIONS.map(c => (
                          <option key={c} value={c}>{c}K (purity {GOLD_CARAT_PURITY[c].purity}%, hallmark {GOLD_CARAT_PURITY[c].hallmark})</option>
                        ))}
                        <option value="__OTHER__">Other (enter carat)</option>
                      </select>
                      {!GOLD_CARAT_OPTIONS.includes(Number(formData.carat)) && (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="24"
                          value={formData.carat}
                          onChange={(e) => {
                            const carat = e.target.value;
                            const purity = carat ? (Number(carat) / 24 * 100) : '';
                            setFormData({ ...formData, carat, purityPercentage: purity ? String(Math.round(purity * 10) / 10) : '' });
                          }}
                          placeholder="e.g. 16.95"
                          required
                          style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px', marginTop: '0.5rem' }}
                        />
                      )}
                    </>
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      value={formData.carat}
                      onChange={(e) => setFormData({...formData, carat: e.target.value})}
                      required
                      placeholder="e.g., 22.00"
                    />
                  )}
                </div>
                <div className="stock-form-group">
                  <label>Purity %</label>
                  {formData.material === 'Gold' ? (
                    <input
                      type="text"
                      readOnly
                      value={formData.purityPercentage ? `${formData.purityPercentage}% (fixed for selected carat)` : '— Select carat —'}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #ecf0f1', borderRadius: '8px', background: '#f8f9fa', color: '#495057' }}
                    />
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.purityPercentage}
                      onChange={(e) => setFormData({...formData, purityPercentage: e.target.value})}
                      placeholder="e.g., 91.67"
                    />
                  )}
                </div>
                <div className="stock-form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                {(formData.category?.toLowerCase() === 'ring' || formData.category?.toLowerCase() === 'rings') && (
                  <div className="stock-form-group">
                    <label>Size (ring size)</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                      placeholder="e.g., 7, 7.5, 8"
                    />
                  </div>
                )}
                <div className="stock-form-group">
                  <label>Selling Price (₹)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                      placeholder="e.g., 45000"
                      style={{ flex: '1 1 140px' }}
                    />
                    {formData.material === 'Gold' && formData.weightGrams?.trim() && formData.carat?.trim() && (
                      <button
                        type="button"
                        onClick={handleCalculateFromGoldRate}
                        disabled={calculatingPrice}
                        className="stock-action-btn secondary"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {calculatingPrice ? '⏳ Calculating...' : "💰 Calculate from today's gold rate"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="stock-form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Additional details about this item..."
                />
              </div>
              <div className="stock-image-section">
                <label style={{ fontWeight: 600, color: '#34495e', marginBottom: '0.5rem', display: 'block', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Product Image
                </label>
                <div className="stock-image-actions">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="stock-action-btn" style={{ cursor: 'pointer', display: 'inline-block', margin: 0 }}>
                    📷 Upload Image
                  </label>
                  <button
                    type="button"
                    onClick={showCamera ? stopCamera : startCamera}
                    className="stock-action-btn secondary"
                  >
                    {showCamera ? '✕ Cancel Camera' : '📸 Capture Image'}
                  </button>
                </div>
                {imagePreview && (
                  <div className="stock-image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedImage(null);
                        setFormData({...formData, imageUrl: ''});
                      }}
                      className="stock-btn-delete"
                      style={{ marginLeft: '1rem', marginTop: '0.5rem' }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                )}
                {showCamera && (
                  <div className="stock-camera-container">
                    <video ref={videoRef} autoPlay playsInline />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <button
                      type="button"
                      onClick={captureImage}
                      className="stock-action-btn"
                      style={{ marginTop: '0.5rem' }}
                    >
                      📷 Capture
                    </button>
                  </div>
                )}
              </div>
              <div className="stock-form-actions">
                <button type="submit" className="stock-action-btn stock-submit-btn" disabled={loading}>
                  {loading ? '⏳ Saving...' : editingId ? '💾 Update Item' : '💾 Save Item'}
                </button>
              </div>
            </form>
              </div>
            </div>
          </div>
        )}

        <div className="stock-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📦 Stock Items {filteredStock.length !== stock.length && `(${filteredStock.length} of ${stock.length})`}</h3>
          {filteredStock.length > 0 ? (
            <>
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Article Name</th>
                    <th>Category</th>
                    <th>Material</th>
                    <th>Size</th>
                    <th>Code</th>
                    <th>Weight (g)</th>
                    <th>Carat</th>
                    <th>Purity %</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `${window.location.protocol}//${window.location.hostname}:8000${item.imageUrl}`}
                            alt={item.articleName}
                            className="stock-item-image"
                            onError={(e) => { 
                              console.error('Image load error:', item.imageUrl);
                              e.target.style.display = 'none'; 
                            }}
                          />
                        ) : (
                          <div className="stock-item-image" style={{ background: '#ecf0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6', fontSize: '1.5rem' }}>
                            📦
                          </div>
                        )}
                      </td>
                      <td className="stock-item-name">{item.articleName}</td>
                      <td>{item.category || '-'}</td>
                      <td>{item.material || '-'}</td>
                      <td>{item.size || '–'}</td>
                      <td>{item.articleCode || '-'}</td>
                      <td>{item.weightGrams || '-'}</td>
                      <td>{item.carat || '-'}</td>
                      <td>{item.purityPercentage ? `${item.purityPercentage}%` : '-'}</td>
                      <td>{item.quantity || 1}</td>
                      <td>
                        <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openSalesHistory(item)} className="stock-btn-edit" style={{ marginRight: '0.25rem' }} title="Sold to bills">📋 History</button>
                        <button onClick={() => handleEdit(item)} className="stock-btn-edit">✏️ Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="stock-btn-delete">🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(salesHistoryItem || loadingSalesHistory) && (
                <div className="stock-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => { setSalesHistoryItem(null); setSalesHistory([]); }}>
                  <div className="stock-modal-content" style={{ maxWidth: '420px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                    <div className="stock-form-card" style={{ margin: 0 }}>
                      <div className="stock-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>📋 Sold to bills — {salesHistoryItem?.articleName || ''} ({salesHistoryItem?.articleCode || ''})</h3>
                        <button type="button" className="stock-modal-close" onClick={() => { setSalesHistoryItem(null); setSalesHistory([]); }} aria-label="Close">✕</button>
                      </div>
                      <div style={{ padding: '0 1rem 1rem' }}>
                        {loadingSalesHistory ? (
                          <p>Loading...</p>
                        ) : salesHistory.length === 0 ? (
                          <p style={{ color: '#64748b' }}>No sales recorded for this item yet.</p>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {salesHistory.map((row, i) => (
                              <li key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span><strong>Bill #{row.billNumber}</strong></span>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{formatDate(row.createdAt)} · Qty: {row.quantitySold}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="stock-empty-state">
              <div className="stock-empty-state-icon">📦</div>
              <h3>No Stock Items Found</h3>
              <p>{searchQuery || selectedCategory || selectedMaterial ? 'Try adjusting your search or filter' : 'Start by adding your first stock item'}</p>
            </div>
          )}

          {/* Pagination bar - Showing X-Y of Z, per page, First/Prev/Page X of Y/Next/Last */}
          {usePagination && totalElements > 0 && (
            <div className="stock-pagination-bar">
              <div className="stock-pagination-info">
                Showing {filteredStock.length > 0 ? (currentPage * pageSize + 1) : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} items
              </div>
              <div className="stock-pagination-controls">
                <select
                  className="stock-pagination-select"
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
                  className="stock-pagination-btn"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(0)}
                >
                  First
                </button>
                <button
                  type="button"
                  className="stock-pagination-btn"
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
                  className="stock-pagination-btn"
                  disabled={currentPage >= (totalPages || 1) - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="stock-pagination-btn"
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

export default StockManagement;
