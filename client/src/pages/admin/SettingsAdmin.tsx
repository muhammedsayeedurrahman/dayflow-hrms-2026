import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Sun, Moon, CalendarRange, Clock, Building } from 'lucide-react';

export const SettingsAdmin: React.FC = () => {
  const [companyName, setCompanyName] = useState('Dayflow Technologies Ltd.');
  const [workHours, setWorkHours] = useState('09:00 - 18:00');
  const [allowedSickLeave, setAllowedSickLeave] = useState(12);
  const [allowedPaidLeave, setAllowedPaidLeave] = useState(18);
  const [autoApproveLeaves, setAutoApproveLeaves] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    const storedSettings = localStorage.getItem('dayflow_admin_settings');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setCompanyName(parsed.companyName || companyName);
      setWorkHours(parsed.workHours || workHours);
      setAllowedSickLeave(parsed.allowedSickLeave || allowedSickLeave);
      setAllowedPaidLeave(parsed.allowedPaidLeave || allowedPaidLeave);
      setAutoApproveLeaves(!!parsed.autoApproveLeaves);
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = {
      companyName,
      workHours,
      allowedSickLeave,
      allowedPaidLeave,
      autoApproveLeaves,
    };
    localStorage.setItem('dayflow_admin_settings', JSON.stringify(settings));
    setSuccessMsg('Settings updated successfully!');
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure enterprise workspace metadata, work schedule parameters, and default policies.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Configuration Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-500" />
              <span>Workspace Profile</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Work Hours Schedule</label>
                <input
                  type="text"
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Leave Policies */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CalendarRange className="h-4 w-4 text-blue-500" />
              <span>Leave Policy Quotas</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Allowed Sick Leaves / Year</label>
                <input
                  type="number"
                  value={allowedSickLeave}
                  onChange={(e) => setAllowedSickLeave(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Allowed Paid Leaves / Year</label>
                <input
                  type="number"
                  value={allowedPaidLeave}
                  onChange={(e) => setAllowedPaidLeave(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* HR Workflow Automation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Workflow Automations</span>
            </h3>

            <label className="flex items-center space-x-3 cursor-pointer p-1">
              <input
                type="checkbox"
                checked={autoApproveLeaves}
                onChange={(e) => setAutoApproveLeaves(e.target.checked)}
                className="h-4 w-4 rounded-md text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <div>
                <span className="block text-xs font-bold text-slate-800">Auto-Approve Casual Leaves</span>
                <span className="block text-[10px] text-slate-400 font-semibold">Automatically approve leaves that are short duration (e.g. 1 day)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column - Save Actions & Theme toggle */}
        <div className="space-y-6">
          {/* Action Trigger Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-900">Control Actions</h3>
            
            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-[11px] font-bold flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Save className="h-4 w-4" />
              <span>Save System Settings</span>
            </button>
          </div>

          {/* Quick UI Preferences */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Appearance preferences</h3>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>Color theme mode</span>
              {theme === 'dark' ? (
                <span className="flex items-center space-x-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-[10px]">
                  <Sun className="h-3.5 w-3.5 fill-current" />
                  <span>Dark theme active</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1.5 text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-[10px]">
                  <Moon className="h-3.5 w-3.5" />
                  <span>Light theme active</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default SettingsAdmin;
