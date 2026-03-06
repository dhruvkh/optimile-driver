import React from 'react';
import { useFeatureStore, FeatureKey } from '../store/featureStore';
import { Navigate } from 'react-router-dom';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback = null,
  redirectTo
}) => {
  const isEnabled = useFeatureStore((state) => state.isFeatureEnabled(feature));

  if (!isEnabled) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
