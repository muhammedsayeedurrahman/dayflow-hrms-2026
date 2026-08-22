# Dayflow Backend API

Base URL: `http://localhost:5000/api`. Protected endpoints require `Authorization: Bearer <JWT>`.

| Area | Method and path | Access | Notes |
| --- | --- | --- | --- |
| Health | `GET /health` | Public | Service status |
| Auth | `POST /auth/signup`, `POST /auth/signin`, `GET /auth/verify` | Public, Public, Authenticated | Public signup provisions `EMPLOYEE` only |
| Employees | `GET/PUT /employees/profile` | Authenticated | Current user's profile |
| Employees | `GET /employees`, `GET/PUT /employees/:id` | HR, ADMIN | Directory and management |
| Attendance | `POST /attendance/check-in`, `POST /attendance/check-out`, `GET /attendance/today`, `GET /attendance/me` | Authenticated | Current user's records |
| Attendance | `GET /attendance` | HR, ADMIN | Company records |
| Leave | `POST /leave/apply`, `GET /leave/me` | Authenticated | Current user's requests |
| Leave | `GET /leave`, `PUT /leave/:id/status` | HR, ADMIN | Review workflow |
| Payroll | `GET /payroll/me` | Authenticated | Current user's payroll |
| Payroll | `GET /payroll`, `PUT /payroll/:employeeId` | HR, ADMIN | Payroll management |
| Notifications | `GET /notifications/me`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` | Authenticated | A user may only mark their own notification |

## Analytics

All analytics routes are restricted to `HR` and `ADMIN` and return `{ "success": true, "data": ... }`.

| Endpoint | Response highlights |
| --- | --- |
| `GET /attendance/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` | `summary` (`present`, `absent`, `halfDay`, `leave`), daily `trends`, department breakdown |
| `GET /leave/stats` | `byType`, `byStatus`, department breakdown |
| `GET /employees/stats` | `total`, `active`, `inactive`, department and designation breakdowns |
| `GET /payroll/stats` | `totalGross`, `totalNet`, `averageGross`, `averageNet`, department breakdown |

Attendance date filters are strict `YYYY-MM-DD` calendar dates interpreted in UTC. The end date is inclusive. Missing filters on `/attendance/stats` select the last 30 UTC calendar days. Invalid dates or reversed ranges return HTTP 400.

## Errors and local verification

Errors use `{ "success": false, "error": { "message": "..." } }`. Validation failures additionally contain a safe `errors` array. Stack traces and database internals are not returned to clients.

From `server/`, run `npm.cmd run build`, `npx.cmd prisma validate`, then start the API and run `bash test-api.sh`. The smoke suite is read-mostly and does not create attendance or leave records.
