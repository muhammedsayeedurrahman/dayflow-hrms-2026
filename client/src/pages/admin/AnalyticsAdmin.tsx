import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, Download, Calendar, Filter } from 'lucide-react';
import { useHRMSStore } from '../../store/hrmsStore';

export const AnalyticsAdmin: React.FC = () => {
  const { employees, leaveRequests, payroll } = useHRMSStore();
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Chart Data Preparation
  const attendanceTrendData = [
    { day: 'Mon', Present: 94, OnLeave: 6 },
    { day: 'Tue', Present: 96, OnLeave: 4 },
    { day: 'Wed', Present: 92, OnLeave: 8 },
    { day: 'Thu', Present: 98, OnLeave: 2 },
    { day: 'Fri', Present: 90, OnLeave: 10 },
    { day: 'Sat', Present: 85, OnLeave: 15 },
  ];

  const leaveDistributionData = [
    { name: 'Paid Leave', value: 45, color: '#4f46e5' },
    { name: 'Sick Leave', value: 25, color: '#10b981' },
    { name: 'Casual Leave', value: 20, color: '#f59e0b' },
    { name: 'Unpaid Leave', value: 10, color: '#ef4444' },
  ];

  const departmentHeadcountData = [
    { dept: 'Engineering', Headcount: 4, Budget: 420000 },
    { dept: 'HR', Headcount: 2, Budget: 210000 },
    { dept: 'Product', Headcount: 1, Budget: 145000 },
    { dept: 'Marketing', Headcount: 1, Budget: 95000 },
    { dept: 'Finance', Headcount: 1, Budget: 105000 },
    { dept: 'Sales', Headcount: 1, Budget: 100000 },
  ];

  const payrollExpenseTrend = [
    { month: 'Apr', TotalPayroll: 820000 },
    { month: 'May', TotalPayroll: 890000 },
    { month: 'Jun', TotalPayroll: 940000 },
    { month: 'Jul', TotalPayroll: 980000 },
    { month: 'Aug', TotalPayroll: 1075000 },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workforce Analytics & Reports</h1>
          <p className="text-xs text-slate-500">Interactive telemetry for attendance, leave concentration, and payroll</p>
        </div>

        <button className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all">
          <Download className="h-4 w-4" />
          <span>Export Analytics Report (CSV)</span>
        </button>
      </div>

      {/* Grid of Interactive Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graph 1: Weekly Attendance Trends (Line Chart) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Attendance Rate %</h3>
              <p className="text-xs text-slate-500">Daily present vs on-leave trends</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Present" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="OnLeave" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Leave Distribution by Type (Pie Chart) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Leave Type Distribution</h3>
              <p className="text-xs text-slate-500">Percentage breakdown by category</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leaveDistributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {leaveDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Department Headcount (Bar Chart) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Departmental Headcount</h3>
              <p className="text-xs text-slate-500">Employees per department</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentHeadcountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dept" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="Headcount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 4: Monthly Payroll Expense Trend (Area Chart) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Payroll Expenditure (₹)</h3>
              <p className="text-xs text-slate-500">Total company payout growth</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payrollExpenseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="TotalPayroll" stroke="#10b981" fill="#ecfdf5" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsAdmin;
