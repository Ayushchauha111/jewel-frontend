import httpCommon from "../http-common";

class CommunityService {
  // ============ Community Config ============
  getAllConfigs() {
    return httpCommon.get('/community/configs');
  }

  getConfig(key) {
    return httpCommon.get(`/community/configs/${key}`);
  }

  // ============ Study Buddy ============
  createOrUpdateStudyBuddy(data) {
    return httpCommon.post('/community/study-buddy', data);
  }

  getMyStudyBuddy() {
    return httpCommon.get('/community/study-buddy/me');
  }

  searchStudyBuddies(exam = null, availability = null, search = null) {
    const params = new URLSearchParams();
    if (exam) params.append('exam', exam);
    if (availability) params.append('availability', availability);
    if (search) params.append('search', search);
    
    return httpCommon.get(`/community/study-buddy/search?${params.toString()}`);
  }

  deactivateStudyBuddy() {
    return httpCommon.delete('/community/study-buddy');
  }

  // ============ Forest Group ============
  addFocusSession(focusMinutes) {
    return httpCommon.post(`/community/forest/session?focusMinutes=${focusMinutes}`, null);
  }

  getTodaySession() {
    return httpCommon.get('/community/forest/today');
  }

  getUserHistory() {
    return httpCommon.get('/community/forest/history');
  }

  getDailyLeaderboard(date = null) {
    const url = date 
      ? `/community/forest/leaderboard?date=${date}`
      : '/community/forest/leaderboard';
    return httpCommon.get(url);
  }

  getAvailableDates() {
    return httpCommon.get('/community/forest/ranking/dates');
  }

  getUserStats() {
    return httpCommon.get('/community/forest/stats');
  }

  // ============ Study Room Assignment ============
  assignStudyRoom(roomType = 'study_room') {
    return httpCommon.get(`/community/study-room/assign?roomType=${roomType}`);
  }

  confirmJoinStudyRoom(roomId) {
    return httpCommon.post(`/community/study-room/confirm?roomId=${roomId}`, null);
  }

  cancelJoinStudyRoom(roomId) {
    return httpCommon.post(`/community/study-room/cancel?roomId=${roomId}`, null);
  }

  previewStudyRoom(roomType = 'study_room') {
    return httpCommon.get(`/community/study-room/preview?roomType=${roomType}`);
  }

  releaseStudyRoom(roomId) {
    return httpCommon.post(`/community/study-room/release?roomId=${roomId}`, null);
  }

  getStudyRoomStats(roomType = 'study_room') {
    return httpCommon.get(`/community/study-room/stats?roomType=${roomType}`);
  }

  deleteStudyRoom(roomId) {
    return httpCommon.delete(`/community/admin/study-room/${roomId}`);
  }

  // ============ Admin ============
  getAllConfigsAdmin() {
    return httpCommon.get('/community/admin/configs');
  }

  createOrUpdateConfig(key, value, type = null, description = null, displayOrder = null, id = null) {
    const params = new URLSearchParams();
    params.append('key', key);
    params.append('value', value);
    if (type) params.append('type', type);
    if (description) params.append('description', description);
    if (displayOrder !== null) params.append('displayOrder', displayOrder);
    if (id !== null) params.append('id', id);
    
    return httpCommon.post(`/community/admin/config?${params.toString()}`, null);
  }

  // ============ Admin Study Room Management ============
  getAllStudyRooms(roomType = null) {
    const url = roomType 
      ? `/community/admin/study-rooms?roomType=${roomType}`
      : '/community/admin/study-rooms';
    return httpCommon.get(url);
  }

  createStudyRoom(roomName, meetLink, maxCapacity = 100, roomType = 'study_room', region = null, priority = 0, platform = null) {
    const params = new URLSearchParams();
    params.append('roomName', roomName);
    params.append('meetLink', meetLink);
    params.append('maxCapacity', maxCapacity);
    params.append('roomType', roomType);
    if (region) params.append('region', region);
    params.append('priority', priority);
    if (platform) params.append('platform', platform);
    
    return httpCommon.post(`/community/admin/study-room?${params.toString()}`, null);
  }

  updateStudyRoom(roomId, roomName, meetLink, maxCapacity = 100, roomType = 'study_room', region = null, priority = 0, platform = null) {
    const params = new URLSearchParams();
    params.append('roomName', roomName);
    params.append('meetLink', meetLink);
    params.append('maxCapacity', maxCapacity);
    if (roomType) params.append('roomType', roomType);
    if (region) params.append('region', region);
    params.append('priority', priority);
    if (platform) params.append('platform', platform);
    
    return httpCommon.put(`/community/admin/study-room/${roomId}?${params.toString()}`, null);
  }

  // ============ Analytics ============
  getRoomAnalytics(roomId, days = 7) {
    return httpCommon.get(`/community/admin/study-rooms/analytics/room/${roomId}?days=${days}`);
  }

  getOverallAnalytics(days = 7) {
    return httpCommon.get(`/community/admin/study-rooms/analytics/overall?days=${days}`);
  }
}

const communityService = new CommunityService();
export default communityService;

