import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiMail, FiSend, FiRefreshCw, FiUsers, FiAlertCircle,
  FiCheck, FiX, FiLoader, FiSearch, FiCheckSquare, FiSquare,
  FiFileText, FiStar, FiGift, FiZap
} from 'react-icons/fi';
import UserService from '../../service/user.service';
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
  background: ${props => props.$primary ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$primary ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$primary ? '#00ff88' : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$primary ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${props => props.$primary ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmailForm = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const InfoBox = styled.div`
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const WarningBox = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const Notification = styled(motion.div)`
  position: fixed;
  top: 120px;
  right: 2rem;
  background: ${props => props.$success ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)'};
  border: 1px solid ${props => props.$success ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 68, 0.5)'};
  border-radius: 12px;
  padding: 1rem 1.5rem;
  color: ${props => props.$success ? '#00ff88' : '#ff4444'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  gap: 1.5rem;
`;

const LoadingText = styled.div`
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #00ff88 0%, #00d4ff 100%);
  border-radius: 4px;
`;

const ResultCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ResultLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
`;

const ResultValue = styled.span`
  color: #00ff88;
  font-weight: 700;
  font-size: 1.1rem;
`;

const UserSelectionCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const UserSelectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SelectionControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const UserListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 1rem;
  cursor: pointer;
  accent-color: #00ff88;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const UserName = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
`;

const UserEmail = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
`;

const UserSignupDate = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const UserTemplateTableCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const UserTemplateTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const UserTemplateTableHeader = styled.thead`
  background: rgba(0, 255, 136, 0.1);
`;

const UserTemplateTableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  &:hover {
    background: rgba(0, 255, 136, 0.05);
  }
`;

const UserTemplateTableCell = styled.td`
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  vertical-align: middle;
`;

const UserTemplateTableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  color: #00ff88;
  font-weight: 600;
  font-size: 0.9rem;
`;

const SendButton = styled(motion.button)`
  padding: 0.5rem 1rem;
  background: ${props => props.$sent ? 'rgba(0, 255, 136, 0.2)' : 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)'};
  border: 1px solid ${props => props.$sent ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 255, 136, 0.5)'};
  border-radius: 8px;
  color: ${props => props.$sent ? '#00ff88' : '#fff'};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: ${props => props.$sent ? 'default' : 'pointer'};
  transition: all 0.3s;
  
  &:hover {
    ${props => !props.$sent && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
    `}
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmailHistoryCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const HistoryTableHeader = styled.thead`
  background: rgba(0, 255, 136, 0.1);
`;

const HistoryTableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  &:hover {
    background: rgba(0, 255, 136, 0.05);
  }
`;

const HistoryTableCell = styled.td`
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const HistoryTableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  color: #00ff88;
  font-weight: 600;
  font-size: 0.9rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => props.$status === 'sent' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)'};
  color: ${props => props.$status === 'sent' ? '#00ff88' : '#ff4444'};
  border: 1px solid ${props => props.$status === 'sent' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)'};
`;

const TemplateSection = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const TemplateCard = styled(motion.div)`
  background: ${props => props.$selected ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
  border: 2px solid ${props => props.$selected ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: rgba(0, 255, 136, 0.5);
    background: rgba(0, 255, 136, 0.05);
    transform: translateY(-2px);
  }
`;

const TemplateIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TemplateTitle = styled.div`
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const TemplateDescription = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  line-height: 1.4;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
  }
  
  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
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
  background: ${props => props.$active ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? '#00ff88' : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${props => props.$active ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
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

const BulkEmailAdminPanel = () => {
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sendResult, setSendResult] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    body: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailHistory, setEmailHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showEmailHistory, setShowEmailHistory] = useState(false);
  const [emailStats, setEmailStats] = useState({});
  const [userTemplateStatus, setUserTemplateStatus] = useState({}); // {userId: {templateId: {sent: bool, sentAt: date}}}
  const [sendingToUser, setSendingToUser] = useState({}); // Track which user-template is being sent
  const [showUserTemplateTable, setShowUserTemplateTable] = useState(false);
  const [userTablePage, setUserTablePage] = useState(0);
  const [userTablePageSize, setUserTablePageSize] = useState(10);
  const [userTableTotalPages, setUserTableTotalPages] = useState(0);
  const [userTableTotalElements, setUserTableTotalElements] = useState(0);
  const [loadingUserTable, setLoadingUserTable] = useState(false);
  // Email history pagination
  const [historyPage, setHistoryPage] = useState(0);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [historyTotalElements, setHistoryTotalElements] = useState(0);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const hasAdminRole = user.roles?.includes('ROLE_ADMIN') || 
                          user.roles?.includes('ADMIN') ||
                          user.roles?.some(role => role.includes('ADMIN'));
      setIsAdmin(hasAdminRole);
      if (hasAdminRole) {
        fetchUserCount();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserCount = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUserCount();
      if (response.data && response.data.success) {
        setUserCount(response.data.data?.count || 0);
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await UserService.getAllUsers();
      if (response.data && response.data.success) {
        const userList = response.data.data || [];
        setUsers(userList);
        // Select all users by default
        const allIds = new Set(userList.map(u => u.id));
        setSelectedUserIds(allIds);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', false);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const filteredUsers = getFilteredUsers();
    const allIds = new Set(filteredUsers.map(u => u.id));
    setSelectedUserIds(allIds);
  };

  const deselectAll = () => {
    setSelectedUserIds(new Set());
  };

  const getFilteredUsers = () => {
    if (!searchTerm.trim()) {
      return users;
    }
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      (user.username && user.username.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term))
    );
  };

  // Email Templates
  const emailTemplates = {
    welcome: {
      id: 'welcome',
      name: 'Welcome Email',
      icon: '👋',
      description: 'Welcome new users to Typogram',
      subject: 'Welcome to Typogram - Start Your Typing Journey! 🎉',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Welcome to Typogram! 🎉</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your journey to typing mastery begins now</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hello there! 👋</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                We're thrilled to have you join the Typogram community! You've taken the first step towards becoming a typing master.
              </p>
              <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">🚀 Get Started:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>Explore our free typing courses</li>
                  <li>Take practice tests to improve your speed</li>
                  <li>Join our community challenges</li>
                  <li>Track your progress and achievements</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/courses" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">Start Practicing Now →</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Happy Typing!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #667eea; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #667eea; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #667eea; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    govtCourses: {
      id: 'govtCourses',
      name: 'Free Govt Exam Courses',
      icon: '📚',
      description: 'Promote free government exam courses',
      subject: '🎓 Free Government Exam Courses - Start Your Preparation Today!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎓 Free Government Exam Courses</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Prepare for SSC, RRB, Banking & More - 100% FREE!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Unlock Your Government Job Dreams! 🚀</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                We're excited to offer you <strong>FREE</strong> access to our comprehensive government exam typing courses. Perfect your typing skills for SSC, RRB, Banking, and other competitive exams.
              </p>
              <div style="background: linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%); border: 2px solid #f5576c; padding: 25px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <h3 style="margin: 0 0 15px; color: #f5576c; font-size: 22px;">✨ What's Included:</h3>
                <div style="color: #555555; font-size: 16px; line-height: 2;">
                  <div style="margin: 10px 0;">✅ SSC CGL Typing Tests</div>
                  <div style="margin: 10px 0;">✅ RRB Typing Practice</div>
                  <div style="margin: 10px 0;">✅ Banking Exam Preparation</div>
                  <div style="margin: 10px 0;">✅ Real Exam Pattern Tests</div>
                  <div style="margin: 10px 0;">✅ Performance Analytics</div>
                </div>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/courses" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4); text-transform: uppercase; letter-spacing: 1px;">Enroll Now - It's FREE! 🎁</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Don't miss this opportunity to boost your exam preparation!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #f5576c; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #f5576c; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #f5576c; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    newFeatures: {
      id: 'newFeatures',
      name: 'New Features Announcement',
      icon: '✨',
      description: 'Announce new features and updates',
      subject: '✨ Exciting New Features - Check Out What\'s New!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">✨ What's New at Typogram!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">We've been working hard to make your experience better</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Exciting Updates! 🎉</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                We're constantly improving Typogram to give you the best typing experience. Here are the latest features we've added:
              </p>
              <div style="margin: 30px 0;">
                <div style="background: #f0f9ff; border-left: 4px solid #4facfe; padding: 20px; margin-bottom: 15px; border-radius: 8px;">
                  <h3 style="margin: 0 0 10px; color: #333333; font-size: 18px;">🚀 Enhanced Performance Tracking</h3>
                  <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Track your progress with detailed analytics and insights.</p>
                </div>
                <div style="background: #f0f9ff; border-left: 4px solid #4facfe; padding: 20px; margin-bottom: 15px; border-radius: 8px;">
                  <h3 style="margin: 0 0 10px; color: #333333; font-size: 18px;">🎮 New Practice Games</h3>
                  <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Learn typing while having fun with our new interactive games.</p>
                </div>
                <div style="background: #f0f9ff; border-left: 4px solid #4facfe; padding: 20px; margin-bottom: 15px; border-radius: 8px;">
                  <h3 style="margin: 0 0 10px; color: #333333; font-size: 18px;">👥 Community Features</h3>
                  <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Connect with other learners, join challenges, and compete on leaderboards.</p>
                </div>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in" style="display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);">Explore New Features →</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                We'd love to hear your feedback!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #00f2fe; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #00f2fe; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #00f2fe; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    promotion: {
      id: 'promotion',
      name: 'General Promotion',
      icon: '🎁',
      description: 'General promotional email template',
      subject: '🎁 Special Offer - Don\'t Miss Out!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎁 Special Offer for You!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Limited time opportunity</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Exclusive Deal Just for You! 🎉</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                We have something special for our valued users! Take advantage of this limited-time offer to enhance your typing skills.
              </p>
              <div style="background: linear-gradient(135deg, #fa709a15 0%, #fee14015 100%); border: 2px dashed #fa709a; padding: 30px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
                <h3 style="margin: 0 0 10px; color: #fa709a; font-size: 28px; font-weight: 700;">Special Benefits</h3>
                <p style="margin: 0; color: #555555; font-size: 18px; line-height: 1.8;">
                  Access premium features<br>
                  Advanced practice tests<br>
                  Priority support<br>
                  And much more!
                </p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in" style="display: inline-block; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(250, 112, 154, 0.4); text-transform: uppercase; letter-spacing: 1px;">Claim Your Offer Now! 🚀</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                This offer won't last long!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #fa709a; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #fa709a; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #fa709a; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    maintenance: {
      id: 'maintenance',
      name: 'Maintenance Notice',
      icon: '🔧',
      description: 'System maintenance or update notice',
      subject: '🔧 Scheduled Maintenance - Important Notice',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🔧 Scheduled Maintenance</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">We're making improvements</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Important Notice</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                We'll be performing scheduled maintenance to improve your experience. During this time, some features may be temporarily unavailable.
              </p>
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #856404; font-size: 20px;">📅 Maintenance Schedule:</h3>
                <p style="margin: 0; color: #856404; font-size: 16px; line-height: 1.8;">
                  <strong>Date:</strong> [Insert Date]<br>
                  <strong>Time:</strong> [Insert Time]<br>
                  <strong>Duration:</strong> [Insert Duration]
                </p>
              </div>
              <p style="margin: 30px 0 0; color: #555555; font-size: 16px; line-height: 1.6;">
                We apologize for any inconvenience and appreciate your patience. We'll be back with an even better experience!
              </p>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Thank you for understanding,<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #667eea; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #667eea; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #667eea; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    howToUse: {
      id: 'howToUse',
      name: 'How to Use Typogram',
      icon: '📖',
      description: 'Guide users on how to use the platform',
      subject: '📖 How to Use Typogram - Your Complete Guide',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">📖 How to Use Typogram</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your step-by-step guide to mastering typing</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Welcome to Typogram! 🎉</h2>
              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">
                We're excited to help you improve your typing skills! Here's a comprehensive guide to get you started.
              </p>
              
              <div style="background: #f8f9fa; border-left: 4px solid #a8edea; padding: 25px; margin: 25px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">🚀 Step 1: Create Your Free Account</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Sign up for a free account to track your progress, save your results, and unlock all features. It only takes a minute!
                </p>
              </div>

              <div style="background: #f8f9fa; border-left: 4px solid #fed6e3; padding: 25px; margin: 25px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">📚 Step 2: Explore Free Courses</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Browse our extensive library of free typing courses. Start with beginner courses and gradually move to advanced levels.
                </p>
              </div>

              <div style="background: #f8f9fa; border-left: 4px solid #a8edea; padding: 25px; margin: 25px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">✍️ Step 3: Take Practice Tests</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Practice regularly with our typing tests. Choose from various categories: General Practice, SSC, RRB, Banking, and more.
                </p>
              </div>

              <div style="background: #f8f9fa; border-left: 4px solid #fed6e3; padding: 25px; margin: 25px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">🎯 Step 4: Try Demo Tests</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Before taking real exams, practice with our demo tests to familiarize yourself with the interface and test format.
                </p>
              </div>

              <div style="background: #f8f9fa; border-left: 4px solid #a8edea; padding: 25px; margin: 25px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">🏆 Step 5: Join Challenges & Races</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Participate in Daily Challenges, Race Mode, and Tournaments to compete with others and improve your skills.
                </p>
              </div>

              <div style="background: #f8f9fa; border-left: 4px solid #fed6e3; padding: 25px; margin: 25px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">👥 Step 6: Connect with Friends</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Add friends, chat with them, and challenge each other to typing races. Learning is more fun together!
                </p>
              </div>

              <div style="background: #f8f9fa; border-left: 4px solid #a8edea; padding: 25px; margin: 25px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">🎮 Step 7: Play Typing Games</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Make learning fun with our engaging typing games like Word Blaster. Improve your speed while having fun!
                </p>
              </div>

              <div style="background: #f8f9fa; border-left: 4px solid #fed6e3; padding: 25px; margin: 25px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">📊 Step 8: Track Your Progress</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  View your results, check leaderboards, and monitor your improvement over time. See how far you've come!
                </p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in" style="display: inline-block; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333333; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(168, 237, 234, 0.4);">Start Your Journey Now →</a>
              </div>

              <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 20px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <p style="margin: 0; color: #2e7d32; font-size: 16px; font-weight: 600;">
                  💡 Pro Tip: Practice for at least 15-20 minutes daily for best results!
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Need help? Visit our <a href="https://typogram.in/about" style="color: #a8edea; text-decoration: none;">About</a> page or <a href="https://typogram.in/contact" style="color: #fed6e3; text-decoration: none;">Contact Us</a>.<br>
                Happy Typing!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #a8edea; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #a8edea; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #a8edea; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    allFeatures: {
      id: 'allFeatures',
      name: 'All Features Showcase',
      icon: '🌟',
      description: 'Showcase all platform features',
      subject: '🌟 Discover All Typogram Features - Your Complete Typing Solution!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🌟 All Typogram Features</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Everything you need to master typing</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Your Complete Typing Solution 🚀</h2>
              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">
                Typogram offers a comprehensive platform with everything you need to improve your typing skills. Here's what you can do:
              </p>

              <div style="display: grid; gap: 20px; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 1px solid #667eea; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #667eea; font-size: 18px; font-weight: 700;">🏠 Home Dashboard</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Access all features from one central location. View your stats, recent activity, and quick links.</p>
                </div>

                <div style="background: linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%); border: 1px solid #f5576c; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #f5576c; font-size: 18px; font-weight: 700;">🆓 Free Account</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Create a free account to track progress, save results, and unlock all basic features. No credit card required!</p>
                </div>

                <div style="background: linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%); border: 1px solid #00f2fe; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #00f2fe; font-size: 18px; font-weight: 700;">📝 Exams</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Take real exam-style typing tests for SSC CGL, CHSL, RRB, Banking, and other competitive exams.</p>
                </div>

                <div style="background: linear-gradient(135deg, #43e97b15 0%, #38f9d715 100%); border: 1px solid #38f9d7; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #38f9d7; font-size: 18px; font-weight: 700;">✍️ Practice</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Practice typing with various difficulty levels. Improve speed, accuracy, and consistency.</p>
                </div>

                <div style="background: linear-gradient(135deg, #fa709a15 0%, #fee14015 100%); border: 1px solid #fee140; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #fee140; font-size: 18px; font-weight: 700;">🎯 Demo Test</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Try our demo tests to get familiar with the interface before taking real exams. Perfect for beginners!</p>
                </div>

                <div style="background: linear-gradient(135deg, #30cfd015 0%, #33086715 100%); border: 1px solid #330867; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #330867; font-size: 18px; font-weight: 700;">👥 Friends & Chat</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Connect with friends, send messages, and challenge each other to typing races. Make learning social!</p>
                </div>

                <div style="background: linear-gradient(135deg, #a8edea15 0%, #fed6e315 100%); border: 1px solid #fed6e3; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #fed6e3; font-size: 18px; font-weight: 700;">🎮 Typing Games</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Play fun typing games like Word Blaster. Improve your skills while having an amazing time!</p>
                </div>

                <div style="background: linear-gradient(135deg, #ff9a9e15 0%, #fecfef15 100%); border: 1px solid #fecfef; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #fecfef; font-size: 18px; font-weight: 700;">🔥 Daily Challenge</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Complete daily typing challenges to earn rewards and maintain your practice streak.</p>
                </div>

                <div style="background: linear-gradient(135deg, #ffecd215 0%, #fcb69f15 100%); border: 1px solid #fcb69f; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #fcb69f; font-size: 18px; font-weight: 700;">🏁 Race Mode</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Compete in real-time typing races with other users. See who can type the fastest!</p>
                </div>

                <div style="background: linear-gradient(135deg, #ff6e7f15 0%, #bfe9ff15 100%); border: 1px solid #bfe9ff; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #bfe9ff; font-size: 18px; font-weight: 700;">🏆 Tournaments</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Join scheduled tournaments and compete for top positions. Win prizes and recognition!</p>
                </div>

                <div style="background: linear-gradient(135deg, #c471ed15 0%, #f64f5915 100%); border: 1px solid #f64f59; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #f64f59; font-size: 18px; font-weight: 700;">📚 SSC CGL Typing Course</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Comprehensive course designed specifically for SSC CGL typing test preparation.</p>
                </div>

                <div style="background: linear-gradient(135deg, #12c2e915 0%, #c471ed15 100%); border: 1px solid #c471ed; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #c471ed; font-size: 18px; font-weight: 700;">📋 CHSL Typing Test</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Practice tests matching the exact pattern of SSC CHSL typing examination.</p>
                </div>

                <div style="background: linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%); border: 1px solid #f5576c; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #f5576c; font-size: 18px; font-weight: 700;">🚂 RRB Typing Course</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Specialized course for Railway Recruitment Board (RRB) typing test preparation.</p>
                </div>

                <div style="background: linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%); border: 1px solid #00f2fe; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #00f2fe; font-size: 18px; font-weight: 700;">🏦 Banking Typing Test</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Prepare for banking sector typing tests with our comprehensive practice modules.</p>
                </div>

                <div style="background: linear-gradient(135deg, #43e97b15 0%, #38f9d715 100%); border: 1px solid #38f9d7; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #38f9d7; font-size: 18px; font-weight: 700;">📰 Blog</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Read helpful articles, tips, and guides on typing improvement and exam preparation.</p>
                </div>

                <div style="background: linear-gradient(135deg, #fa709a15 0%, #fee14015 100%); border: 1px solid #fee140; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #fee140; font-size: 18px; font-weight: 700;">📊 Leaderboards</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">Check global and category-wise leaderboards. See where you rank among top typists!</p>
                </div>
              </div>

              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; margin: 40px 0; border-radius: 12px; text-align: center;">
                <h3 style="margin: 0 0 15px; color: #ffffff; font-size: 22px; font-weight: 700;">Ready to Get Started?</h3>
                <p style="margin: 0 0 20px; color: rgba(255,255,255,0.9); font-size: 16px;">
                  Join thousands of users improving their typing skills every day!
                </p>
                <a href="https://typogram.in" style="display: inline-block; background: #ffffff; color: #667eea; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">Explore All Features →</a>
              </div>

              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Have questions? Visit our <a href="https://typogram.in/about" style="color: #667eea; text-decoration: none;">About</a> page or <a href="https://typogram.in/contact" style="color: #764ba2; text-decoration: none;">Contact Us</a>.<br>
                Happy Typing!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #667eea; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #667eea; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #667eea; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    forestGroup: {
      id: 'forestGroup',
      name: 'Focus Forest Group',
      icon: '🌲',
      description: 'Promote Forest Group for focus and productivity',
      subject: '🌲 Join Focus Forest - Stay Focused, Stay Productive!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🌲 Focus Forest Group</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Beat phone addiction, boost productivity!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Struggling with Phone Distractions? 🌳</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Join our Focus Forest Group and transform your study habits! Track your focus sessions, compete in daily rankings, and stay accountable with a supportive community.
              </p>
              <div style="background: linear-gradient(135deg, #8bc34a15 0%, #689f3815 100%); border: 2px solid #8bc34a; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 15px; color: #689f38; font-size: 20px;">✨ What You Get:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>📊 Track your daily focus sessions</li>
                  <li>🏆 Compete in daily leaderboards</li>
                  <li>📱 Reduce phone usage with accountability</li>
                  <li>👥 Join a supportive WhatsApp community</li>
                  <li>📈 Monitor your productivity stats</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/community/forest-group" style="display: inline-block; background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(139, 195, 74, 0.4);">Join Focus Forest Now! 🌲</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Start your focus journey today!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #8bc34a; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #8bc34a; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #8bc34a; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    zenSessions: {
      id: 'zenSessions',
      name: 'Zen Sessions (Yoga & Meditation)',
      icon: '🧘',
      description: 'Promote daily yoga and meditation sessions',
      subject: '🧘 Daily Zen Sessions - Find Your Inner Peace!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🧘 Zen Sessions</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Daily yoga & meditation for calm & focus</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Find Your Inner Peace 🕉️</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Join our daily 30-minute yoga and meditation sessions led by a certified expert. Stay calm, focused, and energized throughout your study journey.
              </p>
              <div style="background: linear-gradient(135deg, #00bcd415 0%, #0097a715 100%); border: 2px solid #00bcd4; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 15px; color: #0097a7; font-size: 20px;">✨ What's Included:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>🧘 Daily 30-minute guided sessions</li>
                  <li>👨‍🏫 Led by certified yoga & meditation expert</li>
                  <li>😌 Reduce stress and anxiety</li>
                  <li>🎯 Improve focus and concentration</li>
                  <li>💪 Boost energy and mental clarity</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/community/yoga-meditation" style="display: inline-block; background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);">Join Zen Sessions! 🧘</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Start your journey to inner peace today!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #00bcd4; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #00bcd4; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #00bcd4; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    studyRoom247: {
      id: 'studyRoom247',
      name: '24/7 Study Room',
      icon: '📹',
      description: 'Promote 24/7 Study Room feature',
      subject: '📹 Join Our 24/7 Study Room - Study Anytime!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">📹 24/7 Study Room</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Study anytime with dedicated learners!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Study Anytime, Anywhere! 🌙</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Join our always-active Google Meet study room and study with dedicated learners from around the world. Build consistency, stay accountable, and achieve your goals together!
              </p>
              <div style="background: linear-gradient(135deg, #2196f315 0%, #1976d215 100%); border: 2px solid #2196f3; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 15px; color: #1976d2; font-size: 20px;">✨ Benefits:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>⏰ Available 24/7 - study whenever you want</li>
                  <li>👥 Study with motivated learners worldwide</li>
                  <li>📚 Build consistent study habits</li>
                  <li>💪 Stay accountable with peer support</li>
                  <li>🎯 Create a productive study environment</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/community/study-room" style="display: inline-block; background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);">Join Study Room Now! 📹</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Your study companions are waiting!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #2196f3; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #2196f3; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #2196f3; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    dawnDuskCircles: {
      id: 'dawnDuskCircles',
      name: 'Dawn & Dusk Circles',
      icon: '🌅',
      description: 'Promote early morning and late-night study groups',
      subject: '🌅 Join Dawn & Dusk Circles - Study at Your Perfect Time!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🌅 Dawn & Dusk Circles</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Study at your perfect time!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Find Your Study Tribe! 🌙</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Whether you're an early bird or a night owl, join our dedicated study groups that match your schedule. Connect with learners who share your study rhythm!
              </p>
              <div style="display: grid; gap: 20px; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #ff980015 0%, #f57c0015 100%); border: 2px solid #ff9800; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #f57c00; font-size: 18px;">🌅 Dawn Circle</h3>
                  <p style="margin: 0 0 10px; color: #555555; font-size: 14px;"><strong>Time:</strong> 5:00 AM - 10:00 AM</p>
                  <p style="margin: 0; color: #555555; font-size: 14px;">Rise with the sun and start your day with dedicated morning learners. Perfect for those who find clarity in the early hours.</p>
                </div>
                <div style="background: linear-gradient(135deg, #673ab715 0%, #512da815 100%); border: 2px solid #673ab7; padding: 20px; border-radius: 12px;">
                  <h3 style="margin: 0 0 10px; color: #512da8; font-size: 18px;">🌙 Dusk Circle</h3>
                  <p style="margin: 0 0 10px; color: #555555; font-size: 14px;"><strong>Time:</strong> 10:00 PM - 2:00 AM</p>
                  <p style="margin: 0; color: #555555; font-size: 14px;">Study under the moonlight with fellow night learners. Connect with souls who find peace in late-night study sessions.</p>
                </div>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/community/study-groups" style="display: inline-block; background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);">Join Your Circle! 🌅</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Find your perfect study time!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #9c27b0; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #9c27b0; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #9c27b0; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    innerPeaceHub: {
      id: 'innerPeaceHub',
      name: 'Inner Peace Hub',
      icon: '💚',
      description: 'Promote mental health support and webinars',
      subject: '💚 Inner Peace Hub - Free Mental Health Support!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">💚 Inner Peace Hub</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Free mental health support & webinars</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Your Mental Health Matters! 💚</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Join our Inner Peace Hub for free weekly live webinars with a psychiatrist, including live Q&A sessions. Get the mental health support you need on your learning journey.
              </p>
              <div style="background: linear-gradient(135deg, #e91e6315 0%, #c2185b15 100%); border: 2px solid #e91e63; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 15px; color: #c2185b; font-size: 20px;">✨ What's Included:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>🎓 Free weekly live webinars</li>
                  <li>👨‍⚕️ Sessions with qualified psychiatrist</li>
                  <li>💬 Live Q&A sessions</li>
                  <li>💚 Dedicated WhatsApp support group</li>
                  <li>🤝 Peer support and community</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/community/mental-health" style="display: inline-block; background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(233, 30, 99, 0.4);">Join Inner Peace Hub! 💚</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Your mental well-being is our priority!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #e91e63; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #e91e63; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #e91e63; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    studySoulmates: {
      id: 'studySoulmates',
      name: 'Study Soulmates',
      icon: '👥',
      description: 'Promote study partner matching feature',
      subject: '👥 Find Your Study Soulmate - Study Together!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">👥 Study Soulmates</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Find your perfect study partner!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Study Together, Achieve More! 🤝</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Connect with a study partner for your exam through our Find Study Partner group. Study together, stay motivated, and achieve your goals faster!
              </p>
              <div style="background: linear-gradient(135deg, #4caf5015 0%, #388e3c15 100%); border: 2px solid #4caf50; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 15px; color: #388e3c; font-size: 20px;">✨ Benefits:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>👥 Find study partners for your exam</li>
                  <li>💪 Stay motivated and accountable</li>
                  <li>📚 Share study resources and tips</li>
                  <li>🎯 Achieve goals faster together</li>
                  <li>🤝 Build lasting study friendships</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/community/study-buddy" style="display: inline-block; background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);">Find Your Study Soulmate! 👥</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Your study partner is waiting!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #4caf50; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #4caf50; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #4caf50; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    wisdomCircles: {
      id: 'wisdomCircles',
      name: 'Wisdom Circles',
      icon: '💬',
      description: 'Promote discussion groups and peer support',
      subject: '💬 Join Wisdom Circles - Connect & Learn Together!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">💬 Wisdom Circles</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Join dedicated discussion groups!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Connect & Learn Together! 📚</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Join our dedicated WhatsApp and Telegram groups for peer support and exam-specific discussions. Share knowledge, ask questions, and grow together!
              </p>
              <div style="background: linear-gradient(135deg, #ff980015 0%, #f57c0015 100%); border: 2px solid #ff9800; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 15px; color: #f57c00; font-size: 20px;">✨ What's Included:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>💬 Active WhatsApp discussion groups</li>
                  <li>📱 Telegram groups for quick updates</li>
                  <li>📚 Exam-specific study discussions</li>
                  <li>🤝 Peer support and guidance</li>
                  <li>💡 Share tips and strategies</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/community/discussion-groups" style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);">Join Wisdom Circles! 💬</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Your learning community awaits!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #ff9800; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #ff9800; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #ff9800; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    communityHub: {
      id: 'communityHub',
      name: 'All Community Features',
      icon: '🌟',
      description: 'Showcase all community features together',
      subject: '🌟 Discover Typogram Community - Join Our Amazing Features!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🌟 Typogram Community</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Join our amazing community features!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Your Complete Learning Community! 🚀</h2>
              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">
                Typogram offers a comprehensive community platform to support your learning journey. Join our amazing features and connect with learners worldwide!
              </p>
              <div style="display: grid; gap: 15px; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #8bc34a15 0%, #689f3815 100%); border: 1px solid #8bc34a; padding: 15px; border-radius: 10px;">
                  <h3 style="margin: 0 0 8px; color: #689f38; font-size: 16px; font-weight: 700;">🌲 Focus Forest</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">Beat phone addiction, track focus sessions, compete in daily rankings.</p>
                </div>
                <div style="background: linear-gradient(135deg, #00bcd415 0%, #0097a715 100%); border: 1px solid #00bcd4; padding: 15px; border-radius: 10px;">
                  <h3 style="margin: 0 0 8px; color: #0097a7; font-size: 16px; font-weight: 700;">🧘 Zen Sessions</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">Daily 30-minute yoga & meditation sessions with certified expert.</p>
                </div>
                <div style="background: linear-gradient(135deg, #2196f315 0%, #1976d215 100%); border: 1px solid #2196f3; padding: 15px; border-radius: 10px;">
                  <h3 style="margin: 0 0 8px; color: #1976d2; font-size: 16px; font-weight: 700;">📹 24/7 Study Room</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">Study anytime with dedicated learners in always-active Google Meet.</p>
                </div>
                <div style="background: linear-gradient(135deg, #9c27b015 0%, #7b1fa215 100%); border: 1px solid #9c27b0; padding: 15px; border-radius: 10px;">
                  <h3 style="margin: 0 0 8px; color: #7b1fa2; font-size: 16px; font-weight: 700;">🌅 Dawn & Dusk Circles</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">Join early morning or late-night study groups matching your schedule.</p>
                </div>
                <div style="background: linear-gradient(135deg, #e91e6315 0%, #c2185b15 100%); border: 1px solid #e91e63; padding: 15px; border-radius: 10px;">
                  <h3 style="margin: 0 0 8px; color: #c2185b; font-size: 16px; font-weight: 700;">💚 Inner Peace Hub</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">Free weekly mental health webinars with psychiatrist & live Q&A.</p>
                </div>
                <div style="background: linear-gradient(135deg, #4caf5015 0%, #388e3c15 100%); border: 1px solid #4caf50; padding: 15px; border-radius: 10px;">
                  <h3 style="margin: 0 0 8px; color: #388e3c; font-size: 16px; font-weight: 700;">👥 Study Soulmates</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">Find your perfect study partner for your exam preparation.</p>
                </div>
                <div style="background: linear-gradient(135deg, #ff980015 0%, #f57c0015 100%); border: 1px solid #ff9800; padding: 15px; border-radius: 10px;">
                  <h3 style="margin: 0 0 8px; color: #f57c00; font-size: 16px; font-weight: 700;">💬 Wisdom Circles</h3>
                  <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">Join WhatsApp & Telegram groups for peer support & discussions.</p>
                </div>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/community" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);">Explore All Features! 🌟</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Join thousands of learners in our community!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #a855f7; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #a855f7; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #a855f7; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    practiceReminder: {
      id: 'practiceReminder',
      name: 'Practice Reminder',
      icon: '⏰',
      description: 'Remind users to practice regularly',
      subject: '⏰ Don\'t Forget to Practice Today!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">⏰ Practice Time!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Consistency is the key to success</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Keep Your Streak Going! 🔥</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Just a friendly reminder - it's time to practice! Regular practice is the secret to improving your typing speed and accuracy.
              </p>
              <div style="background: linear-gradient(135deg, #ff6b6b15 0%, #ee5a6f15 100%); border: 2px solid #ff6b6b; padding: 25px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <h3 style="margin: 0 0 15px; color: #ee5a6f; font-size: 22px;">💪 Quick Practice Session</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.8;">
                  Even 10-15 minutes of practice can make a huge difference!<br>
                  Start your session now and maintain your progress.
                </p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/typing-display" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);">Start Practicing Now! ⏰</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Remember: Practice makes perfect!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #ff6b6b; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #ff6b6b; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #ff6b6b; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    achievementCelebration: {
      id: 'achievementCelebration',
      name: 'Achievement Celebration',
      icon: '🏆',
      description: 'Celebrate user achievements and milestones',
      subject: '🏆 Congratulations on Your Achievement!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🏆 Congratulations!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">You've reached a milestone!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">You're Amazing! 🎉</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                We noticed you've been making great progress! Your dedication and hard work are paying off. Keep up the excellent work!
              </p>
              <div style="background: linear-gradient(135deg, #fbbf2415 0%, #f59e0b15 100%); border: 2px solid #fbbf24; padding: 30px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 15px;">🎊</div>
                <h3 style="margin: 0 0 10px; color: #f59e0b; font-size: 24px; font-weight: 700;">Milestone Achieved!</h3>
                <p style="margin: 0; color: #555555; font-size: 18px; line-height: 1.8;">
                  Your consistent practice is showing results.<br>
                  You're on the right track to typing mastery!
                </p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in" style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);">Continue Your Journey! 🚀</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Keep pushing forward!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #fbbf24; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #fbbf24; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #fbbf24; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    examTips: {
      id: 'examTips',
      name: 'Exam Tips & Strategies',
      icon: '💡',
      description: 'Share exam tips and preparation strategies',
      subject: '💡 Top Typing Exam Tips - Ace Your Test!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">💡 Exam Success Tips</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Expert strategies to ace your typing test</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Master Your Typing Exam! 🎯</h2>
              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">
                Here are proven tips and strategies to help you excel in your typing examination:
              </p>
              
              <div style="background: #f0f4ff; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #4f46e5; font-size: 18px;">✅ Tip 1: Practice Daily</h3>
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Consistent daily practice for at least 20-30 minutes builds muscle memory and improves speed.</p>
              </div>

              <div style="background: #f0f4ff; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #4f46e5; font-size: 18px;">✅ Tip 2: Focus on Accuracy First</h3>
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Speed will come naturally. Prioritize accuracy - it's better to type correctly at 30 WPM than make errors at 50 WPM.</p>
              </div>

              <div style="background: #f0f4ff; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #4f46e5; font-size: 18px;">✅ Tip 3: Learn Proper Posture</h3>
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Sit straight, keep wrists elevated, and maintain proper finger placement on the keyboard.</p>
              </div>

              <div style="background: #f0f4ff; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #4f46e5; font-size: 18px;">✅ Tip 4: Take Demo Tests</h3>
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Familiarize yourself with the exam interface by taking demo tests before the actual exam.</p>
              </div>

              <div style="background: #f0f4ff; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #4f46e5; font-size: 18px;">✅ Tip 5: Stay Calm During Exam</h3>
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Take deep breaths, read the passage once before typing, and maintain a steady rhythm.</p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/courses" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);">Practice Now! 💡</a>
              </div>

              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                You've got this! Good luck with your exam!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #6366f1; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #6366f1; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #6366f1; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    reEngagement: {
      id: 'reEngagement',
      name: 'Re-engagement',
      icon: '👋',
      description: 'Re-engage inactive users',
      subject: '👋 We Miss You - Come Back to Typogram!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">👋 We Miss You!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your typing journey is waiting</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Come Back and Continue Your Progress! 🚀</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                We noticed you haven't practiced in a while. Don't let your progress slip away! Come back and pick up where you left off.
              </p>
              <div style="background: linear-gradient(135deg, #ec489915 0%, #be185d15 100%); border: 2px solid #ec4899; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 15px; color: #be185d; font-size: 20px;">✨ What's New Since You Left:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>🎮 New typing games and challenges</li>
                  <li>📚 More free courses added</li>
                  <li>🏆 Enhanced leaderboards</li>
                  <li>👥 Improved community features</li>
                  <li>📊 Better progress tracking</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);">Return to Typogram! 👋</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Your typing skills are waiting!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #ec4899; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #ec4899; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #ec4899; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    referralProgram: {
      id: 'referralProgram',
      name: 'Referral Program',
      icon: '🎁',
      description: 'Promote referral program and rewards',
      subject: '🎁 Invite Friends & Earn Rewards - Referral Program!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎁 Referral Program</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Invite friends and earn rewards!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Share Typogram & Earn Rewards! 💰</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Love Typogram? Share it with your friends and earn amazing rewards! For every friend you refer, both you and your friend get special benefits.
              </p>
              <div style="background: linear-gradient(135deg, #10b98115 0%, #05966915 100%); border: 2px solid #10b981; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 15px; color: #059669; font-size: 20px;">✨ How It Works:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>Get your unique referral link from your profile</li>
                  <li>Share it with friends via WhatsApp, email, or social media</li>
                  <li>When they sign up using your link, you both earn rewards!</li>
                  <li>Track your referrals and earnings in your dashboard</li>
                </ol>
              </div>
              <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <h3 style="margin: 0 0 10px; color: #059669; font-size: 22px;">🎯 Rewards Include:</h3>
                <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.8;">
                  Premium features access<br>
                  Exclusive course discounts<br>
                  Priority support<br>
                  And more exciting benefits!
                </p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/profile" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);">Get Your Referral Link! 🎁</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Start referring today and earn rewards!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #10b981; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #10b981; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #10b981; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    courseCompletion: {
      id: 'courseCompletion',
      name: 'Course Completion',
      icon: '🎓',
      description: 'Celebrate course completion',
      subject: '🎓 Congratulations on Completing Your Course!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎓 Course Completed!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">You've achieved a major milestone!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Outstanding Achievement! 🎉</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Congratulations on completing your typing course! Your dedication and consistent practice have paid off. You've taken a significant step towards typing mastery.
              </p>
              <div style="background: linear-gradient(135deg, #8b5cf615 0%, #7c3aed15 100%); border: 2px solid #8b5cf6; padding: 30px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 15px;">🏅</div>
                <h3 style="margin: 0 0 10px; color: #7c3aed; font-size: 24px; font-weight: 700;">Course Mastered!</h3>
                <p style="margin: 0; color: #555555; font-size: 18px; line-height: 1.8;">
                  You've successfully completed all lessons and tests.<br>
                  Your typing skills have improved significantly!
                </p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/courses" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);">Explore More Courses! 🎓</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Keep learning and improving!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #8b5cf6; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #8b5cf6; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #8b5cf6; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    weeklyDigest: {
      id: 'weeklyDigest',
      name: 'Weekly Digest',
      icon: '📰',
      description: 'Weekly summary of activity and tips',
      subject: '📰 Your Weekly Typogram Digest',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">📰 Weekly Digest</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your weekly summary and updates</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Your Week at Typogram! 📊</h2>
              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">
                Here's a summary of your activity and what's happening at Typogram this week:
              </p>
              
              <div style="background: #f0f9ff; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #0891b2; font-size: 18px;">📈 Your Progress This Week</h3>
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Keep up the great work! Your consistent practice is showing results.</p>
              </div>

              <div style="background: #f0f9ff; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #0891b2; font-size: 18px;">🎯 This Week's Challenges</h3>
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">New daily challenges and tournaments are waiting for you. Join now!</p>
              </div>

              <div style="background: #f0f9ff; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #0891b2; font-size: 18px;">💡 Tip of the Week</h3>
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">Practice typing common words and phrases from your exam syllabus. This will help you type faster during the actual test!</p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);">Continue Your Journey! 📰</a>
              </div>

              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Have a great week ahead!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #06b6d4; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #06b6d4; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #06b6d4; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    examReminder: {
      id: 'examReminder',
      name: 'Exam Reminder',
      icon: '📅',
      description: 'Remind users about upcoming exams',
      subject: '📅 Important: Your Typing Exam is Coming Up!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">📅 Exam Reminder</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your exam date is approaching!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Don't Forget Your Exam! ⚠️</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Your typing examination is coming up soon! Make sure you're fully prepared. Here's a quick checklist to help you succeed:
              </p>
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 25px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #dc2626; font-size: 20px;">✅ Pre-Exam Checklist:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>Take demo tests to familiarize with the interface</li>
                  <li>Practice daily for at least 30 minutes</li>
                  <li>Review exam pattern and requirements</li>
                  <li>Ensure stable internet connection</li>
                  <li>Keep your device charged and ready</li>
                  <li>Get a good night's sleep before the exam</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/courses" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);">Practice Now! 📅</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                You've got this! Good luck! 🍀<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #ef4444; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #ef4444; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #ef4444; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    communityInvite: {
      id: 'communityInvite',
      name: 'Community Invitation',
      icon: '👥',
      description: 'Invite users to join community groups',
      subject: '👥 Join Our Amazing Community - Connect with Learners!',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">👥 Join Our Community!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Connect with thousands of learners</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Be Part of Something Amazing! 🌟</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Join our vibrant community of typing enthusiasts! Connect with fellow learners, share tips, ask questions, and grow together.
              </p>
              <div style="background: linear-gradient(135deg, #14b8a615 0%, #0d948815 100%); border: 2px solid #14b8a6; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 15px; color: #0d9488; font-size: 20px;">✨ Community Benefits:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li>💬 Active discussion groups</li>
                  <li>📚 Share study resources</li>
                  <li>🎯 Get exam tips and strategies</li>
                  <li>🏆 Participate in challenges</li>
                  <li>🤝 Find study partners</li>
                  <li>💡 Learn from experienced members</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/community" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);">Join Community Now! 👥</a>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                We can't wait to have you!<br>
                <strong>The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #14b8a6; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #14b8a6; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #14b8a6; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    cglExamLive: {
      id: 'cglExamLive',
      name: 'CGL Exam Live Tests Announcement',
      icon: '📝',
      description: 'Announce free live tests for CGL exam preparation',
      subject: '🎯 FREE Live Tests Available! Prepare for SSC CGL Exam on 18th January',
      body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎯 FREE Live Tests Available!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 600;">SSC CGL Exam on 18th January</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Prepare Before Your Exam! 📚</h2>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Dear Aspirant,
              </p>
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                We're excited to announce that <strong>FREE live typing tests</strong> are now available on Typogram! With the SSC CGL exam scheduled for <strong>18th January</strong>, this is the perfect time to practice and improve your typing skills.
              </p>
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 5px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">✨ What's Available:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                  <li><strong>FREE Live Typing Tests</strong> - Practice in real exam conditions</li>
                  <li><strong>SSC CGL Specific Tests</strong> - Designed as per exam pattern</li>
                  <li><strong>Real-time Leaderboard</strong> - Compete with other aspirants</li>
                  <li><strong>Detailed Performance Analysis</strong> - Track your progress</li>
                  <li><strong>Instant Results</strong> - Know your WPM, accuracy & errors immediately</li>
                </ul>
              </div>
              <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="margin: 0; color: #856404; font-size: 18px; font-weight: 600;">
                  ⏰ Exam Date: <span style="color: #d9534f;">18th January 2024</span>
                </p>
                <p style="margin: 10px 0 0; color: #856404; font-size: 16px;">
                  Don't wait! Start practicing now and be exam-ready!
                </p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://typogram.in/live-exams" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5); transition: transform 0.2s;">Start Free Live Tests Now →</a>
              </div>
              <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #1976D2; font-size: 18px;">💡 Pro Tips:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.7;">
                  <li>Practice daily to build muscle memory</li>
                  <li>Focus on accuracy first, then speed</li>
                  <li>Take multiple tests to get familiar with exam format</li>
                  <li>Review your mistakes and improve</li>
                </ul>
              </div>
              <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6; text-align: center;">
                Best of luck for your exam!<br>
                <strong style="color: #667eea;">The Typogram Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="https://instagram.com/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">📷</span>
                </a>
                <a href="https://t.me/typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">✈️</span>
                </a>
                <a href="https://youtube.com/@typogram_in" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <span style="font-size: 24px;">▶️</span>
                </a>
              </div>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                © 2024 Typogram. All rights reserved.
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                Follow us: <a href="https://instagram.com/typogram_in" style="color: #667eea; text-decoration: none;">Instagram</a> | <a href="https://t.me/typogram_in" style="color: #667eea; text-decoration: none;">Telegram</a> | <a href="https://youtube.com/@typogram_in" style="color: #667eea; text-decoration: none;">YouTube</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
  };

  const handleTemplateSelect = (templateId) => {
    if (templateId === '') {
      setSelectedTemplate('');
      return;
    }
    
    const template = emailTemplates[templateId];
    if (template) {
      setSelectedTemplate(templateId);
      setFormData({
        subject: template.subject,
        body: template.body
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      showNotification('Subject is required', false);
      return;
    }
    
    if (!formData.body.trim()) {
      showNotification('Email body is required', false);
      return;
    }

    // If no users are selected, load all users and select them
    let finalSelectedIds = Array.from(selectedUserIds);
    
    if (finalSelectedIds.length === 0) {
      // If user list hasn't been loaded, fetch it first
      if (users.length === 0) {
        try {
          setLoadingUsers(true);
          const response = await UserService.getAllUsers();
          if (response.data && response.data.success) {
            const userList = response.data.data || [];
            setUsers(userList);
            // Select all users
            finalSelectedIds = userList.map(u => u.id);
            setSelectedUserIds(new Set(finalSelectedIds));
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          showNotification('Failed to load users. Please select users manually.', false);
          return;
        } finally {
          setLoadingUsers(false);
        }
      } else {
        // Users are loaded but none selected - select all
        finalSelectedIds = users.map(u => u.id);
        setSelectedUserIds(new Set(finalSelectedIds));
      }
    }

    if (finalSelectedIds.length === 0) {
      showNotification('No users available to send email to', false);
      return;
    }

    if (!window.confirm(`Are you sure you want to send this email to ${finalSelectedIds.length} user(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setSending(true);
      setSendResult(null);
      
      // Ensure IDs are numbers, not strings
      const numericIds = finalSelectedIds
        .filter(id => id != null) // Remove null/undefined
        .map(id => {
          if (typeof id === 'string') {
            const parsed = parseInt(id, 10);
            return isNaN(parsed) ? null : parsed;
          }
          return typeof id === 'number' ? id : null;
        })
        .filter(id => id != null); // Remove any that couldn't be converted
      
      if (numericIds.length === 0) {
        showNotification('No valid user IDs found. Please select users and try again.', false);
        setSending(false);
        return;
      }
      
      const response = await UserService.sendBulkEmail(
        formData.subject, 
        formData.body, 
        numericIds,
        selectedTemplate || null
      );
      
      if (response.data && response.data.success) {
        setSendResult(response.data.data);
        const sentCount = response.data.data.emailsSent || 0;
        const selectedCount = response.data.data.selectedUsers || 0;
        
        if (sentCount === 0 && selectedCount === 0) {
          showNotification('No emails were sent. Please check if users have valid email addresses.', false);
        } else {
          showNotification(`Email sent successfully! ${sentCount} emails delivered to ${selectedCount} selected user(s).`, true);
        }
        // Clear form after successful send
        setFormData({ subject: '', body: '' });
        setSelectedTemplate('');
        // Refresh email history
        if (showEmailHistory) {
          fetchEmailHistory(historyPage, historyPageSize);
        }
      } else {
        showNotification(response.data?.message || 'Failed to send bulk email', false);
      }
    } catch (error) {
      console.error('Error sending bulk email:', error);
      showNotification(error.response?.data?.message || 'Failed to send bulk email', false);
    } finally {
      setSending(false);
    }
  };

  const fetchEmailHistory = async (page = historyPage, size = historyPageSize) => {
    try {
      setLoadingHistory(true);
      const response = await UserService.getEmailHistory(page, size);
      if (response.data && response.data.success) {
        const data = response.data.data;
        setEmailHistory(data?.emailHistory || data?.content || []);
        setHistoryTotalPages(data?.totalPages || 0);
        setHistoryTotalElements(data?.totalElements || 0);
        setHistoryPage(data?.currentPage || page);
      }
    } catch (error) {
      console.error('Error fetching email history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchEmailStatistics = async () => {
    try {
      const response = await UserService.getEmailStatistics();
      if (response.data && response.data.success) {
        setEmailStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Error fetching email statistics:', error);
    }
  };

  useEffect(() => {
    if (showEmailHistory) {
      fetchEmailHistory(0, historyPageSize);
      fetchEmailStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmailHistory]);

  // Refetch email history when page or page size changes
  useEffect(() => {
    if (showEmailHistory && historyPage >= 0) {
      fetchEmailHistory(historyPage, historyPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPage, historyPageSize]);

  // Fetch paginated users for the table
  const fetchUsersForTable = async (page = userTablePage, size = userTablePageSize) => {
    try {
      setLoadingUserTable(true);
      const response = await UserService.getUsersPaginated(page, size);
      if (response.data && response.data.success) {
        const data = response.data.data;
        setUsers(data.content || []);
        setUserTableTotalPages(data.totalPages || 0);
        setUserTableTotalElements(data.totalElements || 0);
        setUserTablePage(data.currentPage || 0);
        
        // Fetch bulk status for these users
        if (data.content && data.content.length > 0) {
          await fetchUserTemplateStatusBulk(data.content);
        }
      }
    } catch (error) {
      console.error('Error fetching users for table:', error);
      showNotification('Failed to load users', false);
    } finally {
      setLoadingUserTable(false);
    }
  };

  // Fetch user-template status in bulk (single API call)
  const fetchUserTemplateStatusBulk = async (userList) => {
    if (!userList || userList.length === 0) return;
    
    try {
      const userIds = userList.map(u => u.id);
      const templateIds = Object.keys(emailTemplates);
      
      if (userIds.length === 0 || templateIds.length === 0) return;
      
      const response = await UserService.getBulkUserTemplateStatus(userIds, templateIds);
      if (response.data && response.data.success) {
        const statusMap = {};
        const bulkStatus = response.data.data;
        
        // Convert the response to our format
        for (const userId of userIds) {
          statusMap[userId] = {};
          const userStatus = bulkStatus[userId.toString()] || {};
          for (const templateId of templateIds) {
            const templateStatus = userStatus[templateId] || {};
            statusMap[userId][templateId] = {
              sent: templateStatus.sent || false,
              sentAt: templateStatus.sentAt || null
            };
          }
        }
        
        setUserTemplateStatus(prev => ({ ...prev, ...statusMap }));
      }
    } catch (error) {
      console.error('Error fetching bulk user-template status:', error);
    }
  };

  useEffect(() => {
    if (showUserTemplateTable) {
      fetchUsersForTable(0, userTablePageSize);
    }
  }, [showUserTemplateTable]);

  // Refetch status when page changes
  useEffect(() => {
    if (showUserTemplateTable && users.length > 0) {
      fetchUserTemplateStatusBulk(users);
    }
  }, [userTablePage]);

  // Send email to a specific user with a specific template
  const sendEmailToUser = async (userId, templateId) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.email) {
      showNotification('User email not found', false);
      return;
    }

    const template = emailTemplates[templateId];
    if (!template) {
      showNotification('Template not found', false);
      return;
    }

    if (!window.confirm(`Send "${template.name}" to ${user.username} (${user.email})?`)) {
      return;
    }

    try {
      setSendingToUser(prev => ({ ...prev, [`${userId}-${templateId}`]: true }));
      
      const response = await UserService.sendBulkEmail(
        template.subject,
        template.body,
        [userId],
        templateId
      );

      if (response.data && response.data.success) {
        showNotification(`Email sent to ${user.username}!`, true);
        // Update status
        setUserTemplateStatus(prev => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            [templateId]: {
              sent: true,
              sentAt: new Date().toISOString()
            }
          }
        }));
        // Refresh email history if shown
        if (showEmailHistory) {
          fetchEmailHistory(historyPage, historyPageSize);
          fetchEmailStatistics();
        }
      } else {
        showNotification('Failed to send email', false);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showNotification(error.response?.data?.message || 'Failed to send email', false);
    } finally {
      setSendingToUser(prev => {
        const newState = { ...prev };
        delete newState[`${userId}-${templateId}`];
        return newState;
      });
    }
  };

  const showNotification = (message, success) => {
    setNotification({ message, success });
    setTimeout(() => setNotification(null), 5000);
  };

  if (!isAdmin) {
    return (
      <AdminContainer>
        <Title><FiMail /> Bulk Email</Title>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          You don't have permission to access this page.
        </div>
      </AdminContainer>
    );
  }

  if (loading) {
    return (
      <AdminContainer>
        <Title><FiMail /> Bulk Email</Title>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          Loading...
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title><FiMail /> Bulk Email</Title>
        <ActionButton
          onClick={fetchUserCount}
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
          <StatNumber>{selectedUserIds.size}</StatNumber>
          <StatLabel>Selected Users</StatLabel>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowEmailHistory(!showEmailHistory)}
          style={{ cursor: 'pointer' }}
        >
          <StatNumber>{Object.values(emailStats).reduce((sum, count) => sum + count, 0)}</StatNumber>
          <StatLabel>Total Emails Sent</StatLabel>
        </StatCard>
      </StatsContainer>

      <UserTemplateTableCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#00ff88', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUsers /> User Template Management
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              View and send emails to users by template
            </p>
          </div>
          <ActionButton
            onClick={() => {
              setShowUserTemplateTable(!showUserTemplateTable);
              if (!showUserTemplateTable) {
                fetchUsersForTable(0, userTablePageSize);
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showUserTemplateTable ? <FiX /> : <FiUsers />}
            {showUserTemplateTable ? 'Hide' : 'Show'} Table
          </ActionButton>
        </div>

        {showUserTemplateTable && (
          <div>
            {loadingUserTable ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                <FiLoader style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', marginBottom: '1rem' }} />
                <div>Loading users...</div>
              </div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                No users found.
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <UserTemplateTable>
                  <UserTemplateTableHeader>
                    <UserTemplateTableRow>
                      <UserTemplateTableHeaderCell>User</UserTemplateTableHeaderCell>
                      <UserTemplateTableHeaderCell>Email</UserTemplateTableHeaderCell>
                      {Object.values(emailTemplates).map((template) => (
                        <UserTemplateTableHeaderCell key={template.id}>
                          {template.icon} {template.name}
                        </UserTemplateTableHeaderCell>
                      ))}
                    </UserTemplateTableRow>
                  </UserTemplateTableHeader>
                  <tbody>
                    {users.map((user) => {
                      const userStatus = userTemplateStatus[user.id] || {};
                      return (
                        <UserTemplateTableRow key={user.id}>
                          <UserTemplateTableCell>
                            <div>
                              <div style={{ fontWeight: '600', color: '#fff' }}>{user.username || 'Unknown'}</div>
                              {user.createdAt && (
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </UserTemplateTableCell>
                          <UserTemplateTableCell>
                            <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{user.email || 'No email'}</div>
                          </UserTemplateTableCell>
                          {Object.values(emailTemplates).map((template) => {
                            const status = userStatus[template.id] || { sent: false, sentAt: null };
                            const isSending = sendingToUser[`${user.id}-${template.id}`];
                            return (
                              <UserTemplateTableCell key={template.id}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                                  <SendButton
                                    $sent={status.sent}
                                    onClick={() => !status.sent && !isSending && sendEmailToUser(user.id, template.id)}
                                    disabled={status.sent || isSending}
                                    whileHover={!status.sent && !isSending ? { scale: 1.05 } : {}}
                                    whileTap={!status.sent && !isSending ? { scale: 0.95 } : {}}
                                  >
                                    {isSending ? (
                                      <>
                                        <FiLoader style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '0.5rem' }} />
                                        Sending...
                                      </>
                                    ) : status.sent ? (
                                      <>
                                        <FiCheck style={{ marginRight: '0.5rem' }} />
                                        Sent
                                      </>
                                    ) : (
                                      <>
                                        <FiSend style={{ marginRight: '0.5rem' }} />
                                        Send
                                      </>
                                    )}
                                  </SendButton>
                                  {status.sent && status.sentAt && (
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                      {new Date(status.sentAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </UserTemplateTableCell>
                            );
                          })}
                        </UserTemplateTableRow>
                      );
                    })}
                  </tbody>
                </UserTemplateTable>
                </div>
                {/* Pagination Controls */}
                {userTableTotalPages > 0 && (
                  <PaginationContainer>
                    <PaginationInfo>
                      Showing {users.length > 0 ? (userTablePage * userTablePageSize + 1) : 0} - {Math.min((userTablePage + 1) * userTablePageSize, userTableTotalElements)} of {userTableTotalElements} users
                    </PaginationInfo>
                    <PaginationControls>
                      <PageSizeSelect
                        value={userTablePageSize}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value);
                          setUserTablePageSize(newSize);
                          fetchUsersForTable(0, newSize);
                        }}
                      >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                      </PageSizeSelect>
                      <PageButton
                        onClick={() => fetchUsersForTable(0, userTablePageSize)}
                        disabled={userTablePage === 0 || loadingUserTable}
                      >
                        First
                      </PageButton>
                      <PageButton
                        onClick={() => fetchUsersForTable(userTablePage - 1, userTablePageSize)}
                        disabled={userTablePage === 0 || loadingUserTable}
                      >
                        Previous
                      </PageButton>
                      <span style={{ color: 'rgba(255,255,255,0.7)', padding: '0 0.5rem' }}>
                        Page {userTablePage + 1} of {userTableTotalPages}
                      </span>
                      <PageButton
                        onClick={() => fetchUsersForTable(userTablePage + 1, userTablePageSize)}
                        disabled={userTablePage >= userTableTotalPages - 1 || loadingUserTable}
                      >
                        Next
                      </PageButton>
                      <PageButton
                        onClick={() => fetchUsersForTable(userTableTotalPages - 1, userTablePageSize)}
                        disabled={userTablePage >= userTableTotalPages - 1 || loadingUserTable}
                      >
                        Last
                      </PageButton>
                    </PaginationControls>
                  </PaginationContainer>
                )}
              </>
            )}
          </div>
        )}
      </UserTemplateTableCard>

      <EmailHistoryCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#00ff88', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFileText /> Email History
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Track which users have received which email templates
            </p>
          </div>
          <ActionButton
            onClick={() => {
              setShowEmailHistory(!showEmailHistory);
              if (!showEmailHistory) {
                fetchEmailHistory(historyPage, historyPageSize);
                fetchEmailStatistics();
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showEmailHistory ? <FiX /> : <FiFileText />}
            {showEmailHistory ? 'Hide' : 'Show'} History
          </ActionButton>
        </div>

        {showEmailHistory && (
          <div>
            {Object.keys(emailStats).length > 0 && (
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {Object.entries(emailStats).map(([templateId, count]) => (
                  <div key={templateId} style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}>
                    <span style={{ color: '#00ff88', fontSize: '0.85rem', fontWeight: '600' }}>
                      {emailTemplates[templateId]?.name || templateId}
                    </span>
                    <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                <FiLoader style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', marginBottom: '1rem' }} />
                <div>Loading email history...</div>
              </div>
            ) : emailHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                No email history found. Start sending emails to see history here.
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <HistoryTable>
                    <HistoryTableHeader>
                      <HistoryTableRow>
                        <HistoryTableHeaderCell>User</HistoryTableHeaderCell>
                        <HistoryTableHeaderCell>Email</HistoryTableHeaderCell>
                        <HistoryTableHeaderCell>Template</HistoryTableHeaderCell>
                        <HistoryTableHeaderCell>Subject</HistoryTableHeaderCell>
                        <HistoryTableHeaderCell>Status</HistoryTableHeaderCell>
                        <HistoryTableHeaderCell>Sent At</HistoryTableHeaderCell>
                      </HistoryTableRow>
                    </HistoryTableHeader>
                    <tbody>
                      {emailHistory.map((history) => (
                        <HistoryTableRow key={history.id}>
                          <HistoryTableCell>
                            {history.user?.username || 'Unknown'}
                          </HistoryTableCell>
                          <HistoryTableCell>
                            {history.emailAddress || history.user?.email || 'N/A'}
                          </HistoryTableCell>
                          <HistoryTableCell>
                            {emailTemplates[history.templateId]?.name || history.templateId || 'Custom'}
                          </HistoryTableCell>
                          <HistoryTableCell>
                            {history.subject || 'N/A'}
                          </HistoryTableCell>
                          <HistoryTableCell>
                            <StatusBadge $status={history.status || 'sent'}>
                              {history.status || 'sent'}
                            </StatusBadge>
                          </HistoryTableCell>
                          <HistoryTableCell>
                            {history.sentAt ? new Date(history.sentAt).toLocaleString() : 'N/A'}
                          </HistoryTableCell>
                        </HistoryTableRow>
                      ))}
                    </tbody>
                  </HistoryTable>
                </div>
                {/* Pagination Controls for Email History */}
                {historyTotalPages > 0 && (
                  <PaginationContainer>
                    <PaginationInfo>
                      Showing {emailHistory.length > 0 ? (historyPage * historyPageSize + 1) : 0} - {Math.min((historyPage + 1) * historyPageSize, historyTotalElements)} of {historyTotalElements} emails
                    </PaginationInfo>
                    <PaginationControls>
                      <PageSizeSelect
                        value={historyPageSize}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value);
                          setHistoryPageSize(newSize);
                          fetchEmailHistory(0, newSize);
                        }}
                      >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                      </PageSizeSelect>
                      <PageButton
                        onClick={() => fetchEmailHistory(0, historyPageSize)}
                        disabled={historyPage === 0 || loadingHistory}
                      >
                        First
                      </PageButton>
                      <PageButton
                        onClick={() => fetchEmailHistory(historyPage - 1, historyPageSize)}
                        disabled={historyPage === 0 || loadingHistory}
                      >
                        Previous
                      </PageButton>
                      <span style={{ color: 'rgba(255,255,255,0.7)', padding: '0 0.5rem' }}>
                        Page {historyPage + 1} of {historyTotalPages}
                      </span>
                      <PageButton
                        onClick={() => fetchEmailHistory(historyPage + 1, historyPageSize)}
                        disabled={historyPage >= historyTotalPages - 1 || loadingHistory}
                      >
                        Next
                      </PageButton>
                      <PageButton
                        onClick={() => fetchEmailHistory(historyTotalPages - 1, historyPageSize)}
                        disabled={historyPage >= historyTotalPages - 1 || loadingHistory}
                      >
                        Last
                      </PageButton>
                    </PaginationControls>
                  </PaginationContainer>
                )}
              </>
            )}
          </div>
        )}
      </EmailHistoryCard>

      <UserSelectionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <UserSelectionHeader>
          <div>
            <h3 style={{ color: '#00ff88', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
              Select Users
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
              Choose which users should receive this email. By default, all users are selected.
            </p>
          </div>
          <ActionButton
            onClick={() => {
              setShowUserSelection(!showUserSelection);
              if (!showUserSelection && users.length === 0) {
                fetchUsers();
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showUserSelection ? <FiX /> : <FiUsers />}
            {showUserSelection ? 'Hide' : 'Show'} User List
          </ActionButton>
        </UserSelectionHeader>

        {showUserSelection && (
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                <FiSearch style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255, 255, 255, 0.5)' 
                }} />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username or email..."
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              <SelectionControls>
                <ActionButton
                  onClick={selectAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiCheckSquare /> Select All
                </ActionButton>
                <ActionButton
                  onClick={deselectAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiSquare /> Deselect All
                </ActionButton>
              </SelectionControls>
            </div>

            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                <FiLoader style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', marginBottom: '1rem' }} />
                <div>Loading users...</div>
              </div>
            ) : (
              <UserListContainer>
                {getFilteredUsers().length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                  </div>
                ) : (
                  getFilteredUsers().map(user => (
                    <UserItem key={user.id}>
                      <Checkbox
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                      <UserInfo>
                        <UserName>{user.username || 'Unknown'}</UserName>
                        <UserEmail>{user.email || 'No email'}</UserEmail>
                        {user.createdAt && (
                          <UserSignupDate>
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </UserSignupDate>
                        )}
                      </UserInfo>
                    </UserItem>
                  ))
                )}
              </UserListContainer>
            )}
          </div>
        )}
      </UserSelectionCard>

      <TemplateSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <FiFileText style={{ fontSize: '1.5rem', color: '#00ff88' }} />
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>Email Templates</h2>
        </div>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Choose a beautiful pre-designed template or create your own custom email
        </p>
        
        <TemplateGrid>
          {Object.values(emailTemplates).map((template) => (
            <TemplateCard
              key={template.id}
              $selected={selectedTemplate === template.id}
              onClick={() => handleTemplateSelect(template.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TemplateIcon>{template.icon}</TemplateIcon>
              <TemplateTitle>{template.name}</TemplateTitle>
              <TemplateDescription>{template.description}</TemplateDescription>
            </TemplateCard>
          ))}
        </TemplateGrid>
        
        {selectedTemplate && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#00ff88', fontWeight: '600' }}>
              ✓ Template "{emailTemplates[selectedTemplate].name}" selected
            </span>
            <ActionButton
              onClick={() => handleTemplateSelect('')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiX /> Clear Template
            </ActionButton>
          </div>
        )}
      </TemplateSection>

      <EmailForm
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <form onSubmit={handleSubmit}>
          <InfoBox>
            <FiUsers style={{ fontSize: '1.25rem', color: '#00d4ff', marginTop: '0.25rem' }} />
            <div>
              <div style={{ fontWeight: '600', color: '#00d4ff', marginBottom: '0.25rem' }}>
                Bulk Email to Selected Users
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                This email will be sent to {selectedUserIds.size} selected user(s) out of {userCount} total users. Use the user selection panel above to choose recipients.
              </div>
            </div>
          </InfoBox>

          <WarningBox>
            <FiAlertCircle style={{ fontSize: '1.25rem', color: '#ffc107', marginTop: '0.25rem' }} />
            <div>
              <div style={{ fontWeight: '600', color: '#ffc107', marginBottom: '0.25rem' }}>
                Important Notice
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                This is different from the newsletter. This email will be sent to ALL users regardless of their newsletter subscription status. Please use this feature responsibly.
              </div>
            </div>
          </WarningBox>

          <FormGroup>
            <Label>Email Subject *</Label>
            <Input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., New Feature Update: Enhanced Typing Experience"
              required
              disabled={sending}
            />
          </FormGroup>

          <FormGroup>
            <Label>Email Body (HTML supported) *</Label>
            <TextArea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Enter your email content here. You can use HTML for formatting..."
              required
              disabled={sending}
            />
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.85rem', 
              color: 'rgba(255, 255, 255, 0.5)' 
            }}>
              Tip: You can use HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;a href="..."&gt; for formatting.
            </div>
          </FormGroup>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <ActionButton
              type="button"
              onClick={() => setFormData({ subject: '', body: '' })}
              disabled={sending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiX /> Clear
            </ActionButton>
            <ActionButton
              type="submit"
              $primary
              disabled={sending || !formData.subject.trim() || !formData.body.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {sending ? (
                <>
                  <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> Sending...
                </>
              ) : (
                <>
                  <FiSend /> Send to {selectedUserIds.size} Selected User{selectedUserIds.size !== 1 ? 's' : ''}
                </>
              )}
            </ActionButton>
          </div>
        </form>
      </EmailForm>

      {sendResult && (
        <ResultCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 style={{ 
            color: '#00ff88', 
            marginBottom: '1.5rem', 
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            Send Results
          </h3>
          <ResultItem>
            <ResultLabel>Total Users</ResultLabel>
            <ResultValue>{sendResult.totalUsers || 0}</ResultValue>
          </ResultItem>
          <ResultItem>
            <ResultLabel>Selected Users</ResultLabel>
            <ResultValue>{sendResult.selectedUsers || 0}</ResultValue>
          </ResultItem>
          <ResultItem>
            <ResultLabel>Emails Sent Successfully</ResultLabel>
            <ResultValue style={{ color: '#00ff88' }}>
              {sendResult.emailsSent || 0}
            </ResultValue>
          </ResultItem>
          <ResultItem>
            <ResultLabel>Emails Failed</ResultLabel>
            <ResultValue style={{ color: sendResult.emailsFailed > 0 ? '#ff4444' : '#00ff88' }}>
              {sendResult.emailsFailed || 0}
            </ResultValue>
          </ResultItem>
        </ResultCard>
      )}

      <AnimatePresence>
        {notification && (
          <Notification
            $success={notification.success}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            {notification.success ? <FiCheck /> : <FiX />}
            {notification.message}
          </Notification>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sending && (
          <LoadingOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FiLoader style={{ fontSize: '3rem', color: '#00ff88', animation: 'spin 1s linear infinite' }} />
            <LoadingText>Sending emails to all users...</LoadingText>
            <LoadingText style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              This may take a few minutes. Please don't close this page.
            </LoadingText>
            <ProgressBar>
              <ProgressFill
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </ProgressBar>
          </LoadingOverlay>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminContainer>
  );
};

export default BulkEmailAdminPanel;

