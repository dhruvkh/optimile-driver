import React, { useState, useEffect } from 'react';
import { useTripStore } from '../store/tripStore';
import { BigActionButton } from './BigActionButton';
import { MapPin, Clock, CheckCircle, XCircle, Truck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const IncomingTripAlert = () => {
  const { incomingTrip, acceptTrip, rejectTrip } = useTripStore();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  useEffect(() => {
    if (incomingTrip) {
      setTimeLeft(30);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAccept(); // Auto-accept
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [incomingTrip]);

  if (!incomingTrip) return null;

  const handleAccept = async () => {
    await acceptTrip();
    navigate('/trip-detail');
  };

  const handleReject = async (reason: string) => {
    console.log('Trip rejected:', reason);
    await rejectTrip(reason);
    setShowDeclineModal(false);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[2000] bg-green-600 text-white flex flex-col p-4 overflow-y-auto"
      >
        {!showDeclineModal ? (
          <>
            <div className="flex-1 flex flex-col items-center pt-8">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-6"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <Truck className="w-12 h-12 text-green-600" />
                </div>
              </motion.div>
              
              <h1 className="text-3xl font-black uppercase mb-2 text-center tracking-tight">New Trip Assigned</h1>
              <div className="bg-white/20 px-4 py-1 rounded-full mb-8 backdrop-blur-sm">
                <p className="text-green-50 font-bold">Auto-accepting in {timeLeft}s</p>
              </div>

              <div className="bg-white text-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl mb-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="w-0.5 h-12 bg-gray-200 my-1" />
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">From</p>
                        <p className="text-lg font-bold leading-tight">{incomingTrip.origin}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">To</p>
                        <p className="text-lg font-bold leading-tight">{incomingTrip.destination}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Distance</p>
                      <p className="text-lg font-bold">{incomingTrip.distance}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Weight</p>
                      <p className="text-lg font-bold">{incomingTrip.weight}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Client</p>
                      <p className="text-lg font-bold truncate">{incomingTrip.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Pickup By</p>
                      <p className="text-sm font-bold">{incomingTrip.pickupTime}</p>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-600 font-bold uppercase mb-1">Cargo</p>
                    <p className="text-orange-900 font-bold">{incomingTrip.cargo}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-4">
              <button 
                onClick={handleAccept}
                className="w-full h-[72px] rounded-2xl bg-white text-green-700 font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg uppercase tracking-wide"
              >
                <CheckCircle className="w-8 h-8" />
                Accept Trip
              </button>
              
              <button 
                onClick={() => setShowDeclineModal(true)}
                className="w-full h-14 rounded-2xl border-2 border-red-200 bg-red-500/10 text-red-100 font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <XCircle className="w-5 h-5" />
                Decline
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="bg-white text-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-center">Reason for Declining</h2>
              <div className="space-y-3">
                {[
                  "Can't reach loading point",
                  "Vehicle issue",
                  "Personal emergency",
                  "Other"
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleReject(reason)}
                    className="w-full p-4 rounded-xl border border-gray-200 text-left font-medium hover:bg-gray-50 active:bg-gray-100"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowDeclineModal(false)}
                className="w-full mt-6 p-4 font-bold text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
