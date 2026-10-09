import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Sparkles,
  User,
  Phone,
  Mail,
  MapPin,
  Wallet,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

export const KycDetailScreen: React.FC = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: detail, isLoading } = useQuery({
    queryKey: ['kycDetail', userId],
    queryFn: () => adminApi.fetchKycDetail(userId),
    enabled: !!userId,
    staleTime: 10000,
  });

  const approveMutation = useMutation({
    mutationFn: () => adminApi.approveKyc(userId, detail?.roleType || 'worker'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycDetail', userId] });
      queryClient.invalidateQueries({ queryKey: ['verificationQueueUsers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      success('KYC Approved', `Profile ${detail?.name || userId} marked as APPROVED.`);
    },
    onError: (err: any) => error('Approval Failed', err.message || 'Could not approve KYC.'),
  });

  const rejectMutation = useMutation({
    mutationFn: () => adminApi.rejectKyc(userId, 'Rejected during manual admin inspection'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycDetail', userId] });
      queryClient.invalidateQueries({ queryKey: ['verificationQueueUsers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      success('KYC Rejected', `Profile ${detail?.name || userId} marked as REJECTED.`);
    },
    onError: (err: any) => error('Rejection Failed', err.message || 'Could not reject KYC.'),
  });

  if (isLoading || !detail) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-[#F0EBE1] rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 lg:col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#EBE4D8]" />
          <div className="h-64 bg-[#FFFFFF] rounded-2xl border border-[#EBE4D8]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl font-poppins text-xs text-[#2C221E]">
      {/* Top Action & User Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0">
          <button
            onClick={() => navigate('/admin/kyc/queue')}
            className="p-2.5 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] transition-colors border border-[#EBE4D8] shrink-0"
            title="Back to Verification Queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#2C221E] truncate">{detail.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C69432]/10 text-[#C69432] font-numeric border border-[#C69432]/30 uppercase font-bold">
                {detail.hasBothRoles ? 'WORKER & EMPLOYER' : detail.roleType}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                  detail.kycStatus === 'APPROVED'
                    ? 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                    : detail.kycStatus === 'PENDING'
                    ? 'bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30'
                    : detail.kycStatus === 'NOT_STARTED'
                    ? 'bg-[#665C54]/15 text-[#665C54] border-[#665C54]/30'
                    : 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/30'
                }`}
              >
                {detail.kycStatus === 'NOT_STARTED' ? 'KYC NOT STARTED' : detail.kycStatus}
              </span>
            </div>
            <p className="text-[11px] text-[#665C54] font-numeric mt-1 break-all sm:break-normal">
              ID: {detail.userId} • Registered: {formatDate(detail.submittedAt)}
              {detail.updatedAt && detail.updatedAt !== detail.submittedAt ? ` • Updated: ${formatDate(detail.updatedAt)}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {detail.kycStatus !== 'APPROVED' && (
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="px-3.5 py-2 rounded-xl bg-[#0F8B5F] hover:bg-[#0C6F4C] text-white font-bold text-xs transition-colors inline-flex items-center space-x-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve KYC</span>
            </button>
          )}
          {detail.kycStatus !== 'REJECTED' && (
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              className="px-3.5 py-2 rounded-xl bg-[#DC2626]/10 hover:bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30 font-bold text-xs transition-colors inline-flex items-center space-x-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          )}
        </div>
      </div>

      {/* Real Supabase User Details Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-numeric">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#665C54] text-[11px]">
            <span>Contact Details</span>
            <Phone className="w-3.5 h-3.5 text-[#C69432]" />
          </div>
          <div className="text-sm font-bold text-[#2C221E]">{detail.phone}</div>
          <div className="text-[11px] text-[#665C54] truncate flex items-center space-x-1">
            <Mail className="w-3 h-3 text-[#8C827A] shrink-0" />
            <span className="truncate">{detail.email}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#665C54] text-[11px]">
            <span>Profile Names & Role</span>
            <User className="w-3.5 h-3.5 text-[#C69432]" />
          </div>
          <div className="text-xs font-bold text-[#2C221E] truncate">
            Worker: {detail.workerName || 'Not Set'}
          </div>
          <div className="text-[11px] text-[#665C54] truncate">
            Employer: {detail.employerName || detail.businessName || 'Not Set'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#665C54] text-[11px]">
            <span>Wallet & Trust Score</span>
            <Wallet className="w-3.5 h-3.5 text-[#0F8B5F]" />
          </div>
          <div className="text-sm font-bold text-[#0F8B5F]">
            {formatCurrency(detail.walletBalance || 0)} <span className="text-[10px] text-[#665C54] font-normal">(Escrow: {formatCurrency(detail.amountInEscrow || 0)})</span>
          </div>
          <div className="text-[11px] text-[#2C221E] font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C69432]" />
            <span>Trust Score: {detail.trustScore ?? 100}/100 • Completed: {detail.completedOrders ?? 0}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#665C54] text-[11px]">
            <span>Location & Referral</span>
            <MapPin className="w-3.5 h-3.5 text-[#C69432]" />
          </div>
          <div className="text-xs font-bold text-[#2C221E] truncate">
            {detail.city || detail.state ? [detail.city, detail.state].filter(Boolean).join(', ') : 'Location Not Set'}
          </div>
          <div className="text-[11px] text-[#665C54] truncate">
            Ref Code: <strong className="text-[#C69432]">{detail.referralCode || detail.workerReferralCode || 'N/A'}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Government DB & Supabase Profile Field Comparison */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
            <h3 className="text-sm font-bold text-[#2C221E] mb-4 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F8B5F]" />
              <span>Supabase Profile & Identity Verification Breakdown</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-[#C69432] font-numeric border-b border-[#EBE4D8] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">Primary Profile Value</th>
                    <th className="py-2.5 px-3">Verification / Role Metadata</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4D8]">
                  {detail.fieldComparison.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F0EBE1]/50">
                      <td className="py-3 px-3 font-semibold text-[#2C221E]">{row.field}</td>
                      <td className="py-3 px-3 font-numeric text-[#5C524B]">{row.submittedValue}</td>
                      <td className="py-3 px-3 font-numeric text-[#C69432]">{row.governmentDbValue}</td>
                      <td className="py-3 px-3 text-center">
                        {row.isMatching ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#0F8B5F]/15 text-[#0F8B5F] font-numeric border border-[#0F8B5F]/30 font-bold">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#665C54]/15 text-[#665C54] font-numeric border border-[#665C54]/30 font-bold">
                            NOT SET
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Didit Liveness AI Status & Verified Bank Account */}
        <div className="space-y-6">
          {/* Didit Liveness AI Integration Panel */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-3">
              <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#C69432]" />
                <span>Didit Liveness AI Status</span>
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-numeric border font-bold ${
                  detail.diditStatus === 'VERIFIED'
                    ? 'bg-[#0F8B5F]/10 text-[#0F8B5F] border-[#0F8B5F]/20'
                    : detail.diditStatus === 'PENDING_MANUAL_REVIEW'
                    ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20'
                    : 'bg-[#665C54]/10 text-[#665C54] border-[#665C54]/20'
                }`}
              >
                {detail.diditStatus === 'NOT_STARTED' ? 'KYC NOT STARTED' : detail.diditStatus}
              </span>
            </div>

            <div className="space-y-3 font-numeric">
              <div>
                <div className="flex justify-between text-xs text-[#665C54] mb-1">
                  <span>Verification Confidence</span>
                  <span className="font-bold text-[#2C221E]">{detail.diditConfidence}%</span>
                </div>
                <div className="w-full bg-[#F0EBE1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0F8B5F] h-full transition-all duration-500"
                    style={{ width: `${detail.diditConfidence}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-center">
                  <span className="text-[10px] text-[#665C54] block">ID Protocol</span>
                  <span className="text-xs font-extrabold text-[#2C221E]">{detail.idType || 'Not Submitted'}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-center">
                  <span className="text-[10px] text-[#665C54] block">Passive Liveness</span>
                  <span className={`text-xs font-extrabold ${detail.diditLivenessPassed ? 'text-[#0F8B5F]' : 'text-[#665C54]'}`}>
                    {detail.diditLivenessPassed ? 'VERIFIED' : 'NOT STARTED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] space-y-1">
              <span className="text-[10px] font-bold text-[#C69432] uppercase">Database Notes:</span>
              <p className="text-xs text-[#2C221E] font-numeric leading-relaxed">{detail.notes}</p>
            </div>
          </div>

          {/* Verified Bank & RazorpayX Account Panel */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4">
            <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#0F8B5F]" />
              <span>Bank, UPI & RazorpayX Account</span>
            </h3>

            <div className="space-y-2.5 font-numeric text-xs">
              <div className="flex justify-between border-b border-[#EBE4D8] pb-2 gap-2">
                <span className="text-[#665C54]">Bank / Provider</span>
                <span className="font-bold text-[#2C221E] text-right">{detail.bankName}</span>
              </div>
              <div className="flex justify-between border-b border-[#EBE4D8] pb-2 gap-2">
                <span className="text-[#665C54]">Account / UPI</span>
                <span className="font-bold text-[#2C221E] text-right">{detail.accountNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#EBE4D8] pb-2 gap-2">
                <span className="text-[#665C54]">IFSC Code</span>
                <span className="font-bold text-[#C69432] text-right">{detail.ifscCode}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#665C54]">RazorpayX ID</span>
                <span className="font-bold text-[#0F8B5F] text-right">{detail.razorpayAccountId || 'Not Linked'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
