import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiUsers, FiActivity, FiTrendingUp, FiTrendingDown, FiBarChart2,
  FiDollarSign, FiBook, FiTarget, FiRefreshCw, FiCalendar,
  FiAward, FiZap, FiClock, FiChevronDown, FiChevronUp, FiEye
} from 'react-icons/fi';
import UserService from '../../service/user.service';
import AuthService from '../../service/auth.service';

const DashboardContainer = styled.div`
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
  font-size: 2.5rem;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #00ff88 0%, #00d4ff 100%);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  color: #00ff88;
`;

const StatTitle = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 600;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: ${props => props.positive ? '#00ff88' : 'rgba(255, 255, 255, 0.5)'};
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #00ff88;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const ChartCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
`;

const ChartTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #00ff88;
  margin-bottom: 1rem;
`;

const ChartContent = styled.div`
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TrendBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(0, 255, 136, 0.05);
  border-radius: 8px;
  border-left: 3px solid #00ff88;
`;

const TrendDate = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const TrendValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ff88;
`;

const PopularList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PopularItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 255, 136, 0.05);
  border-radius: 8px;
  border-left: 3px solid #00ff88;
`;

const PopularName = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
`;

const PopularCount = styled.div`
  color: #00ff88;
  font-weight: 700;
  font-size: 1.1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.5rem;
  color: #00ff88;
`;

const ErrorMessage = styled.div`
  padding: 1.5rem;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 12px;
  color: #ff4444;
  text-align: center;
`;

const ExpandButton = styled(motion.button)`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 255, 136, 0.2);
    border-color: rgba(0, 255, 136, 0.5);
  }
`;

const DetailsTable = styled(motion.div)`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 255, 136, 0.2);
  max-height: 400px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
