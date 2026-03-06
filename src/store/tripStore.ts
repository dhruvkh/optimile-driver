import { create } from 'zustand';
import { api } from '../services/api';
import { locationService } from '../services/locationService';

export type TripStatus = 
  | 'ASSIGNED' 
  | 'ACCEPTED' 
  | 'ARRIVED_LOADING' 
  | 'LOADING_STARTED' 
  | 'IN_TRANSIT' 
  | 'REACHED_DESTINATION' 
  | 'UNLOADING_DONE' 
  | 'DELIVERED'
  | 'COMPLETED';

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  status: 'pending' | 'active' | 'completed' | 'issue'; // General status
  tripStatus: TripStatus; // Detailed flow status
  cargo: string;
  weight: string;
  distance: string;
  duration: string;
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  coordinates: {
    start: [number, number];
    end: [number, number];
  };
  consignor: { name: string; phone: string; address: string };
  consignee: { name: string; phone: string; address: string };
  fleetManager: { name: string; phone: string };
  specialInstructions?: string;
  eWayBillNo: string;
  tollBooths: string[];
  documents: { lr: boolean; invoice: boolean; eWay: boolean };
  diversion?: {
    status: 'none' | 'requested' | 'approved' | 'rejected';
    newAddress?: string;
    requestedBy?: 'consignee' | 'consignor';
    phone?: string;
    extraDistance?: string;
    reason?: string;
    managerNote?: string;
    extraCharge?: string;
  };
}

interface TripState {
  currentTrip: Trip | null;
  incomingTrip: Trip | null;
  trips: Trip[];
  setCurrentTrip: (trip: Trip | null) => void;
  setIncomingTrip: (trip: Trip | null) => void;
  updateTripStatus: (status: Trip['status']) => void;
  updateDetailedStatus: (status: TripStatus) => Promise<void>;
  requestDiversion: (data: NonNullable<Trip['diversion']>) => Promise<void>;
  resolveDiversion: (status: 'approved' | 'rejected', note?: string, charge?: string) => void;
  acceptTrip: () => Promise<void>;
  rejectTrip: (reason: string) => Promise<void>;
  fetchTrips: () => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
  currentTrip: null,
  incomingTrip: null,
  trips: [],
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setIncomingTrip: (trip) => set({ incomingTrip: trip }),
  updateTripStatus: (status) => set((state) => ({
    currentTrip: state.currentTrip ? { ...state.currentTrip, status } : null
  })),
  updateDetailedStatus: async (status) => {
    const { currentTrip } = get();
    if (!currentTrip) return;

    // Optimistic update
    set((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, tripStatus: status } : null
    }));

    try {
      // Sync with API
      // We need to send location and other data. For now just status.
      // In real app, we might capture location here too.
      await api.trip.updateStatus(currentTrip.id, { status });

      if (status === 'COMPLETED' || status === 'DELIVERED') {
        locationService.stopTracking();
      }
    } catch (error) {
      console.error('Failed to update trip status:', error);
      // Revert or handle error? For now, we rely on offline queue to eventually sync.
    }
  },
  requestDiversion: async (data) => {
    const { currentTrip } = get();
    if (!currentTrip) return;

    set((state) => ({
      currentTrip: state.currentTrip ? {
        ...state.currentTrip,
        diversion: { ...data, status: 'requested' }
      } : null
    }));

    try {
      await api.trip.requestDiversion(currentTrip.id, {
        newAddress: data.newAddress,
        requestedBy: data.requestedBy,
        phone: data.phone,
        reason: data.reason,
        extraKm: data.extraDistance
      });
    } catch (error) {
      console.error('Failed to request diversion:', error);
    }
  },
  resolveDiversion: (status, note, charge) => set((state) => ({
    currentTrip: state.currentTrip ? {
      ...state.currentTrip,
      diversion: { 
        ...state.currentTrip.diversion!, 
        status, 
        managerNote: note,
        extraCharge: charge 
      }
    } : null
  })),
  acceptTrip: async () => {
    const { incomingTrip } = get();
    if (incomingTrip) {
      // Optimistic update
      set({ 
        currentTrip: { ...incomingTrip, status: 'active', tripStatus: 'ACCEPTED' }, 
        incomingTrip: null 
      });

      try {
        await api.trip.accept(incomingTrip.id);
        locationService.startTracking(incomingTrip.id);
      } catch (error) {
        console.error('Failed to accept trip:', error);
        // If it fails and not offline, maybe revert?
        // But api.ts handles offline queueing.
      }
    }
  },
  rejectTrip: async (reason) => {
    const { incomingTrip } = get();
    if (incomingTrip) {
      const tripId = incomingTrip.id;
      set({ incomingTrip: null });
      try {
        await api.trip.decline(tripId, reason);
      } catch (error) {
        console.error('Failed to reject trip:', error);
      }
    }
  },
  fetchTrips: async () => {
    try {
      const activeTrip = await api.trip.getActive();
      if (activeTrip) {
        set({ currentTrip: activeTrip });
        locationService.startTracking(activeTrip.id);
      } else {
        set({ currentTrip: null });
        locationService.stopTracking();
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    }
  }
}));
