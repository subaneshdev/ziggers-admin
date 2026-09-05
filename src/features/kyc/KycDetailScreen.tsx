import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Sparkles
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { formatDate } from '../../lib/utils';

export const KycDetailScreen: React.FC = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: detail, isLoading } = useQuery({
    queryKey: ['kycDetail', userId],
    queryFn: () => adminApi.fetchKycDetail(userId),
    enabled: !!userId,
  });

  if (isLoading || !detail) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-[#F0EBE1] rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-64 col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#EBE4D8]" />
          <div className="h-64 bg-[#FFFFFF] rounded-2xl border border-[#EBE4D8]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl font-poppins text-xs text-[#2C221E]">
      {/* Top Action & User Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/kyc/queue')}
            className="p-2.5 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] transition-colors border border-[#EBE4D8]"
            title="Back to Verification Queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#2C221E]">{detail.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C69432]/10 text-[#C69432] font-numeric border border-[#C69432]/30 uppercase font-bold">
                {detail.roleType}
              </span>
            </div>
            <p className="text-[11px] text-[#665C54] font-numeric mt-0.5">
              ID: {detail.userId} • Registered: {formatDate(detail.submittedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-numeric font-bold uppercase border ${
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
      </div>

      {/* Main Grid Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Government DB Field Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {/* Side-by-Side Government DB Field Comparison */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
            <h3 className="text-sm font-bold text-[#2C221E] mb-4 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F8B5F]" />
              <span>Government DB & OCR Field Comparison</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-[#C69432] font-numeric border-b border-[#EBE4D8] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">User Submitted Input</th>
                    <th className="py-2.5 px-3">Verified Gov DB Record</th>
                    <th className="py-2.5 px-3 text-center">Match Result</th>
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
                            MATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#DC2626]/15 text-[#DC2626] font-numeric border border-[#DC2626]/30 font-bold">
                            MISMATCH
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
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-3">
              <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#C69432]" />
                <span>Didit Liveness AI Status</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-numeric bg-[#0F8B5F]/10 text-[#0F8B5F] border border-[#0F8B5F]/20 font-bold">
                {detail.diditStatus}
              </span>
            </div>

            <div className="space-y-3 font-numeric">
              <div>
                <div className="flex justify-between text-xs text-[#665C54] mb-1">
                  <span>Confidence Score</span>
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
                  <span className="text-[10px] text-[#665C54] block">Face Match Score</span>
                  <span className="text-sm font-extrabold text-[#0F8B5F]">{detail.diditMatchScore}%</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-center">
                  <span className="text-[10px] text-[#665C54] block">Passive Liveness</span>
                  <span className="text-xs font-extrabold text-[#0F8B5F]">
                    {detail.diditLivenessPassed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] space-y-1">
              <span className="text-[10px] font-bold text-[#C69432] uppercase">Database Notes:</span>
              <p className="text-xs text-[#2C221E] font-numeric leading-relaxed">{detail.notes}</p>
            </div>
          </div>

          {/* Verified Bank Account Panel */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4">
            <h3 className="text-sm font-bold text-[#2C221E] flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#0F8B5F]" />
              <span>Verified Bank Account</span>
            </h3>

            <div className="space-y-2.5 font-numeric text-xs">
              <div className="flex justify-between border-b border-[#EBE4D8] pb-2">
                <span className="text-[#665C54]">Bank Name</span>
                <span className="font-bold text-[#2C221E]">{detail.bankName}</span>
              </div>
              <div className="flex justify-between border-b border-[#EBE4D8] pb-2">
                <span className="text-[#665C54]">Account Number</span>
                <span className="font-bold text-[#2C221E]">{detail.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#665C54]">IFSC Code</span>
                <span className="font-bold text-[#C69432]">{detail.ifscCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
