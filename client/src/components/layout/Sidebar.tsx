import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  CalendarDays,
  FileText,
  DollarSign,
  Bell,
  Users,
  BarChart3,
  Sparkles,
  LogOut,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/attendance', label: 'Attendance', icon: Clock },
    { to: '/employee/leave', label: 'Leave Requests', icon: CalendarDays },
    { to: '/employee/payroll', label: 'Salary / Payroll', icon: DollarSign },
    { to: '/employee/profile', label: 'My Profile', icon: UserCheck },
    { to: '/employee/notifications', label: 'Notifications', icon: Bell },
  ];

  const hrLinks = [
    { to: '/admin/dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
    { to: '/admin/employees', label: 'Employees', icon: Users },
    { to: '/admin/attendance', label: 'Attendance Log', icon: Clock },
    { to: '/admin/leave', label: 'Leave Approvals', icon: CalendarDays },
    { to: '/admin/payroll', label: 'Payroll Mgmt', icon: DollarSign },
    { to: '/admin/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  ];

  const navLinks = isHR ? hrLinks : employeeLinks;

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30 bg-slate-900 text-slate-300 border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-lg shadow-md">
            D
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">Dayflow</span>
            <span className="block text-[10px] font-medium text-indigo-400 tracking-wider uppercase">HRMS Enterprise</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {isHR ? 'HR Administration' : 'Employee Portal'}
          </div>
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={user?.fullName}
              className="h-9 w-9 rounded-full object-cover border border-slate-700"
            />
            <div className="truncate">
              <span className="block text-xs font-semibold text-white truncate">{user?.fullName}</span>
              <span className="block text-[10px] text-slate-400 truncate">{user?.role} Portal</span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
