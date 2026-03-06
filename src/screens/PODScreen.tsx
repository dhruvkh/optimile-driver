import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import SignatureCanvas from 'react-signature-canvas';
import { Camera, Check, X, ChevronRight, Package, Truck, User, PenTool, UploadCloud, Home, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useLocationStore } from '../store/locationStore';
import { offlineQueue } from '../services/offlineQueue';
import { BigActionButton } from '../components/BigActionButton';
import { clsx } from 'clsx';
import { api } from '../services/api';

type PODStep = 'confirm' | 'unloading' | 'receiver' | 'signature' | 'submit' | 'success';

export const PODScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentTrip, updateDetailedStatus } = useTripStore();
  const { latitude, longitude } = useLocationStore();
  
  const [step, setStep] = useState<PODStep>('confirm');
  const [deliveryIssue, setDeliveryIssue] = useState<string | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [photos, setPhotos] = useState<{ type: string; url: string }[]>([]);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const sigPad = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock camera capture
  const handleCapture = (type: string) => {
    const mockPhoto = `https://picsum.photos/seed/${Date.now()}/400/300`;
    setPhotos([...photos, { type, url: mockPhoto }]);
  };

  const handleSignatureClear = () => {
    sigPad.current?.clear();
    setSignature(null);
  };

  const handleSignatureEnd = () => {
    if (sigPad.current) {
      setSignature(sigPad.current.getTrimmedCanvas().toDataURL('image/png'));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const payload = {
      tripId: currentTrip?.id,
      photos,
      signature,
      receiverName,
      receiverPhone,
      deliveryTimestamp: new Date().toISOString(),
      location: { lat: latitude, lng: longitude }
    };

    try {
      await api.trip.submitPod(currentTrip?.id || '', payload);
      await updateDetailedStatus('DELIVERED');
      setStep('success');
    } catch (error) {
      console.error('Failed to submit POD:', error);
      // If offline, api.ts throws "Offline: Request queued"
      if (error instanceof Error && (error.message.includes('queued') || error.message.includes('Offline'))) {
        await updateDetailedStatus('DELIVERED'); // Optimistic update
        setStep('success');
      } else {
        alert('Failed to submit POD. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'confirm', label: 'Confirm' },
    { id: 'unloading', label: 'Unload' },
    { id: 'receiver', label: 'Details' },
    { id: 'signature', label: 'Sign' },
    { id: 'submit', label: 'Submit' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-green-600 text-white p-6 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-black uppercase mb-2">POD Submitted!</h1>
        <p className="text-green-100 text-lg mb-8">Trip marked as DELIVERED</p>
        
        <div className="bg-white/20 px-8 py-6 rounded-2xl backdrop-blur-sm border border-white/30 mb-12">
          <p className="text-green-200 text-sm font-bold uppercase mb-1">Trip Earnings</p>
          <p className="text-5xl font-black">₹ 12,450</p>
        </div>

        <BigActionButton onClick={() => navigate('/home')} className="bg-white text-green-700 w-full">
          <Home className="w-5 h-5 mr-2" />
          Go to Home
        </BigActionButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Proof of Delivery
          </h1>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
            #{currentTrip?.id || 'TRIP-123'}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center px-2">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                idx <= currentStepIndex ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              )}>
                {idx + 1}
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 pb-24 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'confirm' && (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-center">Did you deliver the goods?</h2>
              
              <button 
                onClick={() => setStep('unloading')}
                className="w-full h-20 bg-green-600 text-white rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                <Check className="w-8 h-8" />
                YES — DELIVERED
              </button>

              <button 
                onClick={() => setDeliveryIssue('refused')}
                className="w-full h-16 border-2 border-red-200 text-red-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform bg-red-50"
              >
                <X className="w-6 h-6" />
                NO — ISSUE WITH DELIVERY
              </button>

              {deliveryIssue && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-in slide-in-from-bottom">
                  <p className="font-bold text-red-800 mb-3">Select Issue Type:</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {['Consignee Refused', 'Short Delivery', 'Damaged Goods', 'Wrong Address'].map(issue => (
                      <button 
                        key={issue}
                        onClick={() => setDeliveryIssue(issue)}
                        className={clsx(
                          "p-2 text-xs font-bold rounded-lg border",
                          deliveryIssue === issue ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-200"
                        )}
                      >
                        {issue}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    placeholder="Describe the issue..."
                    className="w-full p-3 rounded-lg border border-red-200 text-sm mb-3"
                    rows={3}
                    onChange={(e) => setIssueDescription(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      alert('Claim submitted');
                      navigate('/home');
                    }}
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-bold"
                  >
                    SUBMIT CLAIM
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === 'unloading' && (
            <motion.div 
              key="unloading"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-orange-100 p-6 rounded-2xl border border-orange-200 text-center">
                <Truck className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-bold text-orange-900 text-lg mb-1">Unloading Confirmation</h3>
                <p className="text-orange-800 text-sm">Take a clear photo of the empty truck or unloaded goods.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleCapture('unloading')}
                  className="aspect-square bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 active:bg-gray-200"
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-xs font-bold text-gray-500">Capture Photo</span>
                </button>
                {photos.filter(p => p.type === 'unloading').map((photo, idx) => (
                  <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden border border-gray-200">
                    <img src={photo.url} alt="Unloading" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center">
                      {new Date().toLocaleTimeString()} • GPS
                    </div>
                  </div>
                ))}
              </div>

              <BigActionButton 
                onClick={() => setStep('receiver')}
                disabled={!photos.some(p => p.type === 'unloading')}
              >
                Next Step <ChevronRight className="w-5 h-5 ml-2" />
              </BigActionButton>
            </motion.div>
          )}

          {step === 'receiver' && (
            <motion.div 
              key="receiver"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Receiver Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input 
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-bold"
                      placeholder="Enter name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Receiver Phone</label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 font-bold text-gray-400">+91</span>
                    <input 
                      type="tel"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="w-full h-14 pl-14 pr-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-bold"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photo of LR / Challan
                </p>
                <button 
                  onClick={() => handleCapture('lr')}
                  className="w-full h-12 bg-white rounded-lg border border-blue-200 text-blue-600 font-bold text-sm flex items-center justify-center gap-2"
                >
                  {photos.some(p => p.type === 'lr') ? 'Retake Photo' : 'Capture Document'}
                </button>
              </div>

              <BigActionButton 
                onClick={() => setStep('signature')}
                disabled={!receiverName || !receiverPhone}
              >
                Next Step <ChevronRight className="w-5 h-5 ml-2" />
              </BigActionButton>
            </motion.div>
          )}

          {step === 'signature' && (
            <motion.div 
              key="signature"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-100 p-4 rounded-xl text-center">
                <PenTool className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-bold text-gray-900">Digital Signature</p>
                <p className="text-xs text-gray-500">Ask receiver to sign below</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden h-64 relative touch-none">
                <SignatureCanvas 
                  ref={sigPad}
                  penColor="black"
                  canvasProps={{ className: 'w-full h-full' }}
                  onEnd={handleSignatureEnd}
                />
                <button 
                  onClick={handleSignatureClear}
                  className="absolute top-2 right-2 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded hover:bg-gray-200"
                >
                  CLEAR
                </button>
              </div>

              <BigActionButton 
                onClick={() => setStep('submit')}
                disabled={!signature}
              >
                Review & Submit <ChevronRight className="w-5 h-5 ml-2" />
              </BigActionButton>
            </motion.div>
          )}

          {step === 'submit' && (
            <motion.div 
              key="submit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">Summary</h2>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500 text-sm">Receiver</span>
                  <span className="font-bold">{receiverName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500 text-sm">Phone</span>
                  <span className="font-bold">+91 {receiverPhone}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500 text-sm">Photos</span>
                  <span className="font-bold">{photos.length} Attached</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block mb-2">Signature</span>
                  {signature && (
                    <img src={signature} alt="Signature" className="h-16 border border-gray-100 rounded bg-gray-50" />
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-[72px] bg-green-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6" />
                    SUBMIT POD
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
