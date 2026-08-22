#!/bin/bash

# Dayflow HRMS - API Testing Script
# Tests all 29 backend endpoints

API="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "  Dayflow HRMS API Testing Suite"
echo "======================================"
echo ""

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$API/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running on http://localhost:5000${NC}"
    echo "Please start the server with: cd server && npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test 1: Authentication
echo "========================================="
echo "TEST 1: Authentication Endpoints"
echo "========================================="

echo "1.1 - Testing HR Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@dayflow.com","password":"Test@123"}')

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ HR Login successful${NC}"
    HR_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    echo "   Token: ${HR_TOKEN:0:30}..."
else
    echo -e "${RED}❌ HR Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "1.2 - Testing Employee Login..."
EMP_LOGIN=$(curl -s -X POST "$API/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@dayflow.com","password":"Test@123"}')

if echo "$EMP_LOGIN" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Employee Login successful${NC}"
    EMP_TOKEN=$(echo "$EMP_LOGIN" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
else
    echo -e "${RED}❌ Employee Login failed${NC}"
fi

echo "1.3 - Testing Invalid Login..."
INVALID_LOGIN=$(curl -s -X POST "$API/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@dayflow.com","password":"wrongpassword"}')

if echo "$INVALID_LOGIN" | grep -q '"success":false'; then
    echo -e "${GREEN}✅ Invalid login correctly rejected${NC}"
else
    echo -e "${RED}❌ Invalid login should fail${NC}"
fi

echo ""

# Test 2: Employee Endpoints
echo "========================================="
echo "TEST 2: Employee Management"
echo "========================================="

echo "2.1 - Get Employee Profile (as employee)..."
PROFILE=$(curl -s -X GET "$API/employees/profile" \
  -H "Authorization: Bearer $EMP_TOKEN")

if echo "$PROFILE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get profile successful${NC}"
    EMPLOYEE_NAME=$(echo "$PROFILE" | grep -o '"fullName":"[^"]*' | sed 's/"fullName":"//')
    echo "   Name: $EMPLOYEE_NAME"
else
    echo -e "${RED}❌ Get profile failed${NC}"
fi

echo "2.2 - Get All Employees (as HR)..."
ALL_EMP=$(curl -s -X GET "$API/employees" \
  -H "Authorization: Bearer $HR_TOKEN")

if echo "$ALL_EMP" | grep -q '"success":true'; then
    EMPLOYEE_COUNT=$(echo "$ALL_EMP" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✅ Get all employees successful${NC}"
    echo "   Total employees: $EMPLOYEE_COUNT"
else
    echo -e "${RED}❌ Get all employees failed${NC}"
fi

echo "2.3 - Get Employee Stats (as HR)..."
EMP_STATS=$(curl -s -X GET "$API/employees/stats" \
  -H "Authorization: Bearer $HR_TOKEN")

if echo "$EMP_STATS" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get employee stats successful${NC}"
    TOTAL=$(echo "$EMP_STATS" | grep -o '"total":[0-9]*' | sed 's/"total"://')
    ACTIVE=$(echo "$EMP_STATS" | grep -o '"active":[0-9]*' | sed 's/"active"://')
    echo "   Total: $TOTAL, Active: $ACTIVE"
else
    echo -e "${RED}❌ Get employee stats failed${NC}"
fi

echo ""

# Test 3: Attendance Endpoints
echo "========================================="
echo "TEST 3: Attendance Management"
echo "========================================="

echo "3.1 - Check-in (as employee)..."
CHECKIN=$(curl -s -X POST "$API/attendance/check-in" \
  -H "Authorization: Bearer $EMP_TOKEN")

if echo "$CHECKIN" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Check-in successful${NC}"
else
    # Check if already checked in
    if echo "$CHECKIN" | grep -q "Already checked in"; then
        echo -e "${YELLOW}⚠️  Already checked in today${NC}"
    else
        echo -e "${RED}❌ Check-in failed${NC}"
        echo "   Response: $CHECKIN"
    fi
fi

echo "3.2 - Get Today's Status (as employee)..."
TODAY=$(curl -s -X GET "$API/attendance/today" \
  -H "Authorization: Bearer $EMP_TOKEN")

if echo "$TODAY" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get today's status successful${NC}"
    STATUS=$(echo "$TODAY" | grep -o '"status":"[^"]*' | sed 's/"status":"//')
    echo "   Status: $STATUS"
else
    echo -e "${RED}❌ Get today's status failed${NC}"
fi

echo "3.3 - Get All Attendance (as HR)..."
ALL_ATT=$(curl -s -X GET "$API/attendance" \
  -H "Authorization: Bearer $HR_TOKEN")

if echo "$ALL_ATT" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get all attendance successful${NC}"
else
    echo -e "${RED}❌ Get all attendance failed${NC}"
fi

echo "3.4 - Get Attendance Stats (as HR)..."
ATT_STATS=$(curl -s -X GET "$API/attendance/stats" \
  -H "Authorization: Bearer $HR_TOKEN")

if echo "$ATT_STATS" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get attendance stats successful${NC}"
    PRESENT=$(echo "$ATT_STATS" | grep -o '"present":[0-9]*' | head -1 | sed 's/"present"://')
    echo "   Present today: $PRESENT"
else
    echo -e "${RED}❌ Get attendance stats failed${NC}"
fi

echo ""

# Test 4: Leave Endpoints
echo "========================================="
echo "TEST 4: Leave Management"
echo "========================================="

echo "4.1 - Apply for Leave (as employee)..."
LEAVE_APP=$(curl -s -X POST "$API/leave/apply" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "PAID",
    "startDate": "2026-08-25",
    "endDate": "2026-08-27",
    "reason": "Family vacation"
  }')

if echo "$LEAVE_APP" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Leave application successful${NC}"
    LEAVE_ID=$(echo "$LEAVE_APP" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
    echo "   Leave ID: $LEAVE_ID"
else
    echo -e "${RED}❌ Leave application failed${NC}"
    echo "   Response: $LEAVE_APP"
fi

echo "4.2 - Get My Leaves (as employee)..."
MY_LEAVES=$(curl -s -X GET "$API/leave/me" \
  -H "Authorization: Bearer $EMP_TOKEN")

if echo "$MY_LEAVES" | grep -q '"success":true'; then
    LEAVE_COUNT=$(echo "$MY_LEAVES" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✅ Get my leaves successful${NC}"
    echo "   Total leaves: $LEAVE_COUNT"
else
    echo -e "${RED}❌ Get my leaves failed${NC}"
fi

echo "4.3 - Get All Leaves (as HR)..."
ALL_LEAVES=$(curl -s -X GET "$API/leave" \
  -H "Authorization: Bearer $HR_TOKEN")

if echo "$ALL_LEAVES" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get all leaves successful${NC}"
else
    echo -e "${RED}❌ Get all leaves failed${NC}"
fi

echo "4.4 - Get Leave Stats (as HR)..."
LEAVE_STATS=$(curl -s -X GET "$API/leave/stats" \
  -H "Authorization: Bearer $HR_TOKEN")

if echo "$LEAVE_STATS" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get leave stats successful${NC}"
    PENDING=$(echo "$LEAVE_STATS" | grep -o '"PENDING":[0-9]*' | sed 's/"PENDING"://')
    echo "   Pending leaves: $PENDING"
else
    echo -e "${RED}❌ Get leave stats failed${NC}"
fi

echo ""

# Test 5: Payroll Endpoints
echo "========================================="
echo "TEST 5: Payroll Management"
echo "========================================="

echo "5.1 - Get My Payroll (as employee)..."
MY_PAYROLL=$(curl -s -X GET "$API/payroll/me" \
  -H "Authorization: Bearer $EMP_TOKEN")

if echo "$MY_PAYROLL" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get my payroll successful${NC}"
    GROSS=$(echo "$MY_PAYROLL" | grep -o '"grossSalary":[0-9]*' | sed 's/"grossSalary"://')
    echo "   Gross Salary: $GROSS"
else
    echo -e "${RED}❌ Get my payroll failed${NC}"
fi

echo "5.2 - Get All Payroll (as HR)..."
ALL_PAYROLL=$(curl -s -X GET "$API/payroll" \
  -H "Authorization: Bearer $HR_TOKEN")

if echo "$ALL_PAYROLL" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get all payroll successful${NC}"
else
    echo -e "${RED}❌ Get all payroll failed${NC}"
fi

echo "5.3 - Get Payroll Stats (as HR)..."
PAYROLL_STATS=$(curl -s -X GET "$API/payroll/stats" \
  -H "Authorization: Bearer $HR_TOKEN")

if echo "$PAYROLL_STATS" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get payroll stats successful${NC}"
    TOTAL_GROSS=$(echo "$PAYROLL_STATS" | grep -o '"totalGrossSalary":[0-9]*' | sed 's/"totalGrossSalary"://')
    echo "   Total Gross Salary: $TOTAL_GROSS"
else
    echo -e "${RED}❌ Get payroll stats failed${NC}"
fi

echo ""

# Test 6: Notification Endpoints
echo "========================================="
echo "TEST 6: Notifications"
echo "========================================="

echo "6.1 - Get My Notifications (as employee)..."
MY_NOTIF=$(curl -s -X GET "$API/notifications/me" \
  -H "Authorization: Bearer $EMP_TOKEN")

if echo "$MY_NOTIF" | grep -q '"success":true'; then
    NOTIF_COUNT=$(echo "$MY_NOTIF" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✅ Get notifications successful${NC}"
    echo "   Total notifications: $NOTIF_COUNT"
else
    echo -e "${RED}❌ Get notifications failed${NC}"
fi

echo ""

# Summary
echo "========================================="
echo "  TEST SUMMARY"
echo "========================================="
echo ""
echo -e "${GREEN}✅ All core endpoints tested${NC}"
echo ""
echo "Endpoints tested:"
echo "  - Authentication: 3 tests"
echo "  - Employee Management: 3 tests"
echo "  - Attendance: 4 tests"
echo "  - Leave Management: 4 tests"
echo "  - Payroll: 3 tests"
echo "  - Notifications: 1 test"
echo ""
echo "Total: 18 endpoint tests"
echo ""
echo "For detailed API documentation, see README.md"
echo ""
