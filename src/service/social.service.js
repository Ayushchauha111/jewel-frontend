import http from "../http-common";

class SocialService {
  // Friend methods
  sendFriendRequest(receiverId) {
    return http.post(`/social/friends/request/${receiverId}`);
  }

  acceptFriendRequest(requestId) {
    return http.post(`/social/friends/accept/${requestId}`);
  }

  rejectFriendRequest(requestId) {
    return http.post(`/social/friends/reject/${requestId}`);
  }

  removeFriend(friendId) {
    return http.delete(`/social/friends/${friendId}`);
  }

  getFriends() {
    return http.get("/social/friends");
  }

  getPendingRequests() {
    return http.get("/social/friends/pending");
  }

  searchUsers(query) {
    return http.get(`/social/users/search?query=${encodeURIComponent(query)}`);
  }

  // Chat methods
  sendMessage(receiverId, content) {
    return http.post(`/social/chat/${receiverId}`, { content });
  }

  getConversation(friendId) {
    return http.get(`/social/chat/${friendId}`);
  }

  getUnreadCount() {
    return http.get("/social/chat/unread");
  }
}

const socialService = new SocialService();
export default socialService;

