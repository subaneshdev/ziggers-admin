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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/admin/organizations')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>{org.name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
              {org.tier}
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Org ID: {org.orgId} • GSTIN: {org.taxId}
          </p>
        </div>
      </div>

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Corporate Members</span>
          <div className="text-xl font-black font-mono text-slate-100 mt-1">{members.length} Users</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Active Enterprise Zigs</span>
          <div className="text-xl font-black font-mono text-indigo-400 mt-1">{postedZigs.length} Posted</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Cumulative Spend</span>
          <div className="text-xl font-black font-mono text-emerald-400 mt-1">{formatCompactCurrency(org.totalSpend)}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Billing Email</span>
          <div className="text-xs font-semibold text-slate-200 mt-1 truncate">{org.contactEmail}</div>
        </div>
      </div>

      {/* Detail Sub-Tabs */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          {(['members', 'zigs', 'invoices'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab === 'members' ? `Members Roster (${members.length})` : tab === 'zigs' ? `Posted Zigs (${postedZigs.length})` : `Invoices (${invoices.length})`}
            </button>
          ))}
        </div>

        {/* Members Roster */}
        {activeTab === 'members' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-200">{m.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{m.email}</td>
                    <td className="py-3 px-3 font-mono text-indigo-400 font-semibold">{m.role}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{m.joinedAt}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
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
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Zig Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Workers</th>
                  <th className="py-2.5 px-3">Rate / Worker</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {postedZigs.map((z) => (
                  <tr key={z.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-200">{z.title}</td>
                    <td className="py-3 px-3 text-slate-400">{z.category}</td>
                    <td className="py-3 px-3 font-mono text-indigo-300">{z.workerCount} Workers</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">{formatCurrency(z.budgetPerWorker)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px] border border-sky-500/20">
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
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Invoice Number</th>
                  <th className="py-2.5 px-3">Billing Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{inv.date}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{inv.dueDate}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">{formatCurrency(inv.amount)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
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
