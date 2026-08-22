import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Search, Filter, Calendar, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { attendanceAPI } from '../../services/api';
import { formatTimeStr, formatDateStr, formatDisplayDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';

export const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [searchDate, setSearchDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const [todayRes, listRes] = await Promise.all([
        attendanceAPI.getTodayStatus(),
        attendanceAPI.getMyAttendance(),
      ]);
      setTodayRecord(todayRes.data.data);
      setAttendanceList(listRes.data.data);
    } catch (err) {
      console.error('Failed to load attendance logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleCheckIn = async () => {
    setIsActionLoading(true);
    try {
      await attendanceAPI.checkIn();
      await fetchAttendanceData();
    } catch (err: any) {
      alert(err.message || 'Failed to check in');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsActionLoading(true);
    try {
      await attendanceAPI.checkOut();
      await fetchAttendanceData();
    } catch (err: any) {
      alert(err.message || 'Failed to check out');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isCheckedIn = !!todayRecord?.checkInTime && !todayRecord?.checkOutTime;

  const filteredAttendance = attendanceList.filter((rec) => {
    const recDate = formatDateStr(rec.date);
    const matchesDate = searchDate ? recDate.includes(searchDate) : true;
    const matchesStatus = statusFilter === 'ALL' ? true : rec.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner & Live Action Console */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Attendance & Time Tracker</h1>
          <p className="text-xs text-slate-500">Log daily work hours and review attendance history</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium block">Today's Status</span>
            <span className="text-sm font-bold text-slate-900">
              {isCheckedIn ? 'Checked In' : todayRecord?.checkOutTime ? 'Checked Out' : 'Not Checked In'}
            </span>
          </div>

          {isCheckedIn ? (
            <button
              disabled={isActionLoading}
              onClick={handleCheckOut}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Clock className="h-4 w-4" />
              <span>Check Out</span>
            </button>
          ) : (
            <button
              disabled={isActionLoading || (todayRecord?.checkInTime && todayRecord?.checkOutTime)}
              onClick={handleCheckIn}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{todayRecord?.checkInTime ? 'Day Completed' : 'Check In'}</span>
            </button>
          )}
        </div>
      </div>

      {/* History Table & Filters */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900">Attendance History Logs</h3>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">Date</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 rounded-r-xl">Remarks / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No attendance records found for selected filter.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatDisplayDate(rec.date)}</td>
                    <td className="py-3.5 px-4">{formatTimeStr(rec.checkInTime) || '--:--'}</td>
                    <td className="py-3.5 px-4">{formatTimeStr(rec.checkOutTime) || '--:--'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {rec.workHours ? `${rec.workHours.toFixed(2)} hrs` : '--'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          rec.status === 'PRESENT'
                            ? 'success'
                            : rec.status === 'HALF_DAY'
                            ? 'warning'
                            : rec.status === 'ON_LEAVE'
                            ? 'info'
                            : 'danger'
                        }
                      >
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{rec.remarks || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AttendancePage;
