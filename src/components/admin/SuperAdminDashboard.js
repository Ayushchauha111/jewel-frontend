import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../utils/authHelper';
import { useNavigate } from 'react-router-dom';
import superAdminService from '../../service/superAdmin.service';
import AuthService from '../../service/auth.service';
import './SuperAdminDashboard.css';
import { 
  FaBuilding, 
  FaUsers, 
  FaChartLine, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff,
  FaCalendarAlt,
  FaKey,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: 'COACHING_CENTER',
    contactEmail: '',
    contactPhone: '',
    address: '',
    subdomain: '',
    maxStudents: 1000000,
    adminUserId: null
  });

  useEffect(() => {
    checkAccess();
    loadStats();
    loadInstitutions();
  }, [currentPage]);

  const checkAccess = () => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    const hasSuperAdminRole = user.roles?.some(role => 
      role.includes('SUPER_ADMIN') || role === 'ROLE_SUPER_ADMIN'
    );
    if (!hasSuperAdminRole) {
      setError('Access denied. Super Admin role required.');
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await superAdminService.getAllInstitutionsStats();
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const response = await superAdminService.getAllInstitutions(currentPage, 20);
      if (response.data && response.data.success) {
        setInstitutions(response.data.data.institutions || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error loading institutions:', error);
      setError('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await superAdminService.createInstitution(formData);
      if (response.data && response.data.success) {
        const responseData = response.data.data;
        
        // Check if admin credentials were generated
        if (responseData.adminCredentials) {
          setGeneratedCredentials(responseData.adminCredentials);
          setShowCredentialsModal(true);
        }
        
        setShowCreateModal(false);
        resetForm();
        loadInstitutions();
        loadStats();
        
        if (!responseData.adminCredentials) {
          alert('Institution created successfully!');
        }
      }
    } catch (error) {
      console.error('Error creating institution:', error);
      alert('Failed to create institution: ' + (error.response?.data?.message || error.message));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await superAdminService.updateInstitution(selectedInstitution.id, formData);
      if (response.data && response.data.success) {
        setShowEditModal(false);
        resetForm();
        loadInstitutions();
        alert('Institution updated successfully!');
      }
    } catch (error) {
      console.error('Error updating institution:', error);
      alert('Failed to update institution: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (institutionId) => {
    const confirmMessage = '⚠️ WARNING: This will PERMANENTLY DELETE the institution and all its data (batches, lab sessions, etc.).\n\nThis action cannot be undone!\n\nType "DELETE" to confirm:';
    const userInput = window.prompt(confirmMessage);
    
    if (userInput !== 'DELETE') {
      return;
    }
    
    try {
      const response = await superAdminService.deleteInstitution(institutionId);
      if (response.data && response.data.success) {
        loadInstitutions();
        loadStats();
        alert('Institution deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting institution:', error);
      alert('Failed to delete institution: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleStatus = async (institutionId, currentStatus) => {
    try {
      const response = await superAdminService.toggleInstitutionStatus(institutionId, !currentStatus);
      if (response.data && response.data.success) {
        loadInstitutions();
        loadStats();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle institution status');
    }
  };

  const handleExtendSubscription = async (institutionId) => {
    const days = prompt('Enter number of days to extend subscription:', '30');
    if (!days || isNaN(days)) return;
    
    try {
      const response = await superAdminService.extendSubscription(institutionId, parseInt(days));
      if (response.data && response.data.success) {
        loadInstitutions();
        alert(`Subscription extended by ${days} days!`);
      }
    } catch (error) {
      console.error('Error extending subscription:', error);
      alert('Failed to extend subscription');
    }
  };

  const openEditModal = (institution) => {
    setSelectedInstitution(institution);
    setFormData({
      institutionName: institution.institutionName || '',
      institutionType: institution.institutionType || 'COACHING_CENTER',
      contactEmail: institution.contactEmail || '',
      contactPhone: institution.contactPhone || '',
      address: institution.address || '',
      subdomain: institution.subdomain || '',
      maxStudents: institution.maxStudents || 1000000,
      adminUserId: null
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      institutionName: '',
      institutionType: 'COACHING_CENTER',
      contactEmail: '',
      contactPhone: '',
      address: '',
      subdomain: '',
      maxStudents: 1000000,
      adminUserId: null
    });
    setSelectedInstitution(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ACTIVE': { class: 'status-active', icon: <FaCheckCircle />, text: 'Active' },
      'TRIAL': { class: 'status-trial', icon: <FaCalendarAlt />, text: 'Trial' },
      'EXPIRED': { class: 'status-expired', icon: <FaTimesCircle />, text: 'Expired' },
      'SUSPENDED': { class: 'status-suspended', icon: <FaTimesCircle />, text: 'Suspended' }
    };
    const statusInfo = statusMap[status] || statusMap['TRIAL'];
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.icon} {statusInfo.text}
      </span>
    );
  };

  if (error && !loading) {
    return (
      <div className="super-admin-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard">
      <div className="dashboard-header">
        <h1><FaBuilding /> Super Admin Dashboard</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <FaPlus /> Create Institution
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FaBuilding /></div>
            <div className="stat-content">
              <h3>{stats.totalInstitutions || 0}</h3>
              <p>Total Institutions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active"><FaCheckCircle /></div>
            <div className="stat-content">
              <h3>{stats.activeInstitutions || 0}</h3>
              <p>Active Institutions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-content">
              <h3>{(stats.totalStudents || 0).toLocaleString()}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaChartLine /></div>
            <div className="stat-content">
              <h3>{stats.totalBatches || 0}</h3>
              <p>Total Batches</p>
            </div>
          </div>
        </div>
      )}

      <div className="institutions-section">
        <h2>Institutions</h2>
        {loading ? (
          <div className="loading-spinner">
            <FaSpinner className="spinner" />
            <p>Loading institutions...</p>
          </div>
        ) : (
          <>
            <div className="institutions-table-container">
              <table className="institutions-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Subdomain</th>
                    <th>Contact</th>
                    <th>Max Students</th>
                    <th>Status</th>
                    <th>Subscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-message">
                        No institutions found. Create your first institution!
                      </td>
                    </tr>
                  ) : (
                    institutions.map((institution) => (
                      <tr key={institution.id}>
                        <td>
                          <strong>{institution.institutionName}</strong>
                          {institution.licenseKey && (
                            <div className="license-key">
                              <FaKey /> {institution.licenseKey}
                            </div>
                          )}
                        </td>
                        <td>{institution.institutionType}</td>
                        <td>
                          {institution.subdomain ? (
                            <span className="subdomain">{institution.subdomain}.typogram.in</span>
                          ) : (
                            <span className="no-subdomain">Not set</span>
                          )}
                        </td>
                        <td>
                          <div>{institution.contactEmail}</div>
                          {institution.contactPhone && (
                            <div className="phone">{institution.contactPhone}</div>
                          )}
                        </td>
                        <td>{(institution.maxStudents || 0).toLocaleString()}</td>
                        <td>
                          {getStatusBadge(institution.subscriptionStatus)}
                          <div className="active-status">
                            {institution.isActive ? (
                              <span className="active-badge"><FaToggleOn /> Active</span>
                            ) : (
                              <span className="inactive-badge"><FaToggleOff /> Inactive</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {institution.subscriptionExpiresAt ? (
                            <div>
                              {new Date(institution.subscriptionExpiresAt).toLocaleDateString()}
                              <button 
                                className="btn-extend"
                                onClick={() => handleExtendSubscription(institution.id)}
                                title="Extend subscription"
                              >
                                Extend
                              </button>
                            </div>
                          ) : (
                            <span>No expiry</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => openEditModal(institution)}
                              title="Edit institution"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className={institution.isActive ? "btn-toggle active" : "btn-toggle"}
                              onClick={() => handleToggleStatus(institution.id, institution.isActive)}
                              title={institution.isActive ? "Deactivate" : "Activate"}
                            >
                              {institution.isActive ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(institution.id)}
                              title="Deactivate institution"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>Page {currentPage + 1} of {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Institution</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
              <div className="form-group">
                <label>Institution Name *</label>
                <input
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Institution Type *</label>
                <select
                  required
                  value={formData.institutionType}
                  onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                >
                  <option value="SCHOOL">School</option>
                  <option value="COACHING_CENTER">Coaching Center</option>
                  <option value="COLLEGE">College</option>
                  <option value="UNIVERSITY">University</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Subdomain</label>
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                  placeholder="parmar"
                />
                <small>Will create: {formData.subdomain || 'subdomain'}.typogram.in</small>
              </div>
              <div className="form-group">
                <label>Max Students</label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 1000000 })}
                  min="1"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create Institution</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && generatedCredentials && (
        <div className="modal-overlay" onClick={() => setShowCredentialsModal(false)}>
          <div className="modal-content credentials-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Admin Credentials Generated</h2>
            <div className="credentials-warning">
              <p><strong>IMPORTANT:</strong> Save these credentials now! The password will not be shown again.</p>
            </div>
            <div className="credentials-display">
              <div className="credential-item">
                <label>Username:</label>
                <div className="credential-value">
                  <code>{generatedCredentials.username}</code>
                  <button className="copy-btn" onClick={() => copyToClipboard(generatedCredentials.username)}>
                    📋 Copy
                  </button>
                </div>
              </div>
              <div className="credential-item">
                <label>Email:</label>
                <div className="credential-value">
                  <code>{generatedCredentials.email}</code>
                  <button className="copy-btn" onClick={() => copyToClipboard(generatedCredentials.email)}>
                    📋 Copy
                  </button>
                </div>
              </div>
              <div className="credential-item">
                <label>Password:</label>
                <div className="credential-value">
                  <code className="password-display">{generatedCredentials.password}</code>
                  <button className="copy-btn" onClick={() => copyToClipboard(generatedCredentials.password)}>
                    📋 Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="credentials-instructions">
              <h3>Share with Institution:</h3>
              <div className="share-text">
                <p><strong>Dashboard URL:</strong> http://localhost:3000/institutional/dashboard</p>
                <p><strong>Username:</strong> {generatedCredentials.username}</p>
                <p><strong>Password:</strong> {generatedCredentials.password}</p>
              </div>
              <button className="copy-all-btn" onClick={() => {
                const shareText = `Dashboard URL: http://localhost:3000/institutional/dashboard\nUsername: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}`;
                copyToClipboard(shareText);
              }}>
                📋 Copy All Credentials
              </button>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => {
                setShowCredentialsModal(false);
                setGeneratedCredentials(null);
              }}>
                I've Saved the Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedInstitution && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Institution</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
              <div className="form-group">
                <label>Institution Name *</label>
                <input
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Institution Type *</label>
                <select
                  required
                  value={formData.institutionType}
                  onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                >
                  <option value="SCHOOL">School</option>
                  <option value="COACHING_CENTER">Coaching Center</option>
                  <option value="COLLEGE">College</option>
                  <option value="UNIVERSITY">University</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Subdomain</label>
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                  placeholder="parmar"
                />
                <small>Will create: {formData.subdomain || 'subdomain'}.typogram.in</small>
              </div>
              <div className="form-group">
                <label>Max Students</label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 1000000 })}
                  min="1"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Update Institution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
