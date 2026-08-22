import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarDays,
  DollarSign,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHRMSStore } from '../../store/hrmsStore';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { attendance, leaveRequests, payroll, notifications, checkIn, checkOut } = useHRMSStore();

  const today = new Date().toISOString().split('T')[0];
  const empId = user?.employeeId || 'EMP-1001';

  // Attendance details for today
  const todayRecord = attendance.find((a) => a.employeeId === empId && a.date === today);
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  // Leave details
  const myLeaves = leaveRequests.filter((l) => l.employeeId === empId);
  const pendingLeaves = myLeaves.filter((l) => l.status === 'PENDING').length;
  const approvedLeaves = myLeaves.filter((l) => l.status === 'APPROVED');
  const usedDays = approvedLeaves.reduce((acc, l) => acc + l.totalDays, 0);
  const totalBalance = Math.max(0, 18 - usedDays);

  // Next Payroll
  const myPayroll = payroll.filter((p) => p.employeeId === empId)[0];
  const nextSalary = myPayroll ? `₹${myPayroll.netPay.toLocaleString('en-IN')}` : '₹96,000';

  // Notifications
  const myNotifs = notifications.filter((n) => n.userId === empId || n.userId === 'ALL');

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Employee Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Good morning, {user?.fullName || 'Alex Vance'} 👋
            </h1>
            <p className="text-sm text-slate-300">
              {user?.designation || 'Senior Frontend Engineer'} • {user?.department || 'Engineering'}
            </p>
          </div>

          {/* Quick Check In/Out Console */}
          <div className="flex items-center space-x-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="text-right hidden sm:block">
              <span className="block text-xs text-slate-400 font-medium">Today's Attendance</span>
              <span className="text-sm font-bold text-white">
                {todayRecord?.checkIn ? `In: ${todayRecord.checkIn}` : 'Not Checked In'}
              </span>
            </div>
            {isCheckedIn ? (
              <button
                onClick={() => checkOut(empId)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                <Clock className="h-4 w-4" />
                <span>Check Out</span>
              </button>
            ) : (
              <button
                onClick={() => checkIn(empId)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Check In Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Leave Balance"
          value={`${totalBalance} Days`}
          subtitle={`Used: ${usedDays} days of 18 annual`}
          icon={CalendarDays}
          color="emerald"
          onClick={() => navigate('/employee/leave')}
        />
        <StatCard
          title="Pending Requests"
          value={pendingLeaves}
          subtitle="Awaiting HR sign-off"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/employee/leave')}
        />
        <StatCard
          title="Upcoming Payroll"
          value={nextSalary}
          subtitle="Payout date: Aug 31, 2026"
          icon={DollarSign}
          color="violet"
          onClick={() => navigate('/employee/payroll')}
        />
        <StatCard
          title="Monthly Work Hours"
          value="164 hrs"
          subtitle="Average: 8.4 hrs/day"
          icon={TrendingUp}
          color="blue"
          onClick={() => navigate('/employee/attendance')}
        />
      </div>

      {/* Main Dashboard Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Attendance & Leave Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Widget */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Attendance Status</h3>
                <p className="text-xs text-slate-500">Real-time check-in logging</p>
              </div>
              <button
                onClick={() => navigate('/employee/attendance')}
                className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>Full Attendance Log</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 text-center">
                <span className="text-xs text-slate-500 font-medium block">Check-In Time</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {todayRecord?.checkIn || '--:--'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 text-center">
                <span className="text-xs text-slate-500 font-medium block">Check-Out Time</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {todayRecord?.checkOut || '--:--'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 text-center">
                <span className="text-xs text-slate-500 font-medium block">Logged Hours</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {todayRecord?.workHours ? `${todayRecord.workHours} hrs` : '0 hrs'}
                </span>
              </div>
            </div>
          </div>

          {/* Leave Requests Overview */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Leave Applications</h3>
                <p className="text-xs text-slate-500">Track HR approval status</p>
              </div>
              <button
                onClick={() => navigate('/employee/leave')}
                className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>Apply for Leave</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {myLeaves.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No leave applications filed yet.</p>
              ) : (
                myLeaves.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{req.leaveType} Leave</span>
                        <span className="text-xs text-slate-500">({req.totalDays} day{req.totalDays > 1 ? 's' : ''})</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {req.startDate} to {req.endDate}
                      </p>
                      {req.hrComment && (
                        <p className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                          HR: {req.hrComment}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        req.status === 'APPROVED'
                          ? 'success'
                          : req.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {req.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Activity Notifications */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Quick Navigation</h3>
            <button
              onClick={() => navigate('/employee/profile')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-800 text-xs font-semibold transition-all group"
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                <span>View & Edit Profile</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/employee/payroll')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-800 text-xs font-semibold transition-all group"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span>View Salary Payslip</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Recent Activity Feed */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Alerts</h3>
              <Bell className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {myNotifs.slice(0, 4).map((n) => (
                <div key={n.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-900">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmployeeDashboard;
