import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHRMSStore } from '../../store/hrmsStore';
import { Badge } from '../../components/ui/Badge';

export const NotificationsAdmin: React.FC = () => {
  const { user } = useAuthStore();
  const { notifications } = useHRMSStore();

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [dispatched, setDispatched] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMessage) return;

    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
      setAnnouncementTitle('');
      setAnnouncementMessage('');
    }, 2500);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Global Notifications & Announcements</h1>
          <p className="text-xs text-slate-500">Dispatch company-wide alerts and review notification telemetry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Broadcast Announcement Form */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Broadcast Company Alert</h3>
          <p className="text-xs text-slate-500">Sends instantly to all employee notification hubs</p>

          {dispatched ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Announcement Broadcasted to All Employees!</span>
            </div>
          ) : (
            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Alert Title
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Q3 Town Hall Schedule"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Announcement Body
                </label>
                <textarea
                  required
                  rows={4}
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Type broadcast message..."
                  className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Send Broadcast Alert</span>
              </button>
            </form>
          )}
        </div>

        {/* Global Notifications Log */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">System Notification Activity Log</h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{n.title}</span>
                  <Badge variant="neutral">{n.timestamp}</Badge>
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                <span className="text-[10px] text-indigo-600 font-mono">Recipient: {n.userId}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default NotificationsAdmin;
