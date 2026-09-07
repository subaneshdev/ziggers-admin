import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  RefreshCw, 
  Bell, 
  Shield, 
  Clock, 
  CheckCircle2, 
  Briefcase, 
  Phone, 
  MapPin, 
  User, 
  X,
  Menu
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { PostedZigRecord } from '../../types/admin';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useToast } from '../ui/Toast';

interface HeaderProps {
  onRefreshData?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRefreshData, onToggleMobileSidebar }) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Fetch live zigs list for notifications drawer
  const { data: zigs = [] } = useQuery({
    queryKey: ['postedZigsList'],
    queryFn: () => adminApi.fetchPostedZigsList(),
    refetchInterval: 15000, // auto refetch every 15s for live updates
  });

  // Mutation to mark task as completed directly from notifications
  const completeMutation = useMutation({
    mutationFn: (taskId: string) => adminApi.completeTaskZig(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['postedZigsList'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      success('Zig Work Completed', `Task ${taskId.slice(0, 8)} marked as COMPLETED and payment status updated.`);
      if (onRefreshData) onRefreshData();
    },
    onError: (err: any) => {
      error('Completion Failed', err.message || 'Could not complete task.');
    },
  });

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/admin/dashboard')) return 'Analytics Dashboard';
    if (pathname.includes('/admin/zigs')) return 'Posted Zigs Directory';
    if (pathname.includes('/admin/kyc/queue')) return 'KYC Verification Queue';
    if (pathname.includes('/admin/kyc/')) return 'KYC Adjudication';
    if (pathname.includes('/admin/disputes')) return 'Escrow Dispute Engine';
    if (pathname.includes('/admin/fraud-alerts')) return 'Fraud Risk Monitoring';
    if (pathname.includes('/admin/trust-score')) return 'Trust Score Manager';
    if (pathname.includes('/admin/organizations/')) return 'Organization Details';
    if (pathname.includes('/admin/organizations')) return 'B2B Accounts';
    if (pathname.includes('/admin/referrals')) return 'Referral Growth Ledger';
    if (pathname.includes('/admin/tickets')) return 'Support Tickets';
    return 'Ziggers Console';
  };

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    try {
      await adminApi.triggerAnalyticsRefresh();
      await queryClient.invalidateQueries({ queryKey: ['postedZigsList'] });
      success('Analytics Refresh Triggered', 'Hourly snapshot recalculation completed across all modules.');
      if (onRefreshData) onRefreshData();
    } catch {
      error('Refresh Failed', 'Unable to reach AdminAnalyticsScheduler service.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const activeZigs = zigs.filter(z => z.status !== 'COMPLETED' && z.status !== 'CANCELLED' && z.status !== 'EXPIRED');

  return (
    <header className="h-16 px-3 sm:px-6 bg-[#FFFFFF] border-b border-[#EBE4D8] shadow-[0_2px_15px_rgba(44,34,30,0.03)] flex items-center justify-between sticky top-0 z-30 font-poppins">
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] border border-[#EBE4D8] transition-colors focus:outline-none shrink-0"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5 text-[#2C221E]" />
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-[#F0EBE1] text-[#2C221E] border border-[#EBE4D8] shrink-0">
            <Shield className="w-4 h-4 sm:w-5 h-5 text-[#C69432]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-[#2C221E] tracking-tight truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
              {getPageTitle(location.pathname)}
            </h1>
            <div className="hidden sm:flex items-center space-x-2 text-[11px] text-[#665C54]">
              <span className="font-medium">Ziggers Ops</span>
              <span>/</span>
              <span className="font-numeric font-semibold text-[#C69432] truncate max-w-[180px]">{location.pathname}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 relative shrink-0">
        {/* Quick Search - hidden on mobile (< md) */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search User ID, Zig #, Org..."
            className="w-44 lg:w-64 bg-[#F0EBE1] border border-[#EBE4D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2C221E] placeholder-[#8C827A] focus:outline-none focus:border-[#C69432] transition-all font-numeric"
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleGlobalRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-bold transition-all disabled:opacity-50 min-h-[38px] shadow-sm"
          title="Trigger manual analytics snapshot computation"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C69432] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Computing...' : 'Refresh Snapshots'}</span>
          <span className="sm:hidden">{isRefreshing ? '...' : 'Refresh'}</span>
        </button>

        {/* Live System Time indicator - hidden on < xl */}
        <div className="hidden xl:flex px-3 py-1.5 rounded-xl bg-[#F0EBE1] border border-[#EBE4D8] items-center space-x-2 text-[11px] font-numeric text-[#2C221E]">
          <Clock className="w-3.5 h-3.5 text-[#0F8B5F]" />
          <span className="font-bold">UTC {new Date().toISOString().substring(11, 19)}</span>
        </div>

        {/* Notifications Bell Button */}
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`relative p-2 rounded-xl border transition-colors ${
            isNotificationsOpen
              ? 'bg-[#2C221E] text-white border-[#2C221E]'
              : 'bg-[#F0EBE1] hover:bg-[#EBE4D8] text-[#2C221E] border-[#EBE4D8]'
          }`}
          title="Live Zigs & Worker Activity Notifications"
        >
          <Bell className="w-4 h-4 text-[#C69432]" />
          {activeZigs.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] bg-[#DC2626] text-white font-bold rounded-full font-numeric border border-white">
              {activeZigs.length}
            </span>
          )}
        </button>

        {/* Real-time Notifications & Live Zigs Drawer Popover - Viewport safe */}
        {isNotificationsOpen && (
          <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-14 w-[calc(100vw-1rem)] sm:w-96 max-w-sm rounded-2xl bg-[#FFFFFF] border border-[#EBE4D8] shadow-2xl p-4 space-y-3 z-50 text-xs font-poppins">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-2.5">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-[#C69432]" />
                <h3 className="font-bold text-[#2C221E]">Live Zigs Notifications</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-[#C69432]/10 text-[#C69432] font-numeric font-bold text-[10px]">
                  {activeZigs.length} Active
                </span>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1 rounded-lg text-[#665C54] hover:text-[#2C221E] hover:bg-[#F0EBE1]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Zigs List */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {zigs.length === 0 ? (
                <div className="p-6 text-center text-[#665C54]">
                  <p>No active Zigs posted.</p>
                </div>
              ) : (
                zigs.slice(0, 8).map((zig) => {
                  const isCompleted = zig.status === 'COMPLETED';

                  return (
                    <div
                      key={zig.id}
                      className={`p-3 rounded-xl border space-y-2 transition-colors ${
                        isCompleted
                          ? 'bg-[#F8F5EE] border-[#EBE4D8] opacity-75'
                          : 'bg-[#FFFFFF] border-[#EBE4D8] shadow-sm hover:border-[#C69432]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-[#2C221E] line-clamp-1">{zig.title}</h4>
                          <span className="text-[10px] text-[#C69432] font-numeric uppercase font-semibold">
                            {zig.category} • {formatCurrency(zig.payout)}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-numeric font-bold uppercase border ${
                            isCompleted
                              ? 'bg-[#0F8B5F]/15 text-[#0F8B5F] border-[#0F8B5F]/30'
                              : zig.status === 'IN_PROGRESS' || zig.status === 'ASSIGNED'
                              ? 'bg-[#C69432]/15 text-[#C69432] border-[#C69432]/30'
                              : 'bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30'
                          }`}
                        >
                          {zig.status}
                        </span>
                      </div>

                      {/* Details & Assigned Worker */}
                      <div className="space-y-1 text-[11px] font-numeric text-[#5C524B] bg-[#F8F5EE] p-2 rounded-lg border border-[#EBE4D8]">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-[#0F8B5F]" />
                            <strong>Worker:</strong> {zig.assignedToName}
                          </span>
                          {zig.assignedToPhone && (
                            <span className="flex items-center space-x-1 text-[#665C54]">
                              <Phone className="w-3 h-3 text-[#C69432]" />
                              <span>{zig.assignedToPhone}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 text-[#665C54] truncate">
                          <MapPin className="w-3 h-3 text-[#C69432] shrink-0" />
                          <span className="truncate">{zig.locationName}</span>
                        </div>
                      </div>

                      {/* Action Button: Done / Mark Completed */}
                      <div className="flex items-center justify-between pt-1 font-numeric">
                        <span className="text-[10px] text-[#8C827A]">
                          Posted: {formatDate(zig.createdAt)}
                        </span>

                        {!isCompleted ? (
                          <button
                            disabled={completeMutation.isPending}
                            onClick={() => completeMutation.mutate(zig.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#0F8B5F] hover:bg-[#0C6F4C] text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-sm min-h-[32px]"
                            title="Mark this Zig task as Finished/Completed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done / Finish Work</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[11px] text-[#0F8B5F] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Work Completed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
