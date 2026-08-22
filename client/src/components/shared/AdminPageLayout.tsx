import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  children: React.ReactNode;
}

/**
 * Consistent layout wrapper for all admin pages
 * Follows design system: Fira Sans typography, spacing tokens, blue primary colors
 */
export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  title,
  description,
  icon: Icon,
  action,
  children,
}) => {
  const ActionIcon = action?.icon;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="w-6 h-6 text-blue-800" style={{ color: '#1E40AF' }} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: '"Fira Code", monospace' }}
              >
                {title}
              </h1>
              {description && (
                <p
                  className="text-sm text-gray-500 mt-1"
                  style={{ fontFamily: '"Fira Sans", sans-serif' }}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer hover:opacity-90 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              fontFamily: '"Fira Sans", sans-serif',
            }}
          >
            <span className="flex items-center gap-2">
              {ActionIcon && <ActionIcon className="w-4 h-4" />}
              {action.label}
            </span>
          </button>
        )}
      </div>

      {/* Page Content */}
      <div style={{ fontFamily: '"Fira Sans", sans-serif' }}>
        {children}
      </div>
    </div>
  );
};
