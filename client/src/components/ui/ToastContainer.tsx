import React from 'react';
import { useToastStore } from '../../store/toastStore';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

/**
 * Toast notification container
 * Displays toast messages in bottom-right corner
 * Auto-dismisses after duration (default 5s)
 */
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      style={{ fontFamily: '"Fira Sans", sans-serif' }}
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle
            : toast.type === 'error'
            ? XCircle
            : toast.type === 'warning'
            ? AlertTriangle
            : Info;

        const bgColor =
          toast.type === 'success'
            ? '#10B981' // Green
            : toast.type === 'error'
            ? '#EF4444' // Red
            : toast.type === 'warning'
            ? '#F59E0B' // Amber
            : '#3B82F6'; // Blue

        const iconColor =
          toast.type === 'success'
            ? '#DCFCE7'
            : toast.type === 'error'
            ? '#FEE2E2'
            : toast.type === 'warning'
            ? '#FEF3C7'
            : '#DBEAFE';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto min-w-[320px] max-w-md rounded-lg shadow-xl animate-slide-in-right"
            style={{
              backgroundColor: 'white',
              border: `1px solid ${bgColor}`,
            }}
          >
            <div className="flex items-start gap-3 p-4">
              {/* Icon */}
              <div
                className="flex-shrink-0 p-1.5 rounded-lg"
                style={{ backgroundColor: iconColor }}
              >
                <Icon className="w-5 h-5" style={{ color: bgColor }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: '#1F2937' }}
                >
                  {toast.message}
                </p>
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-xs font-semibold hover:underline"
                    style={{ color: bgColor }}
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
