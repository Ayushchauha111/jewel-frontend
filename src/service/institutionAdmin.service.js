import http from "../http-common";

class InstitutionAdminService {
  // Get all institutions for logged-in admin
  getAllInstitutions() {
    return http.get("/institution-admin/institutions");
  }

  // Get institution details for logged-in admin (returns most recent if multiple)
  getInstitution() {
    return http.get("/institution-admin/institution");
  }

  // Get specific institution by ID
  getInstitutionById(institutionId) {
    return http.get(`/institution-admin/institution/${institutionId}`);
  }

  // Update white-label settings
  updateWhiteLabelSettings(settings) {
    return http.put("/institution-admin/white-label", settings);
  }

  // Get dashboard statistics
  getDashboardStats(institutionId = null) {
    const url = institutionId 
      ? `/institution-admin/dashboard/stats?institutionId=${institutionId}`
      : "/institution-admin/dashboard/stats";
    return http.get(url);
  }

  // Get all students in institution
  getInstitutionStudents() {
    return http.get("/institution-admin/students");
  }
}

export default new InstitutionAdminService();
