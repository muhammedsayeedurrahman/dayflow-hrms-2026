import { useHRMSStore } from '../store/hrmsStore';
import { Employee, AttendanceRecord, LeaveRequest, PayrollRecord, NotificationItem } from '../types';

export const hrmsService = {
  // Employee Service
  getEmployees: (): Employee[] => {
    return useHRMSStore.getState().employees;
  },

  getEmployeeById: (id: string): Employee | undefined => {
    return useHRMSStore.getState().employees.find((e) => e.id === id || e.employeeId === id);
  },

  updateEmployeeProfile: (employeeId: string, updates: { phone?: string; address?: string; avatarUrl?: string }) => {
    useHRMSStore.getState().updateProfile(employeeId, updates);
  },

  // Attendance Service
  getAttendance: (): AttendanceRecord[] => {
    return useHRMSStore.getState().attendance;
  },

  getEmployeeAttendance: (employeeId: string): AttendanceRecord[] => {
    return useHRMSStore.getState().attendance.filter((a) => a.employeeId === employeeId);
  },

  checkIn: (employeeId: string) => {
    useHRMSStore.getState().checkIn(employeeId);
  },

  checkOut: (employeeId: string) => {
    useHRMSStore.getState().checkOut(employeeId);
  },

  // Leave Service
  getLeaveRequests: (): LeaveRequest[] => {
    return useHRMSStore.getState().leaveRequests;
  },

  getEmployeeLeaveRequests: (employeeId: string): LeaveRequest[] => {
    return useHRMSStore.getState().leaveRequests.filter((l) => l.employeeId === employeeId);
  },

  submitLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
    useHRMSStore.getState().submitLeaveRequest(data);
  },

  approveLeaveRequest: (id: string, hrComment: string, hrName: string) => {
    useHRMSStore.getState().approveLeaveRequest(id, hrComment, hrName);
  },

  rejectLeaveRequest: (id: string, hrComment: string, hrName: string) => {
    useHRMSStore.getState().rejectLeaveRequest(id, hrComment, hrName);
  },

  // Payroll Service
  getPayroll: (): PayrollRecord[] => {
    return useHRMSStore.getState().payroll;
  },

  getEmployeePayroll: (employeeId: string): PayrollRecord[] => {
    return useHRMSStore.getState().payroll.filter((p) => p.employeeId === employeeId);
  },

  updateSalary: (employeeId: string, newSalary: Parameters<ReturnType<typeof useHRMSStore.getState>['updateSalary']>[1]) => {
    useHRMSStore.getState().updateSalary(employeeId, newSalary);
  },

  // Notifications Service
  getNotifications: (userId: string): NotificationItem[] => {
    return useHRMSStore.getState().notifications.filter((n) => n.userId === userId || n.userId === 'ALL');
  },

  markAsRead: (id: string) => {
    useHRMSStore.getState().markNotificationAsRead(id);
  },

  markAllAsRead: (userId: string) => {
    useHRMSStore.getState().markAllNotificationsAsRead(userId);
  },
};
