import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ClearConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  isDark: boolean;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-6 z-10 transition-all ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-200'
            : 'bg-white border-neutral-200 text-neutral-800'
        }`}
      >
        <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="font-bold text-base mb-1">Clear all conversations?</h3>
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          This will permanently remove all your saved chat history and uploaded document queries from your browser storage. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmClear();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
