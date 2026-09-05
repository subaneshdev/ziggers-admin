import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Scale, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  UserCheck
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { Dispute, DisputeStatus, DisputeResolutionType } from '../../types/admin';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

export const DisputeResolutionScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | DisputeStatus>('ALL');
  
  // Resolution Modal State
  const [activeResolution, setActiveResolution] = useState<{
    type: DisputeResolutionType;
    dispute: Dispute;
  } | null>(null);

  // Custom Split Slider State (Worker %)
  const [workerSplitPct, setWorkerSplitPct] = useState<number>(50);
  const [adminNotes, setAdminNotes] = useState<string>('');

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => adminApi.fetchDisputes(),
  });

  const resolveMutation = useMutation({
    mutationFn: (payload: { disputeId: string; resolutionType: DisputeResolutionType; splitRatio?: { workerPct: number; employerPct: number }; notes: string }) =>
      adminApi.resolveDispute(payload.disputeId, payload.resolutionType, payload.splitRatio),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      success('Dispute Adjudicated', `Case ${variables.disputeId} marked as RESOLVED.`);
      setActiveResolution(null);
      setAdminNotes('');
    },
    onError: () => error('Adjudication Failed', 'Could not resolve dispute.'),
  });

  const filteredDisputes = disputes.filter(
    (d) => statusFilter === 'ALL' || d.status === statusFilter
  );

  const selectedDispute = disputes.find((d) => d.disputeId === selectedDisputeId) || filteredDisputes[0] || null;

  const calculateSplitAmounts = (dispute: Dispute, workerPct: number) => {
    const totalAmount = dispute.escrowAmount || 0;
    const workerAmount = Math.round((totalAmount * workerPct) / 100);
    const employerAmount = totalAmount - workerAmount;
    return { workerAmount, employerAmount };
  };

  const handleExecuteResolution = () => {
    if (!activeResolution) return;
    const { type, dispute } = activeResolution;
    const splitRatio = type === 'PARTIAL_SPLIT' ? { workerPct: workerSplitPct, employerPct: 100 - workerSplitPct } : undefined;

    resolveMutation.mutate({
      disputeId: dispute.disputeId,
      resolutionType: type,
      splitRatio,
      notes: adminNotes || `Resolved via ${type} rule.`,
    });
  };

  return (
    <div className="space-y-5 font-poppins text-xs text-[#2C221E]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2C221E] tracking-tight">
            Escrow Dispute Resolution Engine
          </h2>
          <p className="text-[11px] text-[#665C54] mt-0.5">
            Adjudicate contested escrow funds with custom payout splits, evidence inspection, and automated wallet refund execution
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-2 p-3 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <span className="text-[11px] text-[#665C54] font-semibold uppercase ml-1">Case Status:</span>
        {(['ALL', 'INVESTIGATING', 'RESOLVED_WORKER', 'RESOLVED_EMPLOYER', 'PARTIAL_SPLIT'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
              statusFilter === st
                ? 'bg-[#2C221E] text-white border border-[#2C221E]'
                : 'bg-[#F0EBE1] text-[#5C524B] hover:text-[#2C221E] border border-[#EBE4D8]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Main Grid: Cases List + Case Adjudicator Inspector */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-5 animate-pulse">
          <div className="h-96 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8]" />
          <div className="h-96 col-span-2 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8]" />
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center flex flex-col items-center">
          <CheckCircle2 className="w-10 h-10 text-[#0F8B5F] mb-2" />
          <h3 className="text-sm font-bold text-[#2C221E]">No Contested Disputes Found</h3>
          <p className="text-xs text-[#665C54] mt-0.5">All escrow transactions are currently clear of contested claims.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Contested Cases Selector List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C69432]">
              Contested Cases ({filteredDisputes.length})
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredDisputes.map((dispute) => {
                const isSelected = selectedDispute?.disputeId === dispute.disputeId;
                return (
                  <div
                    key={dispute.disputeId}
                    onClick={() => setSelectedDisputeId(dispute.disputeId)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-md font-bold'
                        : 'bg-[#FFFFFF] border-[#EBE4D8] hover:bg-[#F0EBE1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-numeric font-bold ${isSelected ? 'text-[#C69432]' : 'text-[#2C221E]'}`}>
                        {dispute.disputeId}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.2 rounded font-numeric font-bold border ${
                          dispute.status === 'INVESTIGATING'
                            ? 'bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30'
                            : 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                        }`}
                      >
                        {dispute.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold mt-1 line-clamp-1">{dispute.zigTitle}</h4>

                    <div className="mt-2 pt-2 border-t border-[#EBE4D8]/30 flex items-center justify-between font-numeric">
                      <span className={`text-[11px] font-bold text-[#0F8B5F]`}>
                        {formatCurrency(dispute.escrowAmount)}
                      </span>
                      <span className="text-[10px] opacity-70">
                        {formatDate(dispute.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Adjudication Inspector & Resolution Control Panel */}
          {selectedDispute && (
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-3">
                  <div>
                    <span className="text-[10px] font-numeric text-[#C69432] font-bold">CASE ID: {selectedDispute.disputeId}</span>
                    <h3 className="text-sm font-bold text-[#2C221E]">{selectedDispute.zigTitle}</h3>
                  </div>
                  <div className="text-right font-numeric">
                    <span className="text-[10px] text-[#665C54] block">Contested Escrow Pool</span>
                    <span className="text-base font-extrabold text-[#0F8B5F]">
                      {formatCurrency(selectedDispute.escrowAmount)}
                    </span>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="grid grid-cols-2 gap-3 text-xs font-numeric">
                  <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8]">
                    <span className="text-[10px] text-[#0F8B5F] font-bold uppercase block">Worker Party</span>
                    <span className="font-bold text-[#2C221E] block mt-0.5">{selectedDispute.workerName}</span>
                    <span className="text-[10px] text-[#665C54]">ID: {selectedDispute.workerId}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8]">
                    <span className="text-[10px] text-[#2C221E] font-bold uppercase block">Employer Party</span>
                    <span className="font-bold text-[#2C221E] block mt-0.5">{selectedDispute.employerName}</span>
                    <span className="text-[10px] text-[#665C54]">ID: {selectedDispute.employerId}</span>
                  </div>
                </div>

                {/* Claim Statement */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#665C54] uppercase block">Contested Claim Details:</span>
                  <p className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-xs text-[#2C221E] leading-relaxed font-numeric">
                    {selectedDispute.description || selectedDispute.workerClaim || selectedDispute.employerClaim}
                  </p>
                </div>

                {/* Adjudication Action Controls */}
                <div className="pt-2 border-t border-[#EBE4D8] space-y-3">
                  <span className="text-[11px] font-semibold text-[#665C54] uppercase block">Executive Escrow Adjudication Actions:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveResolution({ type: 'RESOLVED_WORKER', dispute: selectedDispute })}
                      className="p-3 rounded-xl bg-[#0F8B5F] hover:bg-[#0C6F4C] text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 min-h-[38px] shadow-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Full Payout to Worker</span>
                    </button>

                    <button
                      onClick={() => setActiveResolution({ type: 'RESOLVED_EMPLOYER', dispute: selectedDispute })}
                      className="p-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 min-h-[38px] shadow-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Full Refund to Employer</span>
                    </button>

                    <button
                      onClick={() => setActiveResolution({ type: 'PARTIAL_SPLIT', dispute: selectedDispute })}
                      className="p-3 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 min-h-[38px] shadow-sm"
                    >
                      <Sliders className="w-4 h-4 text-[#C69432]" />
                      <span>Custom Split Ratio</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resolution Confirmation & Split Modal */}
      {activeResolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] p-5 space-y-4 font-poppins shadow-2xl">
            <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
              <Scale className="w-4 h-4 text-[#C69432]" />
              <span>Adjudicate Escrow Case: {activeResolution.type.replace(/_/g, ' ')}</span>
            </h3>

            {activeResolution.type === 'PARTIAL_SPLIT' && (
              <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] space-y-3 font-numeric">
                <div className="flex justify-between text-xs font-semibold text-[#2C221E]">
                  <span>Worker Split: {workerSplitPct}%</span>
                  <span>Employer Split: {100 - workerSplitPct}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={workerSplitPct}
                  onChange={(e) => setWorkerSplitPct(Number(e.target.value))}
                  className="w-full accent-[#C69432]"
                />

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold pt-1">
                  <div className="p-2 rounded-lg bg-[#FFFFFF] text-[#0F8B5F] border border-[#EBE4D8]">
                    Worker: {formatCurrency(calculateSplitAmounts(activeResolution.dispute, workerSplitPct).workerAmount)}
                  </div>
                  <div className="p-2 rounded-lg bg-[#FFFFFF] text-[#2C221E] border border-[#EBE4D8]">
                    Employer: {formatCurrency(calculateSplitAmounts(activeResolution.dispute, workerSplitPct).employerAmount)}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#665C54] mb-1 uppercase">Official Adjudication Reason:</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="State clear rationale for escrow resolution..."
                className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl p-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#C69432] font-numeric"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveResolution(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#F0EBE1] text-xs font-semibold text-[#665C54] hover:text-[#2C221E] border border-[#EBE4D8]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resolveMutation.isPending}
                onClick={handleExecuteResolution}
                className="px-4 py-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-xs font-bold text-white shadow-sm"
              >
                Execute Adjudication
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
