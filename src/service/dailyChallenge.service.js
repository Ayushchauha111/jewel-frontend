import http from "../http-common";

class DailyChallengeService {
  /**
   * Get today's challenge
   */
  getTodaysChallenge() {
    return http.get("/daily-challenge/today");
  }

  /**
   * Submit challenge attempt
   */
  submitAttempt(challengeId, wpm, accuracy, timeTaken) {
    return http.post("/daily-challenge/submit", {
      challengeId,
      wpm,
      accuracy,
      timeTaken
    });
  }

  /**
   * Get today's leaderboard
   */
  getLeaderboard() {
    return http.get("/daily-challenge/leaderboard");
  }

  /**
   * Get user's streak info
   */
  getUserStreak() {
    return http.get("/daily-challenge/streak");
  }

  /**
   * Get streak leaderboard
   */
  getStreakLeaderboard() {
    return http.get("/daily-challenge/streak-leaderboard");
  }
}

const dailyChallengeService = new DailyChallengeService();
export default dailyChallengeService;

