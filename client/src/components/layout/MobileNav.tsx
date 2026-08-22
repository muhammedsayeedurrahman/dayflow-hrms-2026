import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Clock,
  CalendarDays,
  DollarSign,
  UserCheck,
  Bell,
  Users,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-slate-900 p-6 text-slate-300 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              D
            </div>
            <span className="text-base font-bold text-white">Dayflow HRMS</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
