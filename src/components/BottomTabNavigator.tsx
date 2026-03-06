import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Navigation, AlertTriangle, User, FileText, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useDriverStore } from '../store/driverStore';
import { useFeatureStore, FEATURES } from '../store/featureStore';

export const BottomTabNavigator = () => {
  const { t } = useTranslation();
  const { driverType } = useDriverStore();
  const { isFeatureEnabled } = useFeatureStore();
  
  const tabs = [
    { id: 'home', icon: Home, label: t('active_trip'), path: '/home', feature: null },
    { id: 'nav', icon: Navigation, label: t('navigation'), path: '/navigation', feature: FEATURES.NAVIGATION },
    { id: 'issue', icon: AlertTriangle, label: t('report_issue'), path: '/issue', feature: FEATURES.ISSUES },
    { id: 'leaderboard', icon: Trophy, label: t('leaderboard'), path: '/leaderboard', feature: FEATURES.LEADERBOARD },
    { id: 'profile', icon: User, label: t('profile'), path: '/profile', feature: FEATURES.PROFILE },
  ];

  const visibleTabs = tabs.filter(tab => 
    (!tab.feature || isFeatureEnabled(tab.feature)) &&
    (tab.id !== 'leaderboard' || driverType === 'OWN_FLEET')
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-2 flex justify-around items-end h-[80px] z-50">
      {visibleTabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.path}
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full h-full pb-2
            ${isActive ? 'text-blue-600' : 'text-gray-400'}
          `}
        >
          <tab.icon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-center leading-tight">
            {tab.label}
          </span>
        </NavLink>
      ))}
    </div>
  );
};
