import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, CheckCircle2, ShieldCheck, Sparkles, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHRMSStore } from '../../store/hrmsStore';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginAsDemoEmployee, loginAsDemoHR, logout } = useAuthStore();
  const { notifications, attendance, markNotificationAsRead } = useHRMSStore();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Refs for outside-click detection
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
          ' • ' +
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const userNotifs = notifications.filter(
    (n) => n.userId === user?.employeeId || n.userId === user?.id || n.userId === 'ALL'
  );
  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find((a) => a.employeeId === user?.employeeId && a.date === today);
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  // Memoized page title to avoid recalculating on every render
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/employee/dashboard')) return 'Employee Dashboard';
    if (path.includes('/employee/attendance')) return 'Attendance & Time Tracker';
    if (path.includes('/employee/leave')) return 'Leave & Time-Off Requests';
    if (path.includes('/employee/payroll')) return 'Salary & Payslips';
    if (path.includes('/employee/profile')) return 'My Employee Profile';
    if (path.includes('/employee/notifications')) return 'Notification Center';

    if (path.includes('/admin/dashboard')) return 'HR Executive Dashboard';
    if (path.includes('/admin/employees')) return 'Employee Directory & Records';
    if (path.includes('/admin/attendance')) return 'Company Attendance Matrix';
    if (path.includes('/admin/leave')) return 'Leave Approval Portal';
    if (path.includes('/admin/payroll')) return 'Enterprise Payroll Management';
    if (path.includes('/admin/analytics')) return 'HR Analytics & Reports';
    if (path.includes('/admin/notifications')) return 'HR Global Notifications';

    return 'Dayflow HRMS';
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
          <span className="text-xs text-slate-500 font-medium">{currentTime}</span>
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Switcher Pills for Judges */}
        <div className="hidden sm:flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            onClick={() => {
              loginAsDemoEmployee();
              navigate('/employee/dashboard');
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              user?.role === 'EMPLOYEE'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employee View
          </button>
          <button
            onClick={() => {
              loginAsDemoHR();
              navigate('/admin/dashboard');
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              user?.role === 'HR' || user?.role === 'ADMIN'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HR Admin View
          </button>
        </div>

        {/* Live Attendance Pill */}
        {user?.role === 'EMPLOYEE' && (
          <div
            className={`hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isCheckedIn
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
            />
            <span>{isCheckedIn ? 'Checked In' : 'Not Checked In'}</span>
          </div>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl border border-slate-100 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                <button
                  onClick={() =>
                    navigate(user?.role === 'EMPLOYEE' ? '/employee/notifications' : '/admin/notifications')
                  }
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {userNotifs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                ) : (
                  userNotifs.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.isRead ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-indigo-50/50 border-indigo-100 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={user?.fullName}
              className="h-8 w-8 rounded-full object-cover border border-slate-200"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 z-50 animate-in fade-in duration-150">
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {user?.role} Mode
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/employee/profile');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
