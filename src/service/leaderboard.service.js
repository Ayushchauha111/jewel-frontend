import http from "../http-common";

class LeaderboardService {
  getSpeedLeaderboard(limit = 50) {
    return http.get(`/leaderboard/speed?limit=${limit}`);
  }

  getStreakLeaderboard(limit = 50) {
    return http.get(`/leaderboard/streaks?limit=${limit}`);
  }

  getXpLeaderboard(limit = 50) {
    return http.get(`/leaderboard/xp?limit=${limit}`);
  }

  getOverallStats() {
    return http.get("/leaderboard/overall");
  }
}

const leaderboardService = new LeaderboardService();
export default leaderboardService;

