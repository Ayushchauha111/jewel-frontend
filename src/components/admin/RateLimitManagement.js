import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './RateLimitManagement.css';

const API_URL = '/api';

function RateLimitManagement() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editedConfigs, setEditedConfigs] = useState({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/rate-limit/config`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        const configMap = response.data.configMap || {};
        setConfigs(configMap);
        setEditedConfigs(configMap);
      } else {
        setError(response.data.message || 'Failed to fetch configurations');
      }
    } catch (err) {
      console.error('Error fetching rate limit configs:', err);
      setError(err.response?.data?.message || 'Failed to fetch rate limit configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedConfigs(prev => ({
        ...prev,
        [key]: numValue
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.put(`${API_URL}/rate-limit/config`, editedConfigs, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setSuccess('Rate limit configurations updated successfully!');
        setConfigs(editedConfigs);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || 'Failed to update configurations');
      }
    } catch (err) {
      console.error('Error updating rate limit configs:', err);
      setError(err.response?.data?.message || 'Failed to update rate limit configurations');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all rate limit configurations to default values?')) {
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.post(`${API_URL}/rate-limit/config/reset`, {}, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setSuccess('Rate limit configurations reset to defaults!');
        fetchConfigs();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || 'Failed to reset configurations');
      }
    } catch (err) {
      console.error('Error resetting rate limit configs:', err);
      setError(err.response?.data?.message || 'Failed to reset rate limit configurations');
    } finally {
      setSaving(false);
    }
  };

  const configDescriptions = {
    'AUTH_REQUESTS_PER_MINUTE': {
      label: 'Authentication Requests per Minute',
      description: 'Maximum number of authentication requests (login, register) allowed per IP per minute. Lower values provide better security against brute force attacks.',
      default: 5,
      min: 1,
      max: 100
    },
    'GENERAL_REQUESTS_PER_MINUTE': {
      label: 'General API Requests per Minute',
      description: 'Maximum number of general API requests allowed per IP per minute. Applies to most authenticated endpoints.',
      default: 100,
      min: 10,
      max: 1000
    },
    'PUBLIC_REQUESTS_PER_MINUTE': {
      label: 'Public API Requests per Minute',
      description: 'Maximum number of public (read-only) API requests allowed per IP per minute. Applies to public endpoints like product listings.',
      default: 200,
      min: 20,
      max: 2000
    },
    'WINDOW_SIZE_MS': {
      label: 'Rate Limit Window (seconds)',
      description: 'Time window in seconds for rate limiting. Default is 60 (1 minute). Changing this affects how requests are counted.',
      default: 60,
      min: 1,
      max: 300
    }
  };

  const hasChanges = () => {
    return Object.keys(editedConfigs).some(key => 
      editedConfigs[key] !== configs[key]
    );
  };

  return (
    <div className="admin-dashboard">
      <AdminNav title="⚙️ Rate Limits" onLogout={handleLogout} />
      <div className="rate-limit-management">
        <div className="rate-limit-header">
          <h1>Rate Limit Configuration</h1>
          <p>Configure API rate limits to protect against abuse and ensure fair usage</p>
        </div>
        <div className="rate-limit-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner">⏳</div>
            <p>Loading rate limit configurations...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="error-message">
                <span>❌</span> {error}
              </div>
            )}
            {success && (
              <div className="success-message">
                <span>✅</span> {success}
              </div>
            )}

            <div className="rate-limit-info">
              <div className="info-card">
                <h3>📊 Rate Limiting Overview</h3>
                <p>
                  Rate limiting helps protect your API from abuse, DDoS attacks, and ensures fair resource usage. 
                  Configure different limits for different types of endpoints based on their sensitivity and usage patterns.
                </p>
                <ul>
                  <li><strong>Authentication endpoints:</strong> Stricter limits to prevent brute force attacks</li>
                  <li><strong>General endpoints:</strong> Moderate limits for authenticated operations</li>
                  <li><strong>Public endpoints:</strong> Higher limits for read-only public data</li>
                </ul>
              </div>
            </div>

            <div className="config-form">
              <div className="form-header">
                <h2>Configuration Settings</h2>
                <div className="form-actions">
                  <button 
                    onClick={handleReset} 
                    className="reset-btn"
                    disabled={saving}
                  >
                    🔄 Reset to Defaults
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="save-btn"
                    disabled={saving || !hasChanges()}
                  >
                    {saving ? '💾 Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>

              <div className="config-items">
                {Object.keys(configDescriptions).map(key => {
                  const desc = configDescriptions[key];
                  const currentValue = editedConfigs[key] ?? desc.default;
                  const isChanged = currentValue !== (configs[key] ?? desc.default);
                  
                  return (
                    <div key={key} className={`config-item ${isChanged ? 'changed' : ''}`}>
                      <div className="config-item-header">
                        <label htmlFor={key}>{desc.label}</label>
                        {isChanged && <span className="changed-badge">Modified</span>}
                      </div>
                      <p className="config-description">{desc.description}</p>
                      <div className="config-input-group">
                        <input
                          type="number"
                          id={key}
                          value={currentValue}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          min={desc.min}
                          max={desc.max}
                          className="config-input"
                        />
                        <div className="config-meta">
                          <span className="default-value">Default: {desc.default}</span>
                          {key === 'WINDOW_SIZE_MS' && (
                            <span className="window-info">
                              ({currentValue} seconds)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="current-values">
              <h3>Current Active Values</h3>
              <div className="values-grid">
                {Object.keys(configDescriptions).map(key => {
                  const value = configs[key] ?? configDescriptions[key].default;
                  return (
                    <div key={key} className="value-card">
                      <div className="value-label">{configDescriptions[key].label}</div>
                      <div className="value-number">{value.toLocaleString()}</div>
                      {key === 'WINDOW_SIZE_MS' && (
                        <div className="value-subtext">{value} seconds</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

export default RateLimitManagement;
