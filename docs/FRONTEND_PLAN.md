# Dayflow HRMS — Frontend Execution Plan

This plan outlines the priority-based integration process to replace the mock data layer with the live Express API.

## Priority Checklist

### P0 — Authentication & Session Guards (Hour 1)
- [ ] Connect `client/src/pages/auth/Login.tsx` to `authAPI.signIn()`
- [ ] Connect `client/src/pages/auth/SignUp.tsx` to `authAPI.signUp()`
- [ ] Connect `client/src/pages/auth/VerifyEmail.tsx` to `authAPI.verifyEmail()`
- [ ] Update `useAuthStore` to initialize with null state (no default demo user bypass)
- [ ] Wire judge shortcut buttons in Login to perform API-driven sign-in with seeded accounts:
  - Employee: `john@dayflow.com` / `Password123`
  - HR Lead: `hr@dayflow.com` / `Password123`
- [ ] Implement expired session and 401 response handling redirection to `/login`

### P1 — Employee Dashboard & Core Attendance (Hour 2)
- [ ] Connect `client/src/pages/employee/EmployeeDashboard.tsx` to fetch:
  - Employee Profile details (name, job, department)
  - Today's Attendance status (checked-in time, checked-out time, work hours)
  - Leave Requests summaries
  - Notifications list
  - Recent activities feed
- [ ] Connect Check-In and Check-Out actions to `attendanceAPI.checkIn()` and `attendanceAPI.checkOut()`

### P2 — Employee Attendance, Leave, Profile & Payroll (Hours 3-4)
- [ ] **Attendance history page**: Fetch attendance logs from `attendanceAPI.getMyAttendance()`, display status badges.
- [ ] **Leave page**: Apply leave via `leaveAPI.applyLeave()`, display history list from `leaveAPI.getMyLeaves()`, show HR comments.
- [ ] **Profile page**: Fetch details from `employeeAPI.getProfile()`, allow editing Phone, Address, Avatar via `employeeAPI.updateProfile()`.
- [ ] **Payroll page**: Fetch payslip details from `payrollAPI.getMyPayroll()`.

### P3 — Admin Dashboard & Leave Approval (Hours 5-6)
- [ ] **Admin Dashboard KPIs**: Fetch live workforce counters (total active employees, present today, on leave, pending requests).
- [ ] **Leave Admin page**: Fetch leave queue via `leaveAPI.getAllLeaves()`, implement approve/reject modals with comment submissions via `leaveAPI.updateLeaveStatus()`.
- [ ] **Employee directory**: Fetch directory from `employeeAPI.getAllEmployees()`, details view, edit profiles.
- [ ] **Payroll Admin page**: Fetch all employee structures via `payrollAPI.getAllPayroll()`, allow editing basic, hra, conveyance, allowances, pf, tax.

### P4 — Recharts Analytics & HR Insights (Hour 7)
- [ ] **Analytics charts**: Connect Recharts graphs to backend stats:
  - Attendance Trends (Line chart) -> `GET /attendance/stats`
  - Leave Type Distribution (Donut chart) -> `GET /leave/stats`
  - Department Headcount (Bar chart) -> `GET /employees/stats`
  - Monthly Payroll Expense (Area chart) -> `GET /payroll/stats`
- [ ] **Smart HR Insights**: Run frontend alert calculations or use stats data to display anomaly detection (absence rates > 15%), spike warnings, and action centers.

### P5 — Mock Data Cleanup & QA (Hour 8)
- [ ] Audit imports, remove all references to `useHRMSStore` or mock data variables.
- [ ] Test mobile responsiveness, keyboard focus, semantic tags.
- [ ] Verify cross-role leave request flow (Employee submits leave -> HR approves -> Employee gets notified & status updates).
