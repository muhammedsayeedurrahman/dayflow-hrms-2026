import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-indigo-200 border-t-indigo-600 animate-spin`}
        role="status"
        aria-label={message}
      />
      {message && (
        <span className="text-xs font-medium text-slate-500">{message}</span>
      )}
    </div>
  );
};

/**
 * Full-page loading screen shown while lazy-loaded routes are being fetched.
 */
export const PageLoadingFallback: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-6">
      {/* Brand logo */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-2xl shadow-xl shadow-indigo-500/25">
        D
      </div>
      <LoadingSpinner size="md" message="Loading Dayflow HRMS..." />
    </div>
  </div>
);

/**
 * Inline skeleton shimmer block used as placeholder while content loads.
 */
export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

/**
 * A card-shaped skeleton used for dashboard stat cards.
 */
export const StatCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-8 w-8 rounded-xl" />
    </div>
    <SkeletonBlock className="h-8 w-32" />
    <SkeletonBlock className="h-3 w-40" />
  </div>
);
