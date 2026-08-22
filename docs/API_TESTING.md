# API Testing Guide

Complete guide for testing all Dayflow HRMS API endpoints.

## Prerequisites

- Backend server running (`npm run dev` in `server/` directory)
- Database seeded with test data (`npm run prisma:seed`)
- `curl` installed (or Postman/Insomnia for GUI testing)

## Quick Test

Run the automated test suite:

```bash
cd server
chmod +x test-api.sh
./test-api.sh
```

Expected output: `ALL TESTS PASSED (30+ endpoints)`

## Manual Testing

### Base URL

```
Local: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| HR Admin | hr@dayflow.com | Test@123 |
| Employee 1 | employee1@dayflow.com | Test@123 |
| Employee 2-10 | employee2-10@dayflow.com | Test@123 |

## API Endpoints

### 1. Authentication

#### Health Check
```bash
curl http://localhost:5000/api/health
```
**Expected:** `200 OK`

#### Sign In
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@dayflow.com",
    "password": "Test@123"
  }'
```
**Expected:** `200 OK` with JWT token

#### Verify Token
```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with user data

#### Sign Up (New User)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP999",
    "email": "newuser@dayflow.com",
    "password": "SecurePass@123",
    "firstName": "New",
    "lastName": "User",
    "role": "EMPLOYEE"
  }'
```
**Expected:** `201 Created` with JWT token

---

### 2. Employee Endpoints

**Note:** Replace `YOUR_TOKEN` with actual JWT token from sign-in

#### Get My Profile
```bash
curl -X GET http://localhost:5000/api/employees/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with employee profile

#### Update My Profile
```bash
curl -X PUT http://localhost:5000/api/employees/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001"
  }'
```
**Expected:** `200 OK` with updated profile

#### Get All Employees (HR/Admin only)
```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with employee list

#### Get Employee by ID (HR/Admin only)
```bash
curl -X GET http://localhost:5000/api/employees/EMPLOYEE_ID \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with employee data

#### Get Employee Attendance (NEW)
```bash
# HR can view any employee's attendance
curl -X GET http://localhost:5000/api/employees/EMPLOYEE_ID/attendance \
  -H "Authorization: Bearer HR_TOKEN"

# With date filters
curl -X GET "http://localhost:5000/api/employees/EMPLOYEE_ID/attendance?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer HR_TOKEN"

# Employee can view their own attendance
curl -X GET http://localhost:5000/api/employees/THEIR_ID/attendance \
  -H "Authorization: Bearer EMP_TOKEN"
```
**Expected:** `200 OK` with attendance records

#### Update Employee (HR/Admin only)
```bash
curl -X PUT http://localhost:5000/api/employees/EMPLOYEE_ID \
  -H "Authorization: Bearer HR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "Senior Developer",
    "department": "Engineering",
    "phone": "+9876543210"
  }'
```
**Expected:** `200 OK` with updated employee

#### Get Employee Statistics (HR/Admin only)
```bash
curl -X GET http://localhost:5000/api/employees/stats \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with stats (total, by department, by designation)

---

### 3. Attendance Endpoints

#### Check In
```bash
curl -X POST http://localhost:5000/api/attendance/check-in \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with attendance record

#### Check Out
```bash
curl -X POST http://localhost:5000/api/attendance/check-out \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with work hours calculated

#### Get Today's Status
```bash
curl -X GET http://localhost:5000/api/attendance/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with today's attendance or `null`

#### Get My Attendance
```bash
# All attendance
curl -X GET http://localhost:5000/api/attendance/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# With date range
curl -X GET "http://localhost:5000/api/attendance/me?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with attendance records

#### Get All Attendance (HR/Admin only)
```bash
# All attendance
curl -X GET http://localhost:5000/api/attendance \
  -H "Authorization: Bearer HR_TOKEN"

# Filter by employee
curl -X GET "http://localhost:5000/api/attendance?employeeId=EMPLOYEE_ID" \
  -H "Authorization: Bearer HR_TOKEN"

# Filter by date range
curl -X GET "http://localhost:5000/api/attendance?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with attendance records

#### Get Attendance Statistics (HR/Admin only)
```bash
curl -X GET http://localhost:5000/api/attendance/stats \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with stats (summary, trends, by department)

---

### 4. Leave Endpoints

#### Apply for Leave
```bash
curl -X POST http://localhost:5000/api/leave/apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "PAID",
    "startDate": "2024-12-25",
    "endDate": "2024-12-27",
    "reason": "Personal work"
  }'
```
**Expected:** `201 Created` with leave request

