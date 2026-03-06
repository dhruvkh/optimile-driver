import { create } from 'zustand';
import { api } from '../services/api';

interface DriverProfile {
  totalTrips: number;
  rating: number;
  earnings: number;
  badges?: string[];
}

interface DriverState {
  isAuthenticated: boolean;
  driverId: string | null;
  name: string | null;
  mobileNumber: string | null;
  vehicleId: string | null;
  authToken: string | null;
  language: 'en' | 'hi';
  isOnline: boolean;
  driverType: 'OWN_FLEET' | 'MARKET_HIRE';
  profileStats: DriverProfile | null;
  hasOnboarded: boolean;
  login: (data: { driverId: string; name: string; mobileNumber: string; vehicleId: string; authToken: string; driverType?: 'OWN_FLEET' | 'MARKET_HIRE' }) => void;
  logout: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  setOnlineStatus: (status: boolean) => void;
  setOnboarded: () => void;
  fetchProfile: () => Promise<void>;
}

export const useDriverStore = create<DriverState>((set) => ({
  isAuthenticated: false,
  driverId: null,
  name: null,
  mobileNumber: null,
  vehicleId: null,
  authToken: null,
  language: 'en',
  isOnline: true,
  driverType: 'OWN_FLEET',
  profileStats: null,
  hasOnboarded: localStorage.getItem('hasOnboarded') === 'true',
  login: (data) => set({ 
    isAuthenticated: true, 
    driverId: data.driverId,
    name: data.name,
    mobileNumber: data.mobileNumber,
    vehicleId: data.vehicleId,
    authToken: data.authToken,
    driverType: data.driverType || 'OWN_FLEET'
  }),
  logout: () => set({ 
    isAuthenticated: false, 
    driverId: null, 
    name: null, 
    mobileNumber: null, 
    vehicleId: null, 
    authToken: null,
    driverType: 'OWN_FLEET',
    profileStats: null
  }),
  setLanguage: (lang) => set({ language: lang }),
  setOnlineStatus: (status) => set({ isOnline: status }),
  setOnboarded: () => {
    localStorage.setItem('hasOnboarded', 'true');
    set({ hasOnboarded: true });
  },
  fetchProfile: async () => {
    try {
      const data = await api.driver.getProfile();
      if (data) {
        set({ 
          name: data.name,
          driverId: data.id,
          mobileNumber: data.phone,
          vehicleId: data.vehicleId,
          driverType: data.type,
          profileStats: data.stats
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }
}));
