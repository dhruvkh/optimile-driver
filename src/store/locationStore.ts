import { create } from 'zustand';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  setLocation: (lat: number | ((prev: number | null) => number), lng: number | ((prev: number | null) => number)) => void;
  setAddress: (address: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  address: null,
  setLocation: (lat, lng) => set((state) => ({
    latitude: typeof lat === 'function' ? lat(state.latitude) : lat,
    longitude: typeof lng === 'function' ? lng(state.longitude) : lng
  })),
  setAddress: (address) => set({ address }),
}));
