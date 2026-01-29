import httpCommon from "../http-common";

class ConfigService {
  /**
   * Get all feature flags
   */
  getFeatureFlags() {
    return httpCommon.get("/config/features");
  }

  /**
   * Check if AI features are enabled
   */
  isAiEnabled() {
    return httpCommon.get("/config/ai-enabled");
  }
}

const configService = new ConfigService();
export default configService;

