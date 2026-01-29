import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiTag,
  FiCalendar, FiPercent, FiSave, FiX, FiCheck
} from 'react-icons/fi';
import CouponService from '../../service/coupon.service';
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

const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CouponCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid ${props => props.expired ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'};
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
  background: ${props => props.expired ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 255, 136, 0.2)'};
  color: ${props => props.expired ? '#ef4444' : '#00ff88'};
  border: 1px solid ${props => props.expired ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'};
`;

const CouponCode = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
`;

const CouponDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
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
  max-width: 500px;
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

const CouponAdminPanel = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [processing, setProcessing] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    expiryDate: ''
  });

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const hasAdminRole = user.roles?.includes('ROLE_ADMIN') || 
                          user.roles?.includes('ADMIN') ||
                          user.roles?.some(role => role.includes('ADMIN'));
      setIsAdmin(hasAdminRole);
      if (hasAdminRole) {
        fetchCoupons();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await CouponService.getAllCoupons();
      setCoupons(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      showNotification('Failed to fetch coupons', false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discount: '',
      expiryDate: ''
    });
    setShowModal(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount: coupon.discount.toString(),
      expiryDate: coupon.expiryDate
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discount || !formData.expiryDate) {
      showNotification('Please fill all fields', false);
      return;
    }

    const couponData = {
      code: formData.code.toUpperCase().trim(),
      discount: parseFloat(formData.discount),
      expiryDate: formData.expiryDate
    };

    try {
      if (editingCoupon) {
        await CouponService.updateCoupon(editingCoupon.id, couponData);
        showNotification('Coupon updated successfully!', true);
      } else {
        await CouponService.createCoupon(couponData);
        showNotification('Coupon created successfully!', true);
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      console.error('Error saving coupon:', err);
      showNotification(err.response?.data?.message || 'Failed to save coupon', false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    if (processing.has(id)) return;
    
    setProcessing(prev => new Set(prev).add(id));
    try {
      await CouponService.deleteCoupon(id);
      showNotification('Coupon deleted successfully', true);
      fetchCoupons();
    } catch (err) {
      showNotification('Failed to delete coupon', false);
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
      day: 'numeric'
    });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

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
        <Title>Coupon Management</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton
            primary
            onClick={handleCreate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus /> New Coupon
          </ActionButton>
          <ActionButton
            onClick={fetchCoupons}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw /> Refresh
          </ActionButton>
        </div>
      </Header>

      {coupons.length === 0 ? (
        <EmptyState>
          <p>No coupons found. Create your first coupon!</p>
        </EmptyState>
      ) : (
        <CouponsGrid>
          <AnimatePresence>
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.expiryDate);
              return (
                <CouponCard
                  key={coupon.id}
                  expired={expired}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <StatusBadge expired={expired}>
                    {expired ? 'Expired' : 'Active'}
                  </StatusBadge>

                  <CouponCode>{coupon.code}</CouponCode>

                  <CouponDetails>
                    <DetailRow>
                      <FiPercent /> Discount: {coupon.discount}%
                    </DetailRow>
                    <DetailRow>
                      <FiCalendar /> Expires: {formatDate(coupon.expiryDate)}
                    </DetailRow>
                  </CouponDetails>

                  <ActionButtons>
                    <Button
                      edit
                      onClick={() => handleEdit(coupon)}
                      disabled={processing.has(coupon.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiEdit2 /> Edit
                    </Button>
                    <Button
                      delete
                      onClick={() => handleDelete(coupon.id)}
                      disabled={processing.has(coupon.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  </ActionButtons>
                </CouponCard>
              );
            })}
          </AnimatePresence>
        </CouponsGrid>
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
                <ModalTitle>
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </ModalTitle>
                <CloseButton onClick={() => setShowModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>

              <FormGroup>
                <Label>Coupon Code</Label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="SUMMER2024"
                  maxLength={50}
                />
              </FormGroup>

              <FormGroup>
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="10"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </FormGroup>

              <FormGroup>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormGroup>

              <FormActions>
                <ActionButton
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
                  <FiX /> Cancel
                </ActionButton>
                <ActionButton
                  primary
                  onClick={handleSave}
                  style={{ flex: 1 }}
                >
                  <FiSave /> {editingCoupon ? 'Update' : 'Create'}
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

export default CouponAdminPanel;

