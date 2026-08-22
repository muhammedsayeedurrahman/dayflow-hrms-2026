import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { PageLoadingFallback } from './components/ui/LoadingSpinner';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages — eagerly loaded (fast path, always needed)
const Login = lazy(() => import('./pages/auth/Login'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

// Employee Pages — lazy loaded (only when navigated to)
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const ProfilePage = lazy(() => import('./pages/employee/ProfilePage'));
const AttendancePage = lazy(() => import('./pages/employee/AttendancePage'));
const LeavePage = lazy(() => import('./pages/employee/LeavePage'));
const PayrollPage = lazy(() => import('./pages/employee/PayrollPage'));
const NotificationsPage = lazy(() => import('./pages/employee/NotificationsPage'));

// Admin / HR Pages — lazy loaded
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const EmployeeList = lazy(() => import('./pages/admin/EmployeeList'));
const AttendanceAdmin = lazy(() => import('./pages/admin/AttendanceAdmin'));
const LeaveAdmin = lazy(() => import('./pages/admin/LeaveAdmin'));
const PayrollAdmin = lazy(() => import('./pages/admin/PayrollAdmin'));
const AnalyticsAdmin = lazy(() => import('./pages/admin/AnalyticsAdmin'));
const NotificationsAdmin = lazy(() => import('./pages/admin/NotificationsAdmin'));

function App() {
  const { user, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('dayflow_theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Suspense fallback={<PageLoadingFallback />}>
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
    </Suspense>
  );
}

export default App;

