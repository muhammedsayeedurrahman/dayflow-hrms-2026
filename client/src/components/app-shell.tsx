import React, { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Topbar } from './layout/Topbar';
import { MobileNav } from './layout/MobileNav';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex w-full relative overflow-hidden">
      {/* Liquid Background Blobs */}
      <div className="liquid-bg-blob -top-40 -left-40" />
      <div className="liquid-bg-blob-2 -bottom-20 -right-20" />
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-28 min-w-0">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};
export default AppShell;
