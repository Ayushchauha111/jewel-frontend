import http from "../http-common-auth";
import httpCommon from "../http-common";

class UserService {
  getPublicContent() {
    return http.get('all');
  }

  getUserBoard() {
    return http.get('user');
  }

  getModeratorBoard() {
    return http.get('mod');
  }

  getAdminBoard() {
    return http.get('admin');
  }

  getActiveUsersCount(minutes = 5) {
    return httpCommon.get(`/admin/analytics/active-users?minutes=${minutes}`);
  }

  getDashboardAnalytics() {
    return httpCommon.get('/admin/analytics/dashboard');
  }

  // Admin methods
  getAllUsers() {
    return httpCommon.get('/user/admin/all');
  }

  getUsersPaginated(page = 0, size = 10, search = null) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (search) {
      params.append('search', search);
    }
    return httpCommon.get(`/user/admin/paginated?${params.toString()}`);
  }

  getUserCount() {
    return httpCommon.get('/user/admin/count');
  }

  updateUserRoles(userId, roles) {
    return httpCommon.put(`/user/admin/${userId}/roles`, { roles });
  }

  deleteUser(userId) {
    return httpCommon.delete(`/user/admin/${userId}`);
  }

  sendBulkEmail(subject, body, selectedUserIds = null, templateId = null) {
    const payload = { subject, body };
    if (selectedUserIds && selectedUserIds.length > 0) {
      payload.selectedUserIds = selectedUserIds;
    }
    if (templateId) {
      payload.templateId = templateId;
    }
    return httpCommon.post('/user/admin/bulk-email', payload);
  }

  // Email history methods
  getEmailHistory(page = 0, size = 20) {
    return httpCommon.get(`/email-history/all?page=${page}&size=${size}`);
  }

  getUserEmailHistory(userId, page = 0, size = 20) {
    return httpCommon.get(`/email-history/user/${userId}?page=${page}&size=${size}`);
  }

  getTemplateEmailHistory(templateId) {
    return httpCommon.get(`/email-history/template/${templateId}`);
  }

  getEmailStatistics() {
    return httpCommon.get('/email-history/statistics');
  }

  checkUserTemplate(userId, templateId) {
    return httpCommon.get(`/email-history/user/${userId}/template/${templateId}/check`);
  }

  getBulkUserTemplateStatus(userIds, templateIds) {
    return httpCommon.post('/email-history/bulk-status', { userIds, templateIds });
  }
}

const userService = new UserService();
export default userService;