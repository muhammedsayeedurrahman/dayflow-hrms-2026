import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, Calendar, AlertCircle, FileText } from 'lucide-react';
import { attendanceAPI } from '../../services/api';
import { formatTimeStr, formatDateStr, formatDisplayDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';

export const AttendanceAdmin: React.FC = () => {
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await attendanceAPI.getAllAttendance();
      setAttendanceList(response.data.data);
    } catch (err) {
      console.error('Failed to load company attendance matrix:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ['Employee Name', 'Department', 'Date', 'Check-In', 'Check-Out', 'Work Hours', 'Status'];
    const rows = filteredAttendance.map((rec) => {
      const name = rec.employee?.fullName || `${rec.employee?.firstName} ${rec.employee?.lastName}`;
      const dept = rec.employee?.department || 'Operations';
      const date = formatDateStr(rec.date);
      const checkIn = formatTimeStr(rec.checkInTime) || '--:--';
      const checkOut = formatTimeStr(rec.checkOutTime) || '--:--';
      const hours = rec.workHours ? rec.workHours.toFixed(2) : '0';
      const status = rec.status;
      return [name, dept, date, checkIn, checkOut, hours, status].map(val => `"${val}"`).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `company_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttendance = attendanceList.filter((rec) => {
    const empName = (rec.employee?.fullName || `${rec.employee?.firstName} ${rec.employee?.lastName}`).toLowerCase();
    const empId = (rec.employee?.id || '').toLowerCase();
    
    const matchesSearch =
      empName.includes(searchTerm.toLowerCase()) ||
      empId.includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' ? true : rec.status === statusFilter;
    const matchesDept = deptFilter === 'ALL' ? true : rec.employee?.department === deptFilter;
    
    return matchesSearch && matchesStatus && matchesDept;
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Attendance Matrix</h1>
          <p className="text-xs text-slate-500">Monitor employee check-in logs and work durations</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all"
        >
          <FileText className="h-4 w-4 text-blue-800" />
          <span>Export Attendance CSV</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute top-3 left-3" />
            <input
              type="text"
              placeholder="Search employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product Management">Product Management</option>
              <option value="QA Engineering">QA Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Work Hours</th>
                <th className="py-3.5 px-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No attendance records logged matching the filters today.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {rec.employee?.fullName || `${rec.employee?.firstName} ${rec.employee?.lastName}`}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{rec.employee?.department || 'Operations'}</td>
                    <td className="py-3.5 px-4">{formatDisplayDate(rec.date)}</td>
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
export default AttendanceAdmin;
