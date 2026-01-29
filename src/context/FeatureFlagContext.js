import React, { createContext, useContext, useState, useEffect } from 'react';
import FeatureFlagService from '../service/featureFlag.service';

const FeatureFlagContext = createContext();

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

export const FeatureFlagProvider = ({ children }) => {
  const [featureFlags, setFeatureFlags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatureFlags();
    // Refresh every 5 minutes
    const interval = setInterval(loadFeatureFlags, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const response = await FeatureFlagService.getAllFeatureFlags();
      if (response.data.success) {
        setFeatureFlags(response.data.data || {});
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
      // Default to all features enabled if API fails
      setFeatureFlags({});
    } finally {
      setLoading(false);
    }
  };

  const isFeatureEnabled = (featureKey) => {
    // If flag doesn't exist, default to enabled
    return featureFlags[featureKey] !== false;
  };

  return (
    <FeatureFlagContext.Provider value={{ featureFlags, isFeatureEnabled, loading, refresh: loadFeatureFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

