import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTripStore } from '../store/tripStore';
import { useLocationStore } from '../store/locationStore';
import { BigActionButton } from '../components/BigActionButton';
import { Navigation as NavIcon, AlertTriangle, Share2, RefreshCw, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { offlineQueue } from '../services/offlineQueue';
import { SOSButton } from '../components/SOSButton';

// Custom Icons
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/741/741407.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: 'animate-pulse'
});

const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const tollIcon = new L.DivIcon({
  className: 'bg-yellow-400 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-xs',
  html: '₹',
  iconSize: [24, 24]
});

// Component to update map center when location changes
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const NavigationScreen = () => {
  const { currentTrip } = useTripStore();
  const { latitude, longitude, setLocation } = useLocationStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showDeviationAlert, setShowDeviationAlert] = useState(false);
  const [speed, setSpeed] = useState(0);
  const locationInterval = useRef<NodeJS.Timeout | null>(null);

  // Mock route polyline (straight line for demo)
  const routePolyline: [number, number][] = currentTrip ? [
    currentTrip.coordinates.start,
    [19.1, 73.0], // Intermediate point
    currentTrip.coordinates.end
  ] : [];

  // Mock toll booths
  const tollBooths: [number, number][] = [
    [19.05, 72.98],
    [19.15, 73.02]
  ];

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Start location tracking simulation
    if (currentTrip) {
      // Set initial location to start
      setLocation(currentTrip.coordinates.start[0], currentTrip.coordinates.start[1]);

      locationInterval.current = setInterval(() => {
        // Simulate movement towards destination
        setLocation((prevLat: number | null) => (prevLat || 0) + 0.001, (prevLng: number | null) => (prevLng || 0) + 0.001);
        setSpeed(Math.floor(Math.random() * (80 - 40) + 40)); // Random speed 40-80 km/h

        // Note: Real location updates are handled by locationService.ts in the background.
        // This interval is purely for UI simulation in the demo.

        // Simulate deviation check (randomly trigger)
        if (Math.random() > 0.98) {
          setShowDeviationAlert(true);
        }
      }, 3000); // Update every 3s for demo (60s in prod)
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, [currentTrip]);

  if (!currentTrip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <NavIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('no_active_trip')}</h2>
        <BigActionButton onClick={() => navigate('/home')}>Go to Home</BigActionButton>
      </div>
    );
  }

  const currentLocation: [number, number] = [latitude || currentTrip.coordinates.start[0], longitude || currentTrip.coordinates.start[1]];

  return (
    <div className="h-screen flex flex-col relative bg-gray-900">
      <SOSButton />
      {/* Offline Banner */}
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white p-2 text-center text-sm font-bold z-[2000] flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          Offline — GPS still active. Data will sync later.
        </div>
      )}

      {/* Top Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-2xl shadow-lg z-[1000] border border-white/10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Remaining</p>
            <h2 className="text-4xl font-black tracking-tighter">284 KM</h2>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-green-400">~4:30 PM</p>
            <p className="text-gray-400 text-xs font-bold uppercase">ETA</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">NH 48</div>
            <span className="text-sm font-medium text-gray-300">Mumbai-Pune Expy</span>
          </div>
          <div className="text-xl font-bold font-mono">{speed} <span className="text-xs text-gray-500">km/h</span></div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 z-0">
        <MapContainer 
          center={currentLocation} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={currentLocation} />
          
          <Polyline positions={routePolyline} color="#3b82f6" weight={6} opacity={0.8} />
          
          <Marker position={currentTrip.coordinates.start} icon={originIcon}>
            <Popup>Start: {currentTrip.origin}</Popup>
          </Marker>
          
          <Marker position={currentTrip.coordinates.end} icon={destinationIcon}>
            <Popup>End: {currentTrip.destination}</Popup>
          </Marker>

          <Marker position={currentLocation} icon={truckIcon} zIndexOffset={1000} />

          {tollBooths.map((pos, idx) => (
            <Marker key={idx} position={pos} icon={tollIcon} />
          ))}
        </MapContainer>
      </div>

      {/* Route Deviation Alert */}
      {showDeviationAlert && (
        <div className="absolute inset-0 z-[3000] bg-black/80 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Route Deviation Detected</h3>
            <p className="text-gray-500 mb-6">You are 5km off the assigned route. Is this intentional?</p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setShowDeviationAlert(false);
                  // Navigate to diversion request screen (mock)
                  alert('Diversion request sent');
                }}
                className="w-full h-12 bg-red-600 text-white rounded-xl font-bold"
              >
                YES — Request Diversion
              </button>
              <button 
                onClick={() => setShowDeviationAlert(false)}
                className="w-full h-12 bg-gray-100 text-gray-700 rounded-xl font-bold"
              >
                NO — Returning to Route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-[1000] p-6 pb-8">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Destination</p>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{currentTrip.destination}</h3>
            <p className="text-sm text-gray-500 font-mono mt-1">#{currentTrip.id}</p>
          </div>
          <button 
            onClick={() => navigate('/trip-detail')}
            className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <NavIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => navigate('/issue')}
            className="bg-red-50 text-red-700 h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-red-100 active:scale-95 transition-transform"
          >
            <AlertTriangle className="w-4 h-4" />
            REPORT
          </button>
          <button 
            onClick={() => alert('Location shared with Fleet Manager')}
            className="bg-blue-50 text-blue-700 h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-blue-100 active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4" />
            SHARE
          </button>
          <button 
            onClick={() => navigate('/trip-detail')}
            className="bg-orange-50 text-orange-700 h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-orange-100 active:scale-95 transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            STATUS
          </button>
        </div>
        
        <div className="mt-3">
          <button 
            onClick={() => navigate('/diversion')}
            className="w-full bg-amber-50 text-amber-700 h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-amber-100 active:scale-95 transition-transform"
          >
            <AlertTriangle className="w-4 h-4 rotate-180" />
            REPORT DIVERSION
          </button>
        </div>
      </div>
    </div>
  );
};
