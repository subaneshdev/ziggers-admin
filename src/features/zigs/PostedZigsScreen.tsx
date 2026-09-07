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
  Phone
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { PostedZigRecord } from '../../types/admin';
import { formatCurrency, formatDate } from '../../lib/utils';

export const PostedZigsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'POSTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'>('ALL');
  const [selectedZig, setSelectedZig] = useState<PostedZigRecord | null>(null);

  const { data: zigs = [], isLoading } = useQuery({
    queryKey: ['postedZigsList'],
    queryFn: () => adminApi.fetchPostedZigsList(),
  });

  const filteredZigs = zigs.filter((z) => {
    const matchesStatus = statusFilter === 'ALL' || z.status === statusFilter;
    const matchesSearch =
      z.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.createdByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (z.assignedToName && z.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (z.locationName && z.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      z.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const completedCount = zigs.filter(z => z.status === 'COMPLETED').length;
  const activeCount = zigs.filter(z => z.status === 'POSTED' || z.status === 'ASSIGNED' || z.status === 'IN_PROGRESS').length;
  const expiredCount = zigs.filter(z => z.status === 'EXPIRED').length;
  const totalPayoutSum = zigs.filter(z => z.status === 'COMPLETED').reduce((sum, z) => sum + (z.payout || 0), 0);

  return (
    <div className="space-y-5 font-poppins text-xs text-[#2C221E]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2C221E] tracking-tight">
            Posted Zigs & Gig Operations Directory
          </h2>
          <p className="text-[11px] text-[#665C54] mt-0.5">
            Inspect all posted gig tasks, check-in attendance photos, payouts, and worker assignments ({zigs.length} total tasks)
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-numeric">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Total Posted Zigs</span>
            <Briefcase className="w-4 h-4 text-[#C69432]" />
          </div>
          <div className="text-xl font-extrabold text-[#2C221E] mt-1">{zigs.length}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">{activeCount} Active / {completedCount} Completed / {expiredCount} Expired</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Completed Gig Fulfillments</span>
            <CheckCircle2 className="w-4 h-4 text-[#0F8B5F]" />
          </div>
          <div className="text-xl font-extrabold text-[#0F8B5F] mt-1">{completedCount}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Fulfillment Rate: {zigs.length > 0 ? ((completedCount / zigs.length) * 100).toFixed(1) : 0}%</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <div className="flex items-center justify-between text-[#665C54] text-xs font-medium">
            <span>Total Payout Volume</span>
            <DollarSign className="w-4 h-4 text-[#C69432]" />
          </div>
          <div className="text-xl font-extrabold text-[#C69432] mt-1">{formatCurrency(totalPayoutSum)}</div>
          <div className="text-[11px] text-[#665C54] mt-0.5">Disbursed payout volume (Completed Zigs only)</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#C69432] ml-1" />
          <span className="text-[11px] text-[#665C54] font-semibold uppercase">Status:</span>
          {(['ALL', 'POSTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'] as const).map((st) => (
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
            placeholder="Search title, category, employer, worker..."
            className="w-full bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] font-numeric"
          />
        </div>
      </div>

      {/* Tasks Directory Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] animate-pulse" />
          ))}
        </div>
      ) : filteredZigs.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] text-center flex flex-col items-center">
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
                  <th className="py-2.5 px-3">Employer Creator</th>
                  <th className="py-2.5 px-3">Assigned Worker</th>
                  <th className="py-2.5 px-3">Payout Budget</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Inspect Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8]">
                {filteredZigs.map((z) => (
                  <tr key={z.id} className="hover:bg-[#F0EBE1]/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#2C221E]">{z.title}</div>
                      <div className="flex items-center space-x-1.5 mt-0.5 text-[11px]">
                        <span className="bg-[#C69432]/10 text-[#C69432] font-numeric font-bold px-1.5 py-0.2 rounded uppercase text-[9px] border border-[#C69432]/30">
                          {z.category}
                        </span>
                        <span className="text-[#665C54] truncate max-w-xs">{z.locationName}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-numeric">
                      <div className="font-bold text-[#2C221E]">{z.createdByName}</div>
                      <div className="text-[11px] text-[#665C54] flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-[#C69432]" />
                        <span>{z.createdByPhone}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-numeric">
                      {z.assignedToName && z.assignedToName !== 'Unassigned' ? (
                        <div>
                          <div className="font-bold text-[#2C221E]">{z.assignedToName}</div>
                          <div className="text-[11px] text-[#665C54] flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-[#C69432]" />
                            <span>{z.assignedToPhone}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#8C827A] italic font-semibold">Unassigned</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-numeric font-bold text-[#0F8B5F]">
                      {formatCurrency(z.payout)}
                    </td>

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

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedZig(z)}
                        className="px-3 py-1.5 rounded-lg bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-bold transition-colors inline-flex items-center space-x-1 min-h-[32px] shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C69432]" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Inspection Modal */}
      {selectedZig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-2xl w-full rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] p-5 space-y-4 font-poppins shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-3">
              <div>
                <span className="text-[10px] font-numeric text-[#C69432] font-bold">ZIG ID: {selectedZig.id}</span>
                <h3 className="text-base font-bold text-[#2C221E]">{selectedZig.title}</h3>
              </div>
              <button
                onClick={() => setSelectedZig(null)}
                className="p-1 rounded-lg text-[#665C54] hover:text-[#2C221E] hover:bg-[#F0EBE1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-numeric">
              <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8]">
                <span className="text-[10px] text-[#C69432] font-bold uppercase block">Employer Creator</span>
                <span className="font-bold text-[#2C221E] block mt-0.5">{selectedZig.createdByName}</span>
                <span className="text-[10px] text-[#665C54]">{selectedZig.createdByPhone}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8]">
                <span className="text-[10px] text-[#0F8B5F] font-bold uppercase block">Assigned Worker</span>
                <span className="font-bold text-[#2C221E] block mt-0.5">{selectedZig.assignedToName}</span>
                <span className="text-[10px] text-[#665C54]">{selectedZig.assignedToPhone}</span>
              </div>
            </div>

            <div className="space-y-1 font-numeric">
              <span className="text-[11px] font-semibold text-[#665C54] uppercase block">Location & Description:</span>
              <p className="p-3 rounded-xl bg-[#F8F5EE] border border-[#EBE4D8] text-xs text-[#2C221E] leading-relaxed">
                <strong className="block text-[#C69432] mb-1">📍 {selectedZig.locationName}</strong>
                {selectedZig.description}
              </p>
            </div>

            {/* Proof Photos */}
            <div className="space-y-2 pt-2 border-t border-[#EBE4D8]">
              <span className="text-[11px] font-semibold text-[#665C54] uppercase block flex items-center space-x-1">
                <Camera className="w-3.5 h-3.5 text-[#C69432]" />
                <span>Attendance & Work Completion Photos</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-numeric">
                <div>
                  <span className="text-[10px] text-[#665C54] block mb-1">Check-in Photo:</span>
                  {selectedZig.checkInPhoto ? (
                    <img src={selectedZig.checkInPhoto} alt="Check-in" className="w-full h-40 object-cover rounded-xl border border-[#EBE4D8]" />
                  ) : (
                    <div className="w-full h-40 bg-[#F0EBE1] rounded-xl border border-[#EBE4D8] flex items-center justify-center text-[#8C827A] text-xs">
                      No check-in photo logged
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#665C54] block mb-1">Check-out / Proof Photo:</span>
                  {selectedZig.checkOutPhoto || selectedZig.proofPhotoUrl ? (
                    <img src={selectedZig.checkOutPhoto || selectedZig.proofPhotoUrl} alt="Proof" className="w-full h-40 object-cover rounded-xl border border-[#EBE4D8]" />
                  ) : (
                    <div className="w-full h-40 bg-[#F0EBE1] rounded-xl border border-[#EBE4D8] flex items-center justify-center text-[#8C827A] text-xs">
                      No proof photo logged
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedZig(null)}
                className="px-4 py-2 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-xs font-bold text-white shadow-sm"
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
