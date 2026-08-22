import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signUp: (data: any) => api.post('/auth/signup', data),
  signIn: (email: string, password: string) =>
    api.post('/auth/signin', { email, password }),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
};

// Employee API
export const employeeAPI = {
  getProfile: () => api.get('/employees/profile'),
  updateProfile: (data: any) => api.put('/employees/profile', data),
  getAllEmployees: () => api.get('/employees'),
  getEmployeeById: (id: string) => api.get(`/employees/${id}`),
};

// Attendance API
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getMyAttendance: (startDate?: string, endDate?: string) =>
    api.get('/attendance/me', { params: { startDate, endDate } }),
  getAllAttendance: (employeeId?: string) =>
    api.get('/attendance', { params: { employeeId } }),
};

// Leave API
export const leaveAPI = {
  applyLeave: (data: any) => api.post('/leave/apply', data),
  getMyLeaves: () => api.get('/leave/me'),
  getAllLeaves: () => api.get('/leave'),
  updateLeaveStatus: (id: string, status: string, comments?: string) =>
    api.put(`/leave/${id}/status`, { status, comments }),
};

// Payroll API
export const payrollAPI = {
  getMyPayroll: () => api.get('/payroll/me'),
  getAllPayroll: () => api.get('/payroll'),
  updatePayroll: (employeeId: string, data: any) =>
    api.put(`/payroll/${employeeId}`, data),
  getSalarySlip: (month: number, year: number) =>
    api.get('/payroll/salary-slip', { params: { month, year } }),
};

// Notification API
export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications/me'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};
