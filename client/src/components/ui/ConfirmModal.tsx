import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

/**
 * Confirmation modal component
 * Replaces window.confirm() with accessible, styled modal
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'warning',
}) => {
  if (!isOpen) return null;

  const bgColor = type === 'danger' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6';
  const bgLight = type === 'danger' ? '#FEE2E2' : type === 'warning' ? '#FEF3C7' : '#DBEAFE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in"
        style={{ fontFamily: '"Fira Sans", sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-6 border-b border-gray-200">
          <div
            className="flex-shrink-0 p-2 rounded-lg"
            style={{ backgroundColor: bgLight }}
          >
            <AlertTriangle className="w-6 h-6" style={{ color: bgColor }} />
          </div>
          <div className="flex-1">
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: '"Fira Code", monospace', color: '#1F2937' }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
            style={{ backgroundColor: bgColor }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
