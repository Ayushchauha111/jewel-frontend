import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    whatsappNumber: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers?page=${currentPage}&size=${pageSize}`, {
        headers: getAuthHeaders()
      });
      if (response.data?.content) {
        setCustomers(response.data.content);
        setTotalPages(response.data.totalPages ?? 0);
        setTotalElements(response.data.totalElements ?? 0);
      } else {
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setCustomers(data);
        setTotalPages(0);
        setTotalElements(data.length);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers');
      setCustomers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/customers/${editingId}`, formData, {
          headers: getAuthHeaders()
        });
        setSuccess('Customer updated successfully!');
      } else {
        await axios.post(`${API_URL}/customers`, formData, {
          headers: getAuthHeaders()
        });
        setSuccess('Customer added successfully!');
      }

      fetchCustomers();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving customer:', error);
      setError(error.response?.data?.message || 'Failed to save customer');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      whatsappNumber: customer.whatsappNumber || ''
    });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await axios.delete(`${API_URL}/customers/${id}`, {
        headers: getAuthHeaders()
      });
      setSuccess('Customer deleted successfully!');
      fetchCustomers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('Failed to delete customer');
      setTimeout(() => setError(null), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      whatsappNumber: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="👥 Customers" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>👥 Customer Management</h1>
          <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>Manage your customer database</p>
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
              <div className="price-icon">👥</div>
            </div>
            <div className="price-label">Total Customers</div>
            <p className="price-value">{totalElements}</p>
          </div>
        </div>

        <div style={{ margin: '0 2rem 2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="🔍 Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #ecf0f1',
                borderRadius: '12px',
                fontSize: '1rem'
              }}
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="price-action-btn"
            style={{ marginLeft: '1rem' }}
          >
            {showForm ? '✕ Cancel' : '+ Add New Customer'}
          </button>
        </div>

        {showForm && (
          <div className="price-form-card">
            <div className="price-form-header">
              <span style={{ fontSize: '2rem' }}>✨</span>
              <h3>{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="price-form-grid">
                <div className="price-form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Customer full name"
                  />
                </div>
                <div className="price-form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    placeholder="+91 1234567890"
                  />
                </div>
                <div className="price-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="customer@example.com"
                  />
                </div>
                <div className="price-form-group">
                  <label>WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>
              <div className="price-form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="3"
                  placeholder="Customer address..."
                />
              </div>
              <button type="submit" className="price-action-btn" disabled={loading}>
                {loading ? '⏳ Saving...' : editingId ? '💾 Update Customer' : '💾 Save Customer'}
              </button>
            </form>
          </div>
        )}

        <div className="price-table-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📋 Customers ({filteredCustomers.length})</h3>
          {filteredCustomers.length > 0 ? (
            <table className="price-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: '600' }}>{customer.name}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.whatsappNumber || '-'}</td>
                    <td>{customer.address || '-'}</td>
                    <td>
                      <button onClick={() => handleEdit(customer)} className="stock-btn-edit">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(customer.id)} className="stock-btn-delete">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="price-empty-state">
              <div className="price-empty-state-icon">👥</div>
              <h3>{searchTerm ? 'No Customers Found' : 'No Customers Yet'}</h3>
              <p>{searchTerm ? 'Try a different search term' : 'Start by adding your first customer'}</p>
            </div>
          )}

          {totalElements > 0 && (
            <div className="price-pagination-bar">
              <div className="price-pagination-info">
                Showing {filteredCustomers.length > 0 ? currentPage * pageSize + 1 : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} customers
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

export default CustomerManagement;
