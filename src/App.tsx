import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NavigationScreen } from './screens/NavigationScreen';
import { IssueReportScreen } from './screens/IssueReportScreen';
import { PODScreen } from './screens/PODScreen';
import { BottomTabNavigator } from './components/BottomTabNavigator';
import { useDriverStore } from './store/driverStore';
import { NotificationProvider } from './context/NotificationContext';
import { OnboardingScreen } from './screens/OnboardingScreen';
import './i18n';

import { TripDetailScreen } from './screens/TripDetailScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { DiversionScreen } from './screens/DiversionScreen';
import { FeatureGate } from './components/FeatureGate';
import { FEATURES } from './store/featureStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useDriverStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideTabs = ['/login', '/onboarding', '/navigation', '/trip-detail', '/issue', '/pod', '/diversion'].includes(location.pathname);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden font-sans">
      {children}
      {!hideTabs && <BottomTabNavigator />}
    </div>
  );
};

export default function App() {
  const { hasOnboarded } = useDriverStore();

  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/login" element={hasOnboarded ? <LoginScreen /> : <Navigate to="/onboarding" replace />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/home" element={<HomeScreen />} />
                  <Route path="/navigation" element={
                    <FeatureGate feature={FEATURES.NAVIGATION} redirectTo="/home">
                      <NavigationScreen />
                    </FeatureGate>
                  } />
                  <Route path="/trip-detail" element={
                    <FeatureGate feature={FEATURES.TRIP_DETAILS} redirectTo="/home">
                      <TripDetailScreen />
                    </FeatureGate>
                  } />
                  <Route path="/issue" element={
                    <FeatureGate feature={FEATURES.ISSUES} redirectTo="/home">
                      <IssueReportScreen />
                    </FeatureGate>
                  } />
                  <Route path="/pod" element={
                    <FeatureGate feature={FEATURES.POD} redirectTo="/home">
                      <PODScreen />
                    </FeatureGate>
                  } />
                  <Route path="/diversion" element={
                    <FeatureGate feature={FEATURES.DIVERSION} redirectTo="/home">
                      <DiversionScreen />
                    </FeatureGate>
                  } />
                  <Route path="/leaderboard" element={
                    <FeatureGate feature={FEATURES.LEADERBOARD} redirectTo="/home">
                      <LeaderboardScreen />
                    </FeatureGate>
                  } />
                  <Route path="/profile" element={
                    <FeatureGate feature={FEATURES.PROFILE} redirectTo="/home">
                      <ProfileScreen />
                    </FeatureGate>
                  } />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}
