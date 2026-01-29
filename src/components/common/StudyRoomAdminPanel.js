import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiVideo, FiPlus, FiEdit2, FiSave, FiX, 
  FiRefreshCw, FiCheck, FiXCircle, FiUsers, FiTrash2,
  FiActivity, FiTrendingUp, FiBarChart2, FiPieChart
} from 'react-icons/fi';
import CommunityService from '../../service/community.service';
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #00ff88;
`;

const RoomsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RoomCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const RoomInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RoomName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #00ff88;
  font-family: 'JetBrains Mono', monospace;
`;

const RoomLink = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  word-break: break-all;
`;

const RoomMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
`;

const CapacityBar = styled.div`
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const CapacityFill = styled.div`
  height: 100%;
  background: ${props => {
    const percent = props.percent;
    if (percent >= 90) return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    if (percent >= 70) return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(90deg, #00ff88 0%, #00d4ff 100%)';
  }};
  width: ${props => props.percent}%;
  transition: width 0.3s ease;
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

const StudyRoomAdminPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [overallAnalytics, setOverallAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [formData, setFormData] = useState({
    id: null,
    roomName: '',
    meetLink: '',
    maxCapacity: 100,
    roomType: 'study_room',
    region: '',
    priority: 0,
    platform: ''
  });

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const hasAdminRole = user.roles?.includes('ROLE_ADMIN') || 
                          user.roles?.includes('ADMIN') ||
                          user.roles?.some(role => role.includes('ADMIN'));
      setIsAdmin(hasAdminRole);
      if (hasAdminRole) {
        loadRooms();
        loadStats();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await CommunityService.getAllStudyRooms();
      if (response.data.success) {
        setRooms(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      setMessage({ text: 'Failed to load rooms', success: false });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await CommunityService.getStudyRoomStats('study_room');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await CommunityService.getOverallAnalytics(analyticsDays);
      if (response.data.success) {
        setOverallAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setMessage({ text: 'Failed to load analytics', success: false });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        id: room.id,
        roomName: room.roomName,
        meetLink: room.meetLink,
        maxCapacity: room.maxCapacity,
        roomType: room.roomType || 'study_room',
        region: room.region || '',
        priority: room.priority || 0,
        platform: room.platform || ''
      });
    } else {
      setEditingRoom(null);
      setFormData({
        id: null,
        roomName: '',
        meetLink: '',
        maxCapacity: 100,
        roomType: 'study_room',
        region: '',
        priority: 0,
        platform: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.roomName || !formData.meetLink) {
        setMessage({ text: 'Room name and Meet link are required', success: false });
        return;
      }

      if (formData.id) {
        // Update existing room
        await CommunityService.updateStudyRoom(
          formData.id,
          formData.roomName,
          formData.meetLink,
          formData.maxCapacity,
          formData.roomType,
          formData.region || null,
          formData.priority,
          formData.platform || null
        );
      } else {
        // Create new room
        await CommunityService.createStudyRoom(
          formData.roomName,
          formData.meetLink,
          formData.maxCapacity,
          formData.roomType,
          formData.region || null,
          formData.priority,
          formData.platform || null
        );
      }
      
      setShowModal(false);
      await loadRooms();
      await loadStats();
      setMessage({ text: formData.id ? 'Room updated successfully' : 'Room created successfully', success: true });
    } catch (error) {
      console.error('Error saving room:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to save room', 
        success: false 
      });
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone and will remove all associated sessions.')) {
      return;
    }

    try {
      await CommunityService.deleteStudyRoom(roomId);
      await loadRooms();
      await loadStats();
      setMessage({ text: 'Room deleted successfully', success: true });
    } catch (error) {
      console.error('Error deleting room:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to delete room', 
        success: false 
      });
    }
  };

  const getCapacityPercent = (current, max) => {
    return max > 0 ? Math.round((current / max) * 100) : 0;
  };

  if (!isAdmin) {
    return (
      <AdminContainer>
        <Title><FiVideo /> Study Room Admin</Title>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          You don't have permission to access this page.
        </div>
      </AdminContainer>
    );
  }

  if (loading) {
    return (
      <AdminContainer>
        <Title><FiVideo /> Study Room Admin</Title>
        <div>Loading...</div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title><FiVideo /> Study Room Admin</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton onClick={() => { loadRooms(); loadStats(); }}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton onClick={() => { setShowAnalytics(!showAnalytics); if (!showAnalytics) loadAnalytics(); }}>
            <FiBarChart2 /> {showAnalytics ? 'Hide' : 'Show'} Analytics
          </ActionButton>
          <ActionButton primary onClick={() => handleOpenModal()}>
            <FiPlus /> Add Room
          </ActionButton>
        </div>
      </Header>

      {stats && (
        <StatsGrid>
          <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <StatLabel>Total Rooms</StatLabel>
            <StatValue>{stats.totalRooms || 0}</StatValue>
          </StatCard>
          <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatLabel>Total Capacity</StatLabel>
            <StatValue>{stats.totalCapacity || 0}</StatValue>
          </StatCard>
          <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatLabel>Active Participants</StatLabel>
            <StatValue>{stats.totalParticipants || 0}</StatValue>
          </StatCard>
          <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <StatLabel>Available Spots</StatLabel>
            <StatValue>{stats.availableSpots || 0}</StatValue>
          </StatCard>
          <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <StatLabel>Utilization</StatLabel>
            <StatValue>{stats.utilizationPercent ? stats.utilizationPercent.toFixed(1) : 0}%</StatValue>
          </StatCard>
        </StatsGrid>
      )}

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

      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#00ff88', fontSize: '1.5rem' }}><FiPieChart /> Analytics Dashboard</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Label style={{ marginBottom: 0 }}>Period:</Label>
              <Select
                value={analyticsDays}
                onChange={(e) => { setAnalyticsDays(parseInt(e.target.value)); loadAnalytics(); }}
                style={{ width: 'auto', padding: '0.5rem' }}
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </Select>
            </div>
          </div>
          
          {loadingAnalytics ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Loading analytics...
            </div>
          ) : overallAnalytics ? (
            <StatsGrid>
              <StatCard>
                <StatLabel>Total Participant Minutes</StatLabel>
                <StatValue>{overallAnalytics.totalParticipantMinutes?.toLocaleString() || 0}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Active Rooms (Period)</StatLabel>
                <StatValue>{overallAnalytics.activeRooms || 0}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Platform Breakdown</StatLabel>
                <div style={{ marginTop: '0.5rem' }}>
                  {overallAnalytics.platformCounts && Object.entries(overallAnalytics.platformCounts).map(([platform, count]) => (
                    <div key={platform} style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      <span style={{ color: '#00ff88' }}>{platform}:</span> {count} rooms
                      {overallAnalytics.platformParticipants && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: '0.5rem' }}>
                          ({overallAnalytics.platformParticipants[platform] || 0} participants)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </StatCard>
            </StatsGrid>
          ) : null}
        </motion.div>
      )}

      <RoomsList>
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            No rooms found. Click "Add Room" to create one.
          </div>
        ) : (
          rooms.map((room) => {
            const capacityPercent = getCapacityPercent(room.currentParticipants, room.maxCapacity);
            return (
              <RoomCard
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RoomInfo>
                  <RoomName>{room.roomName}</RoomName>
                  <RoomLink>{room.meetLink}</RoomLink>
                  <RoomMeta>
                    <span><FiUsers /> {room.currentParticipants}/{room.maxCapacity} participants</span>
                    <span>•</span>
                    <span>Type: {room.roomType}</span>
                    {room.platform && <><span>•</span><span>Platform: {room.platform}</span></>}
                    {room.region && <><span>•</span><span>Region: {room.region}</span></>}
                    <span>•</span>
                    <span>Priority: {room.priority}</span>
                    <span>•</span>
                    <span style={{ color: room.isActive ? '#00ff88' : '#ff6464' }}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </RoomMeta>
                  <CapacityBar>
                    <CapacityFill percent={capacityPercent} />
                  </CapacityBar>
                </RoomInfo>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <ActionButton onClick={() => handleOpenModal(room)}>
                    <FiEdit2 />
                  </ActionButton>
                  <ActionButton 
                    onClick={() => handleDeleteRoom(room.id)}
                    style={{ 
                      background: 'rgba(255, 100, 100, 0.1)',
                      borderColor: 'rgba(255, 100, 100, 0.3)',
                      color: '#ff6464'
                    }}
                  >
                    <FiTrash2 />
                  </ActionButton>
                </div>
              </RoomCard>
            );
          })
        )}
      </RoomsList>

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
                  {editingRoom ? 'Edit Room' : 'Create Room'}
                </ModalTitle>
                <ActionButton onClick={() => setShowModal(false)}>
                  <FiX />
                </ActionButton>
              </ModalHeader>

              <FormGroup>
                <Label>Room Name *</Label>
                <Input
                  type="text"
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  placeholder="e.g., Study Room 1"
                />
              </FormGroup>

              <FormGroup>
                <Label>Meet Link *</Label>
                <Input
                  type="text"
                  value={formData.meetLink}
                  onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                  placeholder="e.g., https://meet.google.com/abc-defg-hij"
                />
              </FormGroup>

              <FormGroup>
                <Label>Max Capacity *</Label>
                <Input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 100 })}
                  placeholder="100"
                  min="1"
                  max="1000"
                />
              </FormGroup>

              <FormGroup>
                <Label>Room Type</Label>
                <Select
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                >
                  <option value="study_room">Study Room</option>
                  <option value="zen_session">Zen Session</option>
                  <option value="webinar">Webinar</option>
                  <option value="other">Other</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Region (Optional)</Label>
                <Input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g., us-east, asia, europe"
                />
              </FormGroup>

              <FormGroup>
                <Label>Platform</Label>
                <Select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="">Auto-detect from link</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="youtube_live">YouTube Live</option>
                  <option value="discord">Discord</option>
                  <option value="zoom">Zoom</option>
                  <option value="other">Other</option>
                </Select>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                  Platform will be auto-detected from link if not specified
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                  Higher priority rooms are filled first
                </div>
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

export default StudyRoomAdminPanel;

