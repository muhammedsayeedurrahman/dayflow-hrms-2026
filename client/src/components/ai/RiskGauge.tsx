import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface RiskGaugeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const getRiskLevel = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          fill: 'stroke-red-600',
          icon: AlertTriangle,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-300',
          fill: 'stroke-orange-600',
          icon: AlertCircle,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          fill: 'stroke-yellow-600',
          icon: Info,
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          fill: 'stroke-green-600',
          icon: CheckCircle,
        };
    }
  };

  const riskLevel = getRiskLevel(score);
  const colors = getRiskColor(riskLevel);
  const Icon = colors.icon;

  const gaugeSize = {
    sm: { diameter: 80, strokeWidth: 8 },
    md: { diameter: 120, strokeWidth: 12 },
    lg: { diameter: 160, strokeWidth: 16 },
  }[size];

  const radius = (gaugeSize.diameter - gaugeSize.strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg
          width={gaugeSize.diameter}
          height={gaugeSize.diameter}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={gaugeSize.diameter / 2}
            cy={gaugeSize.diameter / 2}
            r={radius}
            className="stroke-gray-200"
            strokeWidth={gaugeSize.strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={gaugeSize.diameter / 2}
            cy={gaugeSize.diameter / 2}
            r={radius}
            className={colors.fill}
            strokeWidth={gaugeSize.strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colors.text}`}>
            {Math.round(score)}
          </span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>

      {showLabel && (
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colors.text}`} />
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
          >
            {riskLevel} RISK
          </span>
        </div>
      )}
    </div>
  );
};
