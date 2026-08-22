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
    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 interactive-card cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-[10px] font-bold mt-2.5 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: styles.iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: styles.iconColor }} />
        </div>
      </div>
    </div>
  );
};
