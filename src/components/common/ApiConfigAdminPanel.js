import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiRefreshCw, FiSave, FiPlus, FiEdit2, FiTrash2, FiShield,
  FiLock, FiGlobe, FiSettings, FiX, FiCheck, FiPower
} from 'react-icons/fi';
import ApiConfigService from '../../service/apiConfig.service';
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

const ConfigsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConfigCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid ${props => props.isActive ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ConfigInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ConfigEndpoint = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ConfigMethod = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    if (props.method === 'GET') return 'rgba(59, 130, 246, 0.2)';
    if (props.method === 'POST') return 'rgba(34, 197, 94, 0.2)';
    if (props.method === 'PUT') return 'rgba(251, 191, 36, 0.2)';
    if (props.method === 'DELETE') return 'rgba(239, 68, 68, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => {
    if (props.method === 'GET') return '#3b82f6';
    if (props.method === 'POST') return '#22c55e';
    if (props.method === 'PUT') return '#fbbf24';
    if (props.method === 'DELETE') return '#ef4444';
    return '#fff';
  }};
`;

const ConfigDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
`;

const ConfigBadge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    if (props.type === 'public') return 'rgba(34, 197, 94, 0.2)';
    if (props.type === 'private') return 'rgba(239, 68, 68, 0.2)';
    if (props.type === 'auth') return 'rgba(59, 130, 246, 0.2)';
    if (props.type === 'role') return 'rgba(168, 85, 247, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => {
    if (props.type === 'public') return '#22c55e';
    if (props.type === 'private') return '#ef4444';
    if (props.type === 'auth') return '#3b82f6';
    if (props.type === 'role') return '#a855f7';
    return '#fff';
  }};
  border: 1px solid ${props => {
    if (props.type === 'public') return 'rgba(34, 197, 94, 0.3)';
    if (props.type === 'private') return 'rgba(239, 68, 68, 0.3)';
    if (props.type === 'auth') return 'rgba(59, 130, 246, 0.3)';
    if (props.type === 'role') return 'rgba(168, 85, 247, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
`;

const ConfigDescription = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const ConfigActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  
  @media (max-width: 768px) {
    flex-direction: row;
  }
`;

const Button = styled(motion.button)`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  transition: all 0.2s;
  
  ${props => props.edit && `
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.3);
    
    &:hover {
      background: rgba(59, 130, 246, 0.3);
    }
  `}
  
  ${props => props.delete && `
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    
    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  `}
  
  ${props => props.toggle && `
    background: ${props.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)'};
    color: ${props.isActive ? '#22c55e' : '#6b7280'};
    border: 1px solid ${props.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(107, 114, 128, 0.3)'};
    
    &:hover {
      background: ${props.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(107, 114, 128, 0.3)'};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: #1a1a2e;
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }
  
  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: #00ff88;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.5);
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

const ApiConfigAdminPanel = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processing, setProcessing] = useState(new Set());
  
  const [formData, setFormData] = useState({
    endpoint: '',
    httpMethod: '',
    isPublic: false,
    requiresAuth: true,
    requiredRole: '',
    description: '',
    isActive: true
  });

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
      const response = await ApiConfigService.getAllConfigs();
      if (response.data.success) {
        setConfigs(response.data.configs || []);
      }
    } catch (err) {
      console.error('Error fetching API configs:', err);
      showNotification('Failed to fetch API configurations', false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    setFormData({
      endpoint: '',
      httpMethod: '',
      isPublic: false,
      requiresAuth: true,
      requiredRole: '',
      description: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      endpoint: config.endpoint || '',
      httpMethod: config.httpMethod || '',
      isPublic: config.isPublic || false,
      requiresAuth: config.requiresAuth !== undefined ? config.requiresAuth : true,
      requiredRole: config.requiredRole || '',
      description: config.description || '',
      isActive: config.isActive !== undefined ? config.isActive : true
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setProcessing(prev => new Set(prev).add('save'));
      const configToSave = { ...formData };
      
      if (editingConfig) {
        await ApiConfigService.updateConfig(editingConfig.id, configToSave);
        showNotification('API configuration updated successfully!', true);
      } else {
        await ApiConfigService.saveConfig(configToSave);
        showNotification('API configuration created successfully!', true);
      }
      
      setShowModal(false);
      fetchConfigs();
    } catch (err) {
      console.error('Error saving API config:', err);
      showNotification(err.response?.data?.message || 'Failed to save configuration', false);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete('save');
        return next;
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API configuration?')) {
      return;
    }
    
    try {
      setProcessing(prev => new Set(prev).add(id));
      await ApiConfigService.deleteConfig(id);
      showNotification('API configuration deleted successfully!', true);
      fetchConfigs();
    } catch (err) {
      console.error('Error deleting API config:', err);
      showNotification(err.response?.data?.message || 'Failed to delete configuration', false);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleToggleActive = async (id) => {
    try {
      setProcessing(prev => new Set(prev).add(id));
      await ApiConfigService.toggleActive(id);
      showNotification('API configuration status toggled!', true);
      fetchConfigs();
    } catch (err) {
      console.error('Error toggling API config:', err);
      showNotification(err.response?.data?.message || 'Failed to toggle configuration', false);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const showNotification = (message, isSuccess) => {
    setNotification({ message, isSuccess });
    setTimeout(() => setNotification(null), 5000);
  };

  if (!isAdmin) {
    return (
      <AdminContainer>
        <Title>API Configuration</Title>
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
        <Title>API Configuration</Title>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ActionButton onClick={fetchConfigs} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton 
            primary 
            onClick={handleCreate}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus /> Add Configuration
          </ActionButton>
        </div>
      </Header>

      {configs.length === 0 ? (
        <EmptyState>
          <p>No API configurations found.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Click "Add Configuration" to create one.</p>
        </EmptyState>
      ) : (
        <ConfigsList>
          {configs.map((config) => (
            <ConfigCard
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              isActive={config.isActive}
            >
              <ConfigInfo>
                <ConfigEndpoint>
                  {config.httpMethod && (
                    <ConfigMethod method={config.httpMethod}>{config.httpMethod}</ConfigMethod>
                  )}
                  {config.endpoint}
                </ConfigEndpoint>
                <ConfigDetails>
                  <ConfigBadge type={config.isPublic ? 'public' : 'private'}>
                    {config.isPublic ? 'Public' : 'Private'}
                  </ConfigBadge>
                  {config.requiresAuth && (
                    <ConfigBadge type="auth">Requires Auth</ConfigBadge>
                  )}
                  {config.requiredRole && (
                    <ConfigBadge type="role">{config.requiredRole}</ConfigBadge>
                  )}
                  {!config.isActive && (
                    <ConfigBadge type="inactive">Inactive</ConfigBadge>
                  )}
                </ConfigDetails>
                {config.description && (
                  <ConfigDescription>{config.description}</ConfigDescription>
                )}
              </ConfigInfo>
              <ConfigActions>
                <Button
                  edit
                  onClick={() => handleEdit(config)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit2 /> Edit
                </Button>
                <Button
                  toggle
                  isActive={config.isActive}
                  onClick={() => handleToggleActive(config.id)}
                  disabled={processing.has(config.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPower /> {config.isActive ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  delete
                  onClick={() => handleDelete(config.id)}
                  disabled={processing.has(config.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiTrash2 /> Delete
                </Button>
              </ConfigActions>
            </ConfigCard>
          ))}
        </ConfigsList>
      )}

      <AnimatePresence>
        {showModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>{editingConfig ? 'Edit API Configuration' : 'Add API Configuration'}</ModalTitle>
                <Button onClick={() => setShowModal(false)}>
                  <FiX />
                </Button>
              </ModalHeader>

              <FormGroup>
                <Label>Endpoint *</Label>
                <Input
                  type="text"
                  placeholder="/api/example/**"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>HTTP Method</Label>
                <Select
                  value={formData.httpMethod}
                  onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value })}
                >
                  <option value="">All Methods</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <CheckboxContainer>
                  <Checkbox
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                  <span>Public (No authentication required)</span>
                </CheckboxContainer>
              </FormGroup>

              <FormGroup>
                <CheckboxContainer>
                  <Checkbox
                    type="checkbox"
                    checked={formData.requiresAuth}
                    onChange={(e) => setFormData({ ...formData, requiresAuth: e.target.checked })}
                  />
                  <span>Requires Authentication</span>
                </CheckboxContainer>
              </FormGroup>

              <FormGroup>
                <Label>Required Role</Label>
                <Select
                  value={formData.requiredRole}
                  onChange={(e) => setFormData({ ...formData, requiredRole: e.target.value })}
                >
                  <option value="">No specific role required</option>
                  <option value="ROLE_USER">ROLE_USER</option>
                  <option value="ROLE_MODERATOR">ROLE_MODERATOR</option>
                  <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  placeholder="Describe what this API endpoint does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <CheckboxContainer>
                  <Checkbox
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active</span>
                </CheckboxContainer>
              </FormGroup>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <ActionButton
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
                  <FiX /> Cancel
                </ActionButton>
                <ActionButton
                  primary
                  onClick={handleSave}
                  disabled={processing.has('save') || !formData.endpoint}
                  style={{ flex: 1 }}
                >
                  <FiSave /> {editingConfig ? 'Update' : 'Create'}
                </ActionButton>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

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

export default ApiConfigAdminPanel;


