import http from "../http-common";

class AchievementService {
  /**
   * Get all achievements with user progress
   */
  getAllAchievements() {
    return http.get("/achievements");
  }

  /**
   * Get my achievements
   */
  getMyAchievements() {
    return http.get("/achievements/my");
  }

  /**
   * Check for new achievements after typing
   */
  checkAchievements(wpm, accuracy) {
    return http.post("/achievements/check", { wpm, accuracy });
  }

  /**
   * Toggle showcase status
   */
  toggleShowcase(achievementId) {
    return http.post(`/achievements/showcase/${achievementId}`);
  }

  /**
   * Get user's showcased achievements
   */
  getShowcasedAchievements(userId) {
    return http.get(`/achievements/showcased/${userId}`);
  }
}

const achievementService = new AchievementService();
export default achievementService;

