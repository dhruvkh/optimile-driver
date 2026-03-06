import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BigActionButton } from '../components/BigActionButton';
import { Camera, AlertTriangle, Phone, Mic, MapPin, CheckCircle, X, ShieldAlert } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useLocationStore } from '../store/locationStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { api } from '../services/api';

type IssueType = 'BREAKDOWN' | 'ACCIDENT' | 'THEFT' | 'UNWELL' | 'DOCUMENT' | 'DEVIATION';
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export const IssueReportScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentTrip } = useTripStore();
  const { latitude, longitude } = useLocationStore();
  
  const [step, setStep] = useState<'type' | 'details' | 'success' | 'emergency'>('type');
  const [selectedType, setSelectedType] = useState<IssueType | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock location address
  const currentLocation = "NH 48, Near Lonavala Exit, Maharashtra";

  const issueTypes: { id: IssueType; label: string; subLabel: string; icon: string }[] = [
    { id: 'BREAKDOWN', label: 'Breakdown', subLabel: 'गाड़ी खराब', icon: '🚛' },
    { id: 'ACCIDENT', label: 'Accident', subLabel: 'दुर्घटना', icon: '💥' },
    { id: 'THEFT', label: 'Theft / Robbery', subLabel: 'चोरी / डकैती', icon: '🔴' },
    { id: 'UNWELL', label: 'Driver Unwell', subLabel: 'तबीयत खराब', icon: '👤' },
    { id: 'DOCUMENT', label: 'Document Issue', subLabel: 'कागजात समस्या', icon: '📄' },
    { id: 'DEVIATION', label: 'Route Deviation', subLabel: 'रास्ता भटकना', icon: '🔀' },
  ];

  const handleTypeSelect = (type: IssueType) => {
    setSelectedType(type);
    if (type === 'THEFT') {
      setStep('emergency');
      // Silent background POST
      api.issues.report({
        tripId: currentTrip?.id,
        category: 'THEFT',
        severity: 'CRITICAL',
        description: 'Emergency: Theft reported',
        photos: [],
        location: { lat: latitude, lng: longitude }
      }).catch(console.error);
    } else {
      setStep('details');
    }
  };

  const handlePhotoCapture = () => {
    // Mock photo capture
    if (photos.length < 3) {
      const mockPhoto = `https://picsum.photos/seed/${Date.now()}/200/200`;
      setPhotos([...photos, mockPhoto]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await api.issues.report({
        tripId: currentTrip?.id,
        category: selectedType,
        severity,
        description,
        photos,
        location: { lat: latitude, lng: longitude, address: currentLocation }
      });
      setStep('success');
    } catch (error) {
      console.error('Failed to report issue:', error);
      // Show error? Or just assume offline queue handled it?
      // Since api.ts throws if offline queue is used, we might need to handle that.
      // But api.ts throws "Offline: Request queued" which is an error.
      // We should probably treat "Offline: Request queued" as success for UI purposes.
      if (error instanceof Error && (error.message.includes('queued') || error.message.includes('Offline'))) {
        setStep('success');
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'emergency') {
    return (
      <div className="min-h-screen bg-red-600 text-white p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-4xl font-black uppercase mb-4">Emergency Mode</h1>
        <p className="text-red-100 text-xl mb-12">Help has been alerted. Stay safe.</p>
        
        <div className="w-full space-y-4">
          <a href="tel:112" className="block w-full bg-white text-red-600 h-20 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform">
            <Phone className="w-8 h-8" />
            CALL POLICE (112)
          </a>
          <a href={`tel:${currentTrip?.fleetManager.phone}`} className="block w-full bg-red-800 text-white h-16 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 border-2 border-red-400 active:scale-95 transition-transform">
            <Phone className="w-6 h-6" />
            Call Manager
          </a>
        </div>
        <button onClick={() => navigate('/home')} className="mt-12 text-red-200 underline font-bold">
          Return to Home
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-green-600 text-white p-6 flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom duration-500">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-black uppercase mb-2">Issue Reported!</h1>
        <p className="text-green-100 text-lg mb-8">Your fleet manager has been notified.</p>
        
        {severity === 'CRITICAL' && (
          <div className="bg-white/20 px-6 py-3 rounded-xl mb-8 backdrop-blur-sm border border-white/30">
            <p className="font-bold text-xl">🚑 Help is on the way</p>
          </div>
        )}

        {(selectedType === 'BREAKDOWN' || selectedType === 'ACCIDENT') && (
          <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm mb-8 shadow-lg">
            🛠 Replacement Vehicle Requested
          </div>
        )}

        <div className="w-full bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
          <p className="text-green-200 text-xs font-bold uppercase mb-2">Fleet Manager</p>
          <p className="text-2xl font-bold mb-1">{currentTrip?.fleetManager.name}</p>
          <a href={`tel:${currentTrip?.fleetManager.phone}`} className="inline-flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-full font-bold mt-2">
            <Phone className="w-4 h-4" /> Call Now
          </a>
        </div>

        <BigActionButton onClick={() => navigate('/home')} className="bg-white text-green-700 w-full">
          Back to Home
        </BigActionButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-700 pb-24">
      {/* Header */}
      <div className="p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            REPORT ISSUE
          </h1>
          <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-red-100 text-sm font-medium bg-red-800/30 p-3 rounded-xl border border-red-500/30">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{currentLocation}</span>
        </div>
        
        {currentTrip && (
          <div className="mt-2 inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            Trip #{currentTrip.id}
          </div>
        )}
      </div>

      <div className="bg-gray-50 min-h-[calc(100vh-180px)] rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        {step === 'type' ? (
          <div className="grid grid-cols-2 gap-4">
            {issueTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className="bg-white p-4 rounded-2xl shadow-sm border-2 border-transparent hover:border-red-200 active:border-red-500 active:bg-red-50 transition-all flex flex-col items-center text-center h-40 justify-center gap-2"
              >
                <span className="text-4xl mb-2">{type.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 leading-tight">{type.label}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{type.subLabel}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            {/* Selected Type Badge */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-2xl">{issueTypes.find(t => t.id === selectedType)?.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{issueTypes.find(t => t.id === selectedType)?.label}</p>
                <button onClick={() => setStep('type')} className="text-xs text-blue-600 font-bold underline">Change</button>
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="text-gray-500 text-xs font-bold uppercase mb-3 block">Severity Level</label>
              <div className="space-y-3">
                {[
                  { id: 'CRITICAL', label: 'CRITICAL — Need Help Now', color: 'bg-red-100 border-red-300 text-red-800', active: 'bg-red-600 text-white border-red-600' },
                  { id: 'HIGH', label: 'HIGH — Will Delay Trip', color: 'bg-orange-100 border-orange-300 text-orange-800', active: 'bg-orange-500 text-white border-orange-500' },
                  { id: 'MEDIUM', label: 'MEDIUM — FYI Only', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', active: 'bg-yellow-500 text-white border-yellow-500' },
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSeverity(level.id as Severity)}
                    className={clsx(
                      "w-full p-4 rounded-xl border-2 font-bold text-left transition-all",
                      severity === level.id ? level.active : level.color
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            {severity && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <label className="text-gray-500 text-xs font-bold uppercase mb-3 block">Description</label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened..."
                    className="w-full h-32 p-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none text-lg resize-none"
                  />
                  <button className="absolute bottom-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-600">
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Photos */}
            {severity && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <label className="text-gray-500 text-xs font-bold uppercase mb-3 block">Photos (Max 3)</label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <button 
                    onClick={handlePhotoCapture}
                    disabled={photos.length >= 3}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-50 hover:border-red-300 shrink-0"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </button>
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative w-24 h-24 shrink-0">
                      <img src={photo} alt="Evidence" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                      <button 
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Submit */}
            {severity && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-[72px] bg-red-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-red-200 active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6" />
                      SUBMIT REPORT
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
