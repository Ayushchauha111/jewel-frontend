import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';
const CONFIG_API = `${API_URL}/config/category-making`;

// Same categories as Billing / Stock (from API + fallback)
const PREDEFINED_CATEGORIES = [
  'Rings', 'Necklace', 'Earrings', 'Bracelet', 'Bangle', 'Chain', 'Pendant',
  'Anklet', 'Mangalsutra', 'Kamarband', 'Tikka', 'Other'
];
const MATERIAL_OPTIONS = ['', 'Gold', 'Silver', 'Diamond', 'Gold + Diamond', 'Silver + Diamond', 'Gemstone', 'Other'];

function ConfigManagement() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ category: '', material: '', makingChargesPerGram: '' });

  useEffect(() => {
    fetchConfigs();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/stock/categories`);
      const fromApi = Array.isArray(response.data) ? response.data : [];
      const merged = [...new Set([...fromApi, ...PREDEFINED_CATEGORIES])].filter(Boolean).sort();
      setCategories(merged);
    } catch (err) {
      setCategories(PREDEFINED_CATEGORIES.slice().sort());
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchConfigs = async () => {
    try {
      const response = await axios.get(CONFIG_API, { headers: getAuthHeaders() });
      setConfigs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching category making config:', err);
      setError('Failed to load config');
    }
  };

  const resetForm = () => {
    setFormData({ category: '', material: '', makingChargesPerGram: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const category = (formData.category || '').trim();
    const material = (formData.material || '').trim() || null;
    const making = formData.makingChargesPerGram !== '' && formData.makingChargesPerGram != null
      ? parseFloat(formData.makingChargesPerGram) : null;
    if (!category) {
      setError('Category is required');
      setLoading(false);
      return;
    }
    if (making == null || isNaN(making) || making < 0) {
      setError('Making charges per gram (₹/g) must be a number ≥ 0');
      setLoading(false);
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${CONFIG_API}/${editingId}`, { category, material, makingChargesPerGram: making }, { headers: getAuthHeaders() });
        setSuccess('Updated successfully');
      } else {
        await axios.post(CONFIG_API, { category, material, makingChargesPerGram: making }, { headers: getAuthHeaders() });
        setSuccess('Added successfully');
      }
      fetchConfigs();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      category: row.category || '',
      material: row.material || '',
      makingChargesPerGram: row.makingChargesPerGram != null ? String(row.makingChargesPerGram) : ''
    });
    setEditingId(row.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this category making config?')) return;
    try {
      await axios.delete(`${CONFIG_API}/${id}`, { headers: getAuthHeaders() });
      fetchConfigs();
      if (editingId === id) resetForm();
      setSuccess('Removed');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
      setTimeout(() => setError(null), 4000);
    }
  };

  const formatCurrency = (v) => {
    if (v == null || v === '') return '—';
    return `₹${parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/g`;
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="Jewelry Shop Admin" onLogout={handleLogout} />
      <div className="price-management" style={{ margin: '0 2rem' }}>
        <div className="price-header">
          <h1>Config — Category + Material Making Charges</h1>
          <p>Set making charges per gram (₹/g) by <strong>category + material</strong>. Used in price calculation: <strong>Gold/Silver rate + Making (here) + GST 3%</strong>. Leave material empty for category default.</p>
        </div>

        <div className="price-form-card">
          <h3>{editingId ? '✏️ Edit' : '➕ Add'} Category + Material Making</h3>
          {error && <div className="price-error" style={{ marginBottom: '1rem', color: '#e74c3c' }}>{error}</div>}
          {success && <div className="price-success" style={{ marginBottom: '1rem', color: '#27ae60' }}>{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="price-form-grid">
              <div className="price-form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--adm-border-gold)', background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="price-form-group">
                <label>Material (optional — default for category if empty)</label>
                <select
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--adm-border-gold)', background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }}
                >
                  {MATERIAL_OPTIONS.map((m) => (
                    <option key={m || 'all'} value={m}>{m || '— All (category default)'}</option>
                  ))}
                </select>
              </div>
              <div className="price-form-group">
                <label>Making charges (₹/g) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.makingChargesPerGram}
                  onChange={(e) => setFormData({ ...formData, makingChargesPerGram: e.target.value })}
                  placeholder="e.g. 1200"
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="price-action-btn" disabled={loading}>
                {loading ? '⏳ Saving...' : (editingId ? '💾 Update' : '💾 Add')}
              </button>
              {editingId && (
                <button type="button" className="price-action-btn secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="price-table-container">
          <h3 className="price-table-title">Category + Material → Making (₹/g)</h3>
          {configs.length > 0 ? (
            <>
              <div className="price-table-scroll">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Material</th>
                      <th>Making (₹/g)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {configs.map((row) => (
                      <tr key={row.id}>
                        <td style={{ fontWeight: '600' }}>{row.category}</td>
                        <td>{row.material || '—'}</td>
                        <td>{formatCurrency(row.makingChargesPerGram)}</td>
                        <td>
                          <button type="button" onClick={() => handleEdit(row)} className="stock-btn-edit" style={{ marginRight: '0.5rem' }}>✏️ Edit</button>
                          <button type="button" onClick={() => handleDelete(row.id)} className="stock-btn-delete">🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-list-cards">
                {configs.map((row) => (
                  <div key={row.id} className="admin-list-card">
                    <div className="admin-list-card-main">
                      <div className="admin-list-card-title">
                        {row.category}{row.material ? ` — ${row.material}` : ' (category default)'}
                      </div>
                      <div className="admin-list-card-meta">{formatCurrency(row.makingChargesPerGram)}</div>
                    </div>
                    <div className="admin-list-card-actions">
                      <button type="button" onClick={() => handleEdit(row)} className="stock-btn-edit">✏️ Edit</button>
                      <button type="button" onClick={() => handleDelete(row.id)} className="stock-btn-delete">🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">⚙️</div>
              <h3>No category making config yet</h3>
              <p>Add a category (e.g. Rings, Necklace) and its making charges per gram. Price calculation will use: gold rate (from Rates) + this making + GST 3%.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfigManagement;
