import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const location = useLocation();

  // Render topbar header only on dashboard pages
  const isDashboardPage =
    location.pathname === '/admin/dashboard' ||
    location.pathname === '/employee/dashboard' ||
    location.pathname === '/admin' ||
    location.pathname === '/employee';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex relative overflow-hidden">
      {/* Liquid Background Blobs */}
      <div className="liquid-bg-blob -top-40 -left-40" />
      <div className="liquid-bg-blob-2 -bottom-20 -right-20" />

      {/* Desktop Sidebar — passes expand state up */}
      <Sidebar onExpandChange={setSidebarExpanded} />

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area — shifts right when sidebar expands */}
      <div
        className={`
          flex-1 flex flex-col min-w-0
          transition-all duration-300 ease-in-out
          ${sidebarExpanded ? 'md:pl-64' : 'md:pl-28'}
        `}
      >
        {isDashboardPage ? (
          <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        ) : (
          <div className="md:hidden p-4 pb-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-200/60 rounded-xl"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
