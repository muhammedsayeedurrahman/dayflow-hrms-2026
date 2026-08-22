import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHRMSStore } from '../../store/hrmsStore';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employees, attendance, leaveRequests, payroll, insights, approveLeaveRequest, rejectLeaveRequest } =
    useHRMSStore();

  const totalEmployees = employees.length;
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((a) => a.date === today);
  const presentCount = todayRecords.filter((a) => a.status === 'PRESENT').length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 85;

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING');
  const totalPayrollCost = payroll.reduce((acc, p) => acc + p.netPay, 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>HR Administration Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Executive Overview, {user?.fullName || 'Sarah Jenkins'} 👋
            </h1>
            <p className="text-sm text-slate-300">
              Manage organization workforce, attendance approvals, payroll, and smart insights.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/leave')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Review Pending Leaves ({pendingLeaves.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Workforce"
          value={totalEmployees}
          subtitle="6 departments active"
          icon={Users}
          color="blue"
          onClick={() => navigate('/admin/employees')}
        />
        <StatCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          subtitle={`${presentCount} present today`}
          icon={Clock}
          color="emerald"
          onClick={() => navigate('/admin/attendance')}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingLeaves.length}
          subtitle="Requires HR decision"
          icon={CalendarDays}
          color="amber"
          onClick={() => navigate('/admin/leave')}
        />
        <StatCard
          title="Monthly Payroll Cost"
          value={`₹${totalPayrollCost.toLocaleString('en-IN')}`}
          subtitle="August 2026 payroll run"
          icon={DollarSign}
          color="violet"
          onClick={() => navigate('/admin/payroll')}
        />
      </div>

      {/* SMART HR INSIGHTS (DIFFERENTIATORS) SECTION */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">Smart HR Insights & Action Center</h3>
          </div>
          <Badge variant="indigo">Automated Workforce Intelligence</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{ins.title}</span>
                <Badge variant={ins.severity === 'high' ? 'danger' : 'warning'}>{ins.severity} priority</Badge>
              </div>
              <p className="text-xs text-slate-600">{ins.description}</p>
              {ins.affectedEmployees && (
                <div className="flex flex-wrap gap-1">
                  {ins.affectedEmployees.map((emp, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                      {emp}
                    </span>
                  ))}
                </div>
              )}
              {ins.actionText && (
                <button
                  onClick={() => {
                    if (ins.category === 'ANOMALY') navigate('/admin/attendance');
                    else navigate('/admin/leave');
                  }}
                  className="w-full text-center py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition-all"
                >
                  {ins.actionText} →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Leave Requests Action Queue */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Urgent Pending Leave Applications</h3>
            <p className="text-xs text-slate-500">One-click HR decision workflow</p>
          </div>
          <button
            onClick={() => navigate('/admin/leave')}
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Leave Management Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {pendingLeaves.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">All leave applications are currently processed!</p>
          ) : (
            pendingLeaves.map((req) => (
              <div
                key={req.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">{req.employeeName}</span>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {req.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">{req.leaveType} Leave</span>: {req.startDate} to {req.endDate} ({req.totalDays} days)
                  </p>
                  <p className="text-xs text-slate-500 italic">"{req.reason}"</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => approveLeaveRequest(req.id, 'Approved by HR Lead', user?.fullName || 'Sarah Jenkins')}
                    className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-xs transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => rejectLeaveRequest(req.id, 'Rejected due to project timelines', user?.fullName || 'Sarah Jenkins')}
                    className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
