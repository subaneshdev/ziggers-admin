import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  Briefcase, 
  FileText, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Download, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { formatCurrency, formatCompactCurrency, formatDate } from '../../lib/utils';

export const OrganizationDetailsScreen: React.FC = () => {
  const { orgId = 'org_001' } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'members' | 'zigs' | 'invoices'>('members');

  const { data: detail, isLoading } = useQuery({
    queryKey: ['orgDetail', orgId],
    queryFn: () => adminApi.fetchOrganizationDetail(orgId),
  });

  if (isLoading || !detail) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-slate-900 rounded-xl" />
        <div className="h-64 bg-slate-900 rounded-2xl" />
      </div>
    );
  }

  const { org, members, postedZigs, invoices } = detail;

  return (
    <div className="space-y-5 font-poppins text-xs text-[#2C221E]">
      {/* Header Bar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/admin/organizations')}
          className="p-2 rounded-xl bg-[#F0EBE1] border border-[#EBE4D8] text-[#2C221E] hover:bg-[#EBE4D8] transition-colors shrink-0"
          title="Back to Organizations"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-[#2C221E] flex items-center space-x-2 truncate">
            <span className="truncate">{org.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C69432]/10 text-[#C69432] font-numeric border border-[#C69432]/30 font-bold uppercase shrink-0">
              {org.tier}
            </span>
          </h2>
          <p className="text-[11px] text-[#665C54] font-numeric mt-0.5 truncate">
            Org ID: {org.orgId} • GSTIN: {org.taxId}
          </p>
        </div>
      </div>

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-numeric">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <span className="text-[11px] text-[#665C54] font-bold uppercase block">Corporate Members</span>
          <div className="text-xl font-extrabold text-[#2C221E] mt-1">{members.length} Users</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <span className="text-[11px] text-[#665C54] font-bold uppercase block">Active Enterprise Zigs</span>
          <div className="text-xl font-extrabold text-[#C69432] mt-1">{postedZigs.length} Posted</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <span className="text-[11px] text-[#665C54] font-bold uppercase block">Cumulative Spend</span>
          <div className="text-xl font-extrabold text-[#0F8B5F] mt-1">{formatCompactCurrency(org.totalSpend)}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
          <span className="text-[11px] text-[#665C54] font-bold uppercase block">Billing Email</span>
          <div className="text-xs font-semibold text-[#2C221E] mt-1 truncate">{org.contactEmail}</div>
        </div>
      </div>

      {/* Detail Sub-Tabs */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4 min-w-0 w-full overflow-hidden">
        <div className="flex items-center space-x-2 border-b border-[#EBE4D8] pb-3 overflow-x-auto no-scrollbar scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {(['members', 'zigs', 'invoices'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border shrink-0 ${
                activeTab === tab
                  ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-sm font-bold'
                  : 'bg-[#F8F5EE] text-[#5C524B] hover:text-[#2C221E] border-[#EBE4D8]'
              }`}
            >
              {tab === 'members' ? `Members Roster (${members.length})` : tab === 'zigs' ? `Posted Zigs (${postedZigs.length})` : `Invoices (${invoices.length})`}
            </button>
          ))}
        </div>

        {/* Members Roster */}
        {activeTab === 'members' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-numeric">
              <thead className="bg-[#F8F5EE] text-[#C69432] uppercase border-b border-[#EBE4D8]">
                <tr>
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8]">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F0EBE1]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#2C221E]">{m.name}</td>
                    <td className="py-3 px-3 text-[#665C54]">{m.email}</td>
                    <td className="py-3 px-3 text-[#C69432] font-semibold">{m.role}</td>
                    <td className="py-3 px-3 text-[#665C54]">{m.joinedAt}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-[#0F8B5F]/15 text-[#0F8B5F] text-[10px] border border-[#0F8B5F]/30 font-bold uppercase">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Posted Enterprise Zigs */}
        {activeTab === 'zigs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-numeric">
              <thead className="bg-[#F8F5EE] text-[#C69432] uppercase border-b border-[#EBE4D8]">
                <tr>
                  <th className="py-2.5 px-3">Zig Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Workers</th>
                  <th className="py-2.5 px-3">Rate / Worker</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8]">
                {postedZigs.map((z) => (
                  <tr key={z.id} className="hover:bg-[#F0EBE1]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#2C221E]">{z.title}</td>
                    <td className="py-3 px-3 text-[#665C54]">{z.category}</td>
                    <td className="py-3 px-3 text-[#C69432] font-semibold">{z.workerCount} Workers</td>
                    <td className="py-3 px-3 text-[#0F8B5F] font-bold">{formatCurrency(z.budgetPerWorker)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-[#2563EB]/15 text-[#2563EB] text-[10px] border border-[#2563EB]/30 font-bold uppercase">
                        {z.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Invoices */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-numeric">
              <thead className="bg-[#F8F5EE] text-[#C69432] uppercase border-b border-[#EBE4D8]">
                <tr>
                  <th className="py-2.5 px-3">Invoice Number</th>
                  <th className="py-2.5 px-3">Billing Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F0EBE1]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#C69432]">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-[#665C54]">{inv.date}</td>
                    <td className="py-3 px-3 text-[#665C54]">{inv.dueDate}</td>
                    <td className="py-3 px-3 font-bold text-[#0F8B5F]">{formatCurrency(inv.amount)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-[#0F8B5F]/15 text-[#0F8B5F] text-[10px] border border-[#0F8B5F]/30 font-bold uppercase">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