#### Get My Leaves
```bash
curl -X GET http://localhost:5000/api/leave/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with leave requests

#### Get All Leaves (HR/Admin only)
```bash
# All leaves
curl -X GET http://localhost:5000/api/leave \
  -H "Authorization: Bearer HR_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/leave?status=PENDING" \
  -H "Authorization: Bearer HR_TOKEN"

# Filter by employee
curl -X GET "http://localhost:5000/api/leave?employeeId=EMPLOYEE_ID" \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with leave requests

#### Approve/Reject Leave (HR/Admin only)
```bash
# Approve
curl -X PUT http://localhost:5000/api/leave/LEAVE_REQUEST_ID/status \
  -H "Authorization: Bearer HR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "comments": "Approved for personal work"
  }'

# Reject
curl -X PUT http://localhost:5000/api/leave/LEAVE_REQUEST_ID/status \
  -H "Authorization: Bearer HR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "comments": "Team capacity constraints"
  }'
```
**Expected:** `200 OK` with updated leave request
**Note:** Email notification sent to employee (if SMTP configured)

#### Get Leave Statistics (HR/Admin only)
```bash
curl -X GET http://localhost:5000/api/leave/stats \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with stats (by type, status, department)

---

### 5. Payroll Endpoints

#### Get My Payroll
```bash
curl -X GET http://localhost:5000/api/payroll/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with payroll data

#### Get All Payroll (HR/Admin only)
```bash
curl -X GET http://localhost:5000/api/payroll \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with all payroll records

#### Update Employee Payroll (HR/Admin only)
```bash
curl -X PUT http://localhost:5000/api/payroll/EMPLOYEE_ID \
  -H "Authorization: Bearer HR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "basicSalary": 50000,
    "hra": 15000,
    "allowances": 10000,
    "providentFund": 6000,
    "tax": 8000
  }'
```
**Expected:** `200 OK` with updated payroll

#### Get Payroll Statistics (HR/Admin only)
```bash
curl -X GET http://localhost:5000/api/payroll/stats \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with stats (total, average, by department)

---

### 6. Notification Endpoints

#### Get My Notifications
```bash
curl -X GET http://localhost:5000/api/notifications/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with notifications

#### Mark Notification as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK`

#### Mark All as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK`

---

### 7. Document Endpoints

#### Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@/path/to/file.pdf" \
  -F "employeeId=EMPLOYEE_ID" \
  -F "documentType=CONTRACT" \
  -F "description=Employment contract"
```
**Expected:** `201 Created` with document record

**Document Types:** CONTRACT, ID_PROOF, EDUCATION, EXPERIENCE, PAYSLIP, OTHER

#### Get Employee Documents
```bash
curl -X GET http://localhost:5000/api/documents/employee/EMPLOYEE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK` with document list

#### Get All Documents (HR/Admin only)
```bash
# All documents
curl -X GET http://localhost:5000/api/documents \
  -H "Authorization: Bearer HR_TOKEN"

# Filter by type
curl -X GET "http://localhost:5000/api/documents?documentType=CONTRACT" \
  -H "Authorization: Bearer HR_TOKEN"

# Filter by employee
curl -X GET "http://localhost:5000/api/documents?employeeId=EMPLOYEE_ID" \
  -H "Authorization: Bearer HR_TOKEN"
```
**Expected:** `200 OK` with documents

#### Download Document
```bash
curl -X GET http://localhost:5000/api/documents/DOCUMENT_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output downloaded-file.pdf
```
**Expected:** `200 OK` with file content

