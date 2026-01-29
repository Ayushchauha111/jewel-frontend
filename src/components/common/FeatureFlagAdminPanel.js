import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiToggleLeft, FiToggleRight, FiPlus, FiEdit2, FiSave, FiX, 
  FiRefreshCw, FiTrash2, FiSettings, FiCheck, FiXCircle
} from 'react-icons/fi';
import FeatureFlagService from '../../service/featureFlag.service';
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const FeatureFlagsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FeatureFlagCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid ${props => props.enabled ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 100, 100, 0.3)'};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const FeatureInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FeatureKey = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.enabled ? '#00ff88' : 'rgba(255, 100, 100, 0.8)'};
  font-family: 'JetBrains Mono', monospace;
`;

const FeatureName = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
`;

const FeatureDescription = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
`;

const FeatureMeta = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
`;

const ToggleButton = styled(motion.button)`
  background: ${props => props.enabled ? 'rgba(0, 255, 136, 0.1)' : 'rgba(100, 100, 100, 0.1)'};
  border: 1px solid ${props => props.enabled ? 'rgba(0, 255, 136, 0.3)' : 'rgba(100, 100, 100, 0.3)'};
  color: ${props => props.enabled ? '#00ff88' : 'rgba(255, 255, 255, 0.5)'};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.enabled ? 'rgba(0, 255, 136, 0.2)' : 'rgba(100, 100, 100, 0.2)'};
    border-color: ${props => props.enabled ? 'rgba(0, 255, 136, 0.5)' : 'rgba(100, 100, 100, 0.5)'};
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
  color: #00ff88;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  height: 20px;
  cursor: pointer;
`;

const Message = styled(motion.div)`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: ${props => props.success ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 100, 100, 0.1)'};
  border: 1px solid ${props => props.success ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 100, 100, 0.3)'};
  color: ${props => props.success ? '#00ff88' : '#ff6464'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeatureFlagAdminPanel = () => {
  const [featureFlags, setFeatureFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);
  const [formData, setFormData] = useState({
    featureKey: '',
    featureName: '',
    isEnabled: true,
    description: '',
    category: '',
    displayOrder: 0
  });

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      const response = await FeatureFlagService.getAllFlags();
      if (response.data.success) {
        setFeatureFlags(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
      setMessage({ text: 'Failed to load feature flags', success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (featureKey) => {
    try {
      const response = await FeatureFlagService.toggleFeature(featureKey);
      if (response.data.success) {
        await loadFeatureFlags();
        setMessage({ text: 'Feature toggled successfully', success: true });
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      setMessage({ text: 'Failed to toggle feature', success: false });
    }
  };

  const handleOpenModal = (flag = null) => {
    if (flag) {
      setEditingFlag(flag);
      setFormData({
        featureKey: flag.featureKey,
        featureName: flag.featureName,
        isEnabled: flag.isEnabled,
        description: flag.description || '',
        category: flag.category || '',
        displayOrder: flag.displayOrder || 0
      });
    } else {
      setEditingFlag(null);
      setFormData({
        featureKey: '',
        featureName: '',
        isEnabled: true,
        description: '',
        category: '',
        displayOrder: 0
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const response = await FeatureFlagService.createOrUpdateFeatureFlag(
        formData.featureKey,
        formData.featureName,
        formData.isEnabled,
        formData.description,
        formData.category,
        formData.displayOrder
      );
      
      if (response.data.success) {
        setShowModal(false);
        await loadFeatureFlags();
        setMessage({ text: 'Feature flag saved successfully', success: true });
      }
    } catch (error) {
      console.error('Error saving feature flag:', error);
      setMessage({ text: error.response?.data?.message || 'Failed to save feature flag', success: false });
    }
  };

  const enabledCount = featureFlags.filter(f => f.isEnabled).length;
  const disabledCount = featureFlags.length - enabledCount;

  if (loading) {
    return (
      <AdminContainer>
        <Title><FiSettings /> Feature Flags Admin</Title>
        <div>Loading...</div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title><FiSettings /> Feature Flags Admin</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton onClick={loadFeatureFlags}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton primary onClick={() => handleOpenModal()}>
            <FiPlus /> Add Feature Flag
          </ActionButton>
        </div>
      </Header>

      {message && (
        <Message
          success={message.success}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          onClick={() => setMessage(null)}
          style={{ cursor: 'pointer' }}
        >
          {message.success ? <FiCheck /> : <FiXCircle />}
          {message.text}
        </Message>
      )}

      <StatsContainer>
        <StatCard>
          <StatNumber>{featureFlags.length}</StatNumber>
          <StatLabel>Total Features</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{enabledCount}</StatNumber>
          <StatLabel>Enabled</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{disabledCount}</StatNumber>
          <StatLabel>Disabled</StatLabel>
        </StatCard>
      </StatsContainer>

      <FeatureFlagsList>
        {featureFlags.map((flag) => (
          <FeatureFlagCard
            key={flag.id}
            enabled={flag.isEnabled}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FeatureInfo>
              <FeatureKey enabled={flag.isEnabled}>{flag.featureKey}</FeatureKey>
              <FeatureName>{flag.featureName}</FeatureName>
              {flag.description && (
                <FeatureDescription>{flag.description}</FeatureDescription>
              )}
              <FeatureMeta>
                {flag.category && <span>Category: {flag.category}</span>}
                {flag.displayOrder !== null && <span>Order: {flag.displayOrder}</span>}
              </FeatureMeta>
            </FeatureInfo>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <ToggleButton
                enabled={flag.isEnabled}
                onClick={() => handleToggle(flag.featureKey)}
              >
                {flag.isEnabled ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                {flag.isEnabled ? 'Enabled' : 'Disabled'}
              </ToggleButton>
              <ActionButton onClick={() => handleOpenModal(flag)}>
                <FiEdit2 />
              </ActionButton>
            </div>
          </FeatureFlagCard>
        ))}
      </FeatureFlagsList>

      <AnimatePresence>
        {showModal && (
          <Modal
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
                <ModalTitle>
                  {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
                </ModalTitle>
                <ActionButton onClick={() => setShowModal(false)}>
                  <FiX />
                </ActionButton>
              </ModalHeader>

              <FormGroup>
                <Label>Feature Key *</Label>
                <Input
                  type="text"
                  value={formData.featureKey}
                  onChange={(e) => setFormData({ ...formData, featureKey: e.target.value })}
                  placeholder="e.g., inner_peace_hub"
                  disabled={!!editingFlag}
                />
              </FormGroup>

              <FormGroup>
                <Label>Feature Name *</Label>
                <Input
                  type="text"
                  value={formData.featureName}
                  onChange={(e) => setFormData({ ...formData, featureName: e.target.value })}
                  placeholder="e.g., Inner Peace Hub"
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this feature does..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Category</Label>
                <Input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., community, social, games"
                />
              </FormGroup>

              <FormGroup>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </FormGroup>

              <FormGroup>
                <CheckboxContainer>
                  <Checkbox
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  />
                  <Label>Enabled</Label>
                </CheckboxContainer>
              </FormGroup>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <ActionButton onClick={() => setShowModal(false)}>
                  <FiX /> Cancel
                </ActionButton>
                <ActionButton primary onClick={handleSave}>
                  <FiSave /> Save
                </ActionButton>
              </div>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </AdminContainer>
  );
};

export default FeatureFlagAdminPanel;

