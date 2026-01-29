import httpCommon from "../http-common";
import authHeader from './auth-header';

class RateLimitService {
  getAllConfigs() {
    return httpCommon.get('/rate-limit/config', { headers: authHeader() });
  }

  updateConfigs(configUpdates) {
    return httpCommon.put('/rate-limit/config', configUpdates, { headers: authHeader() });
  }

  resetConfigs() {
    return httpCommon.post('/rate-limit/config/reset', {}, { headers: authHeader() });
  }
}

const rateLimitService = new RateLimitService();
export default rateLimitService;


