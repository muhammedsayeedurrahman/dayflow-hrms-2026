import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ProfilePage from './pages/employee/ProfilePage';
import AttendancePage from './pages/employee/AttendancePage';
import LeavePage from './pages/employee/LeavePage';
import PayrollPage from './pages/employee/PayrollPage';
import NotificationsPage from './pages/employee/NotificationsPage';

// Admin / HR Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeList from './pages/admin/EmployeeList';
import AttendanceAdmin from './pages/admin/AttendanceAdmin';
import LeaveAdmin from './pages/admin/LeaveAdmin';
import PayrollAdmin from './pages/admin/PayrollAdmin';
import AnalyticsAdmin from './pages/admin/AnalyticsAdmin';
import NotificationsAdmin from './pages/admin/NotificationsAdmin';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected App Shell Layout Routes */}
      <Route
        element={
          isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
        }
      >
        {/* Employee Routes */}
        <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/profile" element={<ProfilePage />} />
        <Route path="/employee/attendance" element={<AttendancePage />} />
        <Route path="/employee/leave" element={<LeavePage />} />
        <Route path="/employee/payroll" element={<PayrollPage />} />
        <Route path="/employee/notifications" element={<NotificationsPage />} />

        {/* HR / Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<EmployeeList />} />
        <Route path="/admin/attendance" element={<AttendanceAdmin />} />
        <Route path="/admin/leave" element={<LeaveAdmin />} />
        <Route path="/admin/payroll" element={<PayrollAdmin />} />
        <Route path="/admin/analytics" element={<AnalyticsAdmin />} />
        <Route path="/admin/notifications" element={<NotificationsAdmin />} />
      </Route>

      {/* Default Catch-All Route */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            user?.role === 'HR' || user?.role === 'ADMIN' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/employee/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
