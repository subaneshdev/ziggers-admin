import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Share2, 
  Search, 
  Filter, 
  Gift, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Phone
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { formatCurrency, formatDate } from '../../lib/utils';

export const ReferralTrackingScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'waiting' | 'converted' | 'expired'>('ALL');

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['referralTracking'],
    queryFn: () => adminApi.fetchReferrals(),
  });

  const filteredReferrals = referrals.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      r.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referredName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referralCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referrerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referredPhone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRewards = referrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
  const convertedCount = referrals.filter(r => r.status === 'converted').length;
  const waitingCount = referrals.filter(r => r.status === 'waiting').length;

  return (
    <div className="space-y-5 font-poppins text-xs text-[#2C221E]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2C221E] tracking-tight">
            Referral Conversion & Growth Ledger
          </h2>
          <p className="text-[11px] text-[#665C54] mt-0.5">
            Audit log of viral user invite codes, referee registrations, and bonus reward distributions ({referrals.length} total)
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-numeric">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Total Referrals Triggered</span>
            <Share2 className="w-4 h-4 text-[#C69432]" />
          </div>
          <div className="text-xl font-extrabold text-[#2C221E] mt-1">{referrals.length}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Invite codes generated</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Converted Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-[#0F8B5F]" />
          </div>
          <div className="text-xl font-extrabold text-[#0F8B5F] mt-1">{convertedCount}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">{waitingCount} Pending Conversions</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Rewards Distributed</span>
            <Gift className="w-4 h-4 text-[#C69432]" />
          </div>
          <div className="text-xl font-extrabold text-[#C69432] mt-1">{formatCurrency(totalRewards)}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Credited to referrer wallets</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#C69432] ml-1" />
          <span className="text-[11px] text-[#665C54] font-semibold uppercase">Status Filter:</span>
          {(['ALL', 'waiting', 'converted', 'expired'] as const).map((st) => (
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

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, referrer, referee..."
            className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] font-numeric"
          />
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] animate-pulse" />
          ))}
        </div>
      ) : filteredReferrals.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center flex flex-col items-center">
          <Share2 className="w-10 h-10 text-[#C69432] mb-2" />
          <h3 className="text-sm font-bold text-[#2C221E]">No Referral Records Found</h3>
          <p className="text-xs text-[#665C54] mt-0.5">Adjust search or filter parameters.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EE] text-[#C69432] uppercase font-numeric border-b border-[#EBE4D8]">
                <tr>
                  <th className="py-2.5 px-3">Referral Code</th>
                  <th className="py-2.5 px-3">Referrer Identity</th>
                  <th className="py-2.5 px-3">Referred Referee</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Bonus Reward</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8]">
                {filteredReferrals.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F0EBE1]/50 transition-colors">
                    <td className="py-2.5 px-3 font-numeric font-bold text-[#C69432]">
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3.5 h-3.5 text-[#C69432]" />
                        <span>{r.referralCode}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#2C221E]">{r.referrerName}</div>
                      <div className="text-[11px] text-[#665C54] font-numeric flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-[#C69432]" />
                        <span>{r.referrerPhone}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#2C221E]">{r.referredName}</div>
                      <div className="text-[11px] text-[#665C54] font-numeric flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-[#C69432]" />
                        <span>{r.referredPhone}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                          r.status === 'converted'
                            ? 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                            : r.status === 'waiting'
                            ? 'bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30'
                            : 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-numeric font-bold text-[#0F8B5F]">
                      {formatCurrency(r.rewardAmount)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#665C54] font-numeric">
                      <div className="flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3 text-[#8C827A]" />
                        <span>{formatDate(r.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
