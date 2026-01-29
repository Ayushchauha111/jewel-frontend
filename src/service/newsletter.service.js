import http from "../http-common";

class NewsletterService {
  /**
   * Subscribe to newsletter
   */
  subscribe(email) {
    return http.post("/newsletter/subscribe", null, {
      params: { email }
    });
  }

  /**
   * Unsubscribe from newsletter
   */
  unsubscribe(email) {
    return http.post("/newsletter/unsubscribe", null, {
      params: { email }
    });
  }

  /**
   * Get all subscribers (admin only)
   */
  getAllSubscribers() {
    return http.get("/newsletter/subscribers");
  }

  /**
   * Get subscriber count (admin only)
   */
  getSubscriberCount() {
    return http.get("/newsletter/subscribers/count");
  }

  /**
   * Send newsletter broadcast (admin only)
   */
  sendBroadcast(subject, message) {
    return http.post("/newsletter/broadcast", {
      subject,
      message
    });
  }

  /**
   * Delete subscriber (admin only)
   */
  deleteSubscriber(id) {
    return http.delete(`/newsletter/subscribers/${id}`);
  }
}

const newsletterService = new NewsletterService();
export default newsletterService;


