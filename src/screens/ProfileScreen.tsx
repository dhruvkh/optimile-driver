import React, { useEffect } from 'react';
import { useDriverStore } from '../store/driverStore';
import { useTranslation } from 'react-i18next';
import { User, FileText, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { BigActionButton } from '../components/BigActionButton';
import { useNavigate } from 'react-router-dom';

export const ProfileScreen = () => {
  const { name, driverId, logout, driverType, profileStats, fetchProfile } = useDriverStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const MenuItem = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) => (
    <button className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-gray-500 text-sm font-medium">{value}</span>}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-6 pt-12 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg relative">
            <User className="w-10 h-10 text-gray-400" />
            {driverType === 'OWN_FLEET' && (
              <div className="absolute -bottom-2 -right-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200 shadow-sm flex items-center gap-1">
                <span>🌟</span> STAR
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <p className="text-gray-500 font-medium">{driverId}</p>
            {driverType === 'OWN_FLEET' && (
              <p className="text-amber-600 text-xs font-bold mt-1 bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-100">
                Top 10% Driver
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-blue-600 text-xs font-bold uppercase mb-1">Total Trips</p>
            <p className="text-2xl font-bold text-blue-900">{profileStats?.totalTrips || 142}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <p className="text-green-600 text-xs font-bold uppercase mb-1">Rating</p>
            <p className="text-2xl font-bold text-green-900">{profileStats?.rating || 4.8}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <MenuItem icon={CreditCard} label={t('earnings')} value={`₹${profileStats?.earnings || '12,450'}`} />
        <MenuItem icon={FileText} label={t('documents')} value="Verified" />
        
        <div className="pt-6">
          <BigActionButton variant="secondary" onClick={handleLogout} icon={<LogOut className="w-5 h-5" />}>
            Logout
          </BigActionButton>
        </div>
      </div>
    </div>
  );
};
