import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Send,
  UserPlus,
  Flame,
  Award,
  Filter,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { leaveAPI, api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { formatDisplayDate } from '../../utils/format';
import { AdminPageLayout, StatsCard, LoadingState, EmptyState } from '../../components/shared';
import { toast } from '../../store/toastStore';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [employeeStats, setEmployeeStats] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [payrollStats, setPayrollStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Leave Timeline Month State
  const [timelineDays, setTimelineDays] = useState<any[]>([]);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm your HR AI assistant. Click a quick command below or ask me any question about your workforce database.",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quick onboarding list
  const [onboardingEmployees, setOnboardingEmployees] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [empStatsRes, attnStatsRes, payrollStatsRes, leavesRes, empRes] = await Promise.all([
        api.get('/employees/stats'),
        api.get('/attendance/stats'),
        api.get('/payroll/stats'),
        leaveAPI.getAllLeaves(),
        api.get('/employees'),
      ]);

      setEmployeeStats(empStatsRes.data.data);
      setAttendanceStats(attnStatsRes.data.data);
      setPayrollStats(payrollStatsRes.data.data);
      
      const leavesData = leavesRes.data.data;
      setAllLeaves(leavesData);
      setPendingLeaves(leavesData.filter((l: any) => l.status === 'PENDING'));

      const empData = empRes.data.data;
      setEmployees(empData);
      // Grab 4 employees with recent joining date for onboarding mock list
      setOnboardingEmployees(empData.slice(0, 4));
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate calendar days for current month
  const generateTimeline = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({
        dayNum: d,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isToday: d === now.getDate(),
      });
    }
    setTimelineDays(days);

    // Scroll to today's date indicator in timeline automatically
    setTimeout(() => {
      if (timelineScrollRef.current) {
        const todayCell = timelineScrollRef.current.querySelector('.today-cell-indicator');
        if (todayCell) {
          todayCell.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }, 800);
  };

  useEffect(() => {
    fetchDashboardData();
    generateTimeline();
  }, []);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleApprove = async (id: string) => {
    setIsActionLoading(true);
    try {
      await leaveAPI.updateLeaveStatus(id, 'APPROVED', 'Approved by HR Lead');
      await fetchDashboardData();
      toast.success('Leave request approved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Approval failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsActionLoading(true);
    try {
      await leaveAPI.updateLeaveStatus(id, 'REJECTED', 'Rejected due to resource constraints');
      await fetchDashboardData();
      toast.success('Leave request rejected');
    } catch (err: any) {
      toast.error(err.message || 'Rejection failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  // AI chatbot simulation logic mapping dynamic DB states
  const handleAISend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let replyText = "I can help with dashboard parameters. Try clicking one of the quick actions above.";
      const query = textToSend.toLowerCase();

      if (query.includes('report') || query.includes('stats') || query.includes('data')) {
        replyText = `📊 **Workforce Summary**: 
- **Total Employees**: ${employeeStats?.total || 0} active staff members.
- **Attendance Rate**: ${totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 100}% present today.
- **Net Salary Payout**: ₹${(payrollStats?.totalNet || 0).toLocaleString('en-IN')}/month.`;
      } else if (query.includes('leave') || query.includes('request') || query.includes('pending')) {
        replyText = pendingLeaves.length > 0 
          ? `📅 There are **${pendingLeaves.length} pending leave requests** awaiting approval. Select "Review Pending Leaves" to process them.`
          : `📅 Excellent! All employee leave requests are fully processed.`;
      } else if (query.includes('employee') || query.includes('directory') || query.includes('names')) {
        replyText = `👥 **Current Employee Directory**: 
${employees.map((e) => `- **${e.fullName}** (${e.designation} • ${e.department})`).slice(0, 5).join('\n')}
...and ${Math.max(0, employees.length - 5)} other employees.`;
      } else if (query.includes('hi') || query.includes('hello') || query.includes('welcome')) {
        replyText = `Hello! How can I assist you with your Dayflow HRMS databases today?`;
      }

      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: replyText },
      ]);
    }, 600);
  };

  if (isLoading) {
    return (
      <AdminPageLayout
        title="Dashboard"
        description="Here's what's happening across your organization."
        icon={LayoutDashboard}
      >
        <LoadingState type="stats" />
        <div className="mt-6">
          <LoadingState type="card" rows={2} />
        </div>
      </AdminPageLayout>
    );
  }

  const totalEmployees = employeeStats?.total || 0;
  const presentCount = attendanceStats?.summary?.present || 0;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 100;
  const totalPayrollCost = payrollStats?.totalNet || 0;

  // Helper to match dates and leaves
  const getLeaveForDay = (employeeId: string, dateStr: string) => {
    return allLeaves.find((leave) => {
      if (leave.employeeId !== employeeId) return false;
      const start = new Date(leave.startDate).toISOString().split('T')[0];
      const end = new Date(leave.endDate).toISOString().split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  // Helper to color leave blocks on calendar
  const getLeaveBlockClass = (leave: any) => {
    if (leave.status === 'PENDING') {
      return 'bg-amber-100 border border-dashed border-amber-300 text-amber-700 font-bold';
    }
    switch (leave.leaveType) {
      case 'PAID':
        return 'bg-purple-100 text-purple-700 border border-purple-200 font-bold';
      case 'SICK':
        return 'bg-blue-100 text-blue-700 border border-blue-200 font-bold';
      default:
        return 'bg-teal-100 text-teal-700 border border-teal-200 font-bold';
    }
  };

  // Mock Future Events
  const events = [
    {
      id: 'e-1',
      title: 'Tech Innovations Summit',
      description: 'Cutting-edge AI trends & enterprise sync',
      time: '14:00 - 15:00',
      date: 'December 5',
      important: true,
      participants: 12,
    },
    {
      id: 'e-2',
      title: 'Annual Performance Reviews',
      description: 'Q4 performance evaluation evaluations',
      time: '10:00 - 12:00',
      date: 'December 10',
      important: false,
      participants: 8,
    },
    {
      id: 'e-3',
      title: 'New Hire Orientation Program',
      description: 'Onboarding training and account setups',
      time: '09:00 - 11:00',
      date: 'December 12',
      important: false,
      participants: 4,
    },
  ];

  return (
    <AdminPageLayout
      title="Dashboard"
      description="Here's what's happening across your organization."
      icon={LayoutDashboard}
    >
      <div className="space-y-6">
        {/* Header filters pill styled */}
        <div className="flex items-center justify-end space-x-2">
          <button className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>December 2026</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filters</span>
          </button>
        </div>

        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div onClick={() => navigate('/admin/employees')}>
            <StatsCard
              label="Total Employees"
              value={totalEmployees}
              icon={Users}
              variant="primary"
              trend={{
                value: "+12.5% from last month",
                isPositive: true
              }}
            />
          </div>

          <div onClick={() => navigate('/admin/attendance')}>
            <StatsCard
              label="Present Today"
              value={presentCount}
              icon={Clock}
              variant="success"
              trend={{
                value: `${attendanceRate}% attendance rate`,
                isPositive: attendanceRate >= 90
              }}
            />
          </div>

          <div onClick={() => navigate('/admin/leave')}>
            <StatsCard
              label="Pending Requests"
              value={pendingLeaves.length}
              icon={CalendarDays}
              variant="warning"
              trend={{
                value: "Requires HR approval",
                isPositive: false
              }}
            />
          </div>

          <div onClick={() => navigate('/admin/payroll')}>
            <StatsCard
              label="Net Monthly Budget"
              value={`₹${totalPayrollCost.toLocaleString('en-IN')}`}
              icon={DollarSign}
              variant="primary"
              trend={{
                value: "Fully processed",
                isPositive: true
              }}
            />
          </div>
        </div>

      {/* PLANNED ABSENCES TIMELINE PANEL */}
      <div
        className="bg-white rounded-lg p-6 space-y-4 transition-all duration-200"
        style={{
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          fontFamily: '"Fira Sans", sans-serif'
        }}
      >
        <div>
          <h3
            className="text-base font-bold text-slate-900"
            style={{ fontFamily: '"Fira Code", monospace' }}
          >
            Planned Absences & Attendance Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-1">Overview of leave schedules and overlapping time-offs for the current month</p>
        </div>

        {/* Calendar Absence Matrix horizontal scroll */}
        <div ref={timelineScrollRef} className="overflow-x-auto border border-slate-100 rounded-lg" style={{ fontFamily: '"Fira Sans", sans-serif' }}>
          <div className="min-w-[1000px]">
            {/* Timeline Header Row (Days of Month) */}
            <div className="grid grid-cols-[200px_1fr] bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[10px] items-center" style={{ fontFamily: '"Fira Code", monospace' }}>
              <div className="px-4 py-3 border-r border-slate-100">EMPLOYEE</div>
              <div className="flex justify-between w-full">
                {timelineDays.map((day) => (
                  <div
                    key={day.dayNum}
                    className={`flex-1 text-center py-2 flex flex-col items-center justify-center relative ${
                      day.isWeekend ? 'weekend-stripe' : ''
                    }`}
                  >
                    <span>{day.dayName}</span>
                    <span className={`text-xs mt-0.5 h-5 w-5 flex items-center justify-center rounded-full ${
                      day.isToday ? 'bg-blue-600 text-white font-black today-cell-indicator' : ''
                    }`}>
                      {day.dayNum}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employees leave overlap rows */}
            <div className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <div className="p-12">
                  <EmptyState
                    icon={Users}
                    title="No Employees Found"
                    description="No active employee profiles found in the system."
                    action={{
                      label: "Add Employee",
                      onClick: () => navigate('/admin/employees')
                    }}
                  />
                </div>
              ) : (
                employees.map((emp) => {
                  const details = emp.employee || {};
                  return (
                    <div key={emp.id} className="grid grid-cols-[200px_1fr] items-center hover:bg-slate-50/50 transition-colors">
                      {/* Left: Avatar, Name, Job title */}
                      <div className="flex items-center space-x-3 px-4 py-3 border-r border-slate-100 truncate">
                        <img
                          src={details.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                          alt={emp.fullName}
                          className="h-8 w-8 rounded-full object-cover border border-slate-200"
                        />
                        <div className="truncate">
                          <span className="block text-xs font-bold text-slate-900 truncate">{emp.fullName}</span>
                          <span className="block text-[9px] text-slate-400 truncate">{details.designation || 'Staff'}</span>
                        </div>
                      </div>

                      {/* Right: Days cells list */}
                      <div className="flex justify-between w-full h-full items-stretch">
                        {timelineDays.map((day) => {
                          const leave = getLeaveForDay(emp.id, day.dateStr);
                          return (
                            <div
                              key={day.dayNum}
                              className={`flex-1 border-r border-slate-100/50 min-h-[48px] flex items-center justify-center p-0.5 relative ${
                                day.isWeekend ? 'weekend-stripe' : ''
                              }`}
                            >
                              {/* Today vertical trace indicator line */}
                              {day.isToday && (
                                <div className="absolute inset-y-0 w-0.5 bg-blue-600/30 pointer-events-none" />
                              )}
                              {leave && (
                                <div
                                  title={`${leave.leaveType} Leave: ${leave.reason}`}
                                  className={`w-full py-2 px-1 rounded-md text-[9px] text-center overflow-hidden truncate shadow-2xs leading-tight transition-transform active:scale-95 ${getLeaveBlockClass(
                                    leave
                                  )}`}
                                >
                                  {leave.status === 'PENDING' ? '?' : leave.leaveType.slice(0, 1)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        {/* Timeline color helper indicator legend */}
        <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-3" style={{ fontFamily: '"Fira Sans", sans-serif' }}>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-sm bg-purple-100 border border-purple-200" />
            <span>Paid Leave</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-sm bg-teal-100 border border-teal-200" />
            <span>Vacation</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-sm bg-blue-100 border border-blue-200" />
            <span>Sick Leave</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-sm bg-amber-100 border border-dashed border-amber-300" />
            <span>Pending Approvals</span>
          </div>
        </div>
      </div>

      {/* LOWER LAYOUT GRID (Events, Onboarding & Interactive AI Assistant) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1 & 2: Onboarding Progress & Future Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onboarding grid card */}
          <div
            className="bg-white rounded-lg p-6 space-y-4 transition-all duration-200"
            style={{
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontFamily: '"Fira Sans", sans-serif'
            }}
          >
            <div>
              <h3
                className="text-base font-bold text-slate-900"
                style={{ fontFamily: '"Fira Code", monospace' }}
              >
                Onboarding Process Tracker
              </h3>
              <p className="text-xs text-slate-500 mt-1">Monitor new employees profile setups and training steps</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {onboardingEmployees.length === 0 ? (
                <div className="col-span-2">
                  <EmptyState
                    icon={UserPlus}
                    title="No Active Onboarding"
                    description="No new hires currently in the onboarding process."
                  />
                </div>
              ) : (
                onboardingEmployees.map((emp, index) => {
                  const details = emp.employee || {};
                  // Mock done tasks
                  const doneTasks = 5 + (index % 5);
                  const progress = (doneTasks / 10) * 100;
                  return (
                    <div
                      key={emp.id}
                      className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 flex items-center space-x-4 transition-all duration-200 cursor-pointer hover:border-blue-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontFamily: '"Fira Sans", sans-serif' }}
                    >
                      <img
                        src={details.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                        alt={emp.fullName}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-semibold text-slate-900 truncate">{emp.fullName}</span>
                        <span className="block text-[10px] text-slate-400 truncate mb-2">{details.designation || 'Specialist'}</span>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: '#1E40AF'
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[9px] font-semibold text-slate-500">
                          <span>Progress</span>
                          <span>{doneTasks}/10 tasks done</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Future Events grid */}
          <div
            className="bg-white rounded-lg p-6 space-y-4 transition-all duration-200"
            style={{
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontFamily: '"Fira Sans", sans-serif'
            }}
          >
            <div>
              <h3
                className="text-base font-bold text-slate-900"
                style={{ fontFamily: '"Fira Code", monospace' }}
              >
                Future Events
              </h3>
              <p className="text-xs text-slate-500 mt-1">Upcoming orientation workshops, tech summits, and evaluations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-4 border rounded-lg flex flex-col justify-between space-y-4 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    ev.important
                      ? 'bg-amber-50 border-amber-300 text-slate-900'
                      : 'bg-white border-slate-100 hover:border-blue-800'
                  }`}
                  style={{
                    fontFamily: '"Fira Sans", sans-serif',
                    boxShadow: ev.important ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    if (!ev.important) {
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!ev.important) {
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                    }
                  }}
                >
                  <div className="space-y-1">
                    <span
                      className="inline-block text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        color: '#F59E0B',
                        backgroundColor: '#FEF3C7',
                        fontFamily: '"Fira Code", monospace'
                      }}
                    >
                      {ev.date}
                    </span>
                    <h4 className="text-xs font-bold leading-snug" style={{ fontFamily: '"Fira Code", monospace' }}>{ev.title}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{ev.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400 border-t pt-2 border-slate-200/50">
                    <span>{ev.time}</span>
                    <span>{ev.participants} Attendees</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 3: INTERACTIVE AI ASSISTANT PANEL */}
        <div
          className="bg-white rounded-lg p-6 flex flex-col min-h-[420px] justify-between relative overflow-hidden transition-all duration-200"
          style={{
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            fontFamily: '"Fira Sans", sans-serif'
          }}
        >

          {/* Top Banner Orb details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                {/* AI Pulsing Orb Indicator */}
                <div className="relative h-6 w-6">
                  <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: '#1E40AF', opacity: 0.35 }} />
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                    style={{
                      background: 'linear-gradient(to top right, #1E40AF, #3B82F6)',
                      fontFamily: '"Fira Code", monospace'
                    }}
                  >
                    AI
                  </div>
                </div>
                <div>
                  <h3
                    className="text-xs font-bold text-slate-900"
                    style={{ fontFamily: '"Fira Code", monospace' }}
                  >
                    AI Assistant Console
                  </h3>
                  <span className="block text-[8px] font-semibold text-emerald-600 flex items-center space-x-1">
                    <span className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse mr-1" />
                    Online
                  </span>
                </div>
              </div>
              <Badge variant="blue">V3.0</Badge>
            </div>

            {/* Quick Actions command deck */}
            <div className="space-y-1">
              <span
                className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                style={{ fontFamily: '"Fira Code", monospace' }}
              >
                Quick Queries
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAISend("Get database reports")}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-left text-[10px] font-semibold text-slate-700 transition-all duration-200 cursor-pointer hover:bg-blue-50 hover:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#1E40AF' }}
                >
                  Get Reports
                </button>
                <button
                  onClick={() => handleAISend("Check pending leaves")}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-left text-[10px] font-semibold text-slate-700 transition-all duration-200 cursor-pointer hover:bg-blue-50 hover:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#1E40AF' }}
                >
                  Pending Leaves
                </button>
                <button
                  onClick={() => handleAISend("Show directory list")}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-left text-[10px] font-semibold text-slate-700 transition-all duration-200 cursor-pointer hover:bg-blue-50 hover:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#1E40AF' }}
                >
                  Employee Directory
                </button>
                <button
                  onClick={() => handleAISend("Hello AI")}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-left text-[10px] font-semibold text-slate-700 transition-all duration-200 cursor-pointer hover:bg-blue-50 hover:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#1E40AF' }}
                >
                  Greeting Hello
                </button>
              </div>
            </div>
          </div>

          {/* Message log */}
          <div className="flex-1 overflow-y-auto my-4 space-y-3 max-h-[160px] border border-slate-100 rounded-lg p-3 bg-slate-50/50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] rounded-lg p-2.5 text-[10px] leading-relaxed transition-all duration-200 ${
                  msg.sender === 'user'
                    ? 'text-white ml-auto rounded-tr-none'
                    : 'bg-white border text-slate-700 rounded-tl-none font-medium'
                }`}
                style={msg.sender === 'user' ? { backgroundColor: '#1E40AF' } : {}}
              >
                <span className="whitespace-pre-line">{msg.text}</span>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Console form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAISend(chatInput);
            }}
            className="flex items-center space-x-2 border-t pt-3"
          >
            <input
              type="text"
              placeholder="Ask me anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ fontFamily: '"Fira Sans", sans-serif' }}
            />
            <button
              type="submit"
              className="p-2 text-white rounded-lg transition-all duration-200 cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
              style={{
                backgroundColor: '#F59E0B',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>

      </div>
      </div>
    </AdminPageLayout>
  );
};
export default AdminDashboard;
