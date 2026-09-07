import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  ShieldCheck, 
  RefreshCw, 
  Globe, 
  BarChart3, 
  PieChart as PieIcon, 
  Layers, 
  Zap,
  Power,
  CheckCircle2,
  UserCheck,
  Building2,
  Wallet
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { AnalyticsMetricKey } from '../../types/admin';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

const TABS: { key: AnalyticsMetricKey; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview & KPIs', icon: BarChart3 },
  { key: 'work_categories', label: 'Work Categories', icon: Layers },
  { key: 'worker_demographics', label: 'Demographics', icon: PieIcon },
  { key: 'worker_income', label: 'Income Distribution', icon: DollarSign },
  { key: 'employer_metrics', label: 'Employer Performance', icon: Briefcase },
  { key: 'trust_safety', label: 'Trust & Safety', icon: ShieldCheck },
  { key: 'geographic', label: 'Geographic Hubs', icon: Globe },
  { key: 'growth_trends', label: 'Growth Velocity', icon: TrendingUp },
];

const BRAND_COLORS = ['#C69432', '#2C221E', '#0F8B5F', '#2563EB', '#D97706', '#DC2626'];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsMetricKey>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: snapshot, isLoading } = useQuery({
    queryKey: ['analytics', activeTab],
    queryFn: () => adminApi.fetchAnalytics(activeTab),
    staleTime: 0,
    refetchInterval: 5000,
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await adminApi.triggerAnalyticsRefresh();
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
      success('Analytics Refreshed', 'Snapshot calculation completed.');
    } catch {
      error('Refresh Failed', 'Unable to trigger snapshot calculation.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8]" />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8]" />
    </div>
  );

  return (
    <div className="space-y-6 font-poppins text-xs text-[#2C221E]">
      {/* 8 Analytics Module Sub-Tabs Navigation */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#EBE4D8] -mx-3 px-3 sm:mx-0 sm:px-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border shrink-0 ${
                isActive
                  ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-sm font-bold'
                  : 'bg-[#FFFFFF] text-[#5C524B] hover:text-[#2C221E] border-[#EBE4D8] hover:bg-[#F0EBE1]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C69432]' : 'text-[#8C827A]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Content Panel */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW & AGGREGATE BUSINESS METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Aggregate Business Metrics Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-5 rounded-2xl border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                <div>
                  <h2 className="text-base font-extrabold text-[#2C221E] uppercase tracking-wide">
                    AGGREGATE BUSINESS METRICS
                  </h2>
                  <p className="text-[11px] text-[#665C54] mt-1 font-numeric">
                    Last updated: {snapshot?.updatedAt ? new Date(snapshot.updatedAt).toISOString().replace('T', ' ').slice(0, 26) : '2026-08-15 05:50:35.434582'} (Pre-computed cache)
                  </p>
                </div>

                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-white font-bold text-xs transition-colors border border-[#EBE4D8] shadow-sm self-start sm:self-auto"
                >
                  <Zap className={`w-3.5 h-3.5 fill-current text-[#C69432] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Recalculate</span>
                </button>
              </div>

              {/* Platform Overview 6 Metric Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">Platform Overview</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-numeric">
                  {/* TOTAL ZIGS */}
                  <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex items-start justify-between min-h-[105px]">
                    <div>
                      <span className="text-[11px] font-bold text-[#665C54] uppercase tracking-wider block">
                        TOTAL ZIGS
                      </span>
                      <div className="text-2xl font-black text-[#2C221E] mt-2">
                        {snapshot?.metricValue?.total_zigs ?? 0}
                      </div>
                      <div className="text-[10px] text-[#665C54] mt-1 font-medium whitespace-nowrap">
                        Today: {snapshot?.metricValue?.today_zigs ?? 0} | Week: {snapshot?.metricValue?.week_zigs ?? 0}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] shrink-0">
                      <Power className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* ACTIVE ZIGS */}
                  <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex items-start justify-between min-h-[105px]">
                    <div>
                      <span className="text-[11px] font-bold text-[#665C54] uppercase tracking-wider block">
                        ACTIVE ZIGS
                      </span>
                      <div className="text-2xl font-black text-[#2C221E] mt-2">
                        {snapshot?.metricValue?.active_zigs ?? snapshot?.metricValue?.activeZigs ?? 0}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
                      <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* COMPLETED */}
                  <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex items-start justify-between min-h-[105px]">
                    <div>
                      <span className="text-[11px] font-bold text-[#665C54] uppercase tracking-wider block">
                        COMPLETED
                      </span>
                      <div className="text-2xl font-black text-[#2C221E] mt-2">
                        {snapshot?.metricValue?.completed_zigs ?? snapshot?.metricValue?.completedZigs ?? 0}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* REGISTERED USERS */}
                  <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex items-start justify-between min-h-[105px]">
                    <div>
                      <span className="text-[11px] font-bold text-[#665C54] uppercase tracking-wider block">
                        REGISTERED USERS
                      </span>
                      <div className="text-2xl font-black text-[#2C221E] mt-2">
                        {snapshot?.metricValue?.totalUsers ?? snapshot?.metricValue?.registered_users ?? 0}
                      </div>
                      <div className="text-[10px] text-[#0F8B5F] mt-1 font-semibold flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B5F] animate-pulse mr-1" />
                        Live Supabase Profiles
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#CCFBF1] flex items-center justify-center text-[#0D9488] shrink-0">
                      <Users className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* GMV (GROSS VOLUME) */}
                  <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex items-start justify-between min-h-[105px]">
                    <div>
                      <span className="text-[11px] font-bold text-[#665C54] uppercase tracking-wider block">
                        GMV (GROSS VOLUME)
                      </span>
                      <div className="text-2xl font-black text-[#2C221E] mt-2">
                        {formatCurrency(snapshot?.metricValue?.total_gmv ?? snapshot?.metricValue?.gmv ?? 0)}
                      </div>
                      <div className="text-[10px] text-[#665C54] mt-1 font-medium whitespace-nowrap">
                        Revenue: {formatCurrency(snapshot?.metricValue?.platform_revenue ?? snapshot?.metricValue?.totalRevenue ?? 0)}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#FCE7F3] flex items-center justify-center text-[#DB2777] shrink-0 font-extrabold text-base">
                      ₹
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Categories Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">Work Categories Breakdown</h3>

                <div className="space-y-3">
                  {(snapshot?.metricValue?.work_categories || []).map((cat: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-numeric">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-extrabold text-[#2C221E]">{cat.name || cat.category || 'General Support'}</h4>
                        <p className="text-[11px] font-medium text-[#8C827A]">Avg Pay: {formatCurrency(cat.avgPay || 0)}</p>
                      </div>

                      <div className="flex-1 max-w-md space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#2C221E]">
                          <span>Comp: {cat.completionRate || 0}%</span>
                          <span>{cat.count || 0} Zigs</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#EBE4D8] overflow-hidden">
                          <div
                            className="h-full bg-[#16A34A] rounded-full transition-all duration-500"
                            style={{ width: `${cat.completionRate || 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] font-bold text-[11px] self-start sm:self-auto shrink-0">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{cat.trend || '+0'}</span>
                      </div>
                    </div>
                  ))}
                  {(!snapshot?.metricValue?.work_categories || snapshot?.metricValue?.work_categories.length === 0) && (
                    <p className="text-xs text-[#665C54] py-4 text-center">No work categories posted yet.</p>
                  )}
                </div>
              </div>

              {/* User Demographics & Profiles */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">User Distribution & Demographics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-numeric">
                  {/* User Distribution */}
                  <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#2C221E]">User Classification</h4>
                      <p className="text-[11px] text-[#665C54] mt-0.5 font-medium">
                        Total Registered: {snapshot?.metricValue?.totalUsers ?? 0}
                      </p>
                    </div>

                    <div className="divide-y divide-[#EBE4D8] border-t border-[#EBE4D8] pt-1">
                      {(snapshot?.metricValue?.age_distribution?.items || []).map((item: any, i: number) => (
                        <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#2C221E]">{item.label}</span>
                          <span className="font-bold text-[#665C54]">{item.count}</span>
                        </div>
                      ))}
                      {(!snapshot?.metricValue?.age_distribution?.items || snapshot?.metricValue?.age_distribution?.items.length === 0) && (
                        <p className="text-xs text-[#665C54] py-2">No user data available</p>
                      )}
                    </div>
                  </div>

                  {/* Roles & Breakdown */}
                  <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                    <h4 className="text-sm font-bold text-[#2C221E]">Roles & Profiles</h4>

                    <div className="divide-y divide-[#EBE4D8] border-t border-[#EBE4D8] pt-1">
                      {(snapshot?.metricValue?.occupations_and_gender || []).map((item: any, i: number) => (
                        <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#2C221E]">{item.label}</span>
                          <span className="font-bold text-[#2C221E]">{item.count}</span>
                        </div>
                      ))}
                      {(!snapshot?.metricValue?.occupations_and_gender || snapshot?.metricValue?.occupations_and_gender.length === 0) && (
                        <p className="text-xs text-[#665C54] py-2">No role data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Worker Income Metrics */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">Worker Income Metrics</h3>

                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                    <Wallet className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#665C54] block">Average Weekly Income</span>
                    <span className="text-2xl font-black text-[#16A34A] font-numeric mt-0.5 block">
                      {formatCurrency(snapshot?.metricValue?.average_weekly_income ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* GMV Growth Area Chart */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2C221E]">
                    Gross Merchandise Value & Revenue Trajectory (₹)
                  </h3>
                  <span className="text-[11px] font-numeric text-[#C69432] font-semibold bg-[#F0EBE1] px-2.5 py-1 rounded-lg border border-[#EBE4D8]">
                    Monthly GMV Audit
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={snapshot?.metricValue?.gmv_history ?? snapshot?.metricValue?.gmvHistory ?? []}>
                      <defs>
                        <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C69432" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#C69432" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2C221E" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#2C221E" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EBE4D8" />
                      <XAxis dataKey="month" stroke="#665C54" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#665C54" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EBE4D8', borderRadius: '12px', color: '#2C221E' }} />
                      <Area type="monotone" dataKey="gmv" stroke="#C69432" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGmv)" name="GMV (₹)" />
                      <Area type="monotone" dataKey="revenue" stroke="#2C221E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORK CATEGORIES */}
          {activeTab === 'work_categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">Category Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={snapshot?.metricValue?.work_categories || snapshot?.metricValue?.categories || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {(snapshot?.metricValue?.work_categories || snapshot?.metricValue?.categories || []).map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EBE4D8', borderRadius: '12px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">Category Volume Data</h3>
                <div className="divide-y divide-[#EBE4D8]">
                  {(snapshot?.metricValue?.work_categories || snapshot?.metricValue?.categories || []).map((cat: any, i: number) => (
                    <div key={i} className="py-2.5 flex items-center justify-between font-numeric">
                      <span className="font-semibold text-[#2C221E]">{cat.name || cat.category}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#C69432]">{cat.count || cat.totalZigs} Zigs</span>
                        <span className="text-[10px] text-[#665C54] ml-2">Avg ₹{cat.avgPay || 0}</span>
                      </div>
                    </div>
                  ))}
                  {(snapshot?.metricValue?.work_categories || snapshot?.metricValue?.categories || []).length === 0 && (
                    <p className="text-xs text-[#665C54] py-4 text-center">No work categories data in database yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKER DEMOGRAPHICS */}
          {activeTab === 'worker_demographics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Role Distribution Pie Chart */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">User Role Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={snapshot?.metricValue?.genderSplit || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {(snapshot?.metricValue?.genderSplit || []).map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EBE4D8', borderRadius: '12px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Breakdown Table */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">User Breakdown</h3>
                <div className="divide-y divide-[#EBE4D8]">
                  {(snapshot?.metricValue?.ageDistribution || []).map((item: any, i: number) => (
                    <div key={i} className="py-3 flex items-center justify-between font-numeric">
                      <span className="font-semibold text-[#2C221E]">{item.group}</span>
                      <span className="text-sm font-bold text-[#C69432]">{item.percentage}</span>
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-[#EBE4D8] border-t border-[#EBE4D8] pt-2 mt-2">
                  <h4 className="text-xs font-bold text-[#665C54] uppercase mb-1">Profile Completion</h4>
                  {(snapshot?.metricValue?.occupationStatus || []).map((item: any, i: number) => (
                    <div key={i} className="py-2.5 flex items-center justify-between font-numeric">
                      <span className="font-medium text-[#2C221E] text-xs">{item.label}</span>
                      <span className="text-xs font-bold text-[#2C221E]">{item.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORKER INCOME */}
          {activeTab === 'worker_income' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                  <span className="text-[11px] font-bold text-[#665C54] uppercase block">Total GMV (Completed)</span>
                  <span className="text-2xl font-black text-[#2C221E] font-numeric mt-2 block">{formatCurrency(snapshot?.metricValue?.total_gmv ?? 0)}</span>
                  <span className="text-[10px] text-[#665C54] mt-1 block">Sum of all completed task payouts</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                  <span className="text-[11px] font-bold text-[#665C54] uppercase block">Platform Revenue (7.5%)</span>
                  <span className="text-2xl font-black text-[#0F8B5F] font-numeric mt-2 block">{formatCurrency(snapshot?.metricValue?.platform_revenue ?? 0)}</span>
                  <span className="text-[10px] text-[#665C54] mt-1 block">Commission from completed Zigs</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                  <span className="text-[11px] font-bold text-[#665C54] uppercase block">Avg Weekly Income</span>
                  <span className="text-2xl font-black text-[#C69432] font-numeric mt-2 block">{formatCurrency(snapshot?.metricValue?.average_weekly_income ?? 0)}</span>
                  <span className="text-[10px] text-[#665C54] mt-1 block">Per worker average</span>
                </div>
              </div>
              {/* GMV Monthly Chart */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">Monthly GMV & Revenue</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={snapshot?.metricValue?.gmv_history ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EBE4D8" />
                      <XAxis dataKey="month" stroke="#665C54" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#665C54" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EBE4D8', borderRadius: '12px' }} />
                      <Bar dataKey="gmv" fill="#C69432" radius={[6, 6, 0, 0]} name="GMV (₹)" />
                      <Bar dataKey="revenue" fill="#2C221E" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EMPLOYER PERFORMANCE */}
          {activeTab === 'employer_metrics' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                  <span className="text-[11px] font-bold text-[#665C54] uppercase block">Total Employers</span>
                  <span className="text-2xl font-black text-[#2C221E] font-numeric mt-2 block">{snapshot?.metricValue?.totalEmployers ?? 0}</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                  <span className="text-[11px] font-bold text-[#665C54] uppercase block">Total Zigs Posted</span>
                  <span className="text-2xl font-black text-[#2C221E] font-numeric mt-2 block">{snapshot?.metricValue?.total_zigs ?? 0}</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                  <span className="text-[11px] font-bold text-[#665C54] uppercase block">Fulfillment Rate</span>
                  <span className="text-2xl font-black text-[#0F8B5F] font-numeric mt-2 block">{snapshot?.metricValue?.fulfillmentRate ?? 0}%</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">Task Status Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'Completed', value: snapshot?.metricValue?.completedZigs ?? 0 },
                        { name: 'Active', value: snapshot?.metricValue?.activeZigs ?? 0 },
                        { name: 'Cancelled', value: snapshot?.metricValue?.cancelled_zigs ?? 0 },
                      ].filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {[0, 1, 2].map((index) => (
                          <Cell key={`cell-${index}`} fill={['#0F8B5F', '#D97706', '#DC2626'][index]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EBE4D8', borderRadius: '12px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TRUST & SAFETY */}
          {activeTab === 'trust_safety' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                  <span className="text-[11px] font-bold text-[#665C54] uppercase block">Open Disputes</span>
                  <span className="text-2xl font-black text-[#DC2626] font-numeric mt-2 block">{snapshot?.metricValue?.openDisputes ?? 0}</span>
                  <span className="text-[10px] text-[#665C54] mt-1 block">Pending + Investigating</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                  <span className="text-[11px] font-bold text-[#665C54] uppercase block">Total Users</span>
                  <span className="text-2xl font-black text-[#2C221E] font-numeric mt-2 block">{snapshot?.metricValue?.totalUsers ?? 0}</span>
                  <span className="text-[10px] text-[#665C54] mt-1 block">All registered profiles</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                  <span className="text-[11px] font-bold text-[#665C54] uppercase block">Fulfillment Rate</span>
                  <span className="text-2xl font-black text-[#0F8B5F] font-numeric mt-2 block">{snapshot?.metricValue?.fulfillmentRate ?? 0}%</span>
                  <span className="text-[10px] text-[#665C54] mt-1 block">Completed / Total Zigs</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                <h3 className="text-sm font-bold text-[#2C221E] mb-3">Platform Health</h3>
                <div className="divide-y divide-[#EBE4D8] font-numeric">
                  <div className="py-3 flex justify-between"><span className="text-xs text-[#665C54]">Workers Registered</span><span className="text-xs font-bold text-[#2C221E]">{snapshot?.metricValue?.totalWorkers ?? 0}</span></div>
                  <div className="py-3 flex justify-between"><span className="text-xs text-[#665C54]">Employers Registered</span><span className="text-xs font-bold text-[#2C221E]">{snapshot?.metricValue?.totalEmployers ?? 0}</span></div>
                  <div className="py-3 flex justify-between"><span className="text-xs text-[#665C54]">Completed Zigs</span><span className="text-xs font-bold text-[#0F8B5F]">{snapshot?.metricValue?.completedZigs ?? 0}</span></div>
                  <div className="py-3 flex justify-between"><span className="text-xs text-[#665C54]">Active Zigs</span><span className="text-xs font-bold text-[#D97706]">{snapshot?.metricValue?.activeZigs ?? 0}</span></div>
                  <div className="py-3 flex justify-between"><span className="text-xs text-[#665C54]">Cancelled Zigs</span><span className="text-xs font-bold text-[#DC2626]">{snapshot?.metricValue?.cancelled_zigs ?? 0}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: GEOGRAPHIC HUBS */}
          {activeTab === 'geographic' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">Task Locations (from tasks.location_name)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Array.isArray(snapshot?.metricValue) ? snapshot.metricValue : []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EBE4D8" />
                      <XAxis dataKey="city" stroke="#665C54" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                      <YAxis stroke="#665C54" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EBE4D8', borderRadius: '12px' }} />
                      <Bar dataKey="activeZigs" fill="#C69432" radius={[6, 6, 0, 0]} name="Zigs at Location" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                <h3 className="text-sm font-bold text-[#2C221E] mb-3">Location Directory</h3>
                <div className="divide-y divide-[#EBE4D8] font-numeric max-h-80 overflow-y-auto">
                  {(Array.isArray(snapshot?.metricValue) ? snapshot.metricValue : []).map((loc: any, i: number) => (
                    <div key={i} className="py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-[#2C221E] text-xs truncate max-w-[60%]">{loc.city}</span>
                      <span className="text-xs font-bold text-[#C69432]">{loc.activeZigs} Zigs</span>
                    </div>
                  ))}
                  {(Array.isArray(snapshot?.metricValue) ? snapshot.metricValue : []).length === 0 && (
                    <p className="text-xs text-[#665C54] py-4 text-center">No location data in tasks table yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: GROWTH VELOCITY */}
          {activeTab === 'growth_trends' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)] space-y-3">
                <h3 className="text-sm font-bold text-[#2C221E]">Daily User Signups (Last 30 Days)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={Array.isArray(snapshot?.metricValue) ? snapshot.metricValue : []}>
                      <defs>
                        <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C69432" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#C69432" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EBE4D8" />
                      <XAxis dataKey="month" stroke="#665C54" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                      <YAxis stroke="#665C54" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EBE4D8', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="userSignups" stroke="#C69432" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSignups)" name="New Signups" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-[0_4px_20px_rgba(44,34,30,0.03)]">
                <h3 className="text-sm font-bold text-[#2C221E] mb-3">Signup Log</h3>
                <div className="divide-y divide-[#EBE4D8] font-numeric max-h-80 overflow-y-auto">
                  {(Array.isArray(snapshot?.metricValue) ? snapshot.metricValue : []).map((day: any, i: number) => (
                    <div key={i} className="py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-[#2C221E] text-xs">{day.month}</span>
                      <span className="text-xs font-bold text-[#0F8B5F]">+{day.userSignups} users</span>
                    </div>
                  ))}
                  {(Array.isArray(snapshot?.metricValue) ? snapshot.metricValue : []).length === 0 && (
                    <p className="text-xs text-[#665C54] py-4 text-center">No signups in the last 30 days.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
