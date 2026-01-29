import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiMail, FiSend, FiTrash2, FiRefreshCw, FiUsers,
  FiCalendar, FiSave, FiX, FiCheck, FiClock
} from 'react-icons/fi';
import NewsletterService from '../../service/newsletter.service';
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

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: ${props => props.active ? '#00ff88' : 'rgba(255, 255, 255, 0.6)'};
  border-bottom: 2px solid ${props => props.active ? '#00ff88' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s;
  
  &:hover {
    color: #00ff88;
  }
`;

const SubscribersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SubscriberCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid ${props => props.subscribed ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 193, 7, 0.3)'};
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.subscribed ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 193, 7, 0.2)'};
  color: ${props => props.subscribed ? '#00ff88' : '#ffc107'};
  border: 1px solid ${props => props.subscribed ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 193, 7, 0.3)'};
`;

const SubscriberEmail = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
  word-break: break-all;
`;

const SubscriberDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled(motion.button)`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  ${props => props.delete && `
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    
    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.5);
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: #00ff88;
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
  max-width: 700px;
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
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #fff;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-family: 'JetBrains Mono', monospace;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
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
  font-family: 'JetBrains Mono', monospace;
  resize: vertical;
  min-height: 200px;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Notification = styled(motion.div)`
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  background: ${props => props.success ? 'rgba(0, 255, 136, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
  color: #0a0a0f;
  border-radius: 10px;
  font-weight: 600;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const NewsletterAdminPanel = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' or 'broadcast'
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [processing, setProcessing] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const hasAdminRole = user.roles?.includes('ROLE_ADMIN') || 
                          user.roles?.includes('ADMIN') ||
                          user.roles?.some(role => role.includes('ADMIN'));
      setIsAdmin(hasAdminRole);
      if (hasAdminRole) {
        fetchData();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subscribersResponse, countResponse] = await Promise.all([
        NewsletterService.getAllSubscribers(),
        NewsletterService.getSubscriberCount()
      ]);
      setSubscribers(subscribersResponse.data?.data || []);
      setSubscriberCount(countResponse.data?.data?.count || 0);
    } catch (err) {
      console.error('Error fetching newsletter data:', err);
      showNotification('Failed to fetch newsletter data', false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastData.subject || !broadcastData.message) {
      showNotification('Please fill subject and message', false);
      return;
    }

    if (!window.confirm(`Send newsletter to ${subscriberCount} subscribers?`)) return;

    setSending(true);
    try {
      const response = await NewsletterService.sendBroadcast(
        broadcastData.subject,
        broadcastData.message
      );
      const sentCount = response.data?.data?.sentCount || 0;
      showNotification(`Newsletter sent to ${sentCount} subscribers!`, true);
      setShowBroadcastModal(false);
      setBroadcastData({ subject: '', message: '' });
    } catch (err) {
      console.error('Error sending broadcast:', err);
      showNotification(err.response?.data?.message || 'Failed to send newsletter', false);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    
    if (processing.has(id)) return;
    
    setProcessing(prev => new Set(prev).add(id));
    try {
      await NewsletterService.deleteSubscriber(id);
      showNotification('Subscriber deleted successfully', true);
      fetchData();
    } catch (err) {
      showNotification('Failed to delete subscriber', false);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const showNotification = (message, success) => {
    setNotification({ message, success });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSubscribers = subscribers.filter(sub => 
    activeTab === 'active' ? sub.subscribed : activeTab === 'unsubscribed' ? !sub.subscribed : true
  );

  const activeSubscribers = subscribers.filter(s => s.subscribed).length;
  const unsubscribedCount = subscribers.filter(s => !s.subscribed).length;

  if (!isAdmin) {
    return (
      <AdminContainer>
        <EmptyState>
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </EmptyState>
      </AdminContainer>
    );
  }

  if (loading) {
    return (
      <AdminContainer>
        <LoadingSpinner>
          <FiRefreshCw style={{ animation: 'spin 1s linear infinite', fontSize: '2rem' }} />
        </LoadingSpinner>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title>Newsletter Management</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton
            primary
            onClick={() => setShowBroadcastModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSend /> Send Newsletter
          </ActionButton>
          <ActionButton
            onClick={fetchData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw /> Refresh
          </ActionButton>
        </div>
      </Header>

      <StatsContainer>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatNumber>{subscriberCount}</StatNumber>
          <StatLabel>Active Subscribers</StatLabel>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatNumber>{subscribers.length}</StatNumber>
          <StatLabel>Total Subscribers</StatLabel>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatNumber>{unsubscribedCount}</StatNumber>
          <StatLabel>Unsubscribed</StatLabel>
        </StatCard>
      </StatsContainer>

      <Tabs>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          All ({subscribers.length})
        </Tab>
        <Tab 
          active={activeTab === 'active'} 
          onClick={() => setActiveTab('active')}
        >
          Active ({activeSubscribers})
        </Tab>
        <Tab 
          active={activeTab === 'unsubscribed'} 
          onClick={() => setActiveTab('unsubscribed')}
        >
          Unsubscribed ({unsubscribedCount})
        </Tab>
      </Tabs>

      {filteredSubscribers.length === 0 ? (
        <EmptyState>
          <p>No {activeTab} subscribers found.</p>
        </EmptyState>
      ) : (
        <SubscribersGrid>
          <AnimatePresence>
            {filteredSubscribers.map((subscriber) => (
              <SubscriberCard
                key={subscriber.id}
                subscribed={subscriber.subscribed}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StatusBadge subscribed={subscriber.subscribed}>
                  {subscriber.subscribed ? 'Subscribed' : 'Unsubscribed'}
                </StatusBadge>

                <SubscriberEmail>{subscriber.email}</SubscriberEmail>

                <SubscriberDetails>
                  <div><FiCalendar /> Subscribed: {formatDate(subscriber.subscribedAt)}</div>
                  {subscriber.unsubscribedAt && (
                    <div><FiClock /> Unsubscribed: {formatDate(subscriber.unsubscribedAt)}</div>
                  )}
                </SubscriberDetails>

                <ActionButtons>
                  <Button
                    delete
                    onClick={() => handleDelete(subscriber.id)}
                    disabled={processing.has(subscriber.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiTrash2 /> Delete
                  </Button>
                </ActionButtons>
              </SubscriberCard>
            ))}
          </AnimatePresence>
        </SubscribersGrid>
      )}

      <AnimatePresence>
        {showBroadcastModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBroadcastModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>Send Newsletter Broadcast</ModalTitle>
                <CloseButton onClick={() => setShowBroadcastModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>

              <div style={{ 
                background: 'rgba(0, 255, 136, 0.1)', 
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: '#00ff88',
                fontSize: '0.9rem'
              }}>
                This will send the newsletter to <strong>{subscriberCount} active subscribers</strong>.
              </div>

              <FormGroup>
                <Label>Subject *</Label>
                <Input
                  type="text"
                  value={broadcastData.subject}
                  onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                  placeholder="Newsletter Subject"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Message * (HTML supported)</Label>
                <TextArea
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  placeholder="Enter your newsletter content here. HTML is supported."
                  required
                />
              </FormGroup>

              <FormActions>
                <ActionButton
                  onClick={() => setShowBroadcastModal(false)}
                  style={{ flex: 1 }}
                >
                  <FiX /> Cancel
                </ActionButton>
                <ActionButton
                  primary
                  onClick={handleSendBroadcast}
                  style={{ flex: 1 }}
                  disabled={sending}
                >
                  <FiSend /> {sending ? 'Sending...' : 'Send Newsletter'}
                </ActionButton>
              </FormActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <Notification
            success={notification.success}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            {notification.success ? <FiCheck /> : <FiX />}
            {notification.message}
          </Notification>
        )}
      </AnimatePresence>
    </AdminContainer>
  );
};

export default NewsletterAdminPanel;


