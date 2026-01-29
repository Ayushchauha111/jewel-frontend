import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiRefreshCw, FiSave, FiRotateCcw, FiShield, FiClock,
  FiLock, FiGlobe, FiSettings
} from 'react-icons/fi';
import RateLimitService from '../../service/rateLimit.service';
import AuthService from '../../service/auth.service';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0f;
  color: #e8e8e8;
  font-family: 'JetBrains Mono', 'Fira Code', -apple-system, sans-serif;
  padding: 2rem;
  padding-top: 100px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ActionButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.primary ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.primary ? '#00ff88' : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${props => props.primary ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfigSection = styled.div`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ConfigCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
`;

const ConfigLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const ConfigDescription = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const ConfigInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const InfoText = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: #00ff88;
`;

const Notification = styled(motion.div)`
  position: fixed;
  top: 100px;
  right: 2rem;
  padding: 1rem 1.5rem;
  background: ${props => props.isSuccess ? 'rgba(0, 255, 136, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border: 1px solid ${props => props.isSuccess ? 'rgba(0, 255, 136, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
  color: ${props => props.isSuccess ? '#00ff88' : '#ef4444'};
  border-radius: 10px;
  font-weight: 600;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const RateLimitAdminPanel = () => {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    AUTH_REQUESTS_PER_MINUTE: 5,
    GENERAL_REQUESTS_PER_MINUTE: 100,
    PUBLIC_REQUESTS_PER_MINUTE: 200,
    WINDOW_SIZE_MS: 60
  });

  const configDescriptions = {
    AUTH_REQUESTS_PER_MINUTE: 'Maximum requests per minute for authentication endpoints (login, signup, etc.)',
    GENERAL_REQUESTS_PER_MINUTE: 'Maximum requests per minute for general API endpoints',
    PUBLIC_REQUESTS_PER_MINUTE: 'Maximum requests per minute for public read-only endpoints (blog, leaderboard, etc.)',
    WINDOW_SIZE_MS: 'Rate limit window size in seconds (time window for counting requests)'
  };

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const hasAdminRole = user.roles?.includes('ROLE_ADMIN') || 
                          user.roles?.includes('ADMIN') ||
                          user.roles?.some(role => role.includes('ADMIN'));
      setIsAdmin(hasAdminRole);
      if (hasAdminRole) {
        fetchConfigs();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await RateLimitService.getAllConfigs();
      if (response.data.success && response.data.configMap) {
        const configMap = response.data.configMap;
        setFormData({
          AUTH_REQUESTS_PER_MINUTE: configMap.AUTH_REQUESTS_PER_MINUTE || 5,
          GENERAL_REQUESTS_PER_MINUTE: configMap.GENERAL_REQUESTS_PER_MINUTE || 100,
          PUBLIC_REQUESTS_PER_MINUTE: configMap.PUBLIC_REQUESTS_PER_MINUTE || 200,
          WINDOW_SIZE_MS: configMap.WINDOW_SIZE_MS || 60
        });
        setConfigs(configMap);
      }
    } catch (err) {
      console.error('Error fetching rate limit configs:', err);
      showNotification('Failed to fetch rate limit configurations', false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updates = {
        AUTH_REQUESTS_PER_MINUTE: parseInt(formData.AUTH_REQUESTS_PER_MINUTE),
        GENERAL_REQUESTS_PER_MINUTE: parseInt(formData.GENERAL_REQUESTS_PER_MINUTE),
        PUBLIC_REQUESTS_PER_MINUTE: parseInt(formData.PUBLIC_REQUESTS_PER_MINUTE),
        WINDOW_SIZE_MS: parseInt(formData.WINDOW_SIZE_MS)
      };
      
      // Validate inputs
      for (const [key, value] of Object.entries(updates)) {
        if (isNaN(value) || value < 1) {
          showNotification(`Invalid value for ${key}. Must be at least 1.`, false);
          setSaving(false);
          return;
        }
      }
      
      const response = await RateLimitService.updateConfigs(updates);
      if (response.data.success) {
        showNotification('Rate limit configurations updated successfully!', true);
        fetchConfigs(); // Refresh to get updated values
      } else {
        showNotification(response.data.message || 'Failed to update configurations', false);
      }
    } catch (err) {
      console.error('Error updating rate limit configs:', err);
      showNotification(err.response?.data?.message || 'Failed to update configurations', false);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all rate limit configurations to defaults?')) {
      return;
    }
    
    try {
      setSaving(true);
      const response = await RateLimitService.resetConfigs();
      if (response.data.success) {
        showNotification('Rate limit configurations reset to defaults!', true);
        fetchConfigs(); // Refresh to get default values
      } else {
        showNotification(response.data.message || 'Failed to reset configurations', false);
      }
    } catch (err) {
      console.error('Error resetting rate limit configs:', err);
      showNotification(err.response?.data?.message || 'Failed to reset configurations', false);
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message, isSuccess) => {
    setNotification({ message, isSuccess });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isAdmin) {
    return (
      <AdminContainer>
        <Title>Rate Limit Configuration</Title>
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          You do not have permission to access this page.
        </div>
      </AdminContainer>
    );
  }

  if (loading) {
    return (
      <AdminContainer>
        <LoadingSpinner>
          <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} />
        </LoadingSpinner>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title>Rate Limit Configuration</Title>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ActionButton onClick={fetchConfigs} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton onClick={handleReset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <FiRotateCcw /> Reset to Defaults
          </ActionButton>
          <ActionButton 
            primary 
            onClick={handleSave} 
            disabled={saving}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </ActionButton>
        </div>
      </Header>

      <ConfigSection>
        <SectionTitle>
          <FiSettings /> Rate Limit Settings
        </SectionTitle>
        <ConfigGrid>
          <ConfigCard>
            <ConfigLabel>
              <FiLock /> Authentication Requests Per Minute
            </ConfigLabel>
            <ConfigDescription>{configDescriptions.AUTH_REQUESTS_PER_MINUTE}</ConfigDescription>
            <ConfigInput
              type="number"
              min="1"
              value={formData.AUTH_REQUESTS_PER_MINUTE}
              onChange={(e) => handleInputChange('AUTH_REQUESTS_PER_MINUTE', e.target.value)}
            />
            <InfoText>Current: {configs.AUTH_REQUESTS_PER_MINUTE || formData.AUTH_REQUESTS_PER_MINUTE}</InfoText>
          </ConfigCard>

          <ConfigCard>
            <ConfigLabel>
              <FiShield /> General Requests Per Minute
            </ConfigLabel>
            <ConfigDescription>{configDescriptions.GENERAL_REQUESTS_PER_MINUTE}</ConfigDescription>
            <ConfigInput
              type="number"
              min="1"
              value={formData.GENERAL_REQUESTS_PER_MINUTE}
              onChange={(e) => handleInputChange('GENERAL_REQUESTS_PER_MINUTE', e.target.value)}
            />
            <InfoText>Current: {configs.GENERAL_REQUESTS_PER_MINUTE || formData.GENERAL_REQUESTS_PER_MINUTE}</InfoText>
          </ConfigCard>

          <ConfigCard>
            <ConfigLabel>
              <FiGlobe /> Public Requests Per Minute
            </ConfigLabel>
            <ConfigDescription>{configDescriptions.PUBLIC_REQUESTS_PER_MINUTE}</ConfigDescription>
            <ConfigInput
              type="number"
              min="1"
              value={formData.PUBLIC_REQUESTS_PER_MINUTE}
              onChange={(e) => handleInputChange('PUBLIC_REQUESTS_PER_MINUTE', e.target.value)}
            />
            <InfoText>Current: {configs.PUBLIC_REQUESTS_PER_MINUTE || formData.PUBLIC_REQUESTS_PER_MINUTE}</InfoText>
          </ConfigCard>

          <ConfigCard>
            <ConfigLabel>
              <FiClock /> Window Size (seconds)
            </ConfigLabel>
            <ConfigDescription>{configDescriptions.WINDOW_SIZE_MS}</ConfigDescription>
            <ConfigInput
              type="number"
              min="1"
              value={formData.WINDOW_SIZE_MS}
              onChange={(e) => handleInputChange('WINDOW_SIZE_MS', e.target.value)}
            />
            <InfoText>Current: {configs.WINDOW_SIZE_MS || formData.WINDOW_SIZE_MS} seconds</InfoText>
          </ConfigCard>
        </ConfigGrid>
      </ConfigSection>

      <AnimatePresence>
        {notification && (
          <Notification
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            isSuccess={notification.isSuccess}
          >
            {notification.message}
          </Notification>
        )}
      </AnimatePresence>
    </AdminContainer>
  );
};

export default RateLimitAdminPanel;


