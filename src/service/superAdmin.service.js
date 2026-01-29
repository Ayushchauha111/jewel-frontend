import http from "../http-common";

class SuperAdminService {
  // Get all institutions with pagination
  getAllInstitutions(page = 0, size = 20, sortBy = "createdAt", sortDir = "desc") {
    return http.get(`/super-admin/institutions?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
  }

  // Create new institution
  createInstitution(institutionData) {
    return http.post("/super-admin/institutions", institutionData);
  }

  // Update institution
  updateInstitution(institutionId, institutionData) {
    return http.put(`/super-admin/institutions/${institutionId}`, institutionData);
  }

  // Delete/Deactivate institution
  deleteInstitution(institutionId) {
    return http.delete(`/super-admin/institutions/${institutionId}`);
  }

  // Get institution statistics
  getInstitutionStats(institutionId) {
    return http.get(`/super-admin/institutions/${institutionId}/stats`);
  }

  // Get all institutions statistics (dashboard)
  getAllInstitutionsStats() {
    return http.get("/super-admin/stats");
  }

  // Toggle institution status
  toggleInstitutionStatus(institutionId, isActive) {
    return http.put(`/super-admin/institutions/${institutionId}/status`, { isActive });
  }

  // Extend subscription
  extendSubscription(institutionId, days) {
    return http.post(`/super-admin/institutions/${institutionId}/extend-subscription`, { days });
  }
}

export default new SuperAdminService();
