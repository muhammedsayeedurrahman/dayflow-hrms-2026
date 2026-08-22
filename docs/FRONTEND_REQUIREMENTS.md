# Dayflow HRMS — Frontend Requirements Matrix

| ID | Requirement | PDF Section | Page | Frontend Page | API | Status |
|----|-------------|-------------|------|---------------|-----|--------|
| **REQ-AUTH-01** | Sign In with email & password | 3.1.2 | 4 | `src/pages/auth/Login.tsx` | `POST /auth/signin` | IN PROGRESS |
| **REQ-AUTH-02** | Show/Hide password toggle & validation | 3.1.2 | 4 | `src/pages/auth/Login.tsx` | N/A (UI Validation) | IN PROGRESS |
| **REQ-AUTH-03** | Hackathon One-Click Demo Role Login | 3.1.2 | 4 | `src/pages/auth/Login.tsx` | `POST /auth/signin` | IN PROGRESS |
| **REQ-AUTH-04** | Sign Up for employees with role selection | 3.1.1 | 3 | `src/pages/auth/SignUp.tsx` | `POST /auth/signup` | IN PROGRESS |
| **REQ-AUTH-05** | Password security visual rules | 3.1.1 | 3 | `src/pages/auth/SignUp.tsx` | N/A (UI rules matching backend Zod) | IN PROGRESS |
| **REQ-AUTH-06** | Email verification screen with OTP | 3.1.1 | 3 | `src/pages/auth/VerifyEmail.tsx` | `POST /auth/verify-email` | IN PROGRESS |
| **REQ-AUTH-07** | Forgot password reset flow UI | 3.1.2 | 4 | `src/pages/auth/ForgotPassword.tsx` | `POST /auth/forgot-password` (future/mocked) | IN PROGRESS |
| **REQ-DASH-01** | Employee Dashboard quick access cards | 3.2.1 | 5 | `src/pages/employee/EmployeeDashboard.tsx` | `GET /employees/profile` | IN PROGRESS |
| **REQ-DASH-02** | Live attendance status & check-in console | 3.2.1 | 5 | `src/pages/employee/EmployeeDashboard.tsx` | `POST /attendance/check-in`, `POST /attendance/check-out`, `GET /attendance/today` | IN PROGRESS |
| **REQ-DASH-03** | Leave balance metric summary | 3.2.1 | 5 | `src/pages/employee/EmployeeDashboard.tsx` | `GET /leave/me` | IN PROGRESS |
| **REQ-DASH-04** | Next payroll estimate card | 3.2.1 | 5 | `src/pages/employee/EmployeeDashboard.tsx` | `GET /payroll/me` | IN PROGRESS |
| **REQ-DASH-05** | HR / Admin Executive Dashboard | 3.2.2 | 6 | `src/pages/admin/AdminDashboard.tsx` | `GET /employees/stats`, `GET /attendance/stats`, `GET /leave/stats` | IN PROGRESS |
| **REQ-DASH-06** | Company workforce KPI counters | 3.2.2 | 6 | `src/pages/admin/AdminDashboard.tsx` | `GET /employees/stats`, `GET /attendance/stats`, `GET /leave/stats` | IN PROGRESS |
| **REQ-PROF-01** | View personal, job & salary details | 3.3.1 | 7 | `src/pages/employee/ProfilePage.tsx` | `GET /employees/profile` | IN PROGRESS |
| **REQ-PROF-02** | Employee editable fields (Phone, Address, Avatar) | 3.3.2 | 8 | `src/pages/employee/ProfilePage.tsx` | `PUT /employees/profile` | IN PROGRESS |
| **REQ-PROF-03** | HR read-only lock badges (ID, Dept, Designation, Salary) | 3.3.2 | 8 | `src/pages/employee/ProfilePage.tsx` | `GET /employees/profile` | IN PROGRESS |
| **REQ-PROF-04** | HR document repository (ID, Contract, Payslips) | 3.3.1 | 7 | `src/pages/employee/ProfilePage.tsx` | `GET /documents/:employeeId` | IN PROGRESS |
| **REQ-ATTN-01** | Interactive Check-In button with timestamp | 3.4.1 | 9 | `src/pages/employee/AttendancePage.tsx`, `src/pages/employee/EmployeeDashboard.tsx` | `POST /attendance/check-in` | IN PROGRESS |
| **REQ-ATTN-02** | Interactive Check-Out button with work duration | 3.4.1 | 9 | `src/pages/employee/AttendancePage.tsx`, `src/pages/employee/EmployeeDashboard.tsx` | `POST /attendance/check-out` | IN PROGRESS |
| **REQ-ATTN-03** | Status badging (PRESENT, ABSENT, HALF_DAY, ON_LEAVE) | 3.4.1 | 9 | `src/pages/employee/AttendancePage.tsx` | `GET /attendance/me` | IN PROGRESS |
| **REQ-ATTN-04** | Employee historical attendance log with filters | 3.4.2 | 10 | `src/pages/employee/AttendancePage.tsx` | `GET /attendance/me` | IN PROGRESS |
| **REQ-ATTN-05** | HR company-wide attendance matrix | 3.4.2 | 10 | `src/pages/admin/AttendanceAdmin.tsx` | `GET /attendance` | IN PROGRESS |
| **REQ-LEAV-01** | Employee leave application form | 3.5.1 | 11 | `src/pages/employee/LeavePage.tsx` | `POST /leave/apply` | IN PROGRESS |
| **REQ-LEAV-02** | Leave categories (PAID, SICK, UNPAID) | 3.5.1 | 11 | `src/pages/employee/LeavePage.tsx` | `POST /leave/apply` | IN PROGRESS |
| **REQ-LEAV-03** | Automatic leave day duration calculation | 3.5.1 | 11 | `src/pages/employee/LeavePage.tsx` | N/A (UI Calculation) | IN PROGRESS |
| **REQ-LEAV-04** | HR leave approval queue & decision modal | 3.5.2 | 12 | `src/pages/admin/LeaveAdmin.tsx`, `src/pages/admin/AdminDashboard.tsx` | `GET /leave`, `PUT /leave/:id/status` | IN PROGRESS |
| **REQ-LEAV-05** | HR remarks/comment feedback entry | 3.5.2 | 12 | `src/pages/admin/LeaveAdmin.tsx` | `PUT /leave/:id/status` | IN PROGRESS |
| **REQ-LEAV-06** | Real-time state reflection on employee portal | 3.5.2 | 12 | `src/pages/employee/LeavePage.tsx` | `GET /leave/me` | IN PROGRESS |
| **REQ-PAYR-01** | Read-only employee salary breakdown | 3.6.1 | 13 | `src/pages/employee/PayrollPage.tsx` | `GET /payroll/me` | IN PROGRESS |
| **REQ-PAYR-02** | Monthly payment history table | 3.6.1 | 13 | `src/pages/employee/PayrollPage.tsx` | `GET /payroll/me` | IN PROGRESS |
| **REQ-PAYR-03** | Printable digital payslip voucher modal | 3.6.1 | 13 | `src/pages/employee/PayrollPage.tsx` | `GET /payroll/salary-slip` | IN PROGRESS |
| **REQ-PAYR-04** | HR enterprise salary manager & edit modal | 3.6.2 | 14 | `src/pages/admin/PayrollAdmin.tsx` | `GET /payroll`, `PUT /payroll/:employeeId` | IN PROGRESS |
| **REQ-NOTF-01** | In-app notification center dropdown & badge | Section 6 | 15 | `src/components/layout/Topbar.tsx` | `GET /notifications/me`, `PUT /notifications/read-all` | IN PROGRESS |
| **REQ-NOTF-02** | Full notification history page & read filters | Section 6 | 15 | `src/pages/employee/NotificationsPage.tsx` | `GET /notifications/me`, `PUT /notifications/:id/read` | IN PROGRESS |
| **REQ-NOTF-03** | HR global broadcast announcement dispatcher | Section 6 | 15 | `src/pages/admin/NotificationsAdmin.tsx` | `POST /notifications/broadcast` (mocked / future) | IN PROGRESS |
| **REQ-ANLY-01** | Recharts Weekly Attendance Trends (Line chart) | Section 6 | 16 | `src/pages/admin/AnalyticsAdmin.tsx` | `GET /attendance/stats` | IN PROGRESS |
| **REQ-ANLY-02** | Recharts Leave Type Distribution (Donut chart) | Section 6 | 16 | `src/pages/admin/AnalyticsAdmin.tsx` | `GET /leave/stats` | IN PROGRESS |
| **REQ-ANLY-03** | Recharts Department Headcount (Bar chart) | Section 6 | 16 | `src/pages/admin/AnalyticsAdmin.tsx` | `GET /employees/stats` | IN PROGRESS |
| **REQ-ANLY-04** | Recharts Monthly Payroll Expense (Area chart) | Section 6 | 16 | `src/pages/admin/AnalyticsAdmin.tsx` | `GET /payroll/stats` | IN PROGRESS |
| **REQ-SMART-01** | Attendance Anomaly Insights Detector | Differentiator| 17 | `src/pages/admin/AdminDashboard.tsx` | Computed from `GET /attendance/stats` / `GET /attendance` | IN PROGRESS |
| **REQ-SMART-02** | Department Leave Spike Warning | Differentiator| 17 | `src/pages/admin/AdminDashboard.tsx` | Computed from `GET /leave/stats` / `GET /leave` | IN PROGRESS |
| **REQ-SMART-03** | Consolidated HR Action Center | Differentiator| 17 | `src/pages/admin/AdminDashboard.tsx` | `GET /leave` (pending list) | IN PROGRESS |
