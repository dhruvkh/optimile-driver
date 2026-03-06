import React, { useState } from 'react';
import { useTripStore, TripStatus } from '../store/tripStore';
import { BigActionButton } from '../components/BigActionButton';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { 
  Phone, MapPin, Package, Navigation, FileText, 
  User, Shield, Copy, CheckSquare, Truck 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useFeatureStore, FEATURES } from '../store/featureStore';
import { FeatureGate } from '../components/FeatureGate';

export const TripDetailScreen = () => {
  const { currentTrip, updateDetailedStatus } = useTripStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'route' | 'cargo' | 'contacts'>('route');
  const [showStatusModal, setShowStatusModal] = useState(false);

  if (!currentTrip) return <div>No trip selected</div>;

  const getNextStatus = (current: TripStatus): { label: string; next: TripStatus; color: string; requirePhoto?: boolean } | null => {
    switch (current) {
      case 'ACCEPTED': return { label: 'ARRIVED AT LOADING', next: 'ARRIVED_LOADING', color: 'bg-orange-500' };
      case 'ARRIVED_LOADING': return { label: 'LOADING STARTED', next: 'LOADING_STARTED', color: 'bg-orange-500' };
      case 'LOADING_STARTED': return { label: 'LOADING DONE — DISPATCH', next: 'IN_TRANSIT', color: 'bg-green-600', requirePhoto: true };
      case 'IN_TRANSIT': return { label: 'REACHED DESTINATION', next: 'REACHED_DESTINATION', color: 'bg-green-600' };
      case 'REACHED_DESTINATION': return { label: 'UNLOADING DONE', next: 'UNLOADING_DONE', color: 'bg-green-600' };
      case 'UNLOADING_DONE': return { label: 'COMPLETE TRIP', next: 'COMPLETED', color: 'bg-blue-600' };
      default: return null;
    }
  };

  const nextAction = getNextStatus(currentTrip.tripStatus);

  const handleStatusUpdate = () => {
    if (nextAction) {
      updateDetailedStatus(nextAction.next);
      setShowStatusModal(false);
      if (nextAction.next === 'COMPLETED') {
        navigate('/home');
      }
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={clsx(
        "flex-1 py-3 flex flex-col items-center justify-center gap-1 border-b-2 transition-colors",
        activeTab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-bold uppercase">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-32">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase">Trip ID</p>
            <h1 className="text-2xl font-black text-gray-900">#{currentTrip.id}</h1>
          </div>
          <div className={clsx(
            "px-3 py-1 rounded-full text-xs font-bold text-white",
            currentTrip.tripStatus === 'IN_TRANSIT' ? 'bg-green-500' : 'bg-orange-500'
          )}>
            {currentTrip.tripStatus.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-200">
        <TabButton id="route" label="Route" icon={MapPin} />
        <TabButton id="cargo" label="Cargo" icon={Package} />
        <TabButton id="contacts" label="Contacts" icon={User} />
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {activeTab === 'route' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex gap-4 mb-6">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="w-0.5 h-16 bg-gray-200 my-1" />
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('origin')}</p>
                    <p className="text-lg font-medium text-gray-900 leading-tight mb-2">{currentTrip.origin}</p>
                    <button className="text-blue-600 text-sm font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Call Consignor
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t('destination')}</p>
                    <p className="text-lg font-medium text-gray-900 leading-tight mb-2">{currentTrip.destination}</p>
                    <button className="text-blue-600 text-sm font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Call Consignee
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Distance</p>
                  <p className="text-lg font-bold">{currentTrip.distance}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Est. Time</p>
                  <p className="text-lg font-bold">{currentTrip.duration}</p>
                </div>
              </div>

              <BigActionButton 
                variant="warning" 
                icon={<Navigation className="w-5 h-5" />} 
                onClick={() => navigate('/navigation')}
              >
                OPEN NAVIGATION
              </BigActionButton>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Toll Booths on Route</h3>
              <ul className="space-y-3">
                {currentTrip.tollBooths?.map((toll, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    {toll}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'cargo' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Type</p>
                  <p className="text-lg font-bold">{currentTrip.cargo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Weight</p>
                  <p className="text-lg font-bold">{currentTrip.weight}</p>
                </div>
              </div>

              {currentTrip.specialInstructions && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
                  <p className="text-red-600 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Special Instructions
                  </p>
                  <p className="text-red-900 font-medium">{currentTrip.specialInstructions}</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-blue-600 text-xs font-bold uppercase mb-1">E-Way Bill No.</p>
                  <p className="text-blue-900 font-mono font-bold text-lg">{currentTrip.eWayBillNo}</p>
                </div>
                <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                  <Copy className="w-5 h-5 text-blue-600" />
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Document Checklist</h3>
              <div className="space-y-3">
                {Object.entries(currentTrip.documents || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-700 uppercase">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {[
              { role: 'Fleet Manager', ...currentTrip.fleetManager },
              { role: 'Consignor', ...currentTrip.consignor },
              { role: 'Consignee', ...currentTrip.consignee },
            ].map((contact, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">{contact.role}</p>
                  <p className="text-lg font-bold text-gray-900">{contact.name}</p>
                </div>
                <a href={`tel:${contact.phone}`} className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center active:bg-green-200">
                  <Phone className="w-6 h-6 text-green-600" />
                </a>
              </div>
            ))}

            <div className="pt-6">
              <button className="w-full bg-red-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-red-200 active:scale-95 transition-transform">
                <Phone className="w-6 h-6" />
                EMERGENCY (112)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer Status Button */}
      {nextAction && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20 max-w-md mx-auto space-y-3">
          <FeatureGate feature={FEATURES.DIVERSION}>
            <button 
              onClick={() => navigate('/diversion')}
              className="w-full h-12 rounded-xl font-bold text-sm text-amber-700 bg-amber-50 border border-amber-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Navigation className="w-4 h-4 rotate-90" />
              REQUEST DIVERSION
            </button>
          </FeatureGate>
          
          <button 
            onClick={() => setShowStatusModal(true)}
            className={clsx(
              "w-full h-16 rounded-xl font-black text-lg text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform uppercase tracking-wide",
              nextAction.color
            )}
          >
            <Truck className="w-6 h-6" />
            {nextAction.label}
          </button>
        </div>
      )}

      <StatusUpdateModal 
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        title="Update Trip Status?"
        description={`Are you sure you want to update status to "${nextAction?.label}"?`}
        requirePhoto={nextAction?.requirePhoto}
      />
    </div>
  );
};
