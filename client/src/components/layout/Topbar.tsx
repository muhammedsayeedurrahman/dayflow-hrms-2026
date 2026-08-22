import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, CheckCircle2, Menu, Sun, Moon, Plus, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authAPI, notificationAPI, attendanceAPI, api } from '../../services/api';
import { formatDisplayDate } from '../../utils/format';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dayflow_theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dayflow_theme', 'light');
      setTheme('light');
    }
  };

  const fetchTopbarData = async () => {
    if (!user) return;
    try {
      const [notifRes, todayRes, empRes] = await Promise.all([
        notificationAPI.getMyNotifications(),
        attendanceAPI.getTodayStatus(),
        api.get('/employees'),
      ]);
      setNotifications(notifRes.data.data);
      const todayRecord = todayRes.data.data;
      setIsCheckedIn(!!todayRecord?.checkInTime && !todayRecord?.checkOutTime);
      setEmployees(empRes.data.data.slice(0, 4)); // Get first 4 employees for avatar group
    } catch (err) {
      console.error('Failed to load topbar details:', err);
    }
  };

  useEffect(() => {
    fetchTopbarData();
    const pollInterval = setInterval(fetchTopbarData, 30000);
    return () => clearInterval(pollInterval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemoSwitch = async (role: 'EMPLOYEE' | 'HR') => {
    const email = role === 'EMPLOYEE' ? 'employee1@dayflow.com' : 'hr@dayflow.com';
    try {
      const response = await authAPI.signIn(email, 'Test@123');
      const { user: newUser, token } = response.data.data;
      useAuthStore.getState().setAuth(newUser, token);
      if (role === 'EMPLOYEE') {
        navigate('/employee/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
      window.location.reload();
    } catch (err) {
      console.error('Demo switcher login failed:', err);
    }
  };

  return (
    <header className="sticky top-4 z-20 flex h-14 w-full items-center justify-between border border-slate-200 bg-white px-4 md:px-6 rounded-2xl shadow-sm floating-nav max-w-7xl mx-auto mt-2">
      {/* Left: Mobile menu toggle + SaaS pill navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Floating pill navigation */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-0.5 rounded-full border border-slate-200/80">
          <button
            onClick={() => navigate(user?.role === 'HR' || user?.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              location.pathname.includes('dashboard') ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate(user?.role === 'HR' || user?.role === 'ADMIN' ? '/admin/employees' : '/employee/profile')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              location.pathname.includes('employees') || location.pathname.includes('profile')
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => navigate(user?.role === 'HR' || user?.role === 'ADMIN' ? '/admin/analytics' : '/employee/payroll')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              location.pathname.includes('analytics') || location.pathname.includes('payroll')
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Reports
          </button>
        </div>

        {/* Minimal Search Input */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 w-44 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium focus:w-60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Quick actions, Theme switcher, Avatar Groups, notifications, and profile */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Switcher Pills for Judges */}
        <div className="hidden sm:flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 mr-2">
          <button
            onClick={() => handleDemoSwitch('EMPLOYEE')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all ${
              user?.role === 'EMPLOYEE' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Employee View
          </button>
          <button
            onClick={() => handleDemoSwitch('HR')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all ${
              user?.role === 'HR' || user?.role === 'ADMIN' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            HR Admin View
          </button>
        </div>

        {/* Employee Avatar Group (Clean Visual Accent) */}
        {employees.length > 0 && (
          <div className="hidden xl:flex items-center -space-x-2 mr-2">
            {employees.map((emp) => (
              <img
                key={emp.id}
                src={emp.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                alt={emp.fullName}
                title={emp.fullName}
                className="h-6 w-6 rounded-full border-2 border-white object-cover shadow-xs"
              />
            ))}
            <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
              +{employees.length}
            </div>
          </div>
        )}

        {/* "+ Add Employee" button shortcut for HR */}
        {(user?.role === 'HR' || user?.role === 'ADMIN') && (
          <button
            onClick={() => navigate('/admin/employees')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Employee</span>
          </button>
        )}

        {/* Live Attendance Pill */}
        {user?.role === 'EMPLOYEE' && (
          <div
            className={`hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
              isCheckedIn
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isCheckedIn ? 'In' : 'Out'}</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all duration-300 transform active:scale-95 cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-500 animate-in spin-in-12 duration-500" />
          ) : (
            <Moon className="h-4 w-4 text-slate-500" />
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-slate-200 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h3 className="font-bold text-xs text-slate-900">Notifications</h3>
                <button
                  onClick={() => {
                    setShowNotifMenu(false);
                    navigate(user?.role === 'EMPLOYEE' ? '/employee/notifications' : '/admin/notifications');
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className={`p-3 rounded-xl border text-[11px] cursor-pointer transition-colors ${
                        n.isRead ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-blue-50/40 border-blue-100 text-slate-900 font-semibold'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{n.title}</span>
                        <span className="text-[9px] text-slate-400">
                          {n.createdAt ? formatDisplayDate(n.createdAt) : n.timestamp}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center space-x-2 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={user?.fullName}
              className="h-7 w-7 rounded-full object-cover border border-slate-200"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in duration-150">
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[8px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
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
                    navigate('/login');
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
export default Topbar;