#### Delete Document
```bash
curl -X DELETE http://localhost:5000/api/documents/DOCUMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** `200 OK`

---

## Authorization Matrix

| Endpoint | Employee | HR/Admin |
|----------|----------|----------|
| GET /employees/profile | ✅ Own only | ✅ All |
| PUT /employees/profile | ✅ Own only | ✅ All |
| GET /employees | ❌ | ✅ |
| GET /employees/:id | ❌ | ✅ |
| GET /employees/:id/attendance | ✅ Own only | ✅ All |
| PUT /employees/:id | ❌ | ✅ |
| GET /employees/stats | ❌ | ✅ |
| POST /attendance/check-in | ✅ | ✅ |
| POST /attendance/check-out | ✅ | ✅ |
| GET /attendance/today | ✅ | ✅ |
| GET /attendance/me | ✅ | ✅ |
| GET /attendance | ❌ | ✅ |
| GET /attendance/stats | ❌ | ✅ |
| POST /leave/apply | ✅ | ✅ |
| GET /leave/me | ✅ | ✅ |
| GET /leave | ❌ | ✅ |
| PUT /leave/:id/status | ❌ | ✅ |
| GET /leave/stats | ❌ | ✅ |
| GET /payroll/me | ✅ | ✅ |
| GET /payroll | ❌ | ✅ |
| PUT /payroll/:employeeId | ❌ | ✅ |
| GET /payroll/stats | ❌ | ✅ |
| GET /notifications/me | ✅ | ✅ |
| PUT /notifications/:id/read | ✅ | ✅ |
| PUT /notifications/read-all | ✅ | ✅ |
| POST /documents/upload | ✅ Own only | ✅ All |
| GET /documents/employee/:id | ✅ Own only | ✅ All |
| GET /documents | ❌ | ✅ |
| GET /documents/:id/download | ✅ Own only | ✅ All |
| DELETE /documents/:id | ✅ Own only | ✅ All |

---

## Testing Scenarios

### Scenario 1: Employee Daily Workflow

1. Sign in
2. Check today's attendance status
3. Check in
4. View attendance history
5. Check out
6. View notifications
7. Apply for leave

### Scenario 2: HR Leave Approval Workflow

1. Sign in as HR
2. Get pending leaves
3. Review leave details
4. Approve/reject leave
5. Verify notification sent to employee
6. Check leave statistics

### Scenario 3: HR Payroll Management

1. Sign in as HR
2. Get all employees
3. Select employee
4. Update payroll
5. Verify payroll statistics updated

### Scenario 4: Document Management

1. Upload document
2. View documents
3. Download document
4. Delete document

---

## Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 200 | Success | Resource retrieved |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database error |

---

## Postman Collection

Import this collection for GUI testing:

```json
{
  "info": {
    "name": "Dayflow HRMS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "hrToken",
      "value": ""
    },
    {
      "key": "empToken",
      "value": ""
    }
  ]
}
```

1. Import collection into Postman
2. Run "HR Sign In" to set `hrToken`
3. Run "Employee Sign In" to set `empToken`
4. Test other endpoints

---

## Continuous Integration

Add to `.github/workflows/test.yml`:

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd server
          npm install

      - name: Setup database
        run: |
          cd server
          npx prisma generate
          npx prisma migrate dev
          npm run prisma:seed

      - name: Start server
        run: |
          cd server
          npm run dev &
          sleep 5

      - name: Run API tests
        run: |
          cd server
          chmod +x test-api.sh
          ./test-api.sh
```

---

## Performance Testing

Use Apache Bench for load testing:

```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/employees

# POST request
ab -n 100 -c 10 -p payload.json -T application/json -H "Authorization: Bearer TOKEN" http://localhost:5000/api/leave/apply
```

---

## Security Testing

### Test Invalid Tokens
```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer invalid-token"
```
**Expected:** `401 Unauthorized`

### Test Missing Authorization
```bash
curl -X GET http://localhost:5000/api/employees
```
**Expected:** `401 Unauthorized`

### Test Role Escalation
```bash
# Employee trying to access HR endpoint
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"
```
**Expected:** `403 Forbidden`

### Test SQL Injection
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dayflow.com OR 1=1--","password":"anything"}'
```
**Expected:** `401 Unauthorized` (not SQL error)

---

## Troubleshooting

### Tests Failing?

1. **Server not running**: Start server with `npm run dev`
2. **Database not seeded**: Run `npm run prisma:seed`
3. **Port in use**: Check if port 5000 is available
4. **Token expired**: Re-authenticate to get new token
5. **CORS errors**: Check ALLOWED_ORIGINS in .env

### Common Errors

**Error: ECONNREFUSED**
```
Solution: Ensure server is running on correct port
```

**Error: 401 Unauthorized**
```
Solution: Check JWT token is valid and not expired
```

**Error: 403 Forbidden**
```
Solution: Verify user has required role (HR/ADMIN) for endpoint
```

---

## Next Steps

1. ✅ Run automated test suite
2. ✅ Test all endpoints manually
3. ✅ Verify authorization matrix
4. ✅ Test error scenarios
5. ✅ Performance testing
6. ✅ Security audit
7. ✅ Document any bugs found

## Support

- API Documentation: `/docs/API.md`
- README: `/README.md`
- GitHub Issues: https://github.com/muhammedsayeedurrahman/dayflow-hrms-2026/issues
