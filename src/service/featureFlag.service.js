import httpCommon from '../http-common';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class FeatureFlagService {
  checkFeature(featureKey) {
    return axios.get(`${API_URL}/api/feature-flags/check/${featureKey}`);
  }

  getAllFeatureFlags() {
    return axios.get(`${API_URL}/api/feature-flags/all`);
  }

  // Admin endpoints - use httpCommon which automatically adds Authorization header
  getAllFlags() {
    return httpCommon.get('/feature-flags/admin/all');
  }

  createOrUpdateFeatureFlag(featureKey, featureName, isEnabled, description, category, displayOrder) {
    return httpCommon.post(
      '/feature-flags/admin/create',
      null,
      {
        params: {
          featureKey,
          featureName,
          isEnabled,
          description,
          category,
          displayOrder
        }
      }
    );
  }

  toggleFeature(featureKey) {
    return httpCommon.put(`/feature-flags/admin/${featureKey}/toggle`);
  }

  setFeatureEnabled(featureKey, enabled) {
    return httpCommon.put(
      `/feature-flags/admin/${featureKey}/enable`,
      null,
      {
        params: { enabled }
      }
    );
  }
}

const featureFlagService = new FeatureFlagService();
export default featureFlagService;

