import { api } from './api';

interface Location {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

class LocationService {
  private watchId: number | null = null;
  private lastLocation: Location | null = null;
  private isTracking: boolean = false;
  private tripId: string | null = null;
  private stoppedSince: number | null = null;
  private updateInterval: any = null;
  private lastSentTime: number = 0;

  startTracking(tripId: string) {
    if (this.isTracking) return;

    this.tripId = tripId;
    this.isTracking = true;
    this.stoppedSince = null;

    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handlePositionUpdate(position),
        (error) => console.error('Location Error:', error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      // Send update every 60s if location hasn't changed enough to trigger watchPosition?
      // Actually watchPosition triggers on change. But we want to send to API every 60s.
      // So we should buffer the latest location and send it periodically.
      this.updateInterval = setInterval(() => this.sendLocationUpdate(), 60000);
    } else {
      console.error('Geolocation not supported');
    }
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isTracking = false;
    this.tripId = null;
    this.lastLocation = null;
    this.stoppedSince = null;
  }

  private handlePositionUpdate(position: GeolocationPosition) {
    const { latitude, longitude, speed, heading } = position.coords;
    const timestamp = position.timestamp;

    this.lastLocation = {
      latitude,
      longitude,
      speed,
      heading,
      timestamp,
    };

    this.checkStoppedState(speed);
    this.checkRouteDeviation(latitude, longitude);
  }

  private async sendLocationUpdate() {
    if (!this.lastLocation || !this.tripId) return;

    // Throttle: only send if 60s passed (setInterval handles this, but just in case)
    const now = Date.now();
    if (now - this.lastSentTime < 55000) return; 

    try {
      await api.trip.updateLocation(this.tripId, {
        lat: this.lastLocation.latitude,
        lng: this.lastLocation.longitude,
        speed: this.lastLocation.speed,
        heading: this.lastLocation.heading,
        timestamp: this.lastLocation.timestamp,
      });
      this.lastSentTime = now;
    } catch (error) {
      console.error('Failed to send location update:', error);
    }
  }

  private checkStoppedState(speed: number | null) {
    // If speed is null, we can't be sure. Assume 0 if null? Or ignore?
    // Web geolocation often returns null for speed.
    // Let's assume < 1 m/s is stopped.
    const isStopped = (speed || 0) < 1;

    if (isStopped) {
      if (!this.stoppedSince) {
        this.stoppedSince = Date.now();
      } else {
        const stoppedDuration = Date.now() - this.stoppedSince;
        if (stoppedDuration > 30 * 60 * 1000) { // 30 minutes
          // Trigger alert
          this.triggerStoppedAlert();
          // Reset timer to avoid spamming? Or keep alerting?
          // Let's reset for now or just log it.
          console.warn('Driver stopped for > 30 mins');
        }
      }
    } else {
      this.stoppedSince = null;
    }
  }

  private triggerStoppedAlert() {
    // In a real app, this would trigger a push notification or modal.
    // For now, we'll dispatch a custom event or just log.
    window.dispatchEvent(new CustomEvent('DRIVER_STOPPED_ALERT'));
    alert('Are you stopped? Report an issue if needed.');
  }

  private checkRouteDeviation(lat: number, lng: number) {
    // Mock deviation check
    // In real app, we'd compare against the route polyline.
    // Here we'll just log.
    // console.log('Checking route deviation...', lat, lng);
  }
}

export const locationService = new LocationService();
