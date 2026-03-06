import React from 'react';
import { cn } from './BigActionButton';

interface StatusBadgeProps {
  status: 'pending' | 'active' | 'completed' | 'issue';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const styles = {
    pending: 'bg-orange-100 text-orange-800 border-orange-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    issue: 'bg-red-100 text-red-800 border-red-200',
  };

  const labels = {
    pending: 'Pending',
    active: 'In Progress',
    completed: 'Completed',
    issue: 'Issue Reported',
  };

  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-sm font-bold border',
      styles[status],
      className
    )}>
      {labels[status]}
    </span>
  );
};
