import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  primary: {
    iconBg: '#DBEAFE',
    iconColor: '#1E40AF',
  },
  success: {
    iconBg: '#D1FAE5',
    iconColor: '#059669',
  },
  warning: {
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
  },
  danger: {
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
  },
};

/**
 * Stats card component for dashboard KPI metrics
 * Follows design system: minimal padding, grid layout, space-efficient
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'primary',
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className="bg-white rounded-lg p-6 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
      style={{
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontFamily: '"Fira Sans", sans-serif',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div
          className="p-2.5 rounded-lg"
          style={{ backgroundColor: styles.iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: styles.iconColor }} />
        </div>
      </div>
    </div>
  );
};
