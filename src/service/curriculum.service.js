import http from "../http-common";

class CurriculumService {
  // Product endpoints
  getAllProducts() {
    return http.get("/curriculum/products");
  }

  getProductByProductId(productId) {
    return http.get(`/curriculum/products/${productId}`);
  }

  // Unit endpoints
  getUnitsByProductId(productId) {
    return http.get(`/curriculum/products/${productId}/units`);
  }

  getUnitByUnitId(productId, unitId) {
    return http.get(`/curriculum/products/${productId}/units/${unitId}`);
  }

  // Lesson endpoints
  getLessonsByUnitId(unitId) {
    return http.get(`/curriculum/units/${unitId}/lessons`);
  }

  getLessonByLessonId(unitId, lessonId) {
    return http.get(`/curriculum/units/${unitId}/lessons/${lessonId}`);
  }

  // Screen endpoints
  getScreensByLessonId(lessonId) {
    return http.get(`/curriculum/lessons/${lessonId}/screens`);
  }

  // Progress endpoints
  updateProgress(progressData) {
    return http.post("/curriculum/progress/update", progressData);
  }

  getProgress(lessonId) {
    return http.get(`/curriculum/progress/lesson/${lessonId}`);
  }

  getProgressForUnit(unitId) {
    return http.get(`/curriculum/progress/unit/${unitId}`);
  }

  getStats() {
    return http.get("/curriculum/progress/stats");
  }

  // Daily Goal endpoints
  setDailyGoal(goalMinutes) {
    return http.post("/daily-goal/set", {
      goalMinutes
    });
  }

  getDailyGoal() {
    return http.get("/daily-goal/get");
  }

  updateDailyGoalTime(additionalSeconds) {
    return http.post("/daily-goal/update-time", {
      additionalSeconds
    });
  }

  getDailyGoalStats() {
    return http.get("/daily-goal/stats");
  }
}

export default new CurriculumService();
