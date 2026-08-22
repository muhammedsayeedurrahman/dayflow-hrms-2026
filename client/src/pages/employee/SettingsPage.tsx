import React, { useState } from 'react';
import { Settings, Save, Lock, Bell, Moon, Sun, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [attendanceReminders, setAttendanceReminders] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('Security credentials updated!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Preferences updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

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

  return (
    <div className="space-y-6 page-enter-transition">
      {/* Page Header */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account Settings</h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure security credentials, notification preferences, and application themes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Configuration Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security details change password */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Lock className="h-4 w-4 text-blue-500" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleSaveSecurity} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {errorMsg && <p className="text-[10px] text-red-500 font-bold">{errorMsg}</p>}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* Preferences */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-500" />
              <span>Notification Preferences</span>
            </h3>

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 rounded-md text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-800">Email Alerts</span>
                  <span className="block text-[10px] text-slate-400 font-semibold">Get email notifications on leave approval/rejection updates</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={attendanceReminders}
                  onChange={(e) => setAttendanceReminders(e.target.checked)}
                  className="h-4 w-4 rounded-md text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-800">Attendance Check-in Reminders</span>
                  <span className="block text-[10px] text-slate-400 font-semibold">Remind me to check-in/out on scheduled work hours</span>
                </div>
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - System telemetry & themes */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">UI Theme Preferences</h3>
            
            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-[11px] font-bold flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>App Color Theme</span>
              {theme === 'dark' ? (
                <span className="flex items-center space-x-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-[10px]">
                  <Sun className="h-3.5 w-3.5 fill-current" />
                  <span>Dark mode active</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1.5 text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-[10px]">
                  <Moon className="h-3.5 w-3.5" />
                  <span>Light mode active</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
