import httpCommon from "../http-common";
import authHeader from './auth-header';

class ApiConfigService {
  getAllConfigs() {
    return httpCommon.get('/api-config', { headers: authHeader() });
  }

  getActiveConfigs() {
    return httpCommon.get('/api-config/active', { headers: authHeader() });
  }

  getConfigById(id) {
    return httpCommon.get(`/api-config/${id}`, { headers: authHeader() });
  }

  saveConfig(config) {
    return httpCommon.post('/api-config', config, { headers: authHeader() });
  }

  updateConfig(id, config) {
    return httpCommon.put(`/api-config/${id}`, config, { headers: authHeader() });
  }

  deleteConfig(id) {
    return httpCommon.delete(`/api-config/${id}`, { headers: authHeader() });
  }

  toggleActive(id) {
    return httpCommon.post(`/api-config/${id}/toggle`, {}, { headers: authHeader() });
  }
}

const apiConfigService = new ApiConfigService();
export default apiConfigService;


