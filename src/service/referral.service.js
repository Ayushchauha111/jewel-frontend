import http from "../http-common-referral";

class ReferralService {
  
  /**
   * Generate referral code for current user
   */
  generateReferralCode() {
    return http.get("/generate");
  }

  /**
   * Track a referral when new user registers
   */
  trackReferral(referralCode, newUserId) {
    return http.post(`/track?referralCode=${encodeURIComponent(referralCode)}&newUserId=${encodeURIComponent(newUserId)}`);
  }

  /**
   * Get referral stats for a user
   */
  getReferralStats(userId) {
    return http.get(`/stats/${userId}`);
  }

  /**
   * Store referral code from URL in localStorage
   */
  storeReferralFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
      // Clean URL without refresh
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return refCode;
    }
    return null;
  }

  /**
   * Get stored referral code
   */
  getStoredReferralCode() {
    return localStorage.getItem('referralCode');
  }

  /**
   * Clear stored referral code after use
   */
  clearStoredReferralCode() {
    localStorage.removeItem('referralCode');
  }
}

export default new ReferralService();