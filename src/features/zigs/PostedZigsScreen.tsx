import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  Eye,
  X,
  DollarSign,
  Camera,
  Phone,
  Users,
  UserCheck,
  Clock,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Star,
  Layers
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { PostedZigRecord, TaskApplicantRecord } from '../../types/admin';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

export const PostedZigsScreen: React.FC = () => {
  const { success } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'POSTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'>('ALL');
  const [applicantFilter, setApplicantFilter] = useState<'ALL' | 'WITH_APPLICANTS'>('ALL');
  const [selectedZig, setSelectedZig] = useState<PostedZigRecord | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [applicantTab, setApplicantTab] = useState<'ALL' | 'pending' | 'accepted' | 'cancelled'>('ALL');

  const { data: zigs = [], isLoading } = useQuery({
    queryKey: ['postedZigsList'],
    queryFn: () => adminApi.fetchPostedZigsList(),
  });

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    success('Copied', `Phone number ${phone} copied to clipboard.`);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const filteredZigs = zigs.filter((z) => {
    const matchesStatus = statusFilter === 'ALL' || z.status === statusFilter;
    const matchesApplicantFilter = applicantFilter === 'ALL' || (applicantFilter === 'WITH_APPLICANTS' && (z.applicationCount || 0) > 0);
    const matchesApplicantSearch = (z.applications || []).some(a =>
      a.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.workerPhone.includes(searchQuery)
    );
    const matchesSearch =
      z.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.createdByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (z.assignedToName && z.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (z.locationName && z.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      z.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matchesApplicantSearch;

    return matchesStatus && matchesApplicantFilter && matchesSearch;
  });

  const completedCount = zigs.filter(z => z.status === 'COMPLETED').length;
  const activeCount = zigs.filter(z => z.status === 'POSTED' || z.status === 'ASSIGNED' || z.status === 'IN_PROGRESS').length;
  const cancelledCount = zigs.filter(z => z.status === 'CANCELLED').length;
  const expiredCount = zigs.filter(z => z.status === 'EXPIRED').length;
  const totalPayoutSum = zigs.filter(z => z.status === 'COMPLETED').reduce((sum, z) => sum + (z.payout || 0), 0);

  const totalWorkersRequested = zigs.reduce((sum, z) => sum + (z.workersRequired || 1), 0);
  const totalWorkersAssigned = zigs.reduce((sum, z) => sum + (z.workersAssigned || 0), 0);
  const totalApplicationsCount = zigs.reduce((sum, z) => sum + (z.applicationCount || 0), 0);
  const zigsWithApplicationsCount = zigs.filter(z => (z.applicationCount || 0) > 0).length;

  // Filter applicants in modal
  const modalApplicants = (selectedZig?.applications || []).filter(a => {
    if (applicantTab === 'ALL') return true;
    return a.status === applicantTab;
  });

  return (
    <div className="space-y-5 font-poppins text-xs text-[#2C221E]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#2C221E] tracking-tight flex items-center space-x-2">
            <span>Posted Zigs & Gig Operations Directory</span>
            <span className="text-[11px] font-numeric font-bold px-2 py-0.5 rounded-full bg-[#C69432]/10 text-[#C69432] border border-[#C69432]/30">
              {zigs.length} Live Zigs
            </span>
          </h2>
          <p className="text-[11px] text-[#665C54] mt-0.5">
            Audit employer task requests, worker staffing requirements, real-time candidate applications, and proof photos
          </p>
        </div>
      </div>

      {/* Overview Stat Cards - 4 Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-numeric">
        {/* TOTAL POSTED ZIGS */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span className="text-[11px] font-bold text-[#665C54] uppercase tracking-wider">Total Posted Zigs</span>
            <Briefcase className="w-4 h-4 text-[#C69432]" />
          </div>
          <div className="text-2xl font-black text-[#2C221E] mt-2">{zigs.length}</div>
          <div className="text-[11px] text-[#665C54] mt-1">
            <span className="text-[#0F8B5F] font-bold">{activeCount} Active</span> · <span className="text-[#2C221E] font-bold">{completedCount} Done</span> · <span className="text-[#DC2626]">{cancelledCount + expiredCount} Closed</span>
          </div>
        </div>

        {/* WORKERS REQUESTED VS ASSIGNED */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span className="text-[11px] font-bold text-[#665C54] uppercase tracking-wider">Staffing Demand</span>
            <Layers className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-black text-[#2C221E] mt-2">
            {totalWorkersAssigned} <span className="text-sm font-normal text-[#665C54]">/ {totalWorkersRequested} Workers</span>
          </div>
          <div className="text-[11px] text-[#665C54] mt-1 flex items-center justify-between">
            <span>Requested: {totalWorkersRequested}</span>
            <span className="text-[#2563EB] font-bold">
              {totalWorkersRequested > 0 ? ((totalWorkersAssigned / totalWorkersRequested) * 100).toFixed(0) : 0}% Filled
            </span>
          </div>
        </div>

        {/* JOB APPLICATIONS SUBMITTED */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span className="text-[11px] font-bold text-[#665C54] uppercase tracking-wider">Candidate Applications</span>
            <Users className="w-4 h-4 text-[#0F8B5F]" />
          </div>
          <div className="text-2xl font-black text-[#0F8B5F] mt-2 flex items-baseline space-x-1.5">
            <span>{totalApplicationsCount}</span>
            <span className="text-xs font-semibold text-[#665C54]">Applied</span>
          </div>
          <div className="text-[11px] text-[#665C54] mt-1">
            Across <strong className="text-[#2C221E]">{zigsWithApplicationsCount}</strong> active gig listings
          </div>
        </div>

        {/* COMPLETED PAYOUT VOLUME */}
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span className="text-[11px] font-bold text-[#665C54] uppercase tracking-wider">Settled Payouts</span>
            <DollarSign className="w-4 h-4 text-[#C69432]" />
          </div>
          <div className="text-2xl font-black text-[#C69432] mt-2">{formatCurrency(totalPayoutSum)}</div>
          <div className="text-[11px] text-[#665C54] mt-1">
            Fulfillment: <strong className="text-[#0F8B5F]">{zigs.length > 0 ? ((completedCount / zigs.length) * 100).toFixed(1) : 0}%</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        {/* Status & Applicant Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Filter className="w-3.5 h-3.5 text-[#C69432] ml-1" />
          <span className="text-[11px] text-[#665C54] font-semibold uppercase">Status:</span>
          {(['ALL', 'POSTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition-colors ${
                statusFilter === st
                  ? 'bg-[#2C221E] text-white border border-[#2C221E] shadow-xs'
                  : 'bg-[#F0EBE1] text-[#5C524B] hover:text-[#2C221E] border border-[#EBE4D8]'
              }`}
            >
              {st}
            </button>
          ))}

          <div className="h-4 w-px bg-[#EBE4D8] mx-1 hidden sm:block" />

          {/* Quick Applicant Filter */}
          <button
            onClick={() => setApplicantFilter(prev => prev === 'ALL' ? 'WITH_APPLICANTS' : 'ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 border ${
              applicantFilter === 'WITH_APPLICANTS'
                ? 'bg-[#C69432] text-white border-[#C69432] shadow-xs'
                : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] hover:bg-[#FEF3C7]'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Has Applicants ({zigsWithApplicationsCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search zig, candidate, employer, worker..."
            className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] font-numeric"
          />
        </div>
      </div>

      {/* Tasks Directory Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] animate-pulse" />
          ))}
        </div>
      ) : filteredZigs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center flex flex-col items-center">
          <Briefcase className="w-10 h-10 text-[#C69432] mb-2" />
          <h3 className="text-sm font-bold text-[#2C221E]">No Zigs Found</h3>
          <p className="text-xs text-[#665C54] mt-0.5">Adjust filter parameters or search query.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EE] text-[#C69432] uppercase font-numeric border-b border-[#EBE4D8]">
                <tr>
                  <th className="py-2.5 px-3">Zig Title & Category</th>
                  <th className="py-2.5 px-3">Staffing Demands</th>
                  <th className="py-2.5 px-3">Job Applications</th>
                  <th className="py-2.5 px-3">Employer Creator</th>
                  <th className="py-2.5 px-3">Assigned Worker</th>
                  <th className="py-2.5 px-3">Payout Budget</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Inspect Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8]">
                {filteredZigs.map((z) => {
                  const hasApps = (z.applicationCount || 0) > 0;
                  return (
                    <tr key={z.id} className="hover:bg-[#F0EBE1]/50 transition-colors">
                      {/* Zig Title & Category */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#2C221E] flex items-center space-x-1.5">
                          <span className="truncate max-w-[200px]">{z.title}</span>
                          <span className="text-[9px] font-numeric font-bold px-1.5 py-0.2 rounded uppercase bg-[#C69432]/10 text-[#C69432] border border-[#C69432]/30 shrink-0">
                            {z.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 mt-0.5 text-[11px] text-[#665C54]">
                          <MapPin className="w-3 h-3 text-[#C69432] shrink-0" />
                          <span className="truncate max-w-xs">{z.locationName}</span>
                        </div>
                        <div className="text-[10px] text-[#8C827A] font-numeric mt-0.5">
                          Posted: {formatDate(z.createdAt)}
                        </div>
                      </td>

                      {/* Staffing Demands (Workers Requested vs Assigned) */}
                      <td className="py-2.5 px-3 font-numeric">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-[#2C221E]">
                            {z.workersRequired} {z.workersRequired === 1 ? 'Worker' : 'Workers'} Requested
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            z.workersAssigned >= z.workersRequired && z.workersRequired > 0
                              ? 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]'
                              : z.workersAssigned > 0
                              ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                              : 'bg-[#F0EBE1] text-[#665C54] border-[#EBE4D8]'
                          }`}>
                            {z.workersAssigned} / {z.workersRequired} Filled
                          </span>
                        </div>
                      </td>

                      {/* Job Applications */}
                      <td className="py-2.5 px-3 font-numeric">
                        {hasApps ? (
                          <div 
                            onClick={() => setSelectedZig(z)}
                            className="cursor-pointer group inline-flex flex-col"
                            title="Click to view candidate list"
                          >
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#FFFBEB] group-hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold text-xs transition-colors">
                              <Users className="w-3.5 h-3.5 text-[#C69432]" />
                              <span>{z.applicationCount} Applied</span>
                            </span>
                            <span className="text-[10px] text-[#C69432] font-semibold mt-0.5 underline">
                              View Candidates →
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-[#F0EBE1] text-[#8C827A] border border-[#EBE4D8]">
                            <span>0 Applied</span>
                          </span>
                        )}
                      </td>

                      {/* Employer Creator */}
                      <td className="py-2.5 px-3 font-numeric">
                        <div className="font-bold text-[#2C221E] truncate max-w-[140px]">{z.createdByName}</div>
                        <div className="text-[11px] text-[#665C54] flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#C69432] shrink-0" />
                          <span className="truncate">{z.createdByPhone}</span>
                        </div>
                      </td>

                      {/* Assigned Worker */}
                      <td className="py-2.5 px-3 font-numeric">
                        {z.assignedToName && z.assignedToName !== 'Unassigned' ? (
                          <div>
                            <div className="font-bold text-[#2C221E] truncate max-w-[140px]">{z.assignedToName}</div>
                            <div className="text-[11px] text-[#665C54] flex items-center space-x-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[#0F8B5F] shrink-0" />
                              <span className="truncate">{z.assignedToPhone}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#8C827A] italic font-semibold">Unassigned</span>
                        )}
                      </td>

                      {/* Payout Budget */}
                      <td className="py-2.5 px-3 font-numeric font-bold text-[#0F8B5F]">
                        {formatCurrency(z.payout)}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                            z.status === 'COMPLETED'
                              ? 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                              : z.status === 'IN_PROGRESS' || z.status === 'ASSIGNED'
                              ? 'bg-[#C69432]/15 text-[#C69432] border-[#C69432]/30'
                              : z.status === 'POSTED'
                              ? 'bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30'
                              : 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/30'
                          }`}
                        >
                          {z.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedZig(z)}
                          className="px-3 py-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-bold transition-colors inline-flex items-center space-x-1 min-h-[32px] shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C69432]" />
                          <span>Inspect</span>
                          {hasApps && (
                            <span className="ml-1 w-4 h-4 rounded-full bg-[#C69432] text-white text-[9px] flex items-center justify-center font-bold">
                              {z.applicationCount}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task & Candidate Inspection Modal */}
      {selectedZig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-3xl w-full rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] p-4 sm:p-6 space-y-5 font-poppins shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#EBE4D8] pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-numeric text-[#C69432] font-bold uppercase tracking-wider bg-[#F0EBE1] px-2 py-0.5 rounded border border-[#EBE4D8]">
                    ZIG ID: {selectedZig.id.slice(0, 12)}...
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-numeric font-bold uppercase border ${
                      selectedZig.status === 'COMPLETED'
                        ? 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                        : selectedZig.status === 'IN_PROGRESS' || selectedZig.status === 'ASSIGNED'
                        ? 'bg-[#C69432]/15 text-[#C69432] border-[#C69432]/30'
                        : selectedZig.status === 'POSTED'
                        ? 'bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30'
                        : 'bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/30'
                    }`}
                  >
                    {selectedZig.status}
                  </span>
                  <span className="text-[10px] font-numeric font-bold px-2 py-0.5 rounded bg-[#C69432]/10 text-[#C69432] border border-[#C69432]/30 uppercase">
                    {selectedZig.category}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#2C221E]">{selectedZig.title}</h3>
                <p className="text-[11px] text-[#665C54] font-numeric">
                  Posted on: <strong className="text-[#2C221E]">{formatDate(selectedZig.createdAt)}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedZig(null)}
                className="p-1.5 rounded-lg text-[#665C54] hover:text-[#2C221E] hover:bg-[#F0EBE1] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Staffing Demand & Application Volume Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-numeric">
              <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8]">
                <span className="text-[10px] text-[#665C54] font-bold uppercase block">Workers Requested</span>
                <span className="text-lg font-black text-[#2C221E] block mt-1">
                  {selectedZig.workersRequired}
                </span>
                <span className="text-[10px] text-[#665C54]">Staff requested</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8]">
                <span className="text-[10px] text-[#665C54] font-bold uppercase block">Workers Assigned</span>
                <span className="text-lg font-black text-[#0F8B5F] block mt-1">
                  {selectedZig.workersAssigned}
                </span>
                <span className="text-[10px] text-[#665C54]">Filled slots</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                <span className="text-[10px] text-[#92400E] font-bold uppercase block">Total Applied</span>
                <span className="text-lg font-black text-[#B45309] block mt-1">
                  {selectedZig.applicationCount}
                </span>
                <span className="text-[10px] text-[#92400E]">Worker candidates</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8]">
                <span className="text-[10px] text-[#665C54] font-bold uppercase block">Payout Budget</span>
                <span className="text-lg font-black text-[#C69432] block mt-1">
                  {formatCurrency(selectedZig.payout)}
                </span>
                <span className="text-[10px] text-[#665C54]">{selectedZig.paymentStatus}</span>
              </div>
            </div>

            {/* WHO ALL HAVE APPLIED: Candidate Roster Section */}
            <div className="space-y-3 pt-2 border-t border-[#EBE4D8]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-[#C69432]/10 flex items-center justify-center text-[#C69432]">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#2C221E]">
                      Who All Have Applied ({selectedZig.applications?.length || 0} Candidates)
                    </h4>
                    <p className="text-[10px] text-[#665C54]">
                      100% verified application records from Supabase task_applications table
                    </p>
                  </div>
                </div>

                {/* Sub-tabs for application status */}
                {(selectedZig.applications?.length || 0) > 0 && (
                  <div className="flex items-center space-x-1 bg-[#F0EBE1] p-1 rounded-xl">
                    {(['ALL', 'pending', 'accepted', 'cancelled'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setApplicantTab(tab)}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                          applicantTab === tab
                            ? 'bg-[#2C221E] text-white shadow-xs'
                            : 'text-[#5C524B] hover:text-[#2C221E]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Candidate Cards Grid */}
              {modalApplicants.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-center">
                  <Users className="w-8 h-8 text-[#8C827A] mx-auto mb-1.5 opacity-50" />
                  <p className="text-xs font-semibold text-[#2C221E]">
                    {selectedZig.applications?.length === 0
                      ? 'No workers have applied for this Zig yet.'
                      : `No applicants with status "${applicantTab}".`}
                  </p>
                  <p className="text-[10px] text-[#665C54] mt-0.5">
                    When student workers apply on the Zigger app, their profiles appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {modalApplicants.map((applicant, idx) => (
                    <div 
                      key={applicant.id || idx}
                      className="p-3 rounded-xl bg-[#FFFFFF] border border-[#EBE4D8] hover:border-[#C69432] shadow-xs space-y-2 transition-all font-numeric"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {applicant.workerAvatar ? (
                            <img
                              src={applicant.workerAvatar}
                              alt={applicant.workerName}
                              className="w-9 h-9 rounded-full object-cover border border-[#EBE4D8] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#2C221E] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                              {applicant.workerName?.[0] || 'W'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="font-bold text-[#2C221E] text-xs truncate">
                              {applicant.workerName}
                            </h5>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="text-[10px] text-[#665C54] truncate">{applicant.workerPhone}</span>
                              <button
                                onClick={() => handleCopyPhone(applicant.workerPhone)}
                                className="p-0.5 text-[#8C827A] hover:text-[#C69432] transition-colors"
                                title="Copy Phone Number"
                              >
                                {copiedPhone === applicant.workerPhone ? (
                                  <Check className="w-3 h-3 text-[#0F8B5F]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Application Status Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 border ${
                          applicant.status === 'accepted'
                            ? 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]'
                            : applicant.status === 'pending'
                            ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                            : applicant.status === 'cancelled'
                            ? 'bg-[#F0EBE1] text-[#665C54] border-[#EBE4D8]'
                            : 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                        }`}>
                          {applicant.status}
                        </span>
                      </div>

                      {/* Candidate Credentials Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-1 border-t border-[#F0EBE1]">
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-[#0F8B5F]/10 text-[#0F8B5F] font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Trust: {applicant.trustScore}%</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-[#C69432]/10 text-[#C69432] font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Rating: {applicant.rating}</span>
                        </span>
                        <span className={`px-1.5 py-0.2 rounded font-semibold ${
                          applicant.kycStatus === 'APPROVED' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F0EBE1] text-[#665C54]'
                        }`}>
                          KYC: {applicant.kycStatus}
                        </span>
                      </div>

                      {/* Pitch Message or Bid Amount if provided */}
                      {applicant.pitchMessage && (
                        <p className="text-[11px] text-[#5C524B] italic bg-[#F8F5EE] p-2 rounded-lg border border-[#EBE4D8]">
                          "{applicant.pitchMessage}"
                        </p>
                      )}

                      {applicant.bidAmount && (
                        <div className="text-[10px] text-[#0F8B5F] font-bold">
                          Custom Bid: {formatCurrency(applicant.bidAmount)}
                        </div>
                      )}

                      <div className="text-[9px] text-[#8C827A] flex items-center justify-between pt-0.5">
                        <span>Applied: {formatDate(applicant.createdAt)}</span>
                        <span className="font-mono text-[#8C827A]">ID: {applicant.workerId.slice(0, 8)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Employer Creator & Assigned Worker Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-numeric pt-2 border-t border-[#EBE4D8]">
              <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] space-y-1">
                <span className="text-[10px] text-[#C69432] font-bold uppercase block">Employer Creator</span>
                <span className="font-bold text-[#2C221E] block text-sm">{selectedZig.createdByName}</span>
                <div className="text-[11px] text-[#665C54] flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-[#C69432]" />
                  <span>{selectedZig.createdByPhone}</span>
                </div>
                <span className="text-[10px] text-[#8C827A] block font-mono">User ID: {selectedZig.createdBy}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] space-y-1">
                <span className="text-[10px] text-[#0F8B5F] font-bold uppercase block">Assigned Worker</span>
                <span className="font-bold text-[#2C221E] block text-sm">{selectedZig.assignedToName}</span>
                <div className="text-[11px] text-[#665C54] flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-[#0F8B5F]" />
                  <span>{selectedZig.assignedToPhone}</span>
                </div>
                {selectedZig.assignedTo && (
                  <span className="text-[10px] text-[#8C827A] block font-mono">Worker ID: {selectedZig.assignedTo}</span>
                )}
              </div>
            </div>

            {/* Shift Timing in IST */}
            {(selectedZig.startTime || selectedZig.endTime) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-numeric">
                <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8]">
                  <span className="text-[10px] text-[#665C54] font-bold uppercase block">Shift Start (IST)</span>
                  <span className="font-bold text-[#2C221E] mt-0.5 block">{formatDate(selectedZig.startTime)}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8]">
                  <span className="text-[10px] text-[#665C54] font-bold uppercase block">Shift End (IST)</span>
                  <span className="font-bold text-[#2C221E] mt-0.5 block">{formatDate(selectedZig.endTime)}</span>
                </div>
              </div>
            )}

            {/* Location & Task Description */}
            <div className="space-y-1 font-numeric">
              <span className="text-[11px] font-bold text-[#665C54] uppercase block">Location & Description:</span>
              <div className="p-3.5 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-xs text-[#2C221E] leading-relaxed space-y-1.5">
                <div className="flex items-start space-x-1 text-[#C69432] font-bold">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{selectedZig.locationName}</span>
                </div>
                <p className="text-[#5C524B]">{selectedZig.description}</p>
              </div>
            </div>

            {/* Proof & Attendance Photos */}
            <div className="space-y-2 pt-2 border-t border-[#EBE4D8]">
              <span className="text-[11px] font-bold text-[#665C54] uppercase flex items-center space-x-1">
                <Camera className="w-3.5 h-3.5 text-[#C69432]" />
                <span>Attendance & Work Completion Photos</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-numeric">
                <div>
                  <span className="text-[10px] text-[#665C54] block mb-1 font-semibold">Check-in Photo:</span>
                  {selectedZig.checkInPhoto ? (
                    <img 
                      src={selectedZig.checkInPhoto} 
                      alt="Check-in Photo" 
                      className="w-full h-44 object-cover rounded-xl border border-[#EBE4D8] shadow-xs" 
                    />
                  ) : (
                    <div className="w-full h-44 bg-[#F0EBE1] rounded-xl border border-[#EBE4D8] flex items-center justify-center text-[#8C827A] text-xs">
                      No check-in photo logged
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#665C54] block mb-1 font-semibold">Check-out / Proof Photo:</span>
                  {selectedZig.checkOutPhoto || selectedZig.proofPhotoUrl ? (
                    <img 
                      src={selectedZig.checkOutPhoto || selectedZig.proofPhotoUrl} 
                      alt="Proof Photo" 
                      className="w-full h-44 object-cover rounded-xl border border-[#EBE4D8] shadow-xs" 
                    />
                  ) : (
                    <div className="w-full h-44 bg-[#F0EBE1] rounded-xl border border-[#EBE4D8] flex items-center justify-center text-[#8C827A] text-xs">
                      No proof photo logged
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Close Inspector Action */}
            <div className="flex justify-end pt-2 border-t border-[#EBE4D8]">
              <button
                onClick={() => setSelectedZig(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-xs font-bold text-white shadow-sm transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
