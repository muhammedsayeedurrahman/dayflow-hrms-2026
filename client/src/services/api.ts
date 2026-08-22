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
  broadcastNotification: (title: string, message: string) =>
    api.post('/notifications/broadcast', { title, message }),
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

// AI Insights API
export const aiInsightsAPI = {
  generateInsights: () => api.post('/ai/insights/generate'),
  getAllInsights: (type?: string, riskLevel?: string, isActive?: boolean) =>
    api.get('/ai/insights', { params: { type, riskLevel, isActive } }),
  getEmployeeInsights: (employeeId: string) =>
    api.get(`/ai/insights/employee/${employeeId}`),
  acknowledgeInsight: (id: string) => api.put(`/ai/insights/${id}/acknowledge`),
  getAttritionStats: () => api.get('/ai/insights/attrition/stats'),
};

// Skills API
export const skillsAPI = {
  createSkill: (data: any) => api.post('/skills', data),
  getAllSkills: (category?: string, department?: string) =>
    api.get('/skills', { params: { category, department } }),
  updateEmployeeSkills: (employeeId: string, skills: any[]) =>
    api.put(`/skills/employee/${employeeId}`, { skills }),
  getEmployeeSkills: (employeeId: string) => api.get(`/skills/employee/${employeeId}`),
  getSkillsMatrix: (department?: string) =>
    api.get('/skills/matrix', { params: { department } }),
  analyzeSkillGaps: (employeeId: string, roleTitle: string, requiredSkills: any[]) =>
    api.post(`/skills/employee/${employeeId}/gap-analysis`, { roleTitle, requiredSkills }),
  getStats: () => api.get('/skills/stats'),
};

// Performance API (OKRs & 360 Feedback)
export const performanceAPI = {
  createGoal: (data: any) => api.post('/performance/goals', data),
  getAllGoals: (employeeId?: string, quarter?: string) =>
    api.get('/performance/goals', { params: { employeeId, quarter } }),
  updateGoalProgress: (id: string, progress: number, keyResults: any[]) =>
    api.put(`/performance/goals/${id}/progress`, { progress, keyResults }),
  createFeedbackRequest: (data: any) => api.post('/performance/feedback/request', data),
  submitFeedback: (requestId: string, answers: any[]) =>
    api.post(`/performance/feedback/${requestId}/submit`, { answers }),
  getFeedbackRequests: () => api.get('/performance/feedback/requests'),
};

// Onboarding API
export const onboardingAPI = {
  createTemplate: (data: any) => api.post('/onboarding/templates', data),
  startJourney: (employeeId: string, templateId?: string) =>
    api.post('/onboarding/journey', { employeeId, templateId }),
  updateTask: (journeyId: string, taskIndex: number, completed: boolean) =>
    api.put(`/onboarding/journey/${journeyId}/task/${taskIndex}`, { completed }),
  getJourney: (employeeId: string) => api.get(`/onboarding/journey/${employeeId}`),
  getAllJourneys: () => api.get('/onboarding/journeys'),
};

// Shift Scheduling API
export const shiftAPI = {
  createShift: (data: any) => api.post('/shifts', data),
  assignShift: (id: string, employeeId: string) => api.put(`/shifts/${id}/assign`, { employeeId }),
  getShifts: (date?: string, department?: string) =>
    api.get('/shifts', { params: { date, department } }),
  requestSwap: (shiftId: string, targetEmployeeId?: string, reason?: string) =>
    api.post('/shifts/swap/request', { shiftId, targetEmployeeId, reason }),
};

// Expense Management API
export const expenseAPI = {
  submitClaim: (data: any) => api.post('/expenses', data),
  getAllClaims: (status?: string) => api.get('/expenses', { params: { status } }),
  approveClaim: (id: string) => api.put(`/expenses/${id}/approve`),
  rejectClaim: (id: string, reason: string) =>
    api.put(`/expenses/${id}/reject`, { reason }),
};

// Learning & Development API
export const learningAPI = {
  createCourse: (data: any) => api.post('/courses', data),
  getAllCourses: () => api.get('/courses'),
  enrollEmployee: (courseId: string, employeeId: string) =>
    api.post('/courses/enroll', { courseId, employeeId }),
  updateProgress: (enrollmentId: string, progress: number) =>
    api.put(`/courses/enrollment/${enrollmentId}/progress`, { progress }),
  getMyCourses: () => api.get('/courses/my-courses'),
};

// Recruitment API (ATS Lite)
export const recruitmentAPI = {
  createJob: (data: any) => api.post('/jobs', data),
  getAllJobs: (status?: string) => api.get('/jobs', { params: { status } }),
  getCandidates: (jobId: string, stage?: string) =>
    api.get(`/jobs/${jobId}/candidates`, { params: { stage } }),
  updateCandidateStage: (candidateId: string, stage: string) =>
    api.put(`/candidates/${candidateId}/stage`, { stage }),
};

// Well-Being API
export const wellBeingAPI = {
  createProgram: (data: any) => api.post('/wellness/programs', data),
  getAllPrograms: () => api.get('/wellness/programs'),
  logActivity: (data: any) => api.post('/wellness/activity', data),
  getMyActivities: () => api.get('/wellness/my-activities'),
};

// Time Tracking API
export const timeTrackingAPI = {
  createProject: (data: any) => api.post('/projects', data),
  getAllProjects: () => api.get('/projects'),
  logTime: (data: any) => api.post('/time-entries', data),
  getMyTimeEntries: (startDate?: string, endDate?: string) =>
    api.get('/time-entries/me', { params: { startDate, endDate } }),
  approveTimeEntry: (id: string) => api.put(`/time-entries/${id}/approve`),
};
