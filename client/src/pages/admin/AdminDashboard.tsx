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
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { leaveAPI, api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { formatDisplayDate } from '../../utils/format';

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
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsActionLoading(true);
    try {
      await leaveAPI.updateLeaveStatus(id, 'REJECTED', 'Rejected due to resource constraints');
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
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
    <div className="space-y-6 font-sans page-enter-transition">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium">
            Here's what's happening across your organization.
          </p>
        </div>
        {/* Header filters pill styled */}
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>December 2026</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Employees */}
        <div
          onClick={() => navigate('/admin/employees')}
          className="bg-white border border-slate-200 p-5 rounded-2xl cursor-pointer hover:border-blue-500 transition-all relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Employees</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalEmployees}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <span className="block text-[10px] text-green-600 font-bold mt-3">
            +12.5% from last month
          </span>
        </div>

        {/* Present Today */}
        <div
          onClick={() => navigate('/admin/attendance')}
          className="bg-white border border-slate-200 p-5 rounded-2xl cursor-pointer hover:border-blue-500 transition-all relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{presentCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <span className="block text-[10px] text-slate-500 font-bold mt-3">
            {attendanceRate}% attendance rate
          </span>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => navigate('/admin/leave')}
          className="bg-white border border-slate-200 p-5 rounded-2xl cursor-pointer hover:border-blue-500 transition-all relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Requests</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{pendingLeaves.length}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <span className="block text-[10px] text-amber-600 font-bold mt-3">
            Requires HR approval
          </span>
        </div>

        {/* Monthly Payroll Cost */}
        <div
          onClick={() => navigate('/admin/payroll')}
          className="bg-white border border-slate-200 p-5 rounded-2xl cursor-pointer hover:border-blue-500 transition-all relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Monthly Budget</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                ₹{totalPayrollCost.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <span className="block text-[10px] text-slate-500 font-bold mt-3">
            Fully processed
          </span>
        </div>
      </div>

      {/* PLANNED ABSENCES TIMELINE PANEL (PRIMARY REDESIGN VALUE) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Planned Absences & Attendance Timeline</h3>
          <p className="text-xs text-slate-500">Overview of leave schedules and overlapping time-offs for the current month</p>
        </div>

        {/* Calendar Absence Matrix horizontal scroll */}
        <div ref={timelineScrollRef} className="overflow-x-auto border border-slate-100 rounded-2xl">
          <div className="min-w-[1000px]">
            {/* Timeline Header Row (Days of Month) */}
            <div className="grid grid-cols-[200px_1fr] bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[10px] items-center">
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
                <div className="text-center py-6 text-xs text-slate-400">No active employee profiles found.</div>
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
        <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-3">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Onboarding Process Tracker</h3>
              <p className="text-xs text-slate-500">Monitor new employees profile setups and training steps</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {onboardingEmployees.length === 0 ? (
                <p className="text-xs text-slate-400 col-span-2">No new hires currently onboarding.</p>
              ) : (
                onboardingEmployees.map((emp, index) => {
                  const details = emp.employee || {};
                  // Mock done tasks
                  const doneTasks = 5 + (index % 5);
                  const progress = (doneTasks / 10) * 100;
                  return (
                    <div key={emp.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex items-center space-x-4">
                      <img
                        src={details.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                        alt={emp.fullName}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-900 truncate">{emp.fullName}</span>
                        <span className="block text-[10px] text-slate-400 truncate mb-2">{details.designation || 'Specialist'}</span>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[9px] font-bold text-slate-500">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Future Events</h3>
              <p className="text-xs text-slate-500">Upcoming orientation workshops, tech summits, and evaluations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-4 border rounded-2xl flex flex-col justify-between space-y-4 ${
                    ev.important
                      ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-sm'
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      {ev.date}
                    </span>
                    <h4 className="text-xs font-extrabold leading-snug">{ev.title}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{ev.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 border-t pt-2 border-slate-200/50">
                    <span>{ev.time}</span>
                    <span>{ev.participants} Attendees</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 3: INTERACTIVE AI ASSISTANT PANEL */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col min-h-[420px] justify-between relative overflow-hidden">
          
          {/* Top Banner Orb details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                {/* AI Pulsing Orb Indicator */}
                <div className="relative h-6 w-6">
                  <div className="absolute inset-0 bg-blue-500/35 rounded-full animate-ping" />
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-[10px]">
                    AI
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">AI Assistant Console</h3>
                  <span className="block text-[8px] font-semibold text-emerald-600 flex items-center space-x-1">
                    <span className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse mr-1" />
                    Online
                  </span>
                </div>
              </div>
              <Badge variant="indigo">V3.0</Badge>
            </div>

            {/* Quick Actions command deck */}
            <div className="space-y-1">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quick Queries</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAISend("Get database reports")}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl text-left text-[10px] font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                >
                  📊 Get Reports
                </button>
                <button
                  onClick={() => handleAISend("Check pending leaves")}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl text-left text-[10px] font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                >
                  📅 Pending Leaves
                </button>
                <button
                  onClick={() => handleAISend("Show directory list")}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl text-left text-[10px] font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                >
                  👥 Employee Directory
                </button>
                <button
                  onClick={() => handleAISend("Hello AI")}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl text-left text-[10px] font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                >
                  👋 Greeting Hello
                </button>
              </div>
            </div>
          </div>

          {/* Message log */}
          <div className="flex-1 overflow-y-auto my-4 space-y-3 max-h-[160px] border border-slate-100 rounded-xl p-3 bg-slate-50/50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] rounded-xl p-2.5 text-[10px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white ml-auto rounded-tr-none'
                    : 'bg-white border text-slate-700 rounded-tl-none font-medium'
                }`}
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
              className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-2 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
export default AdminDashboard;
