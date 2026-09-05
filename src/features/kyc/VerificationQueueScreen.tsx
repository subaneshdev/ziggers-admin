import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Phone,
  Mail
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { formatDate } from '../../lib/utils';

export const VerificationQueueScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'worker' | 'employer'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'NOT_STARTED' | 'APPROVED' | 'REJECTED'>('ALL');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['verificationQueueUsers'],
    queryFn: () => adminApi.fetchPendingKycs(),
  });

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.roleType === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.kycStatus === statusFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const pendingCount = users.filter(u => u.kycStatus === 'PENDING').length;
  const notStartedCount = users.filter(u => u.kycStatus === 'NOT_STARTED').length;
  const approvedCount = users.filter(u => u.kycStatus === 'APPROVED').length;
  const rejectedCount = users.filter(u => u.kycStatus === 'REJECTED').length;

  return (
    <div className="space-y-5 font-poppins text-xs text-[#2C221E]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2C221E] tracking-tight">
            Registered Users & KYC Verification Directory
          </h2>
          <p className="text-[11px] text-[#665C54] mt-0.5">
            Adjudicate registered worker & employer identities directly from Supabase PostgreSQL profiles ({users.length} total)
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-numeric">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-xl font-extrabold text-[#D97706] mt-1">{pendingCount}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Awaiting manual adjudication</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>KYC Not Started</span>
            <Clock className="w-4 h-4 text-[#665C54]" />
          </div>
          <div className="text-xl font-extrabold text-[#665C54] mt-1">{notStartedCount}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Profiles pending KYC submission</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Approved Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-[#0F8B5F]" />
          </div>
          <div className="text-xl font-extrabold text-[#0F8B5F] mt-1">{approvedCount}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Verified identity profiles</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Rejected Submissions</span>
            <XCircle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div className="text-xl font-extrabold text-[#DC2626] mt-1">{rejectedCount}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Flagged or invalid accounts</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-[#C69432]" />
            <span className="text-[11px] text-[#665C54] font-semibold uppercase">Role:</span>
            {(['ALL', 'worker', 'employer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
                  roleFilter === r
                    ? 'bg-[#2C221E] text-white border border-[#2C221E]'
                    : 'bg-[#F0EBE1] text-[#5C524B] hover:text-[#2C221E] border border-[#EBE4D8]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#EBE4D8] hidden md:block" />

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-[#665C54] font-semibold uppercase">Status:</span>
            {(['ALL', 'PENDING', 'NOT_STARTED', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
                  statusFilter === st
                    ? 'bg-[#2C221E] text-white border border-[#2C221E]'
                    : 'bg-[#F0EBE1] text-[#5C524B] hover:text-[#2C221E] border border-[#EBE4D8]'
                }`}
              >
                {st === 'NOT_STARTED' ? 'NOT STARTED' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, email, ID..."
            className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] font-numeric"
          />
        </div>
      </div>

      {/* Directory Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center flex flex-col items-center">
          <UserCheck className="w-10 h-10 text-[#C69432] mb-2" />
          <h3 className="text-sm font-bold text-[#2C221E]">No Users Found</h3>
          <p className="text-xs text-[#665C54] mt-0.5">Adjust role, status, or search parameters.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EE] text-[#C69432] uppercase font-numeric border-b border-[#EBE4D8]">
                <tr>
                  <th className="py-2.5 px-3">User Profile Identity</th>
                  <th className="py-2.5 px-3">Contact Email</th>
                  <th className="py-2.5 px-3">Role Type</th>
                  <th className="py-2.5 px-3">KYC Status</th>
                  <th className="py-2.5 px-3 text-right">Registration Date</th>
                  <th className="py-2.5 px-3 text-right">Inspect Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8]">
                {filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-[#F0EBE1]/50 transition-colors group">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#2C221E] group-hover:text-[#C69432] transition-colors flex items-center space-x-2">
                        <span>{user.name}</span>
                        <span className="text-[10px] text-[#C69432] font-numeric font-normal">({user.userId.slice(0, 8)})</span>
                      </div>
                      <div className="text-[11px] text-[#665C54] font-numeric flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#C69432]" />
                        <span>{user.phone}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-numeric text-[#2C221E]">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-[#8C827A]" />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-numeric uppercase font-bold text-[#665C54]">
                      {user.roleType}
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                          user.kycStatus === 'APPROVED'
                            ? 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                            : user.kycStatus === 'PENDING'
                            ? 'bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30'
                            : user.kycStatus === 'NOT_STARTED'
                            ? 'bg-[#665C54]/15 text-[#665C54] border-[#665C54]/30'
                            : 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/30'
                        }`}
                      >
                        {user.kycStatus === 'NOT_STARTED' ? 'KYC NOT STARTED' : user.kycStatus}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#665C54] font-numeric">
                      {formatDate((user as any).submittedAt || (user as any).createdAt)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/kyc/${user.userId}`)}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white font-semibold text-xs transition-colors min-h-[32px]"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C69432]" />
                        <span>Inspect Profile</span>
                      </button>
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
