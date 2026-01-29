import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFeatureFlags } from '../../context/FeatureFlagContext';

/**
 * Route wrapper that checks feature flags before rendering.
 * Redirects to home if feature is disabled.
 */
export const FeatureFlagRoute = ({ featureKey, children, fallback = null }) => {
  const { isFeatureEnabled, loading } = useFeatureFlags();

  if (loading) {
    return fallback || <div>Loading...</div>;
  }

  if (!isFeatureEnabled(featureKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
