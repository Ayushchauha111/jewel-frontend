import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiUsers, FiTrash2, FiRefreshCw, FiShield, FiMail,
  FiUser, FiEdit2, FiSave, FiX, FiCheck, FiDollarSign, FiBook, FiChevronDown, FiChevronUp,
  FiAlertTriangle, FiFilter
} from 'react-icons/fi';
import UserService from '../../service/user.service';
import AuthService from '../../service/auth.service';
import CourseDataService from '../../service/course.service';

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
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UserCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  isolation: isolate;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: #0a0a0f;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
  word-break: break-word;
`;

const UserEmail = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  word-break: break-all;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
  font-size: 0.9rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
  background: ${props => {
    if (props.role === 'ROLE_ADMIN' || props.role === 'ADMIN') return 'rgba(239, 68, 68, 0.2)';
    if (props.role === 'ROLE_MODERATOR' || props.role === 'MODERATOR') return 'rgba(59, 130, 246, 0.2)';
    return 'rgba(0, 255, 136, 0.2)';
  }};
  color: ${props => {
    if (props.role === 'ROLE_ADMIN' || props.role === 'ADMIN') return '#ef4444';
    if (props.role === 'ROLE_MODERATOR' || props.role === 'MODERATOR') return '#3b82f6';
    return '#00ff88';
  }};
  border: 1px solid ${props => {
    if (props.role === 'ROLE_ADMIN' || props.role === 'ADMIN') return 'rgba(239, 68, 68, 0.3)';
    if (props.role === 'ROLE_MODERATOR' || props.role === 'MODERATOR') return 'rgba(59, 130, 246, 0.3)';
    return 'rgba(0, 255, 136, 0.3)';
  }};
`;

const RiskBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => {
    if (props.$level === 'HIGH') return 'rgba(239, 68, 68, 0.2)';
    if (props.$level === 'MEDIUM') return 'rgba(251, 191, 36, 0.2)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.$level === 'HIGH') return '#ef4444';
    if (props.$level === 'MEDIUM') return '#fbbf24';
    return 'transparent';
  }};
  border: 1px solid ${props => {
    if (props.$level === 'HIGH') return 'rgba(239, 68, 68, 0.3)';
    if (props.$level === 'MEDIUM') return 'rgba(251, 191, 36, 0.3)';
    return 'transparent';
  }};
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.$active ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? '#00ff88' : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$active ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const FilterCount = styled.span`
  background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'};
  color: ${props => props.$danger ? '#ef4444' : '#00ff88'};
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
`;

const BulkActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const SelectAllCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  
  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const UserCheckbox = styled.input`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #00ff88;
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
  font-size: 0.85rem;
  
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

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
    border-color: #00ff88;
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  span {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Notification = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'isSuccess'
})`
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  background: ${props => props.isSuccess ? 'rgba(0, 255, 136, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
  color: #0a0a0f;
  border-radius: 10px;
  font-weight: 600;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationInfo = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? '#00ff88' : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageSizeSelect = styled.select`
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
  }
  
  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

// Disposable email detection (client-side)
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'throwaway.email', 'fakeinbox.com', 'getnada.com',
  'maildrop.cc', 'yopmail.com', 'trashmail.com', 'dispostable.com',
  'sharklasers.com', 'spam4.me', 'tempinbox.com', 'mailnull.com',
  'guerrillamail.org', '10minmail.com', 'yopmail.fr', 'mohmal.com',
  'burnermail.io', 'inboxkitten.com', '33mail.com'
]);

const VALID_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'in', 'us', 'uk', 'ca',
  'au', 'de', 'fr', 'jp', 'cn', 'ru', 'br', 'it', 'es', 'nl', 'info',
  'biz', 'app', 'dev', 'tech', 'cloud', 'live', 'me', 'tv', 'ai', 'xyz'
]);

const SUSPICIOUS_PATTERNS = ['test', 'fake', 'spam', 'trash', 'temp', 'admin', 
  'administrator', 'user', 'demo', 'sample', 'example', 'dummy', 'asdf', 'qwerty'];

const SUSPICIOUS_DOMAIN_NAMES = ['ceo', 'cto', 'cfo', 'vip', 'boss', 'chief', 'owner'];

const getEmailRiskLevel = (email) => {
  if (!email || !email.includes('@')) return 'LOW';
  
  const parts = email.split('@');
  const localPart = parts[0]?.toLowerCase();
  const domain = parts[1]?.toLowerCase();
  
  // Known disposable domain = HIGH
  if (DISPOSABLE_DOMAINS.has(domain)) return 'HIGH';
  
  let score = 0;
  
  // Check suspicious username patterns
  if (SUSPICIOUS_PATTERNS.some(p => localPart?.includes(p))) score++;
  
  // Check TLD validity
  if (domain) {
    const tld = domain.split('.').pop();
    const domainName = domain.split('.')[0];
    
    if (tld && tld.length > 2 && !VALID_TLDS.has(tld)) score += 2;
    if (domainName && domainName.length <= 3 && SUSPICIOUS_DOMAIN_NAMES.includes(domainName)) score++;
  }
  
  if (score >= 2) return 'HIGH';
  if (score >= 1) return 'MEDIUM';
  return 'LOW';
};

const UserAdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [processing, setProcessing] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCourses, setUserCourses] = useState({}); // userId -> courses array
  const [loadingCourses, setLoadingCourses] = useState(new Set());
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Suspicious users state
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'suspicious', 'high-risk'
  const [suspiciousStats, setSuspiciousStats] = useState({ high: 0, medium: 0 });
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const availableRoles = ['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN'];

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const hasAdminRole = user.roles?.includes('ROLE_ADMIN') || 
                          user.roles?.includes('ADMIN') ||
                          user.roles?.some(role => role.includes('ADMIN'));
      setIsAdmin(hasAdminRole);
      if (hasAdminRole) {
        fetchData(currentPage, pageSize, searchQuery);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Debounced search - fetch from server when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData(0, pageSize, searchQuery);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchData = async (page = currentPage, size = pageSize, search = searchQuery) => {
    try {
      setLoading(true);
      const [usersResponse, countResponse] = await Promise.all([
        UserService.getUsersPaginated(page, size, search || null),
        UserService.getUserCount()
      ]);
      
      const usersData = usersResponse.data?.data;
      let allUsers = [];
      
      if (usersData) {
        allUsers = usersData.content || [];
        setUsers(allUsers);
        setTotalPages(usersData.totalPages || 0);
        setTotalElements(usersData.totalElements || 0);
        setCurrentPage(usersData.currentPage || 0);
      } else {
        // Fallback to old API if paginated fails
        const fallbackResponse = await UserService.getAllUsers();
        allUsers = fallbackResponse.data?.data || [];
        setUsers(allUsers);
      }
      
      // Calculate suspicious stats
      let highCount = 0;
      let mediumCount = 0;
      allUsers.forEach(user => {
        const risk = getEmailRiskLevel(user.email);
        if (risk === 'HIGH') highCount++;
        else if (risk === 'MEDIUM') mediumCount++;
      });
      setSuspiciousStats({ high: highCount, medium: mediumCount });
      
      // Apply filter
      applyFilter(allUsers, filterMode);
      
      setUserCount(countResponse.data?.data?.count || 0);
    } catch (err) {
      console.error('Error fetching user data:', err);
      showNotification('Failed to fetch user data', false);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (userList, mode) => {
    let filtered = userList;
    
    if (mode === 'suspicious') {
      filtered = userList.filter(u => {
        const risk = getEmailRiskLevel(u.email);
        return risk === 'HIGH' || risk === 'MEDIUM';
      });
    } else if (mode === 'high-risk') {
      filtered = userList.filter(u => getEmailRiskLevel(u.email) === 'HIGH');
    }
    
    setFilteredUsers(filtered);
  };

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    setSelectedUsers(new Set());
    applyFilter(users, mode);
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)? This cannot be undone.`)) {
      return;
    }
    
    setBulkDeleting(true);
    try {
      // Delete users one by one using existing API
      const userIds = Array.from(selectedUsers);
      let successCount = 0;
      
      for (const userId of userIds) {
        try {
          await UserService.deleteUser(userId);
          successCount++;
        } catch (err) {
          console.error(`Failed to delete user ${userId}:`, err);
        }
      }
      
      showNotification(`Successfully deleted ${successCount} user(s)`, true);
      setSelectedUsers(new Set());
      fetchData(currentPage, pageSize, searchQuery);
    } catch (err) {
      console.error('Error bulk deleting:', err);
      showNotification('Failed to delete users', false);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleEditRoles = (user) => {
    setEditingUser(user);
    setSelectedRoles(new Set(user.roles || []));
    setShowRoleModal(true);
  };

  const handleRoleToggle = (role) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(role)) {
      newRoles.delete(role);
    } else {
      newRoles.add(role);
    }
    setSelectedRoles(newRoles);
  };

  const handleSaveRoles = async () => {
    if (selectedRoles.size === 0) {
      showNotification('User must have at least one role', false);
      return;
    }

    try {
      await UserService.updateUserRoles(editingUser.id, Array.from(selectedRoles));
      showNotification('User roles updated successfully!', true);
      setShowRoleModal(false);
      fetchData(currentPage, pageSize, searchQuery);
    } catch (err) {
      console.error('Error updating roles:', err);
      showNotification(err.response?.data?.message || 'Failed to update user roles', false);
    }
  };

  const fetchUserCourses = async (userId) => {
    try {
      setLoadingCourses(prev => new Set(prev).add(userId));
      const response = await CourseDataService.getUserSubscribedCourses(userId);
      if (response.data) {
        setUserCourses(prev => ({
          ...prev,
          [userId]: response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching user courses:', error);
      setUserCourses(prev => ({
        ...prev,
        [userId]: []
      }));
    } finally {
      setLoadingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    if (processing.has(id)) return;
    
    setProcessing(prev => new Set(prev).add(id));
    try {
      await UserService.deleteUser(id);
      showNotification('User deleted successfully', true);
      fetchData(currentPage, pageSize, searchQuery);
    } catch (err) {
      showNotification('Failed to delete user', false);
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

  const getInitials = (username) => {
    if (!username) return '?';
    return username.substring(0, 2).toUpperCase();
  };

  const getRoleDisplayName = (role) => {
    return role.replace('ROLE_', '').charAt(0) + role.replace('ROLE_', '').slice(1).toLowerCase();
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

  const adminCount = users.filter(u => u.roles?.includes('ROLE_ADMIN') || u.roles?.includes('ADMIN')).length;
  const moderatorCount = users.filter(u => u.roles?.includes('ROLE_MODERATOR') || u.roles?.includes('MODERATOR')).length;

  return (
    <AdminContainer>
      <Header>
        <Title>User Management</Title>
        <ActionButton
          onClick={fetchData}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiRefreshCw /> Refresh
        </ActionButton>
      </Header>

      <StatsContainer>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatNumber>{userCount}</StatNumber>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatNumber>{adminCount}</StatNumber>
          <StatLabel>Admins</StatLabel>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatNumber>{moderatorCount}</StatNumber>
          <StatLabel>Moderators</StatLabel>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ borderColor: suspiciousStats.high > 0 ? 'rgba(239, 68, 68, 0.5)' : undefined }}
        >
          <StatNumber style={{ background: 'linear-gradient(135deg, #ef4444 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text' }}>
            {suspiciousStats.high + suspiciousStats.medium}
          </StatNumber>
          <StatLabel>⚠️ Suspicious Emails</StatLabel>
        </StatCard>
      </StatsContainer>

      <SearchBar
        type="text"
        placeholder="Search by username, email, or role..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <FilterTabs>
        <FilterTab 
          $active={filterMode === 'all'} 
          onClick={() => handleFilterChange('all')}
        >
          <FiUsers /> All Users
        </FilterTab>
        <FilterTab 
          $active={filterMode === 'suspicious'} 
          onClick={() => handleFilterChange('suspicious')}
        >
          <FiAlertTriangle /> Suspicious
          {(suspiciousStats.high + suspiciousStats.medium) > 0 && (
            <FilterCount $danger>{suspiciousStats.high + suspiciousStats.medium}</FilterCount>
          )}
        </FilterTab>
        <FilterTab 
          $active={filterMode === 'high-risk'} 
          onClick={() => handleFilterChange('high-risk')}
        >
          <FiAlertTriangle style={{ color: '#ef4444' }} /> High Risk
          {suspiciousStats.high > 0 && (
            <FilterCount $danger>{suspiciousStats.high}</FilterCount>
          )}
        </FilterTab>
      </FilterTabs>

      {selectedUsers.size > 0 && (
        <BulkActions>
          <SelectAllCheckbox>
            <input
              type="checkbox"
              checked={selectedUsers.size === filteredUsers.length}
              onChange={handleSelectAll}
            />
            Select All ({filteredUsers.length})
          </SelectAllCheckbox>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {selectedUsers.size} user(s) selected
          </span>
          <ActionButton
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            style={{ 
              background: 'rgba(239, 68, 68, 0.2)', 
              borderColor: 'rgba(239, 68, 68, 0.5)',
              color: '#ef4444',
              marginLeft: 'auto'
            }}
          >
            <FiTrash2 /> {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
          </ActionButton>
        </BulkActions>
      )}

      {filteredUsers.length === 0 ? (
        <EmptyState>
          <p>No users found.</p>
        </EmptyState>
      ) : (
        <UsersGrid>
          <AnimatePresence>
            {filteredUsers.map((user) => {
              if (!user || !user.id) {
                console.error('User missing ID:', user);
                return null;
              }
              return (
              <UserCard
                key={`user-card-${user.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  borderColor: getEmailRiskLevel(user.email) === 'HIGH' 
                    ? 'rgba(239, 68, 68, 0.5)' 
                    : getEmailRiskLevel(user.email) === 'MEDIUM'
                    ? 'rgba(251, 191, 36, 0.5)'
                    : undefined
                }}
              >
                {(filterMode === 'suspicious' || filterMode === 'high-risk') && (
                  <UserCheckbox
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                )}
                <UserHeader>
                  <UserAvatar>
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.username}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      getInitials(user.username)
                    )}
                  </UserAvatar>
                  <UserInfo>
                    <UserName>
                      {user.username}
                      {getEmailRiskLevel(user.email) !== 'LOW' && (
                        <RiskBadge $level={getEmailRiskLevel(user.email)} style={{ marginLeft: '0.5rem' }}>
                          <FiAlertTriangle size={10} />
                          {getEmailRiskLevel(user.email)}
                        </RiskBadge>
                      )}
                    </UserName>
                    <UserEmail>{user.email}</UserEmail>
                  </UserInfo>
                </UserHeader>

                <UserDetails>
                  <DetailRow>
                    <FiShield /> Roles: 
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role, idx) => (
                        <RoleBadge key={idx} role={role}>
                          {getRoleDisplayName(role)}
                        </RoleBadge>
                      ))
                    ) : (
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No roles</span>
                    )}
                  </DetailRow>
                  {user.referralCode && (
                    <DetailRow>
                      <FiUser /> Referral: {user.referralCode}
                    </DetailRow>
                  )}
                  {user.earned !== null && user.earned !== undefined && (
                    <DetailRow>
                      <FiDollarSign /> Earned: ₹{user.earned.toFixed(2)}
                    </DetailRow>
                  )}
                </UserDetails>

                {/* Subscribed Courses Section */}
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const userId = user.id;
                      if (!userId) {
                        console.warn('User ID is missing:', user);
                        return;
                      }
                      const isExpanded = expandedUsers.has(userId);
                      if (isExpanded) {
                        setExpandedUsers(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(userId);
                          return newSet;
                        });
                      } else {
                        setExpandedUsers(prev => new Set(prev).add(userId));
                        if (!userCourses[userId] && !loadingCourses.has(userId)) {
                          fetchUserCourses(userId);
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: '8px',
                      color: '#00ff88',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.9rem'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiBook /> Subscribed Courses ({userCourses[user.id]?.length || 0})
                    </span>
                    {expandedUsers.has(user.id) ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  
                  {expandedUsers.has(user.id) && (
                    <div 
                      key={`expanded-courses-${user.id}`}
                      style={{ 
                        marginTop: '0.75rem', 
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {loadingCourses.has(user.id) ? (
                        <div style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '1rem' }}>
                          Loading courses...
                        </div>
                      ) : userCourses[user.id] && userCourses[user.id].length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {userCourses[user.id].map((course, idx) => (
                            <div 
                              key={idx}
                              style={{
                                padding: '0.75rem',
                                background: course.isExpired 
                                  ? 'rgba(255, 68, 68, 0.1)' 
                                  : 'rgba(0, 255, 136, 0.1)',
                                border: `1px solid ${course.isExpired 
                                  ? 'rgba(255, 68, 68, 0.3)' 
                                  : 'rgba(0, 255, 136, 0.3)'}`,
                                borderRadius: '8px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <div style={{ 
                                fontWeight: '600', 
                                color: course.isExpired ? '#ff4444' : '#00ff88',
                                marginBottom: '0.5rem'
                              }}>
                                {course.subject}
                                {course.isExpired && (
                                  <span style={{ 
                                    marginLeft: '0.5rem', 
                                    fontSize: '0.75rem',
                                    color: '#ff4444'
                                  }}>
                                    (Expired)
                                  </span>
                                )}
                              </div>
                              {course.description && (
                                <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                                  {course.description.substring(0, 100)}{course.description.length > 100 ? '...' : ''}
                                </div>
                              )}
                              <div style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                marginTop: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.5)',
                                flexWrap: 'wrap'
                              }}>
                                {course.enrolledAt && (
                                  <span>Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}</span>
                                )}
                                {course.expiresAt && (
                                  <span>Expires: {new Date(course.expiresAt).toLocaleDateString()}</span>
                                )}
                                {course.validity && (
                                  <span>Validity: {course.validity}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '1rem' }}>
                          No subscribed courses
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <ActionButtons>
                  <Button
                    edit
                    onClick={() => handleEditRoles(user)}
                    disabled={processing.has(user.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiEdit2 /> Edit Roles
                  </Button>
                  <Button
                    delete
                    onClick={() => handleDelete(user.id)}
                    disabled={processing.has(user.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiTrash2 /> Delete
                  </Button>
                </ActionButtons>
              </UserCard>
              );
            })}
          </AnimatePresence>
        </UsersGrid>
      )}

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <PaginationContainer>
          <PaginationInfo>
            Showing {filteredUsers.length > 0 ? (currentPage * pageSize + 1) : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} users
          </PaginationInfo>
          <PaginationControls>
            <PageSizeSelect
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                fetchData(0, parseInt(e.target.value), searchQuery);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </PageSizeSelect>
            <PageButton
              onClick={() => fetchData(0, pageSize, searchQuery)}
              disabled={currentPage === 0}
            >
              First
            </PageButton>
            <PageButton
              onClick={() => fetchData(currentPage - 1, pageSize, searchQuery)}
              disabled={currentPage === 0}
            >
              Previous
            </PageButton>
            <span style={{ color: 'rgba(255,255,255,0.7)', padding: '0 0.5rem' }}>
              Page {currentPage + 1} of {totalPages}
            </span>
            <PageButton
              onClick={() => fetchData(currentPage + 1, pageSize, searchQuery)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </PageButton>
            <PageButton
              onClick={() => fetchData(totalPages - 1, pageSize, searchQuery)}
              disabled={currentPage >= totalPages - 1}
            >
              Last
            </PageButton>
          </PaginationControls>
        </PaginationContainer>
      )}

      <AnimatePresence>
        {showRoleModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRoleModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>Edit User Roles</ModalTitle>
                <CloseButton onClick={() => setShowRoleModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>

              <FormGroup>
                <Label>User: {editingUser?.username}</Label>
                <Label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  {editingUser?.email}
                </Label>
              </FormGroup>

              <FormGroup>
                <Label>Select Roles *</Label>
                <CheckboxGroup>
                  {availableRoles.map(role => (
                    <CheckboxItem key={role}>
                      <input
                        type="checkbox"
                        checked={selectedRoles.has(role)}
                        onChange={() => handleRoleToggle(role)}
                      />
                      <span>{getRoleDisplayName(role)}</span>
                    </CheckboxItem>
                  ))}
                </CheckboxGroup>
              </FormGroup>

              <FormActions>
                <ActionButton
                  onClick={() => setShowRoleModal(false)}
                  style={{ flex: 1 }}
                >
                  <FiX /> Cancel
                </ActionButton>
                <ActionButton
                  primary
                  onClick={handleSaveRoles}
                  style={{ flex: 1 }}
                >
                  <FiSave /> Save Roles
                </ActionButton>
              </FormActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <Notification
            isSuccess={notification.success}
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

export default UserAdminPanel;

