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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-poppins">
      <div className="relative max-w-lg w-full rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-2xl p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 sm:p-3 rounded-xl ${
                variant === 'danger'
                  ? 'bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/30'
                  : variant === 'warning'
                  ? 'bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30'
                  : 'bg-[#C69432]/15 text-[#C69432] border border-[#C69432]/30'
              }`}
            >
              {variant === 'danger' ? (
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : variant === 'warning' ? (
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#2C221E]">{title}</h3>
              <p className="text-[10px] sm:text-xs text-[#C69432] font-numeric font-semibold uppercase tracking-wider">Financial & Ops Compliance Authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#665C54] hover:text-[#2C221E] hover:bg-[#F0EBE1] p-1.5 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Body */}
        <div className="mt-4 space-y-3">
          <p className="text-xs sm:text-sm text-[#5C524B] leading-relaxed">{description}</p>

          {/* High visibility consequence callout */}
          {amountText && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] flex items-center justify-between">
              <span className="text-xs text-[#665C54] uppercase tracking-wider font-semibold">Total Financial Impact</span>
              <span className="text-base sm:text-lg font-numeric font-extrabold text-[#0F8B5F]">{amountText}</span>
            </div>
          )}

          {consequenceText && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#2C221E] text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[#DC2626] mb-0.5">Irreversible Operational Impact</span>
                {consequenceText}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C524B] hover:text-[#2C221E] bg-[#F0EBE1] hover:bg-[#EBE4D8] border border-[#EBE4D8] transition-colors disabled:opacity-50 min-h-[40px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center space-x-2 min-h-[40px] ${
              variant === 'danger'
                ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                : variant === 'warning'
                ? 'bg-[#D97706] hover:bg-[#B45309]'
                : 'bg-[#0F8B5F] hover:bg-[#0C6F4C]'
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
