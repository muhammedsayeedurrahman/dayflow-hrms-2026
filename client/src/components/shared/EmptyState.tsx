import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty state component for when no data is available
 * Provides clear guidance and optional action
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div
      className="bg-white rounded-lg p-12 text-center"
      style={{
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontFamily: '"Fira Sans", sans-serif',
      }}
    >
      <div className="flex justify-center mb-4">
        <div
          className="p-4 rounded-full"
          style={{ backgroundColor: '#F8FAFC' }}
        >
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      </div>

      <h3
        className="text-lg font-semibold text-gray-900 mb-2"
        style={{ fontFamily: '"Fira Code", monospace' }}
      >
        {title}
      </h3>

      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          style={{
            backgroundColor: '#F59E0B',
            color: 'white',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
