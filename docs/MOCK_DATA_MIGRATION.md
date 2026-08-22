# Dayflow HRMS — Mock Data Migration Log

This document details every occurrence of mock data in the frontend client and tracks the migration process to the live REST API.

| Mock Dataset / Service | Frontend State Variable | Where Used | Backend API Replacement | Migration Status | Removal Status |
|-----------------------|-------------------------|------------|-------------------------|------------------|----------------|
| `INITIAL_EMPLOYEES` | `state.employees` | `hrmsStore.ts` (persisted), imported in Profile, Payroll, EmployeeList, AttendanceAdmin, Analytics | `GET /employees` (Admin directory)<br>`GET /employees/profile` (Employee profile) | IN PROGRESS | PENDING |
| `INITIAL_ATTENDANCE` | `state.attendance` | `hrmsStore.ts`, Employee Dashboard, AttendancePage, AttendanceAdmin | `GET /attendance/me` (Employee history)<br>`GET /attendance` (Admin list)<br>`GET /attendance/today` (Quick status) | IN PROGRESS | PENDING |
| `INITIAL_LEAVE_REQUESTS` | `state.leaveRequests` | `hrmsStore.ts`, LeavePage, LeaveAdmin, AdminDashboard, Analytics | `GET /leave/me` (Employee leaves)<br>`GET /leave` (HR queue) | IN PROGRESS | PENDING |
| `INITIAL_PAYROLL` | `state.payroll` | `hrmsStore.ts`, PayrollPage, PayrollAdmin, Analytics | `GET /payroll/me` (Employee view)<br>`GET /payroll` (HR list) | IN PROGRESS | PENDING |
| `INITIAL_NOTIFICATIONS` | `state.notifications` | `hrmsStore.ts`, Topbar, NotificationsPage, NotificationsAdmin | `GET /notifications/me` (My notifications) | IN PROGRESS | PENDING |
| `INITIAL_INSIGHTS` | `state.insights` | `hrmsStore.ts`, AdminDashboard | Dynamically computed from `GET /attendance/stats` & `GET /leave/stats` | IN PROGRESS | PENDING |
| `DEMO_EMPLOYEE_USER` | N/A | `authStore.ts` (default auth user state) | Real login endpoint payload: `POST /auth/signin` | IN PROGRESS | PENDING |
| `DEMO_HR_USER` | N/A | `authStore.ts` (default auth user state) | Real login endpoint payload: `POST /auth/signin` | IN PROGRESS | PENDING |

## Deletion Checklist

Before deleting any mock data files:
1. [ ] Check all references to `hrmsStore.ts` and `mockData.ts` are resolved.
2. [ ] Verify that Zustand state fields are populated via API fetches on page mount or layout mounts.
3. [ ] Run `npm run build` in `client/` to verify zero compile-time references to `mockData.ts`.
4. [ ] Run application manually and ensure no pages block or spinner-lock.
5. [ ] Safely delete `client/src/data/mockData.ts`.
