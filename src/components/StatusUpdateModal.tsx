import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Camera } from 'lucide-react';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  requirePhoto?: boolean;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ 
  isOpen, onClose, onConfirm, title, description, requirePhoto 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500">{description}</p>
          </div>

          {requirePhoto && (
            <div className="mb-6">
              <button className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 hover:border-blue-400 transition-colors">
                <Camera className="w-8 h-8" />
                <span className="font-bold text-sm">Tap to take Odometer Photo</span>
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-700 font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
