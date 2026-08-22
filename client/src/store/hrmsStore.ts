import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  NotificationItem,
  SmartInsight,
  SalaryStructure,
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL,
  INITIAL_NOTIFICATIONS,
  INITIAL_INSIGHTS,
} from '../data/mockData';

interface HRMSState {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payroll: PayrollRecord[];
  notifications: NotificationItem[];
  insights: SmartInsight[];

  // Attendance Actions
  checkIn: (employeeId: string) => void;
  checkOut: (employeeId: string) => void;

  // Leave Actions
  submitLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => void;
  approveLeaveRequest: (id: string, hrComment: string, hrName: string) => void;
  rejectLeaveRequest: (id: string, hrComment: string, hrName: string) => void;

  // Payroll & Profile Actions
  updateSalary: (employeeId: string, newSalary: Partial<SalaryStructure>) => void;
  updateProfile: (employeeId: string, updates: { phone?: string; address?: string; avatarUrl?: string }) => void;
  addEmployee: (employee: Employee) => void;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;

  // Helpers / Reset
  resetToMockData: () => void;
}

export const useHRMSStore = create<HRMSState>()(
  persist(
    (set, get) => ({
      employees: INITIAL_EMPLOYEES,
      attendance: INITIAL_ATTENDANCE,
      leaveRequests: INITIAL_LEAVE_REQUESTS,
      payroll: INITIAL_PAYROLL,
      notifications: INITIAL_NOTIFICATIONS,
      insights: INITIAL_INSIGHTS,

      checkIn: (employeeId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const { attendance, employees, notifications } = get();

        const employee = employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
        if (!employee) return;

        // Check if record exists for today
        const existingIdx = attendance.findIndex((a) => a.employeeId === employee.employeeId && a.date === today);

        let updatedAttendance: AttendanceRecord[];

        if (existingIdx >= 0) {
          updatedAttendance = [...attendance];
          updatedAttendance[existingIdx] = {
            ...updatedAttendance[existingIdx],
            checkIn: nowTime,
            status: 'PRESENT',
          };
        } else {
          const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            employeeId: employee.employeeId,
            employeeName: employee.fullName,
            department: employee.department,
            date: today,
            checkIn: nowTime,
            checkOut: null,
            workHours: 0,
            status: 'PRESENT',
          };
          updatedAttendance = [newRecord, ...attendance];
        }

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: employee.employeeId,
          title: 'Check-In Confirmed',
          message: `Checked in successfully at ${nowTime}. Have a productive day!`,
          type: 'ATTENDANCE',
          isRead: false,
          timestamp: 'Just now',
        };

        set({
          attendance: updatedAttendance,
          notifications: [newNotif, ...notifications],
        });
      },

      checkOut: (employeeId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const { attendance, employees, notifications } = get();

        const employee = employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
        if (!employee) return;

        const updatedAttendance = attendance.map((rec) => {
          if (rec.employeeId === employee.employeeId && rec.date === today) {
            return {
              ...rec,
              checkOut: nowTime,
              workHours: rec.workHours > 0 ? rec.workHours + 4.0 : 8.5,
            };
          }
          return rec;
        });

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: employee.employeeId,
          title: 'Check-Out Confirmed',
          message: `Checked out successfully at ${nowTime}. Today's duration logged.`,
          type: 'ATTENDANCE',
          isRead: false,
          timestamp: 'Just now',
        };

        set({
          attendance: updatedAttendance,
          notifications: [newNotif, ...notifications],
        });
      },

      submitLeaveRequest: (data) => {
        const { leaveRequests, notifications } = get();
        const newId = `lvr-${Date.now()}`;
        const today = new Date().toISOString().split('T')[0];

        const newRequest: LeaveRequest = {
          ...data,
          id: newId,
          status: 'PENDING',
          appliedOn: today,
        };

        const empNotif: NotificationItem = {
          id: `notif-${Date.now()}-emp`,
          userId: data.employeeId,
          title: 'Leave Request Submitted',
          message: `Your ${data.leaveType} leave request for ${data.startDate} to ${data.endDate} (${data.totalDays} day(s)) has been submitted.`,
          type: 'LEAVE',
          isRead: false,
          timestamp: 'Just now',
        };

        const hrNotif: NotificationItem = {
          id: `notif-${Date.now()}-hr`,
          userId: 'EMP-1002', // HR Lead ID
          title: 'New Leave Request Needs Review',
          message: `${data.employeeName} (${data.department}) submitted a ${data.leaveType} leave request.`,
          type: 'LEAVE',
          isRead: false,
          timestamp: 'Just now',
        };

        set({
          leaveRequests: [newRequest, ...leaveRequests],
          notifications: [empNotif, hrNotif, ...notifications],
        });
      },

      approveLeaveRequest: (id: string, hrComment: string, hrName: string) => {
        const { leaveRequests, notifications } = get();
        const today = new Date().toISOString().split('T')[0];

        let targetReq: LeaveRequest | undefined;

        const updatedRequests = leaveRequests.map((req) => {
          if (req.id === id) {
            targetReq = {
              ...req,
              status: 'APPROVED' as const,
              hrComment,
              reviewedBy: hrName,
              reviewedOn: today,
            };
            return targetReq;
          }
          return req;
        });

        if (targetReq) {
          const empNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            userId: targetReq.employeeId,
            title: 'Leave Request Approved ✅',
            message: `Your leave request for ${targetReq.startDate} to ${targetReq.endDate} has been APPROVED by ${hrName}.`,
            type: 'LEAVE',
            isRead: false,
            timestamp: 'Just now',
          };

          set({
            leaveRequests: updatedRequests,
            notifications: [empNotif, ...notifications],
          });
        }
      },

      rejectLeaveRequest: (id: string, hrComment: string, hrName: string) => {
        const { leaveRequests, notifications } = get();
        const today = new Date().toISOString().split('T')[0];

        let targetReq: LeaveRequest | undefined;

        const updatedRequests = leaveRequests.map((req) => {
          if (req.id === id) {
            targetReq = {
              ...req,
              status: 'REJECTED' as const,
              hrComment,
              reviewedBy: hrName,
              reviewedOn: today,
            };
            return targetReq;
          }
          return req;
        });

        if (targetReq) {
          const empNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            userId: targetReq.employeeId,
            title: 'Leave Request Status Updated ❌',
            message: `Your leave request for ${targetReq.startDate} to ${targetReq.endDate} was REJECTED. Remark: ${hrComment || 'No comment'}`,
            type: 'LEAVE',
            isRead: false,
            timestamp: 'Just now',
          };

          set({
            leaveRequests: updatedRequests,
            notifications: [empNotif, ...notifications],
          });
        }
      },

      updateSalary: (employeeId: string, newSalary: Partial<SalaryStructure>) => {
        const { employees, payroll, notifications } = get();

        const updatedEmployees = employees.map((emp) => {
          if (emp.employeeId === employeeId || emp.id === employeeId) {
            const updatedSal = { ...emp.salary, ...newSalary };
            const gross = updatedSal.basic + updatedSal.hra + updatedSal.specialAllowance;
            const net = gross - (updatedSal.pfDeduction + updatedSal.taxDeduction);
            return {
              ...emp,
              salary: {
                ...updatedSal,
                grossSalary: gross,
                netSalary: net,
              },
            };
          }
          return emp;
        });

        const updatedPayroll = payroll.map((pay) => {
          if (pay.employeeId === employeeId && pay.status === 'Processing') {
            const emp = updatedEmployees.find((e) => e.employeeId === employeeId);
            if (emp) {
              return {
                ...pay,
                basic: emp.salary.basic,
                allowances: emp.salary.hra + emp.salary.specialAllowance,
                deductions: emp.salary.pfDeduction + emp.salary.taxDeduction,
                netPay: emp.salary.netSalary,
              };
            }
          }
          return pay;
        });

        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: employeeId,
          title: 'Salary Structure Updated',
          message: 'Your compensation details have been revised by HR. Check your Profile page for full breakdown.',
          type: 'PAYROLL',
          isRead: false,
          timestamp: 'Just now',
        };

        set({
          employees: updatedEmployees,
          payroll: updatedPayroll,
          notifications: [notif, ...notifications],
        });
      },

      updateProfile: (employeeId, updates) => {
        const { employees } = get();
        const updatedEmployees = employees.map((emp) => {
          if (emp.employeeId === employeeId || emp.id === employeeId) {
            return {
              ...emp,
              ...updates,
            };
          }
          return emp;
        });
        set({ employees: updatedEmployees });
      },

      addEmployee: (newEmp) => {
        const { employees } = get();
        set({ employees: [newEmp, ...employees] });
      },

      markNotificationAsRead: (id) => {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        });
      },

      markAllNotificationsAsRead: (userId) => {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) =>
            n.userId === userId || n.userId === 'ALL' ? { ...n, isRead: true } : n
          ),
        });
      },

      resetToMockData: () => {
        set({
          employees: INITIAL_EMPLOYEES,
          attendance: INITIAL_ATTENDANCE,
          leaveRequests: INITIAL_LEAVE_REQUESTS,
          payroll: INITIAL_PAYROLL,
          notifications: INITIAL_NOTIFICATIONS,
          insights: INITIAL_INSIGHTS,
        });
      },
    }),
    {
      name: 'dayflow-hrms-store',
    }
  )
);
