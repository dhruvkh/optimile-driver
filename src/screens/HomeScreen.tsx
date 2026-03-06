import React, { useEffect, useState } from 'react';
import { useTripStore } from '../store/tripStore';
import { useDriverStore } from '../store/driverStore';
import { offlineQueue } from '../services/offlineQueue';
import { BigActionButton } from '../components/BigActionButton';
import { IncomingTripAlert } from '../components/IncomingTripAlert';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, AlertTriangle, Package, Trophy, 
  Navigation, FileText, ArrowRight, Circle, RefreshCw 
} from 'lucide-react';
import { motion } from 'motion/react';
import { SOSButton } from '../components/SOSButton';
import { useNotifications } from '../context/NotificationContext';
import { useFeatureStore, FEATURES } from '../store/featureStore';
import { FeatureGate } from '../components/FeatureGate';

export const HomeScreen = () => {
  const { currentTrip, setIncomingTrip } = useTripStore();
  const { name, vehicleId, isOnline } = useDriverStore();
  const { isFeatureEnabled } = useFeatureStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isLive, setIsLive] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  // Simulate real-time behavior
  useEffect(() => {
    // Simulate WebSocket connection
    const wsTimer = setTimeout(() => setIsLive(true), 2000);

    // Subscribe to offline queue updates
    const unsubscribeQueue = offlineQueue.subscribe(() => {
      setOfflineCount(offlineQueue.getQueue().length);
    });
    // Initial count
    setOfflineCount(offlineQueue.getQueue().length);

    // Simulate incoming trip after 5 seconds if no active trip
    const tripTimer = setTimeout(() => {
      if (!currentTrip) {
        addNotification('NEW_TRIP', 'New Trip Assigned', 'Pickup at Nhava Sheva Port');
        setIncomingTrip({
          id: 'TRP-NEW-001',
          origin: 'Nhava Sheva Port, Mumbai',
          destination: 'Bhiwandi Warehouse, Thane',
          status: 'pending',
          tripStatus: 'ASSIGNED',
          cargo: 'Auto Parts',
          weight: '2.5 Tons',
          distance: '45 km',
          duration: '1h 20m',
          customerName: 'Tata Motors',
          customerPhone: '+91 98765 43210',
          pickupTime: 'Today, 2:30 PM',
          coordinates: {
            start: [18.95, 72.95],
            end: [19.29, 73.06]
          },
          consignor: {
            name: 'Ramesh Logistics',
            phone: '+91 98765 00001',
            address: 'Plot 45, JNPT Port, Navi Mumbai'
          },
          consignee: {
            name: 'Tata Assembly Plant',
            phone: '+91 98765 00002',
            address: 'Industrial Area, Bhiwandi'
          },
          fleetManager: {
            name: 'Suresh Boss',
            phone: '+91 98765 00003'
          },
          specialInstructions: 'Handle with care. Glass components inside.',
          eWayBillNo: '1234 5678 9012',
          tollBooths: ['Vashi Toll Plaza', 'Mulund Toll Naka'],
          documents: { lr: false, invoice: false, eWay: true }
        });
      }
    }, 5000);

    return () => {
      clearTimeout(wsTimer);
      clearTimeout(tripTimer);
      unsubscribeQueue();
    };
  }, [currentTrip, setIncomingTrip]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-20 relative overflow-hidden">
      <IncomingTripAlert />
      <FeatureGate feature={FEATURES.SOS}>
        <SOSButton />
      </FeatureGate>

      {/* Section 1: Driver Greeting Bar */}
      <header className="bg-slate-900 text-white p-6 pt-12 pb-8 rounded-b-3xl shadow-xl z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold border-2 border-blue-400">
              {name?.charAt(0)}
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Good Morning,</p>
              <h1 className="text-xl font-bold leading-tight">{name}</h1>
              <div className="inline-flex items-center gap-2 mt-1 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                <span className="text-xs font-mono text-slate-300">{vehicleId}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
            {isLive && (
              <div className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                <Circle className="w-2 h-2 fill-current animate-ping" />
                LIVE
              </div>
            )}
            {offlineCount > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-[10px] font-bold border border-amber-500/30 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {offlineCount} PENDING
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Section 2: Active Trip Card */}
      <div className="px-4 -mt-6 z-20 mb-6">
        {currentTrip ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-orange-100 text-xs font-bold uppercase">Current Trip</p>
                <h2 className="text-2xl font-black tracking-tight">#{currentTrip.id}</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg">
                <p className="text-xs font-bold">Pickup: 10:00 AM</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1">
                <p className="text-orange-100 text-xs font-bold uppercase mb-1">Origin</p>
                <p className="font-bold text-lg leading-tight truncate">{currentTrip.origin}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-orange-200 shrink-0" />
              <div className="flex-1 text-right">
                <p className="text-orange-100 text-xs font-bold uppercase mb-1">Destination</p>
                <p className="font-bold text-lg leading-tight truncate">{currentTrip.destination}</p>
              </div>
            </div>

            <div className="mb-8 text-center bg-black/10 rounded-xl py-4 border border-black/5">
              <p className="text-orange-100 text-xs font-bold uppercase mb-1">Distance Remaining</p>
              <p className="text-4xl font-black tracking-tighter">{currentTrip.distance}</p>
            </div>

            <div className="flex gap-3">
              <FeatureGate feature={FEATURES.NAVIGATION}>
                <button 
                  onClick={() => navigate('/navigation')}
                  className="flex-1 bg-white text-orange-600 h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                >
                  <Navigation className="w-5 h-5" />
                  NAVIGATE
                </button>
              </FeatureGate>
              <FeatureGate feature={FEATURES.TRIP_DETAILS}>
                <button 
                  onClick={() => navigate('/trip-detail')}
                  className="flex-1 bg-orange-600 text-white border border-orange-400 h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                >
                  <FileText className="w-5 h-5" />
                  DETAILS
                </button>
              </FeatureGate>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Trip</h2>
            <p className="text-gray-500 font-medium animate-pulse">Waiting for assignment...</p>
          </div>
        )}
      </div>

      {/* Section 3: Quick Action Row */}
      <div className="px-4 grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: MapPin, label: 'Locate', color: 'text-blue-600', bg: 'bg-blue-50', action: () => {}, feature: null },
          { icon: AlertTriangle, label: 'Issue', color: 'text-red-600', bg: 'bg-red-50', action: () => navigate('/issue'), feature: FEATURES.ISSUES },
          { icon: Package, label: 'POD', color: 'text-orange-600', bg: 'bg-orange-50', action: () => navigate('/pod'), feature: FEATURES.POD },
          { icon: Trophy, label: 'Rank', color: 'text-indigo-600', bg: 'bg-indigo-50', action: () => navigate('/leaderboard'), feature: FEATURES.LEADERBOARD },
        ]
        .filter(item => !item.feature || isFeatureEnabled(item.feature))
        .map((item, idx) => (
          <button 
            key={idx}
            onClick={item.action}
            className={`${item.bg} flex flex-col items-center justify-center p-3 rounded-xl active:scale-95 transition-transform h-24 border border-gray-100 shadow-sm`}
          >
            <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Section 4: Today's Stats Bar */}
      <FeatureGate feature={FEATURES.EARNINGS}>
        <div className="mt-auto bg-slate-900 text-white p-4 pb-8">
          <div className="flex justify-between divide-x divide-slate-700">
            <div className="px-2 text-center flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Driven</p>
              <p className="text-lg font-bold">124 km</p>
            </div>
            <div className="px-2 text-center flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Trips</p>
              <p className="text-lg font-bold">2</p>
            </div>
            <div className="px-2 text-center flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Earned</p>
              <p className="text-lg font-bold text-green-400">₹850</p>
            </div>
            <div className="px-2 text-center flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Rating</p>
              <p className="text-lg font-bold text-yellow-400">4.9</p>
            </div>
          </div>
        </div>
      </FeatureGate>
    </div>
  );
};
