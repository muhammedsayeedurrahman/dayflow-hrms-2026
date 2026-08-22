import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  Award,
  BarChart3,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/attendance', label: 'Attendance', icon: Clock },
    { to: '/employee/leave', label: 'Leave', icon: CalendarDays },
    { to: '/employee/payroll', label: 'Payroll', icon: DollarSign },
    { to: '/employee/profile', label: 'Profile', icon: Users },
    { to: '/employee/notifications', label: 'Alerts', icon: Bell },
    { to: '/employee/settings', label: 'Settings', icon: Settings },
  ];

  const hrLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/employees', label: 'Employees', icon: Users },
    { to: '/admin/attendance', label: 'Attendance', icon: Clock },
    { to: '/admin/leave', label: 'Leave', icon: CalendarDays },
    { to: '/admin/payroll', label: 'Payroll Mgmt', icon: DollarSign },
    { to: '/admin/performance', label: 'Performance', icon: Award },
    { to: '/admin/analytics', label: 'Reports', icon: BarChart3 },
    { to: '/admin/notifications', label: 'Alerts', icon: Bell },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const navLinks = isHR ? hrLinks : employeeLinks;

  return (
    <aside className="hidden md:flex w-20 flex-col fixed inset-y-4 left-4 z-30 bg-white border border-slate-200 shadow-lg rounded-2xl p-3 items-center justify-between">
      {/* Brand Header */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xl shadow-md shadow-blue-600/25">
        D
      </div>

      {/* Navigation Icons Group */}
      <nav className="flex-1 flex flex-col space-y-2 mt-8 w-full items-center overflow-y-auto py-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              title={link.label}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-300 w-12 h-12 group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              {/* Tooltip */}
              <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-50">
                {link.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Settings & Logout */}
      <div className="flex flex-col items-center space-y-3 pt-3 border-t border-slate-100 w-full">
        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center justify-center w-12 h-12 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
