import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import {
  FiUsers, FiMessageCircle, FiSearch, FiUserPlus, FiUserCheck,
  FiUserX, FiCheck, FiX, FiSend, FiChevronLeft, FiBell
} from 'react-icons/fi';
import socialService from '../../../service/social.service';
import AuthService from '../../../service/auth.service';

// ============ STYLED COMPONENTS ============
const Container = styled.div`
  min-height: 100vh;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #050507 0%, #0d0d1a 50%, #1a1a3e 100%);
  display: flex;
  font-family: 'Inter', -apple-system, sans-serif;
  padding-top: 70px;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 40%);
    pointer-events: none;
    z-index: -1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    padding-top: 60px;
  }
`;

const Sidebar = styled.div`
  width: 320px;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: ${props => props.showChat ? '0' : '100%'};
    display: ${props => props.showChat ? 'none' : 'flex'};
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.5rem;
  background: ${props => props.active ? 'rgba(99, 102, 241, 0.3)' : 'transparent'};
  border: 1px solid ${props => props.active ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? '#fff' : 'rgba(255, 255, 255, 0.5)'};
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;

  .badge {
    background: #ef4444;
    color: #fff;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    position: absolute;
    top: -5px;
    right: -5px;
  }
`;

const SearchBox = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.5rem 1rem;

  input {
    flex: 1;
    background: none;
    border: none;
    color: #fff;
    font-size: 0.95rem;
    margin-left: 0.5rem;

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    &:focus {
      outline: none;
    }
  }

  svg {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const FriendsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const FriendItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: ${props => props.active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  border-left: 3px solid ${props => props.active ? '#6366f1' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  position: relative;

  .online-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    background: #10b981;
    border: 2px solid #0f172a;
    border-radius: 50%;
  }
`;

const FriendInfo = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;

  .name {
    color: #fff;
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const UnreadBadge = styled.span`
  background: #ef4444;
  color: #fff;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    display: ${props => props.show ? 'flex' : 'none'};
    width: 100%;
  }
`;

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: ${props => props.own ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${props => props.own 
    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: #fff;
  align-self: ${props => props.own ? 'flex-end' : 'flex-start'};

  .text {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .time {
    font-size: 0.7rem;
    color: ${props => props.own ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)'};
    margin-top: 0.25rem;
    text-align: right;
  }
`;

const ChatInputArea = styled.div`
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ChatInputWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.875rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  color: #fff;
  font-size: 0.95rem;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const SendButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 2rem;

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const RequestItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const RequestActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionBtn = styled(motion.button)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  background: ${props => props.accept ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.accept ? '#10b981' : '#ef4444'};

  &:hover {
    background: ${props => props.accept ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  }
`;

const SearchResultItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  min-width: 0;
`;

const AddFriendBtn = styled(motion.button)`
  background: ${props => props.pending ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.2)'};
  border: 1px solid ${props => props.pending ? 'rgba(255, 255, 255, 0.2)' : '#6366f1'};
  color: ${props => props.pending ? 'rgba(255, 255, 255, 0.5)' : '#6366f1'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: ${props => props.pending ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  white-space: nowrap;
`;

// ============ MAIN COMPONENT ============
const SocialHub = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const eventSourceRef = useRef(null);
  const selectedFriendRef = useRef(null);
  
  // Get currentUser once and memoize it
  const [currentUser] = useState(() => AuthService.getCurrentUser());
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const fetchFriends = useCallback(async () => {
    try {
      const response = await socialService.getFriends();
      setFriends(response.data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await socialService.getPendingRequests();
      setPendingRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, []);

  // Initial data fetch - only runs once
  useEffect(() => {
    if (currentUser) {
      Promise.all([fetchFriends(), fetchPendingRequests()])
        .finally(() => setLoading(false));
    }
  }, []); // Empty dependency - only run on mount

  // SSE for real-time chat updates + fallback polling for friends (every 60s)
  useEffect(() => {
    if (!currentUser) return;

    // Connect to SSE for instant message notifications
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Get auth token for SSE (EventSource doesn't support headers)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.accessToken;
      
      if (!token) {
        return;
      }
      
      eventSourceRef.current = new EventSource(`${API_URL}/api/social/chat/stream?token=${token}`);

      eventSourceRef.current.addEventListener('chatUpdate', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'newMessage' && data.message) {
            const friendId = selectedFriendRef.current?.id;
            const senderId = data.message.senderId;
            if (friendId && Number(senderId) === Number(friendId)) {
              setMessages(prev => [...prev, { ...data.message, isOwn: false }]);
            }
          }
        } catch (e) {
          // Silent fail for parsing errors
        }
      });

      eventSourceRef.current.addEventListener('socialUpdate', (event) => {
        try {
          const data = JSON.parse(event.data);
          // Handle all friend-related events instantly
          if (data.type === 'friendRequest') {
            // New friend request received - refresh pending requests
            fetchPendingRequests();
          } else if (data.type === 'friendAccepted') {
            // Friend request accepted - refresh friends list
            fetchFriends();
            fetchPendingRequests();
          } else if (data.type === 'friendRejected') {
            // Friend request rejected - refresh pending requests
            fetchPendingRequests();
          } else if (data.type === 'friendRemoved') {
            // Friend removed - refresh friends list
            fetchFriends();
            // Clear chat if removed friend was selected
            if (selectedFriendRef.current?.id === data.data?.friendId) {
              setSelectedFriend(null);
              setMessages([]);
            }
          }
        } catch (e) {
          // Silent fail for parsing errors
        }
      });

      eventSourceRef.current.onerror = () => {
        eventSourceRef.current.close();
        // Reconnect after 10 seconds
        setTimeout(connectSSE, 10000);
      };
    };

    connectSSE();

    // Fallback polling for friends list (every 5 minutes as safety net)
    // SSE handles real-time updates, this is just backup
    pollIntervalRef.current = setInterval(() => {
      fetchFriends();
      fetchPendingRequests();
    }, 300000); // 5 minutes

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [currentUser, fetchFriends, fetchPendingRequests, API_URL]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const response = await socialService.searchUsers(query);
        setSearchResults(response.data || []);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await socialService.sendFriendRequest(userId);
      // Update search results
      setSearchResults(prev => prev.map(u => 
        u.id === userId ? { ...u, friendshipStatus: 'PENDING' } : u
      ));
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await socialService.acceptFriendRequest(requestId);
      fetchFriends();
      fetchPendingRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await socialService.rejectFriendRequest(requestId);
      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const fetchMessages = useCallback(async (friendId) => {
    try {
      const response = await socialService.getConversation(friendId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }, []);

  const selectFriend = async (friend) => {
    setSelectedFriend(friend);
    selectedFriendRef.current = friend; // Update ref for SSE handler
    fetchMessages(friend.id);
  };

  // Update ref when selectedFriend changes (for SSE handler to access)
  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  // No more 3-second polling! SSE handles real-time message delivery.
  // Only fetch messages when switching friends (handled in selectFriend)

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;
    
    try {
      const response = await socialService.sendMessage(selectedFriend.id, newMessage);
      setMessages(prev => [...prev, {
        ...response.data,
        isOwn: true
      }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser) {
    return (
      <Container>
        <EmptyState style={{ flex: 1 }}>
          <FiUsers />
          <h2>Login Required</h2>
          <p>Please login to access social features</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Sidebar showChat={!!selectedFriend}>
        <SidebarHeader>
          <Title>
            <FiUsers /> Friends
          </Title>
          <Tabs>
            <Tab active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>
              <FiMessageCircle /> Chat
            </Tab>
            <Tab active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>
              <FiBell /> Requests
              {pendingRequests.length > 0 && (
                <span className="badge">{pendingRequests.length}</span>
              )}
            </Tab>
            <Tab active={activeTab === 'search'} onClick={() => setActiveTab('search')}>
              <FiSearch /> Find
            </Tab>
          </Tabs>
        </SidebarHeader>

        {activeTab === 'search' && (
          <SearchBox>
            <SearchInput>
              <FiSearch />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </SearchInput>
          </SearchBox>
        )}

        <FriendsList>
          {activeTab === 'friends' && (
            loading ? (
              <EmptyState>Loading...</EmptyState>
            ) : friends.length === 0 ? (
              <EmptyState>
                <FiUsers />
                <p>No friends yet</p>
                <p style={{ fontSize: '0.85rem' }}>Search for users to add friends!</p>
              </EmptyState>
            ) : (
              friends.map(friend => (
                <FriendItem
                  key={friend.id}
                  active={selectedFriend?.id === friend.id}
                  onClick={() => selectFriend(friend)}
                  whileHover={{ x: 4 }}
                >
                  <Avatar>
                    {friend.username?.[0]?.toUpperCase()}
                    <span className="online-dot" />
                  </Avatar>
                  <FriendInfo>
                    <div className="name">{friend.username}</div>
                    <div className="status">Level {friend.level || 1} • {friend.currentStreak || 0} day streak</div>
                  </FriendInfo>
                  {friend.unreadCount > 0 && (
                    <UnreadBadge>{friend.unreadCount}</UnreadBadge>
                  )}
                </FriendItem>
              ))
            )
          )}

          {activeTab === 'requests' && (
            pendingRequests.length === 0 ? (
              <EmptyState>
                <FiBell />
                <p>No pending requests</p>
              </EmptyState>
            ) : (
              pendingRequests.map(request => (
                <RequestItem key={request.id}>
                  <Avatar>{request.senderUsername?.[0]?.toUpperCase()}</Avatar>
                  <FriendInfo>
                    <div className="name">{request.senderUsername}</div>
                    <div className="status">Wants to be friends</div>
                  </FriendInfo>
                  <RequestActions>
                    <ActionBtn
                      accept
                      onClick={() => handleAcceptRequest(request.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiCheck />
                    </ActionBtn>
                    <ActionBtn
                      onClick={() => handleRejectRequest(request.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX />
                    </ActionBtn>
                  </RequestActions>
                </RequestItem>
              ))
            )
          )}

          {activeTab === 'search' && (
            searchResults.length === 0 ? (
              <EmptyState>
                <FiSearch />
                <p>Search for friends</p>
              </EmptyState>
            ) : (
              searchResults.map(user => (
                <SearchResultItem key={user.id}>
                  <Avatar>{user.username?.[0]?.toUpperCase()}</Avatar>
                  <FriendInfo>
                    <div className="name">{user.username}</div>
                    <div className="status">Level {user.level || 1}</div>
                  </FriendInfo>
                  {user.friendshipStatus === 'ACCEPTED' ? (
                    <AddFriendBtn pending disabled>
                      <FiUserCheck /> Friends
                    </AddFriendBtn>
                  ) : user.friendshipStatus === 'PENDING' ? (
                    <AddFriendBtn pending disabled>
                      Pending
                    </AddFriendBtn>
                  ) : (
                    <AddFriendBtn
                      onClick={() => handleSendRequest(user.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiUserPlus /> Add
                    </AddFriendBtn>
                  )}
                </SearchResultItem>
              ))
            )
          )}
        </FriendsList>
      </Sidebar>

      <ChatArea show={!!selectedFriend}>
        {!selectedFriend ? (
          <EmptyState>
            <FiMessageCircle />
            <h2>Select a friend to chat</h2>
            <p>Choose a friend from the list to start a conversation</p>
          </EmptyState>
        ) : (
          <>
            <ChatHeader>
              <BackButton onClick={() => setSelectedFriend(null)}>
                <FiChevronLeft size={24} />
              </BackButton>
              <Avatar>{selectedFriend.username?.[0]?.toUpperCase()}</Avatar>
              <FriendInfo>
                <div className="name">{selectedFriend.username}</div>
                <div className="status">Online</div>
              </FriendInfo>
            </ChatHeader>

            <ChatMessages>
              {messages.length === 0 ? (
                <EmptyState>
                  <FiMessageCircle />
                  <p>No messages yet</p>
                  <p style={{ fontSize: '0.85rem' }}>Say hello! 👋</p>
                </EmptyState>
              ) : (
                messages.map((msg, index) => (
                  <Message key={index} own={msg.isOwn}>
                    <div className="text">{msg.content}</div>
                    <div className="time">{formatTime(msg.createdAt)}</div>
                  </Message>
                ))
              )}
              <div ref={messagesEndRef} />
            </ChatMessages>

            <ChatInputArea>
              <ChatInputWrapper>
                <ChatInput
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <SendButton
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSend />
                </SendButton>
              </ChatInputWrapper>
            </ChatInputArea>
          </>
        )}
      </ChatArea>
    </Container>
  );
};

export default SocialHub;

