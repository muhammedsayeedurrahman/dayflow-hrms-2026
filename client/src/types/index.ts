export type Role = 'EMPLOYEE' | 'HR' | 'ADMIN';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: Role;
  fullName: string;
  department?: string;
  designation?: string;
  avatarUrl?: string;
}

export interface SalaryStructure {
  basic: number;
  hra: number;
  specialAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  grossSalary: number;
  netSalary: number;
  effectiveDate: string;
}

export interface HRDocument {
  id: string;
  title: string;
  category: 'ID' | 'Offer Letter' | 'Payslip' | 'Policy' | 'Contract';
  fileUrl: string;
  uploadDate: string;
  size: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  status: 'Active' | 'On Leave' | 'Terminated';
  managerName: string;
  avatarUrl: string;
  salary: SalaryStructure;
  documents: HRDocument[];
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:MM AM/PM
  checkOut: string | null; // HH:MM AM/PM
  workHours: number;
  status: AttendanceStatus;
  notes?: string;
}

export type LeaveType = 'PAID' | 'SICK' | 'UNPAID' | 'CASUAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  hrComment?: string;
  reviewedBy?: string;
  reviewedOn?: string;
}

export interface LeaveBalance {
  paid: number;
  sick: number;
  unpaid: number;
  totalUsed: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string; // e.g., "August 2026"
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'Paid' | 'Processing' | 'Pending';
  paymentDate: string;
  payslipId?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'ALL' or specific employeeId
  title: string;
  message: string;
  type: 'LEAVE' | 'ATTENDANCE' | 'PAYROLL' | 'PROFILE' | 'SYSTEM';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface SmartInsight {
  id: string;
  title: string;
  category: 'ANOMALY' | 'LEAVE_SPIKE' | 'HR_ACTION';
  description: string;
  severity: 'high' | 'medium' | 'low';
  actionText?: string;
  count?: number;
  affectedEmployees?: string[];
}
