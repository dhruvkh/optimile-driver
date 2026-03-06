import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useFeatureStore, FeatureKey } from '../store/featureStore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BigActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  feature?: FeatureKey;
}

export const BigActionButton: React.FC<BigActionButtonProps> = ({ 
  className, 
  variant = 'primary', 
  fullWidth = true,
  icon,
  children,
  feature,
  disabled,
  ...props 
}) => {
  const { isFeatureEnabled } = useFeatureStore();
  const isEnabled = !feature || isFeatureEnabled(feature);

  const variants = {
    primary: 'bg-blue-600 text-white active:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 active:bg-gray-300',
    danger: 'bg-red-600 text-white active:bg-red-700',
    success: 'bg-green-600 text-white active:bg-green-700',
    warning: 'bg-orange-500 text-white active:bg-orange-600',
  };

  const isDisabled = disabled || !isEnabled;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'h-16 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 touch-manipulation',
        variants[variant],
        fullWidth ? 'w-full' : 'w-auto',
        isDisabled && 'opacity-50 grayscale cursor-not-allowed active:scale-100',
        className
      )}
      {...props}
    >
      {icon && <span className="w-6 h-6">{icon}</span>}
      {children}
    </button>
  );
};
