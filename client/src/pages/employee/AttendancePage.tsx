import React, { useState } from 'react';
import { Clock, CheckCircle2, Search, Filter, Calendar, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHRMSStore } from '../../store/hrmsStore';
import { Badge } from '../../components/ui/Badge';

export const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const { attendance, checkIn, checkOut } = useHRMSStore();
  const empId = user?.employeeId || 'EMP-1001';

  const [searchDate, setSearchDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find((a) => a.employeeId === empId && a.date === today);
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  // Employee's attendance records
  const myAttendance = attendance.filter((a) => a.employeeId === empId);

  const filteredAttendance = myAttendance.filter((rec) => {
    const matchesDate = searchDate ? rec.date.includes(searchDate) : true;
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
              {isCheckedIn ? 'Checked In' : todayRecord?.checkOut ? 'Checked Out' : 'Not Checked In'}
            </span>
          </div>

          {isCheckedIn ? (
            <button
              onClick={() => checkOut(empId)}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <Clock className="h-4 w-4" />
              <span>Check Out</span>
            </button>
          ) : (
            <button
              onClick={() => checkIn(empId)}
              disabled={!!todayRecord?.checkOut}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{todayRecord?.checkOut ? 'Day Completed' : 'Check In'}</span>
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
                <th className="py-3.5 px-4 rounded-r-xl">Notes</th>
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
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rec.date}</td>
                    <td className="py-3.5 px-4">{rec.checkIn || '--:--'}</td>
                    <td className="py-3.5 px-4">{rec.checkOut || '--:--'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {rec.workHours > 0 ? `${rec.workHours} hrs` : '--'}
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
                    <td className="py-3.5 px-4 text-slate-500">{rec.notes || '-'}</td>
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
