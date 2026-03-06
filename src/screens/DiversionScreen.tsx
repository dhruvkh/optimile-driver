import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Navigation, AlertTriangle, Building, Factory, Mic, Check, X, Clock, Camera, Loader2 } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useLocationStore } from '../store/locationStore';
import { BigActionButton } from '../components/BigActionButton';
import { clsx } from 'clsx';
import { extractAddressFromImage } from '../services/ocrService';

export const DiversionScreen = () => {
  const navigate = useNavigate();
  const { currentTrip, requestDiversion, resolveDiversion } = useTripStore();
  const { address: currentAddress } = useLocationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newAddress, setNewAddress] = useState('');
  const [requestedBy, setRequestedBy] = useState<'consignee' | 'consignor'>('consignee');
  const [phone, setPhone] = useState('');
  const [extraDistance, setExtraDistance] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const diversionStatus = currentTrip?.diversion?.status || 'none';

  // Simulate manager response
  useEffect(() => {
    if (diversionStatus === 'requested') {
      const timer = setTimeout(() => {
        // Randomly approve or reject for demo purposes
        const isApproved = Math.random() > 0.3; 
        if (isApproved) {
          resolveDiversion('approved', 'Approved. Proceed to new location.', '1200');
        } else {
          resolveDiversion('rejected', 'Cannot divert. Client refused extra charges.');
        }
      }, 5000); // 5 seconds delay
      return () => clearTimeout(timer);
    }
  }, [diversionStatus, resolveDiversion]);

  const handleSubmit = async () => {
    if (!newAddress || !phone || !reason) return;
    
    setIsSubmitting(true);
    
    await requestDiversion({
      status: 'requested',
      newAddress,
      requestedBy,
      phone,
      extraDistance,
      reason
    });
    setIsSubmitting(false);
  };

  const handleUseCurrentLocation = () => {
    setNewAddress(currentAddress || '123 Current Location, Highway 44');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const extractedAddress = await extractAddressFromImage(base64String);
        if (extractedAddress) {
          setNewAddress(extractedAddress);
        } else {
          alert('Could not detect address. Please try again or enter manually.');
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('OCR Failed', error);
      setIsScanning(false);
      alert('Failed to scan image.');
    }
  };

  if (diversionStatus === 'approved') {
    return (
      <div className="min-h-screen bg-green-600 text-white p-6 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-black uppercase mb-2">DIVERSION APPROVED!</h1>
        
        <div className="bg-white/20 px-6 py-6 rounded-2xl backdrop-blur-sm border border-white/30 mb-8 w-full max-w-sm">
          <p className="text-green-100 text-xs font-bold uppercase mb-1">New Destination</p>
          <p className="text-xl font-bold mb-4">{currentTrip?.diversion?.newAddress}</p>
          
          <div className="h-px bg-white/30 my-4" />
          
          <p className="text-green-100 text-xs font-bold uppercase mb-1">Extra Charges</p>
          <p className="text-3xl font-black">₹ {currentTrip?.diversion?.extraCharge}</p>
          <p className="text-xs text-green-100 mt-1">Billed to {currentTrip?.diversion?.requestedBy}</p>
        </div>

        <BigActionButton 
          onClick={() => navigate('/navigation')} 
          className="bg-white text-green-700 w-full shadow-xl"
        >
          <Navigation className="w-5 h-5 mr-2" />
          Navigate to New Address
        </BigActionButton>
      </div>
    );
  }

  if (diversionStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-red-600 text-white p-6 flex flex-col items-center justify-center text-center animate-in shake duration-500">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6">
          <X className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-black uppercase mb-2">Diversion Not Approved</h1>
        <p className="text-red-100 text-lg mb-8">Please proceed to original destination</p>
        
        <div className="bg-white/20 px-6 py-6 rounded-2xl backdrop-blur-sm border border-white/30 mb-12 w-full max-w-sm">
          <p className="text-red-100 text-xs font-bold uppercase mb-1">Manager's Note</p>
          <p className="text-xl font-bold">{currentTrip?.diversion?.managerNote}</p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <BigActionButton onClick={() => window.location.href = 'tel:+919876543210'} className="bg-white text-red-700 w-full">
            <Phone className="w-5 h-5 mr-2" />
            Call Manager
          </BigActionButton>
          
          <button 
            onClick={() => navigate('/navigation')}
            className="w-full py-4 text-white font-bold underline opacity-80"
          >
            Return to Navigation
          </button>
        </div>
      </div>
    );
  }

  if (diversionStatus === 'requested') {
    return (
      <div className="min-h-screen bg-amber-500 text-white p-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Clock className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-black uppercase mb-2">Request Sent</h1>
        <p className="text-amber-100 text-lg mb-8">Waiting for manager approval...</p>
        
        <div className="bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm border border-white/20 mb-8 w-full max-w-sm">
          <p className="text-sm font-medium">Request sent to <strong>Rajesh Kumar</strong></p>
          <p className="text-xs opacity-70 mt-1">Usually responds in 2 mins</p>
        </div>

        <button 
          onClick={() => window.location.href = 'tel:+919876543210'}
          className="flex items-center gap-2 text-sm font-bold bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Manager Directly
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 border-b border-amber-100">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <AlertTriangle className="w-6 h-6 text-amber-500 fill-amber-500" />
            Delivery Diversion
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
          <span className="font-bold uppercase">Original:</span>
          <span className="truncate">{currentTrip?.destination || 'Loading...'}</span>
        </div>
      </div>

      <div className="flex-1 p-6 pb-24 overflow-y-auto space-y-6">
        {/* New Address */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase">New Delivery Address</label>
          <div className="relative">
            <textarea
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full p-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none font-bold text-lg min-h-[100px]"
              placeholder="Enter new address"
            />
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 top-3 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 active:scale-95 transition-transform"
              disabled={isScanning}
            >
              {isScanning ? <Loader2 className="w-5 h-5 animate-spin text-amber-600" /> : <Camera className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleUseCurrentLocation}
              className="flex-1 bg-blue-50 text-blue-700 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-blue-100 active:scale-95 transition-transform"
            >
              <Navigation className="w-4 h-4" />
              USE CURRENT LOCATION
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-gray-200 active:scale-95 transition-transform">
              <MapPin className="w-4 h-4" />
              PICK ON MAP
            </button>
          </div>
        </div>

        {/* Who asked */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase">Who asked you to divert?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRequestedBy('consignee')}
              className={clsx(
                "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                requestedBy === 'consignee' 
                  ? "bg-amber-50 border-amber-500 text-amber-900" 
                  : "bg-white border-gray-200 text-gray-500"
              )}
            >
              <Building className={clsx("w-8 h-8", requestedBy === 'consignee' ? "text-amber-600" : "text-gray-400")} />
              <span className="font-bold text-sm">CONSIGNEE</span>
              <span className="text-[10px] uppercase opacity-70">(Receiver)</span>
            </button>
            
            <button
              onClick={() => setRequestedBy('consignor')}
              className={clsx(
                "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                requestedBy === 'consignor' 
                  ? "bg-amber-50 border-amber-500 text-amber-900" 
                  : "bg-white border-gray-200 text-gray-500"
              )}
            >
              <Factory className={clsx("w-8 h-8", requestedBy === 'consignor' ? "text-amber-600" : "text-gray-400")} />
              <span className="font-bold text-sm">CONSIGNOR</span>
              <span className="text-[10px] uppercase opacity-70">(Sender)</span>
            </button>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase">Their Phone Number</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-4 font-bold text-gray-400">+91</span>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-14 pl-14 pr-4 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none font-bold text-lg"
                placeholder="98765 43210"
              />
            </div>
            <button className="w-14 h-14 bg-green-100 text-green-700 rounded-xl flex items-center justify-center border border-green-200">
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Extra Distance */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase">Extra Distance (Est. km)</label>
          <input 
            type="number"
            value={extraDistance}
            onChange={(e) => setExtraDistance(e.target.value)}
            className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none font-bold text-lg"
            placeholder="e.g. 55"
          />
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase">Reason for Diversion</label>
          <div className="relative">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none font-medium min-h-[100px]"
              placeholder="e.g. Warehouse shifted, consignee not available..."
            />
            <button className="absolute right-3 bottom-3 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !newAddress || !phone || !reason}
          className="w-full h-[72px] bg-amber-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-amber-200 active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
        >
          {isSubmitting ? 'SENDING...' : 'SEND DIVERSION REQUEST'}
        </button>
      </div>
    </div>
  );
};
