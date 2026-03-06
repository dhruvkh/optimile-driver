import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X, AlertTriangle, CheckCircle, Navigation, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type NotificationType = 
  | 'NEW_TRIP' 
  | 'TRIP_CANCELLED' 
  | 'DIVERSION_RESULT' 
  | 'MANAGER_CALL' 
  | 'POD_REMINDER' 
  | 'DAILY_SUMMARY';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, title: string, message: string, data?: any) => void;
  removeNotification: (id: string) => void;
  requestPermissions: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  const addNotification = (type: NotificationType, title: string, message: string, data?: any) => {
    const id = Date.now().toString();
    const newNotification = { id, type, title, message, data, timestamp: Date.now() };
    setNotifications((prev) => [newNotification, ...prev]);

    // Auto-dismiss after 5 seconds unless it's a critical alert
    if (type !== 'NEW_TRIP' && type !== 'MANAGER_CALL') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const requestPermissions = async () => {
    // Simulate permission request
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    removeNotification(notification.id);
    
    switch (notification.type) {
      case 'NEW_TRIP':
        // Logic to open trip modal handled by HomeScreen usually, 
        // but we can navigate or trigger global state
        navigate('/home'); 
        break;
      case 'DIVERSION_RESULT':
        navigate('/diversion');
        break;
      case 'POD_REMINDER':
        navigate('/pod');
        break;
      case 'MANAGER_CALL':
        window.location.href = 'tel:+919876543210';
        break;
      case 'DAILY_SUMMARY':
        navigate('/leaderboard');
        break;
      default:
        break;
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'NEW_TRIP': return <Navigation className="w-5 h-5 text-blue-600" />;
      case 'TRIP_CANCELLED': return <X className="w-5 h-5 text-red-600" />;
      case 'DIVERSION_RESULT': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'MANAGER_CALL': return <Phone className="w-5 h-5 text-green-600" />;
      case 'POD_REMINDER': return <CheckCircle className="w-5 h-5 text-purple-600" />;
      case 'DAILY_SUMMARY': return <Calendar className="w-5 h-5 text-amber-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, requestPermissions }}>
      {children}
      
      {/* Notification Overlay */}
      <div className="fixed top-4 left-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 pointer-events-auto flex items-start gap-3 max-w-md mx-auto w-full"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="bg-gray-50 p-2 rounded-full shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{notification.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{notification.message}</p>
                
                {notification.type === 'MANAGER_CALL' && (
                  <button className="mt-2 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Phone className="w-3 h-3" /> CALL BACK
                  </button>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
