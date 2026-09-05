import React from 'react';
import { AlertTriangle, ShieldAlert, DollarSign, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  consequenceText?: string;
  amountText?: string;
  confirmButtonText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  consequenceText,
  amountText,
  confirmButtonText = 'Confirm Action',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0B08]/85 backdrop-blur-md animate-in fade-in duration-200 font-poppins">
      <div className="relative max-w-lg w-full rounded-2xl bg-[#221914] border border-[#3A2D24] shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-xl ${
                variant === 'danger'
                  ? 'bg-[#C62828]/15 text-[#C62828] border border-[#C62828]/30'
                  : variant === 'warning'
                  ? 'bg-[#E65100]/15 text-[#E65100] border border-[#E65100]/30'
                  : 'bg-[#C4A052]/15 text-[#C4A052] border border-[#C4A052]/30'
              }`}
            >
              {variant === 'danger' ? (
                <ShieldAlert className="w-6 h-6" />
              ) : variant === 'warning' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <DollarSign className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F6F1EB]">{title}</h3>
              <p className="text-xs text-[#C4A052] mt-0.5 font-numeric font-semibold uppercase tracking-wider">Financial & Ops Compliance Authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Body */}
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>

          {/* High visibility consequence callout */}
          {amountText && (
            <div className="p-3.5 rounded-xl bg-[#0F0B08] border border-[#3A2D24] flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Financial Impact</span>
              <span className="text-lg font-numeric font-extrabold text-[#2E7D32]">{amountText}</span>
            </div>
          )}

          {consequenceText && (
            <div className="p-3.5 rounded-xl bg-[#C62828]/10 border border-[#C62828]/30 text-slate-200 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[#C62828] mb-0.5">Irreversible Operational Impact</span>
                {consequenceText}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-[#0F0B08] hover:bg-[#3D2B1F] border border-[#3A2D24] transition-colors disabled:opacity-50 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg flex items-center space-x-2 min-h-[44px] ${
              variant === 'danger'
                ? 'bg-[#8B1A1A] hover:bg-[#A82323] border border-[#C4A052]/30 shadow-[#8B1A1A]/40'
                : variant === 'warning'
                ? 'bg-[#E65100] hover:bg-[#F57C00] border border-[#C4A052]/30 shadow-[#E65100]/40'
                : 'bg-[#2E7D32] hover:bg-[#388E3C] border border-[#C4A052]/30 shadow-[#2E7D32]/40'
            } disabled:opacity-50`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
            )}
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
