import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

export const FEATURES = {
  NAVIGATION: 'NAVIGATION',
  POD: 'POD',
  ISSUES: 'ISSUES',
  LEADERBOARD: 'LEADERBOARD',
  EARNINGS: 'EARNINGS',
  TRIP_DETAILS: 'TRIP_DETAILS',
  DIVERSION: 'DIVERSION',
  PROFILE: 'PROFILE',
  SOS: 'SOS',
} as const;

export type FeatureKey = keyof typeof FEATURES;

interface FeatureState {
  enabledFeatures: FeatureKey[];
  isLoading: boolean;
  setFeatures: (features: FeatureKey[]) => void;
  fetchFeatures: () => Promise<void>;
  isFeatureEnabled: (feature: FeatureKey) => boolean;
}

// Default features enabled for fallback
const DEFAULT_FEATURES: FeatureKey[] = [
  'NAVIGATION',
  'POD',
  'ISSUES',
  'LEADERBOARD',
  'EARNINGS',
  'TRIP_DETAILS',
  'DIVERSION',
  'PROFILE',
  'SOS'
];

export const useFeatureStore = create<FeatureState>()(
  persist(
    (set, get) => ({
      enabledFeatures: DEFAULT_FEATURES,
      isLoading: false,
      setFeatures: (features) => set({ enabledFeatures: features }),
      fetchFeatures: async () => {
        set({ isLoading: true });
        try {
          const config = await api.driver.getConfig();
          if (config && Array.isArray(config.features)) {
            set({ enabledFeatures: config.features });
          }
        } catch (error) {
          console.error('Failed to fetch feature config:', error);
          // Keep existing features on error (offline-first)
        } finally {
          set({ isLoading: false });
        }
      },
      isFeatureEnabled: (feature) => {
        return get().enabledFeatures.includes(feature);
      },
    }),
    {
      name: 'optimile-features',
    }
  )
);
