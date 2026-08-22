import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

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
  getEmployeeAttendance: (id: string, startDate?: string, endDate?: string) =>
    api.get(`/employees/${id}/attendance`, { params: { startDate, endDate } }),
  updateEmployee: (id: string, data: any) => api.put(`/employees/${id}`, data),
  getStats: () => api.get('/employees/stats'),
};

// Attendance API
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getTodayStatus: () => api.get('/attendance/today'),
  getMyAttendance: (startDate?: string, endDate?: string) =>
    api.get('/attendance/me', { params: { startDate, endDate } }),
  getAllAttendance: (employeeId?: string, startDate?: string, endDate?: string) =>
    api.get('/attendance', { params: { employeeId, startDate, endDate } }),
  getStats: (startDate?: string, endDate?: string) =>
    api.get('/attendance/stats', { params: { startDate, endDate } }),
};

// Leave API
export const leaveAPI = {
  applyLeave: (data: any) => api.post('/leave/apply', data),
  getMyLeaves: () => api.get('/leave/me'),
  getAllLeaves: (status?: string, employeeId?: string) =>
    api.get('/leave', { params: { status, employeeId } }),
  updateLeaveStatus: (id: string, status: string, comments?: string) =>
    api.put(`/leave/${id}/status`, { status, comments }),
  getStats: () => api.get('/leave/stats'),
};

// Payroll API
export const payrollAPI = {
  getMyPayroll: () => api.get('/payroll/me'),
  getAllPayroll: () => api.get('/payroll'),
  updatePayroll: (employeeId: string, data: any) =>
    api.put(`/payroll/${employeeId}`, data),
  getSalarySlip: (month: number, year: number) =>
    api.get('/payroll/salary-slip', { params: { month, year } }),
  getStats: () => api.get('/payroll/stats'),
};

// Notification API
export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications/me'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Document API
export const documentAPI = {
  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getEmployeeDocuments: (employeeId: string) =>
    api.get(`/documents/employee/${employeeId}`),
  getAllDocuments: (documentType?: string, employeeId?: string) =>
    api.get('/documents', { params: { documentType, employeeId } }),
  download: (id: string) =>
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/documents/${id}`),
};
