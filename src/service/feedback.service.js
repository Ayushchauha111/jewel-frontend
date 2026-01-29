import http from "../http-common";

class FeedbackService {
  /**
   * Submit feedback
   */
  submitFeedback(name, email, message, rating) {
    return http.post("/feedback", {
      name,
      email,
      message,
      rating
    });
  }

  /**
   * Get approved feedbacks for homepage
   */
  getApprovedFeedbacks(limit = 10) {
    return http.get(`/feedback/approved?limit=${limit}`);
  }

  /**
   * Get all feedbacks (admin only)
   */
  getAllFeedbacks() {
    return http.get("/feedback/all");
  }

  /**
   * Approve feedback (admin only)
   */
  approveFeedback(id) {
    return http.post(`/feedback/${id}/approve`);
  }

  /**
   * Delete feedback (admin only)
   */
  deleteFeedback(id) {
    return http.delete(`/feedback/${id}`);
  }
}

const feedbackService = new FeedbackService();
export default feedbackService;

