import { useDriverStore } from '../store/driverStore';

type SocketEventListener = (data: any) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, SocketEventListener[]> = new Map();
  private reconnectInterval: number = 5000;
  private reconnectTimer: any = null;
  private isConnecting: boolean = false;

  connect() {
    const token = useDriverStore.getState().authToken;
    if (!token || this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;

    this.isConnecting = true;
    const wsUrl = `wss://api.optimile.in/driver-ws?token=${token}`;

    console.log('Connecting to WebSocket...');
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.isConnecting = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;
        this.emit(type, payload);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket Disconnected');
      this.isConnecting = false;
      this.socket = null;
      this.scheduleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      this.socket?.close();
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.reconnectTimer = null;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  on(event: string, callback: SocketEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: SocketEventListener) {
    if (!this.listeners.has(event)) {
      return;
    }
    const callbacks = this.listeners.get(event) || [];
    this.listeners.set(event, callbacks.filter((cb) => cb !== callback));
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export const socketService = new SocketService();

// Auto-connect when token changes
useDriverStore.subscribe((state, prevState) => {
  if (state.authToken && !prevState.authToken) {
    socketService.connect();
  } else if (!state.authToken && prevState.authToken) {
    socketService.disconnect();
  }
});
