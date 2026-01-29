import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiCheck, FiX, FiTrash2, FiRefreshCw, FiStar, 
  FiUser, FiMail, FiMessageSquare, FiClock, FiEye
} from 'react-icons/fi';
import FeedbackService from '../../service/feedback.service';
import AuthService from '../../service/auth.service';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0f;
  color: #e8e8e8;
  font-family: 'JetBrains Mono', 'Fira Code', -apple-system, sans-serif;
  padding: 2rem;
  padding-top: 100px; /* Space for fixed navbar */
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

const RefreshButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 255, 136, 0.2);
    border-color: rgba(0, 255, 136, 0.5);
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

const FeedbackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeedbackCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid ${props => props.approved ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
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
  background: ${props => props.approved ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 193, 7, 0.2)'};
  color: ${props => props.approved ? '#00ff88' : '#ffc107'};
  border: 1px solid ${props => props.approved ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 193, 7, 0.3)'};
`;

const FeedbackHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0f;
  font-weight: 700;
  font-size: 1.2rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #fff;
  font-size: 1rem;
`;

const UserEmail = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.25rem;
  margin: 1rem 0;
`;

const Star = styled(FiStar)`
  color: ${props => props.filled ? '#ffd700' : 'rgba(255, 255, 255, 0.2)'};
  font-size: 1rem;
  fill: ${props => props.filled ? '#ffd700' : 'none'};
`;

const FeedbackMessage = styled.p`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid #00ff88;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ActionButton = styled(motion.button)`
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
  
  ${props => props.approve && `
    background: rgba(0, 255, 136, 0.2);
    color: #00ff88;
    border: 1px solid rgba(0, 255, 136, 0.3);
    
    &:hover {
      background: rgba(0, 255, 136, 0.3);
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

const FeedbackAdminPanel = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
  const [processing, setProcessing] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const hasAdminRole = user.roles?.includes('ROLE_ADMIN') || 
                          user.roles?.includes('ADMIN') ||
                          user.roles?.some(role => role.includes('ADMIN'));
      setIsAdmin(hasAdminRole);
      if (hasAdminRole) {
        fetchFeedbacks();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await FeedbackService.getAllFeedbacks();
      setFeedbacks(response.data || []);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      showNotification('Failed to fetch feedbacks', false);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (processing.has(id)) return;
    
    setProcessing(prev => new Set(prev).add(id));
    try {
      await FeedbackService.approveFeedback(id);
      showNotification('Feedback approved successfully!', true);
      fetchFeedbacks();
    } catch (err) {
      showNotification('Failed to approve feedback', false);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id) => {
    if (processing.has(id)) return;
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    setProcessing(prev => new Set(prev).add(id));
    try {
      await FeedbackService.deleteFeedback(id);
      showNotification('Feedback deleted successfully', true);
      fetchFeedbacks();
    } catch (err) {
      showNotification('Failed to delete feedback', false);
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

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  const filteredFeedbacks = feedbacks.filter(fb => 
    activeTab === 'pending' ? !fb.isApproved : fb.isApproved
  );

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
        <Title>Feedback Moderation</Title>
        <RefreshButton
          onClick={fetchFeedbacks}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiRefreshCw /> Refresh
        </RefreshButton>
      </Header>

      <Tabs>
        <Tab 
          active={activeTab === 'pending'} 
          onClick={() => setActiveTab('pending')}
        >
          Pending ({feedbacks.filter(f => !f.isApproved).length})
        </Tab>
        <Tab 
          active={activeTab === 'approved'} 
          onClick={() => setActiveTab('approved')}
        >
          Approved ({feedbacks.filter(f => f.isApproved).length})
        </Tab>
      </Tabs>

      {filteredFeedbacks.length === 0 ? (
        <EmptyState>
          <p>No {activeTab} feedbacks found.</p>
        </EmptyState>
      ) : (
        <FeedbackGrid>
          <AnimatePresence>
            {filteredFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                approved={feedback.isApproved}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StatusBadge approved={feedback.isApproved}>
                  {feedback.isApproved ? 'Approved' : 'Pending'}
                </StatusBadge>

                <FeedbackHeader>
                  <Avatar>{getInitials(feedback.name)}</Avatar>
                  <UserInfo>
                    <UserName>{feedback.name}</UserName>
                    {feedback.email && <UserEmail>{feedback.email}</UserEmail>}
                  </UserInfo>
                </FeedbackHeader>

                {feedback.rating && (
                  <StarRating>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} filled={star <= feedback.rating} />
                    ))}
                  </StarRating>
                )}

                <FeedbackMessage>{feedback.message}</FeedbackMessage>

                <MetaInfo>
                  <span><FiClock /> {formatDate(feedback.createdAt)}</span>
                  {feedback.isApproved && feedback.approvedAt && (
                    <span><FiCheck /> Approved: {formatDate(feedback.approvedAt)}</span>
                  )}
                </MetaInfo>

                {!feedback.isApproved && (
                  <ActionButtons>
                    <ActionButton
                      approve
                      onClick={() => handleApprove(feedback.id)}
                      disabled={processing.has(feedback.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiCheck /> Approve
                    </ActionButton>
                    <ActionButton
                      delete
                      onClick={() => handleDelete(feedback.id)}
                      disabled={processing.has(feedback.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiTrash2 /> Delete
                    </ActionButton>
                  </ActionButtons>
                )}

                {feedback.isApproved && (
                  <ActionButtons>
                    <ActionButton
                      delete
                      onClick={() => handleDelete(feedback.id)}
                      disabled={processing.has(feedback.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiTrash2 /> Delete
                    </ActionButton>
                  </ActionButtons>
                )}
              </FeedbackCard>
            ))}
          </AnimatePresence>
        </FeedbackGrid>
      )}

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

export default FeedbackAdminPanel;

