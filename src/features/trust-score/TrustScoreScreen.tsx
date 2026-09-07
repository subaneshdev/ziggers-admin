import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Gift, 
  TrendingDown, 
  User, 
  ShieldCheck
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const TrustScoreScreen: React.FC = () => {
  const { success, error } = useToast();

  const { data: users = [] } = useQuery({
    queryKey: ['realUsersList'],
    queryFn: () => adminApi.fetchPendingKycs(),
  });

  const defaultUser = users[0]?.userId || '45303ec3-dac8-44f2-a83e-f1cc1b76569f';
  const [targetUserId, setTargetUserId] = useState<string>(defaultUser);
  const [actionType, setActionType] = useState<'PENALTY' | 'BONUS'>('PENALTY');
  const [amount, setAmount] = useState<number>(500);
  const [reason, setReason] = useState<string>('Late backout from scheduled shift without prior notice');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const penaltyMutation = useMutation({
    mutationFn: ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) =>
      adminApi.applyPenalty(userId, amount, reason),
    onSuccess: () => {
      const selectedUserObj = users.find(u => u.userId === targetUserId);
      const displayName = selectedUserObj?.name || targetUserId;
      success('Penalty Applied', `Imposed fine of ${formatCurrency(amount)} on ${displayName}.`);
      setIsConfirmOpen(false);
    },
    onError: () => error('Penalty Error', 'Could not apply penalty fine.'),
  });

  const bonusMutation = useMutation({
    mutationFn: ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) =>
      adminApi.issueBonus(userId, amount, reason),
    onSuccess: () => {
      const selectedUserObj = users.find(u => u.userId === targetUserId);
      const displayName = selectedUserObj?.name || targetUserId;
      success('Bonus Issued', `Credited bonus of ${formatCurrency(amount)} to ${displayName}.`);
      setIsConfirmOpen(false);
    },
    onError: () => error('Bonus Error', 'Could not issue bonus.'),
  });

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || amount <= 0 || !reason) {
      error('Invalid Input', 'Please enter a valid User ID, amount > 0, and reason.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmExecute = () => {
    if (actionType === 'PENALTY') {
      penaltyMutation.mutate({ userId: targetUserId, amount, reason });
    } else {
      bonusMutation.mutate({ userId: targetUserId, amount, reason });
    }
  };

  const selectedUser = users.find(u => u.userId === targetUserId) || users[0] || null;

  return (
    <div className="space-y-5 max-w-3xl font-poppins text-xs text-[#2C221E]">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#2C221E] tracking-tight">
          Trust Score Engine & Wallet Fine Manager
        </h2>
        <p className="text-[11px] text-[#665C54] mt-0.5">
          Manually adjust trust scores, issue performance bonuses, and impose penalty fines with ledger audit trail
        </p>
      </div>

      {/* Action Form */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-5">
        <form onSubmit={handleOpenConfirm} className="space-y-4">
          {/* Action Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#665C54] mb-2 uppercase">
              Operation Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActionType('PENALTY')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  actionType === 'PENALTY'
                    ? 'bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626] font-bold'
                    : 'bg-[#F8F5EE] border-[#EBE4D8] text-[#5C524B] hover:text-[#2C221E]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <TrendingDown className="w-4 h-4 text-[#DC2626]" />
                  <span>Apply Penalty Fine</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActionType('BONUS')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  actionType === 'BONUS'
                    ? 'bg-[#0F8B5F]/10 border-[#0F8B5F] text-[#0F8B5F] font-bold'
                    : 'bg-[#F8F5EE] border-[#EBE4D8] text-[#5C524B] hover:text-[#2C221E]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Gift className="w-4 h-4 text-[#0F8B5F]" />
                  <span>Issue Reward Bonus</span>
                </div>
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#665C54] mb-1 uppercase">
                Select Registered Target User (Database)
              </label>
              {users.length > 0 ? (
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-numeric focus:outline-none focus:border-[#C69432]"
                >
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.name} ({u.phone}) - Score: {u.trustScore}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Enter User ID or Mobile..."
                  className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-numeric focus:outline-none focus:border-[#C69432]"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#665C54] mb-1 uppercase">
                Financial Amount (INR)
              </label>
              <div className="relative">
                <span className="text-[#8C827A] font-numeric text-xs absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="500"
                  className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-7 pr-3 py-2 text-xs text-[#2C221E] font-numeric focus:outline-none focus:border-[#C69432]"
                />
              </div>
            </div>
          </div>

          {/* User Profile Preview Badge */}
          {selectedUser && (
            <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] flex items-center justify-between font-numeric text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2C221E] text-white font-bold flex items-center justify-center">
                  <User className="w-4 h-4 text-[#C69432]" />
                </div>
                <div>
                  <span className="font-bold text-[#2C221E] block">{selectedUser.name}</span>
                  <span className="text-[10px] text-[#665C54]">{selectedUser.phone} • {selectedUser.email}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#665C54] block">Trust Score</span>
                <span className="text-xs font-extrabold text-[#0F8B5F] flex items-center justify-end space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F8B5F]" />
                  <span>{selectedUser.trustScore}/100</span>
                </span>
              </div>
            </div>
          )}

          {/* Reason Text */}
          <div>
            <label className="block text-[11px] font-semibold text-[#665C54] mb-1 uppercase">
              Reason & Policy Compliance Reference
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State clear operational reason for penalty or bonus..."
              className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl p-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#C69432] font-numeric"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors min-h-[38px] ${
                actionType === 'PENALTY'
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm'
                  : 'bg-[#0F8B5F] hover:bg-[#0C6F4C] text-white shadow-sm'
              }`}
            >
              Review {actionType === 'PENALTY' ? 'Penalty Fine' : 'Bonus Issuance'} Authorization
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmExecute}
          title={actionType === 'PENALTY' ? 'Confirm Penalty Deduction' : 'Confirm Bonus Credit'}
          description={`Execute manual ${actionType.toLowerCase()} on ${selectedUser?.name || targetUserId}.`}
          amountText={formatCurrency(amount)}
          consequenceText={
            actionType === 'PENALTY'
              ? 'Funds will be immediately deducted from the user’s wallet balance and logged in audit trails.'
              : 'Bonus credit will be deposited directly to the user wallet balance.'
          }
          confirmButtonText={actionType === 'PENALTY' ? 'Deduct Fine Now' : 'Credit Bonus Now'}
          variant={actionType === 'PENALTY' ? 'danger' : 'primary'}
          isLoading={penaltyMutation.isPending || bonusMutation.isPending}
        />
      )}
    </div>
  );
};