`;

const TableHeader = styled.thead`
  background: rgba(0, 255, 136, 0.1);
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem;
  text-align: left;
  color: #00ff88;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 255, 136, 0.3);
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(0, 255, 136, 0.05);
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const hasAdminRole = user.roles?.includes('ROLE_ADMIN') || 
                          user.roles?.includes('ADMIN') ||
                          user.roles?.some(role => role.includes('ADMIN'));
      setIsAdmin(hasAdminRole);
      if (hasAdminRole) {
        loadAnalytics();
      } else {
        setLoading(false);
        setError('Access denied. Admin role required.');
      }
    } else {
      setLoading(false);
      setError('Please login to access analytics.');
    }
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserService.getDashboardAnalytics();
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError('Failed to load analytics');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const calculateChange = (today, yesterday) => {
    if (!yesterday || yesterday === 0) return { value: today || 0, percent: today > 0 ? 100 : 0 };
    const change = ((today - yesterday) / yesterday) * 100;
    return { value: today - yesterday, percent: Math.round(change) };
  };

  const toggleExpand = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner>
          <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </LoadingSpinner>
      </DashboardContainer>
    );
  }

  if (error && !analytics) {
    return (
      <DashboardContainer>
        <Header>
          <Title>Analytics Dashboard</Title>
        </Header>
        <ErrorMessage>{error}</ErrorMessage>
      </DashboardContainer>
    );
  }

  if (!analytics) return null;

  const users = analytics.users || {};
  const tests = analytics.tests || {};
  const courses = analytics.courses || {};
  const performance = analytics.performance || {};
  const trends = analytics.trends || {};
  const popular = analytics.popular || {};

  const userChange = calculateChange(users.activeToday, users.activeYesterday);
  const testChange = calculateChange(tests.today, tests.yesterday);
  const purchaseChange = calculateChange(courses.purchasesToday, courses.purchasesYesterday);

  return (
    <DashboardContainer>
      <Header>
        <Title>📊 Analytics Dashboard</Title>
        <RefreshButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadAnalytics}
        >
          <FiRefreshCw /> Refresh
        </RefreshButton>
      </Header>

      {/* Key Metrics */}
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatHeader>
            <StatIcon><FiUsers /></StatIcon>
            <StatTitle>Active Users (Now)</StatTitle>
          </StatHeader>
          <StatValue>{formatNumber(users.activeNow || 0)}</StatValue>
          <StatChange positive>
            <FiActivity /> Live
          </StatChange>
          {users.activeNowDetails && users.activeNowDetails.length > 0 && (
            <>
              <ExpandButton
                onClick={() => toggleExpand('activeNow')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {expandedSections.activeNow ? <FiChevronUp /> : <FiChevronDown />}
                {expandedSections.activeNow ? 'Hide' : 'Show'} Details ({users.activeNowDetails.length})
              </ExpandButton>
              {expandedSections.activeNow && (
                <DetailsTable
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHeaderCell>Username</TableHeaderCell>
                        <TableHeaderCell>Email</TableHeaderCell>
                        <TableHeaderCell>Last Active</TableHeaderCell>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {users.activeNowDetails.map((user, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{user.username || 'N/A'}</TableCell>
                          <TableCell>{user.email || 'N/A'}</TableCell>
                          <TableCell>{formatDate(user.lastActiveAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DetailsTable>
              )}
            </>
          )}
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatHeader>
            <StatIcon><FiUsers /></StatIcon>
            <StatTitle>Active Today</StatTitle>
          </StatHeader>
          <StatValue>{formatNumber(users.activeToday || 0)}</StatValue>
          <StatChange positive={userChange.percent >= 0}>
            {userChange.percent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {userChange.percent !== 0 && `${Math.abs(userChange.percent)}%`} vs Yesterday
          </StatChange>
          {users.activeTodayDetails && users.activeTodayDetails.length > 0 && (
            <>
              <ExpandButton
                onClick={() => toggleExpand('activeToday')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {expandedSections.activeToday ? <FiChevronUp /> : <FiChevronDown />}
                {expandedSections.activeToday ? 'Hide' : 'Show'} Details ({users.activeTodayDetails.length})
              </ExpandButton>
              {expandedSections.activeToday && (
                <DetailsTable
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHeaderCell>Username</TableHeaderCell>
                        <TableHeaderCell>Email</TableHeaderCell>
                        <TableHeaderCell>Last Active</TableHeaderCell>
                        <TableHeaderCell>Joined</TableHeaderCell>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {users.activeTodayDetails.map((user, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{user.username || 'N/A'}</TableCell>
                          <TableCell>{user.email || 'N/A'}</TableCell>
                          <TableCell>{formatDate(user.lastActiveAt)}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DetailsTable>
              )}
            </>
          )}
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatHeader>
            <StatIcon><FiTarget /></StatIcon>
            <StatTitle>Tests Today</StatTitle>
          </StatHeader>
          <StatValue>{formatNumber(tests.today || 0)}</StatValue>
          <StatChange positive={testChange.percent >= 0}>
            {testChange.percent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {testChange.percent !== 0 && `${Math.abs(testChange.percent)}%`} vs Yesterday
          </StatChange>
          {tests.todayDetails && tests.todayDetails.length > 0 && (
            <>
              <ExpandButton
                onClick={() => toggleExpand('testsToday')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {expandedSections.testsToday ? <FiChevronUp /> : <FiChevronDown />}
                {expandedSections.testsToday ? 'Hide' : 'Show'} Details ({tests.todayDetails.length})
              </ExpandButton>
              {expandedSections.testsToday && (
                <DetailsTable
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHeaderCell>Username</TableHeaderCell>
                        <TableHeaderCell>Email</TableHeaderCell>
                        <TableHeaderCell>WPM</TableHeaderCell>
                        <TableHeaderCell>Accuracy</TableHeaderCell>
                        <TableHeaderCell>Type</TableHeaderCell>
                        <TableHeaderCell>Time</TableHeaderCell>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {tests.todayDetails.map((test, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{test.username || 'N/A'}</TableCell>
                          <TableCell>{test.email || 'N/A'}</TableCell>
                          <TableCell>{test.wpm ? Math.round(test.wpm) : 'N/A'}</TableCell>
                          <TableCell>{test.accuracy ? `${Math.round(test.accuracy)}%` : 'N/A'}</TableCell>
                          <TableCell>{test.type || 'N/A'}</TableCell>
                          <TableCell>{formatDate(test.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DetailsTable>
              )}
            </>
          )}
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatHeader>
            <StatIcon><FiBook /></StatIcon>
            <StatTitle>Course Purchases Today</StatTitle>
          </StatHeader>
          <StatValue>{formatNumber(courses.purchasesToday || 0)}</StatValue>
          <StatChange positive={purchaseChange.percent >= 0}>
            {purchaseChange.percent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {purchaseChange.percent !== 0 && `${Math.abs(purchaseChange.percent)}%`} vs Yesterday
          </StatChange>
          {courses.purchasesTodayDetails && courses.purchasesTodayDetails.length > 0 && (
            <>
              <ExpandButton
                onClick={() => toggleExpand('purchasesToday')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {expandedSections.purchasesToday ? <FiChevronUp /> : <FiChevronDown />}
                {expandedSections.purchasesToday ? 'Hide' : 'Show'} Details ({courses.purchasesTodayDetails.length})
              </ExpandButton>
              {expandedSections.purchasesToday && (
                <DetailsTable
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHeaderCell>Username</TableHeaderCell>
                        <TableHeaderCell>Email</TableHeaderCell>
                        <TableHeaderCell>Course</TableHeaderCell>
                        <TableHeaderCell>Enrolled</TableHeaderCell>
                        <TableHeaderCell>Expires</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {courses.purchasesTodayDetails.map((purchase, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{purchase.username || 'N/A'}</TableCell>
                          <TableCell>{purchase.email || 'N/A'}</TableCell>
                          <TableCell>{purchase.courseName || 'N/A'}</TableCell>
                          <TableCell>{formatDate(purchase.enrolledAt)}</TableCell>
                          <TableCell>{formatDate(purchase.expiresAt)}</TableCell>
                          <TableCell>
                            <span style={{ 
                              color: purchase.isActive ? '#00ff88' : '#ff4444',
                              fontWeight: 600
                            }}>
                              {purchase.isActive ? 'Active' : 'Expired'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DetailsTable>
              )}
            </>
          )}
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StatHeader>
            <StatIcon><FiZap /></StatIcon>
            <StatTitle>Avg WPM</StatTitle>
          </StatHeader>
          <StatValue>{performance.averageWpm || 0}</StatValue>
          <StatChange>
            <FiAward /> Max: {performance.maxWpm || 0}
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <StatHeader>
            <StatIcon><FiTarget /></StatIcon>
            <StatTitle>Avg Accuracy</StatTitle>
          </StatHeader>
          <StatValue>{performance.averageAccuracy || 0}%</StatValue>
          <StatChange>
            <FiAward /> Max: {performance.maxAccuracy || 0}%
          </StatChange>
        </StatCard>
      </StatsGrid>

      {/* Detailed Stats */}
      <Section>
        <SectionTitle><FiBarChart2 /> User Statistics</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatHeader>
              <StatIcon><FiUsers /></StatIcon>
              <StatTitle>Total Users</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(users.total || 0)}</StatValue>
          </StatCard>
          <StatCard>
            <StatHeader>
              <StatIcon><FiUsers /></StatIcon>
              <StatTitle>New Today</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(users.newToday || 0)}</StatValue>
            {users.newTodayDetails && users.newTodayDetails.length > 0 && (
              <>
                <ExpandButton
                  onClick={() => toggleExpand('newToday')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {expandedSections.newToday ? <FiChevronUp /> : <FiChevronDown />}
                  {expandedSections.newToday ? 'Hide' : 'Show'} Details ({users.newTodayDetails.length})
                </ExpandButton>
                {expandedSections.newToday && (
                  <DetailsTable
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Table>
                      <TableHeader>
                        <tr>
                          <TableHeaderCell>Username</TableHeaderCell>
                          <TableHeaderCell>Email</TableHeaderCell>
                          <TableHeaderCell>Joined</TableHeaderCell>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {users.newTodayDetails.map((user, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{user.username || 'N/A'}</TableCell>
                            <TableCell>{user.email || 'N/A'}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DetailsTable>
                )}
              </>
            )}
          </StatCard>
          <StatCard>
            <StatHeader>
              <StatIcon><FiUsers /></StatIcon>
              <StatTitle>Active This Week</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(users.activeThisWeek || 0)}</StatValue>
          </StatCard>
          <StatCard>
            <StatHeader>
              <StatIcon><FiUsers /></StatIcon>
              <StatTitle>Active This Month</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(users.activeThisMonth || 0)}</StatValue>
          </StatCard>
        </StatsGrid>
      </Section>

      <Section>
        <SectionTitle><FiTarget /> Test Statistics</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatHeader>
              <StatIcon><FiTarget /></StatIcon>
              <StatTitle>Total Tests</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(performance.totalTests || 0)}</StatValue>
          </StatCard>
          <StatCard>
            <StatHeader>
              <StatIcon><FiTarget /></StatIcon>
              <StatTitle>Tests This Week</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(tests.thisWeek || 0)}</StatValue>
          </StatCard>
          <StatCard>
            <StatHeader>
              <StatIcon><FiUsers /></StatIcon>
              <StatTitle>Unique Users Today</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(tests.uniqueUsersToday || 0)}</StatValue>
            {tests.uniqueUsersTodayDetails && tests.uniqueUsersTodayDetails.length > 0 && (
              <>
                <ExpandButton
                  onClick={() => toggleExpand('uniqueUsersToday')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {expandedSections.uniqueUsersToday ? <FiChevronUp /> : <FiChevronDown />}
                  {expandedSections.uniqueUsersToday ? 'Hide' : 'Show'} Details ({tests.uniqueUsersTodayDetails.length})
                </ExpandButton>
                {expandedSections.uniqueUsersToday && (
                  <DetailsTable
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Table>
                      <TableHeader>
                        <tr>
                          <TableHeaderCell>Username</TableHeaderCell>
                          <TableHeaderCell>Email</TableHeaderCell>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {tests.uniqueUsersTodayDetails.map((user, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{user.username || 'N/A'}</TableCell>
                            <TableCell>{user.email || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DetailsTable>
                )}
              </>
            )}
          </StatCard>
          <StatCard>
            <StatHeader>
              <StatIcon><FiZap /></StatIcon>
              <StatTitle>Avg WPM Today</StatTitle>
            </StatHeader>
            <StatValue>{performance.averageWpmToday || 0}</StatValue>
          </StatCard>
        </StatsGrid>
      </Section>

      <Section>
        <SectionTitle><FiBook /> Course Statistics</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatHeader>
              <StatIcon><FiBook /></StatIcon>
              <StatTitle>Total Subscriptions</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(courses.totalSubscriptions || 0)}</StatValue>
          </StatCard>
          <StatCard>
            <StatHeader>
              <StatIcon><FiBook /></StatIcon>
              <StatTitle>Active Subscriptions</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(courses.activeSubscriptions || 0)}</StatValue>
            {courses.activeSubscriptionsDetails && courses.activeSubscriptionsDetails.length > 0 && (
              <>
                <ExpandButton
                  onClick={() => toggleExpand('activeSubscriptions')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {expandedSections.activeSubscriptions ? <FiChevronUp /> : <FiChevronDown />}
                  {expandedSections.activeSubscriptions ? 'Hide' : 'Show'} Details ({courses.activeSubscriptionsDetails.length})
                </ExpandButton>
                {expandedSections.activeSubscriptions && (
                  <DetailsTable
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Table>
                      <TableHeader>
                        <tr>
                          <TableHeaderCell>Username</TableHeaderCell>
                          <TableHeaderCell>Email</TableHeaderCell>
                          <TableHeaderCell>Course</TableHeaderCell>
                          <TableHeaderCell>Enrolled</TableHeaderCell>
                          <TableHeaderCell>Expires</TableHeaderCell>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {courses.activeSubscriptionsDetails.map((sub, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{sub.username || 'N/A'}</TableCell>
                            <TableCell>{sub.email || 'N/A'}</TableCell>
                            <TableCell>{sub.courseName || 'N/A'}</TableCell>
                            <TableCell>{formatDate(sub.enrolledAt)}</TableCell>
                            <TableCell>{formatDate(sub.expiresAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DetailsTable>
                )}
              </>
            )}
          </StatCard>
          <StatCard>
            <StatHeader>
              <StatIcon><FiUsers /></StatIcon>
              <StatTitle>Subscribed Users</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(courses.uniqueSubscribedUsers || 0)}</StatValue>
          </StatCard>
          <StatCard>
            <StatHeader>
              <StatIcon><FiBook /></StatIcon>
              <StatTitle>Purchases This Week</StatTitle>
            </StatHeader>
            <StatValue>{formatNumber(courses.purchasesThisWeek || 0)}</StatValue>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Trends and Popular Content */}
      <ChartsGrid>
        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <ChartTitle><FiCalendar /> Daily User Activity (Last 7 Days)</ChartTitle>
          <ChartContent>
            {(trends.dailyUsers || []).map((day, idx) => (
              <TrendBar key={idx}>
                <TrendDate>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TrendDate>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <TrendValue>{day.activeUsers || 0}</TrendValue>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                    +{day.newUsers || 0} new
                  </div>
                </div>
              </TrendBar>
            ))}
          </ChartContent>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <ChartTitle><FiTarget /> Daily Test Attempts (Last 7 Days)</ChartTitle>
          <ChartContent>
            {(trends.dailyTests || []).map((day, idx) => (
              <TrendBar key={idx}>
                <TrendDate>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TrendDate>
                <TrendValue>{day.tests || 0}</TrendValue>
              </TrendBar>
            ))}
          </ChartContent>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <ChartTitle><FiAward /> Most Popular Courses</ChartTitle>
          <PopularList>
            {(popular.popularCourses || []).slice(0, 10).map((course, idx) => (
              <PopularItem key={idx}>
                <PopularName>{course.courseName || 'Unknown'}</PopularName>
                <PopularCount>{course.subscriptions || 0} subscriptions</PopularCount>
              </PopularItem>
            ))}
            {(!popular.popularCourses || popular.popularCourses.length === 0) && (
              <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>
                No course data available
              </div>
            )}
          </PopularList>
        </ChartCard>
      </ChartsGrid>

      {error && (
        <ErrorMessage style={{ marginTop: '2rem' }}>
          {error}
        </ErrorMessage>
      )}
    </DashboardContainer>
  );
};

export default AnalyticsDashboard;
