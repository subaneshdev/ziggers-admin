import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AdminLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#2C221E] flex font-poppins overflow-x-hidden relative w-full max-w-full">
      {/* Responsive Left Sidebar & Mobile Drawer */}
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        onCloseMobile={() => setIsMobileOpen(false)}
        collapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 w-full max-w-full overflow-x-hidden ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        } pl-0`}
      >
        <Header onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 overflow-y-auto overflow-x-hidden min-w-0 w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
