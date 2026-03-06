import React from 'react';
import { MapPin, Clock, Package } from 'lucide-react';
import { Trip } from '../store/tripStore';
import { StatusBadge } from './StatusBadge';
import { BigActionButton } from './BigActionButton';
import { useTranslation } from 'react-i18next';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onPress, onAction, actionLabel }) => {
  const { t } = useTranslation();

  return (
    <div 
      onClick={onPress}
      className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">#{trip.id}</h3>
          <p className="text-gray-500 text-sm">{trip.distance} • {trip.duration}</p>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="w-0.5 h-8 bg-gray-200 my-1" />
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('origin')}</p>
              <p className="text-lg font-medium text-gray-900 leading-tight">{trip.origin}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('destination')}</p>
              <p className="text-lg font-medium text-gray-900 leading-tight">{trip.destination}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
          <Package className="w-5 h-5 text-blue-600" />
          <span className="text-blue-900 font-medium">{trip.cargo}</span>
        </div>
      </div>

      {onAction && (
        <BigActionButton 
          variant="success" 
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
        >
          {actionLabel || t('start_trip')}
        </BigActionButton>
      )}
    </div>
  );
};
