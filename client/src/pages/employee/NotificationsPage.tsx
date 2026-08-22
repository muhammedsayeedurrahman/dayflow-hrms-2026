import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Filter, Clock, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { notificationAPI } from '../../services/api';
import { formatDisplayDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationAPI.getMyNotifications();
      setNotifications(response.data.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      // Update local state to show it is read
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredNotifs = filter === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notification Center</h1>
          <p className="text-xs text-slate-500">In-app activity notifications and updates</p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all"
        >
          <CheckCheck className="h-4 w-4 text-indigo-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs & List */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'UNREAD'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread ({notifications.filter((n) => !n.isRead).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No notifications found.</p>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-slate-50/70 border-slate-100 text-slate-600'
                    : 'bg-indigo-50/40 border-indigo-100 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                    <h4 className="font-bold text-sm">{n.title}</h4>
                    <Badge variant={n.type === 'LEAVE' ? 'info' : n.type === 'PAYROLL' ? 'indigo' : 'neutral'}>
                      {n.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {n.createdAt ? formatDisplayDate(n.createdAt) : n.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 pl-5">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationsPage;
