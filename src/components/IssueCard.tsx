import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface IssueCardProps {
  type: string;
  description: string;
  timestamp: string;
  status: 'open' | 'resolved';
}

export const IssueCard: React.FC<IssueCardProps> = ({ type, description, timestamp, status }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-red-100 p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-gray-900">{type}</h4>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
          <p className="text-gray-400 text-xs mt-2">{timestamp}</p>
        </div>
      </div>
    </div>
  );
};
