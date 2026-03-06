/// <reference types="vite/client" />
import { useDriverStore } from '../store/driverStore';
import { offlineQueue, QueuedRequest } from './offlineQueue';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.optimile.in';

interface ApiConfig {
  method: string;
  body?: any;
  headers?: Record<string, string>;
  skipQueue?: boolean;
}

const getAuthToken = () => useDriverStore.getState().authToken;

const getMockResponse = async (endpoint: string, config: ApiConfig) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency

  if (endpoint === '/auth/driver/send-otp') {
    return { success: true, message: 'OTP sent successfully' };
  }
  
  if (endpoint === '/auth/driver/verify-otp') {
    return {
      token: 'mock-jwt-token-xyz',
      driver: {
        id: 'DRV-007',
        name: 'Rajesh Kumar',
        phone: config.body?.phone || '+919876543210',
        vehicleId: 'MH-04-AB-1234',
        type: 'OWN_FLEET'
      }
    };
  }

  if (endpoint === '/driver/trip/active') {
    return null; // No active trip initially
  }

  if (endpoint === '/driver/profile') {
    return {
      totalTrips: 142,
      rating: 4.8,
      earnings: '12,450'
    };
  }

  if (endpoint.includes('/leaderboard')) {
    return {
      rankings: [
        { id: '1', name: 'Vikram Singh', rank: 1, score: 980, trips: 45, avatarUrl: 'https://i.pravatar.cc/150?u=1', trend: 'up', trendValue: 2 },
        { id: '2', name: 'Amit Patel', rank: 2, score: 945, trips: 42, avatarUrl: 'https://i.pravatar.cc/150?u=3', trend: 'same', trendValue: 0 },
        { id: '3', name: 'Suresh Yadav', rank: 3, score: 910, trips: 38, avatarUrl: 'https://i.pravatar.cc/150?u=4', trend: 'up', trendValue: 1 },
        { id: 'DRV-007', name: 'Rajesh Kumar', rank: 4, score: 850, trips: 32, avatarUrl: 'https://i.pravatar.cc/150?u=2', trend: 'down', trendValue: 1 },
        { id: '5', name: 'Rahul Sharma', rank: 5, score: 820, trips: 30, avatarUrl: 'https://i.pravatar.cc/150?u=5', trend: 'same', trendValue: 0 },
      ]
    };
  }

  if (endpoint === '/driver/config') {
    return {
      features: [
        'NAVIGATION',
        'POD',
        'ISSUES',
        'LEADERBOARD',
        'EARNINGS',
        'TRIP_DETAILS',
        'DIVERSION',
        'PROFILE',
        'SOS'
      ]
    };
  }

  // Default success for other POST actions
  return { success: true };
};

const apiRequest = async (endpoint: string, config: ApiConfig = { method: 'GET' }) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...config.headers,
  };

  // Check for offline status first
  if (!navigator.onLine && config.method !== 'GET' && !config.skipQueue) {
    console.log('Offline: Queuing request', endpoint);
    offlineQueue.addToQueue(endpoint, config.method, config.body);
    throw new Error('Offline: Request queued');
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: config.method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    // If we are in dev mode or using the placeholder API, fallback to mock data
    if (API_URL.includes('optimile.in') || import.meta.env.DEV) {
      console.warn(`API Error (${error.message}). Falling back to mock data for: ${endpoint}`);
      return getMockResponse(endpoint, config);
    }

    if (!navigator.onLine && config.method !== 'GET' && !config.skipQueue) {
      console.log('Network Error: Queuing request', endpoint);
      offlineQueue.addToQueue(endpoint, config.method, config.body);
      throw new Error('Network Error: Request queued');
    }
    throw error;
  }
};

export const api = {
  auth: {
    sendOtp: (phone: string) => apiRequest('/auth/driver/send-otp', { method: 'POST', body: { phone } }),
    verifyOtp: (phone: string, otp: string) => apiRequest('/auth/driver/verify-otp', { method: 'POST', body: { phone, otp } }),
  },
  trip: {
    getActive: () => apiRequest('/driver/trip/active', { method: 'GET' }),
    accept: (id: string) => apiRequest(`/trips/${id}/accept`, { method: 'POST' }),
    decline: (id: string, reason: string) => apiRequest(`/trips/${id}/decline`, { method: 'POST', body: { reason } }),
    updateStatus: (id: string, data: any) => apiRequest(`/trips/${id}/status`, { method: 'POST', body: data }),
    updateLocation: (id: string, data: any) => apiRequest(`/trips/${id}/location`, { method: 'POST', body: data }),
    submitPod: (id: string, data: any) => apiRequest(`/trips/${id}/pod`, { method: 'POST', body: data }),
    requestDiversion: (id: string, data: any) => apiRequest(`/trips/${id}/diversion`, { method: 'POST', body: data }),
  },
  issues: {
    report: (data: any) => apiRequest('/exceptions', { method: 'POST', body: data }),
  },
  driver: {
    getProfile: () => apiRequest('/driver/profile', { method: 'GET' }),
    getLeaderboard: (period: 'month' | 'week' = 'week') => apiRequest(`/driver/leaderboard?period=${period}`, { method: 'GET' }),
    getEarnings: (month?: string) => apiRequest(`/driver/earnings${month ? `?month=${month}` : ''}`, { method: 'GET' }),
    getConfig: () => apiRequest('/driver/config', { method: 'GET' }),
  },
};

// Process offline queue when online
window.addEventListener('online', () => {
  console.log('Online: Processing offline queue...');
  offlineQueue.processQueue(async (req: QueuedRequest) => {
    // Skip queueing when processing from queue to avoid duplicates
    await apiRequest(req.endpoint, { method: req.method, body: req.body, skipQueue: true });
  });
});
