import React, { useState } from 'react';
import { Phone, AlertTriangle, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore } from '../store/tripStore';
import { useLocationStore } from '../store/locationStore';

export const SOSButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { currentTrip } = useTripStore();
  const { latitude, longitude } = useLocationStore();

  const handleEmergency = async () => {
    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('POST /emergency', {
      tripId: currentTrip?.id,
      lat: latitude,
      lng: longitude,
      timestamp: Date.now()
    });

    // Simulate SMS
    console.log('SMS sent to emergency contact');

    setIsSending(false);
    setIsOpen(false);
    
    // Dial 112
    window.location.href = 'tel:112';
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-red-600 rounded-full shadow-lg shadow-red-600/40 flex items-center justify-center z-50 border-4 border-white"
      >
        <AlertTriangle className="w-6 h-6 text-white fill-white" />
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-red-600 p-6 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase">Emergency?</h2>
                <p className="text-red-100 text-sm mt-1">This will alert your manager and dial 112.</p>
              </div>

              <div className="p-6 space-y-3">
                <button
                  onClick={handleEmergency}
                  disabled={isSending}
                  className="w-full h-14 bg-red-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    'SENDING ALERT...'
                  ) : (
                    <>
                      <Phone className="w-5 h-5 fill-current" />
                      YES, CALL HELP
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full h-14 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg active:scale-95 transition-transform"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
