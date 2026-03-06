import { v4 as uuidv4 } from 'uuid';

export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: string;
  body: any;
  timestamp: number;
}

const QUEUE_KEY = 'optimile_offline_queue';

export const offlineQueue = {
  getQueue: (): QueuedRequest[] => {
    try {
      const queue = localStorage.getItem(QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error reading offline queue:', error);
      return [];
    }
  },

  listeners: [] as (() => void)[],

  subscribe: (listener: () => void) => {
    offlineQueue.listeners.push(listener);
    return () => {
      offlineQueue.listeners = offlineQueue.listeners.filter((l) => l !== listener);
    };
  },

  notifyListeners: () => {
    offlineQueue.listeners.forEach((listener) => listener());
  },

  addToQueue: (endpoint: string, method: string, body: any) => {
    const queue = offlineQueue.getQueue();
    const newRequest: QueuedRequest = {
      id: uuidv4(),
      endpoint,
      method,
      body,
      timestamp: Date.now(),
    };
    queue.push(newRequest);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    offlineQueue.notifyListeners();
    return newRequest;
  },

  removeFromQueue: (id: string) => {
    const queue = offlineQueue.getQueue();
    const newQueue = queue.filter((req) => req.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    offlineQueue.notifyListeners();
  },

  clearQueue: () => {
    localStorage.removeItem(QUEUE_KEY);
    offlineQueue.notifyListeners();
  },

  processQueue: async (apiCall: (req: QueuedRequest) => Promise<void>) => {
    const queue = offlineQueue.getQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} offline requests...`);

    // Process sequentially to maintain order
    for (const request of queue) {
      try {
        await apiCall(request);
        offlineQueue.removeFromQueue(request.id);
      } catch (error) {
        console.error(`Failed to process queued request ${request.id}:`, error);
        // Stop processing if one fails to preserve order dependency?
        // Or continue? For now, we'll stop to prevent out-of-order updates
        // unless it's a 4xx error which might be permanent.
        // Simple retry logic: stop on network error, continue on 4xx (and maybe discard).
        break; 
      }
    }
  }
};
