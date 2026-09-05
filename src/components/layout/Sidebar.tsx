import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase,
  ShieldCheck, 
  Scale, 
  ShieldAlert, 
  Award, 
  Building2, 
  Share2,
  MessageSquare,
  ChevronLeft, 
  ChevronRight, 
  LogOut
} from 'lucide-react';
import { authClient } from '../../lib/authClient';
import { useToast } from '../ui/Toast';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { info } = useToast();
  const user = authClient.getUser();

  const handleLogout = () => {
    authClient.clearAuth();
    info('Logged Out', 'You have been securely signed out of Ziggers Admin Console.');
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Analytics Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: '8 Tabs',
      badgeColor: 'bg-[#C69432]/10 text-[#C69432] border-[#C69432]/30',
    },
    {
      name: 'Posted Zigs & Tasks',
      path: '/admin/zigs',
      icon: Briefcase,
      badge: 'Live Tasks',
      badgeColor: 'bg-[#C69432]/10 text-[#C69432] border-[#C69432]/30',
    },
    {
      name: 'Verification Queue',
      path: '/admin/kyc/queue',
      icon: ShieldCheck,
      badge: '5 Pending',
      badgeColor: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30',
    },
    {
      name: 'Dispute Resolution',
      path: '/admin/disputes',
      icon: Scale,
      badge: '2 Open',
      badgeColor: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30',
    },
    {
      name: 'Fraud & Risk Monitoring',
      path: '/admin/fraud-alerts',
      icon: ShieldAlert,
      badge: '3 Risk',
      badgeColor: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30',
    },
    {
      name: 'Trust Score & Fines',
      path: '/admin/trust-score',
      icon: Award,
      badge: 'Rules',
      badgeColor: 'bg-[#0F8B5F]/10 text-[#0F8B5F] border-[#0F8B5F]/30',
    },
    {
      name: 'B2B Enterprise Accounts',
      path: '/admin/organizations',
      icon: Building2,
      badge: '3 Orgs',
      badgeColor: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30',
    },
    {
      name: 'Referrals & Growth',
      path: '/admin/referrals',
      icon: Share2,
      badge: 'Ledger',
      badgeColor: 'bg-[#C69432]/10 text-[#C69432] border-[#C69432]/30',
    },
    {
      name: 'Support & Escalations',
      path: '/admin/tickets',
      icon: MessageSquare,
      badge: 'Tickets',
      badgeColor: 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30',
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#FFFFFF] border-r border-[#EBE4D8] flex flex-col transition-all duration-300 ease-in-out font-poppins shadow-[2px_0_15px_rgba(44,34,30,0.02)] ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header (Official Ziggers Logo Style) */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#EBE4D8]">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-[#2C221E] flex items-center justify-center shadow-md shrink-0">
            <span className="text-white font-extrabold text-lg tracking-tighter">Z</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-[#2C221E]">
                Ziggers
              </span>
              <span className="text-[10px] uppercase font-numeric font-bold tracking-widest text-[#C69432]">
                Admin Console
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#2C221E] hover:bg-[#F0EBE1] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#8C827A]">
            Operations Desk
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-xl text-xs transition-all group relative min-h-[44px] ${
                  isActive
                    ? 'bg-[#2C221E] text-white font-bold shadow-md'
                    : 'text-[#5C524B] hover:text-[#2C221E] hover:bg-[#F0EBE1]'
                }`
              }
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#C69432]' : 'text-[#8C827A] group-hover:text-[#2C221E]'
                }`}
              />
              {!collapsed && (
                <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-numeric border ${item.badgeColor} ml-2 shrink-0 ${
                        isActive ? 'bg-white/10 text-[#C69432] border-white/20' : ''
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#2C221E] text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Backend & Environment Health Badge */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-[#F0EBE1] border border-[#EBE4D8]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5C524B] font-medium">System Core Engine</span>
            <span className="flex items-center text-[#0F8B5F] font-numeric text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B5F] animate-ping mr-1.5" />
              Active
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#5C524B]">
            <span>Authority Level</span>
            <span className="font-numeric text-[#C69432] bg-white px-1.5 py-0.5 rounded border border-[#EBE4D8] font-bold">
              ROLE_ADMIN
            </span>
          </div>
        </div>
      )}

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#EBE4D8] bg-[#F8F5EE] flex items-center justify-between">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-[#2C221E] text-white font-bold flex items-center justify-center shrink-0 text-xs">
            {user?.name?.[0] || 'A'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#2C221E] truncate">{user?.name || 'Ops Supervisor'}</span>
              <span className="text-[10px] text-[#665C54] truncate">{user?.email || 'admin@ziggers.com'}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-[#665C54] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
