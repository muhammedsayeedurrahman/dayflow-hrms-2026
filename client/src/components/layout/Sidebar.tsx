import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Brain,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onExpandChange }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseEnter = () => {
    setIsExpanded(true);
    onExpandChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    onExpandChange?.(false);
  };

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
    { to: '/admin/payroll', label: 'Payroll', icon: DollarSign },
    { to: '/admin/performance', label: 'Performance', icon: Award },
    { to: '/admin/ai-insights', label: 'AI Insights', icon: Brain },
    { to: '/admin/analytics', label: 'Reports', icon: BarChart3 },
    { to: '/admin/notifications', label: 'Alerts', icon: Bell },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const navLinks = isHR ? hrLinks : employeeLinks;

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        hidden md:flex flex-col fixed inset-y-4 left-4 z-30
        bg-white border border-slate-200 shadow-lg rounded-2xl
        p-3 justify-between overflow-hidden
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-56 shadow-xl shadow-slate-200/80' : 'w-[72px]'}
      `}
      style={{ willChange: 'width' }}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-1 mb-2 min-h-[48px]">
        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow-md shadow-blue-600/25">
          D
        </div>
        {/* Brand name slides in */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${
            isExpanded ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0'
          }`}
        >
          <span className="block text-sm font-extrabold text-slate-900 tracking-tight leading-none">
            Dayflow
          </span>
          <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
            HRMS Platform
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col space-y-1 overflow-y-auto py-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 group relative min-h-[44px] ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active left accent bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-blue-600 rounded-full" />
                  )}

                  {/* Icon — always visible */}
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                    <Icon
                      className={`h-5 w-5 transition-transform duration-200 ${
                        isExpanded ? 'scale-100' : 'group-hover:scale-110'
                      }`}
                    />
                  </span>

                  {/* Label — slides in on expand */}
                  <span
                    className={`overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {link.label}
                  </span>

                  {/* Active chevron */}
                  {isActive && isExpanded && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer — User info + Logout */}
      <div className="pt-3 border-t border-slate-100 space-y-1">
        {/* User avatar strip */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl overflow-hidden">
          <img
            src={
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
            }
            alt={user?.fullName}
            className="flex-shrink-0 h-8 w-8 rounded-full object-cover border border-slate-200"
          />
          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out min-w-0 ${
              isExpanded ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'
            }`}
          >
            <span className="block text-xs font-bold text-slate-800 truncate leading-none">
              {user?.fullName?.split(' ')[0]}
            </span>
            <span className="block text-[10px] text-slate-400 truncate mt-0.5">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center gap-3 w-full px-2 py-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-200 cursor-pointer min-h-[44px]"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8">
            <LogOut className="h-5 w-5" />
          </span>
          <span
            className={`overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'
            }`}
          >
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
