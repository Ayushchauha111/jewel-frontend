import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiSettings, FiPlus, FiEdit2, FiSave, FiX, 
  FiRefreshCw, FiCheck, FiXCircle, FiLink, FiTrash2
} from 'react-icons/fi';
import CommunityService from '../../service/community.service';

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

const ConfigsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConfigCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const ConfigInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ConfigKey = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #00ff88;
  font-family: 'JetBrains Mono', monospace;
`;

const ConfigValue = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  word-break: break-all;
`;

const ConfigMeta = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
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

const Select = styled.select`
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
  
  option {
    background: #1a1a2e;
    color: #fff;
  }
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

const CommunityConfigAdminPanel = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    key: '',
    value: '',
    type: 'other',
    description: '',
    displayOrder: 0
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await CommunityService.getAllConfigsAdmin();
      if (response.data.success) {
        setConfigs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading configs:', error);
      setMessage({ text: 'Failed to load configs', success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (config = null) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        id: config.id,
        key: config.configKey,
        value: config.configValue,
        type: config.configType || 'other',
        description: config.description || '',
        displayOrder: config.displayOrder || 0
      });
    } else {
      setEditingConfig(null);
      setFormData({
        id: null,
        key: '',
        value: '',
        type: 'other',
        description: '',
        displayOrder: 0
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await CommunityService.createOrUpdateConfig(
        formData.key,
        formData.value,
        formData.type,
        formData.description,
        formData.displayOrder,
        formData.id
      );
      
      setShowModal(false);
      await loadConfigs();
      setMessage({ text: 'Config saved successfully', success: true });
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to save config', 
        success: false 
      });
    }
  };

  if (loading) {
    return (
      <AdminContainer>
        <Title><FiSettings /> Community Config Admin</Title>
        <div>Loading...</div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title><FiSettings /> Community Config Admin</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton onClick={loadConfigs}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton primary onClick={() => handleOpenModal()}>
            <FiPlus /> Add Config
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

      <ConfigsList>
        {configs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            No configs found. Click "Add Config" to create one.
          </div>
        ) : (
          configs.map((config) => (
            <ConfigCard
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ConfigInfo>
                <ConfigKey>{config.configKey}</ConfigKey>
                <ConfigValue>{config.configValue}</ConfigValue>
                <ConfigMeta>
                  {config.configType && <span>Type: {config.configType}</span>}
                  {config.description && <span>• {config.description}</span>}
                </ConfigMeta>
              </ConfigInfo>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ActionButton onClick={() => handleOpenModal(config)}>
                  <FiEdit2 />
                </ActionButton>
              </div>
            </ConfigCard>
          ))
        )}
      </ConfigsList>

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
                  {editingConfig ? 'Edit Config' : 'Create Config'}
                </ModalTitle>
                <ActionButton onClick={() => setShowModal(false)}>
                  <FiX />
                </ActionButton>
              </ModalHeader>

              <FormGroup>
                <Label>Config Key *</Label>
                <Input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., study_room_meet"
                />
                {editingConfig && (
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                    You can change the key. If the new key already exists, the update will fail.
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Config Value *</Label>
                <TextArea
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., https://meet.google.com/abc-defg-hij"
                />
              </FormGroup>

              <FormGroup>
                <Label>Config Type</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="other">Other</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this config is for..."
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

export default CommunityConfigAdminPanel;

