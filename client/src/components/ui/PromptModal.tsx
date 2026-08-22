import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

/**
 * Prompt modal component
 * Replaces window.prompt() with accessible, styled modal
 */
export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  placeholder = 'Enter value...',
  defaultValue = '',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
}) => {
  const [value, setValue] = useState(defaultValue);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value);
      onClose();
      setValue('');
    }
  };

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
            style={{ backgroundColor: '#DBEAFE' }}
          >
            <MessageSquare className="w-6 h-6" style={{ color: '#3B82F6' }} />
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
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">{message}</p>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') onClose();
            }}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ fontFamily: '"Fira Sans", sans-serif' }}
            autoFocus
          />
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
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1E40AF' }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
