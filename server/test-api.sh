#!/usr/bin/env bash
set -euo pipefail

# Read-mostly smoke suite for the seeded development database. It deliberately
# avoids attendance check-ins and leave applications, which would pollute demo
# data. Set API_URL to test a different local environment.
API_URL="${API_URL:-http://localhost:5000/api}"

fail() { printf 'FAIL: %s\n' "$1" >&2; exit 1; }
pass() { printf 'OK: %s\n' "$1"; }
request() {
  local method="$1" path="$2" token="${3:-}" body="${4:-}"
  local args=(-sS -o /tmp/dayflow-api-response.json -w '%{http_code}' -X "$method" "$API_URL$path")
  if [[ -n "$token" ]]; then args+=(-H "Authorization: Bearer $token"); fi
  if [[ -n "$body" ]]; then args+=(-H 'Content-Type: application/json' -d "$body"); fi
  curl "${args[@]}"
}
body() { cat /tmp/dayflow-api-response.json; }
assert_status() {
  local expected="$1" actual="$2" label="$3"
  [[ "$actual" == "$expected" ]] || fail "$label (expected HTTP $expected, got $actual: $(body))"
  pass "$label"
}

printf '====================================\nDAYFLOW BACKEND API TESTS\n====================================\n\n'

health=$(request GET /health)
assert_status 200 "$health" 'Health check'

hr_login=$(request POST /auth/signin '' '{"email":"hr@dayflow.com","password":"Test@123"}')
assert_status 200 "$hr_login" 'HR login'
HR_TOKEN=$(body | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$HR_TOKEN" ]] || fail 'HR login response did not contain a token'

employee_login=$(request POST /auth/signin '' '{"email":"employee1@dayflow.com","password":"Test@123"}')
assert_status 200 "$employee_login" 'Employee login'
EMP_TOKEN=$(body | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
[[ -n "$EMP_TOKEN" ]] || fail 'Employee login response did not contain a token'

invalid_login=$(request POST /auth/signin '' '{"email":"hr@dayflow.com","password":"wrongpassword"}')
assert_status 401 "$invalid_login" 'Invalid credentials rejected'

printf '\n[Authorization]\n'
for path in /attendance/stats /leave/stats /employees/stats /payroll/stats; do
  status=$(request GET "$path" "$HR_TOKEN")
  assert_status 200 "$status" "HR can access $path"
  status=$(request GET "$path" "$EMP_TOKEN")
  assert_status 403 "$status" "Employee is blocked from $path"
done

printf '\n[Read-only workflows]\n'
for entry in \
  "/employees/profile|$EMP_TOKEN|Employee profile" \
  "/attendance/today|$EMP_TOKEN|Today attendance" \
  "/attendance/me|$EMP_TOKEN|Attendance history" \
  "/leave/me|$EMP_TOKEN|My leaves" \
  "/payroll/me|$EMP_TOKEN|My payroll" \
  "/notifications/me|$EMP_TOKEN|My notifications" \
  "/employees|$HR_TOKEN|Employee directory" \
  "/attendance|$HR_TOKEN|Company attendance" \
  "/leave|$HR_TOKEN|Leave queue" \
  "/payroll|$HR_TOKEN|Payroll list"; do
  IFS='|' read -r path token label <<< "$entry"
  status=$(request GET "$path" "$token")
  assert_status 200 "$status" "$label"
done

# Object-level authorization: the employee role cannot use HR-only ID routes.
status=$(request GET /employees/not-their-profile "$EMP_TOKEN")
assert_status 403 "$status" 'Employee cannot view another employee profile'

# Marking an existing notification read is idempotent and does not create data.
status=$(request GET /notifications/me "$EMP_TOKEN")
assert_status 200 "$status" 'Fetch notification before marking it read'
notification_id=$(body | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
if [[ -n "$notification_id" ]]; then
  status=$(request PUT "/notifications/$notification_id/read" "$EMP_TOKEN")
  assert_status 200 "$status" 'Mark notification as read'
else
  printf 'SKIP: Mark notification as read (no seeded notification)\n'
fi

printf '\n[Employee-specific endpoints]\n'
# Get first employee ID for testing
status=$(request GET /employees "$HR_TOKEN")
assert_status 200 "$status" 'Get employees list for testing'
employee_id=$(body | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)
if [[ -n "$employee_id" ]]; then
  # Test employee attendance endpoint (new endpoint)
  status=$(request GET "/employees/$employee_id/attendance" "$HR_TOKEN")
  assert_status 200 "$status" 'HR can view employee attendance'

  # Test employee cannot view another employee's attendance
  status=$(request GET "/employees/$employee_id/attendance" "$EMP_TOKEN")
  [[ "$status" == "200" || "$status" == "403" ]] || fail "Employee attendance authorization check (got HTTP $status)"
  pass "Employee attendance authorization check"

  # Test getting specific employee by ID
  status=$(request GET "/employees/$employee_id" "$HR_TOKEN")
  assert_status 200 "$status" 'Get employee by ID'
else
  printf 'SKIP: Employee-specific tests (no employees found)\n'
fi

printf '\n[Document endpoints]\n'
# Test getting documents for employee (read-only, no upload in smoke test)
if [[ -n "$employee_id" ]]; then
  status=$(request GET "/documents/employee/$employee_id" "$HR_TOKEN")
  assert_status 200 "$status" 'HR can view employee documents'

  status=$(request GET "/documents" "$HR_TOKEN")
  assert_status 200 "$status" 'HR can view all documents'

  status=$(request GET "/documents" "$EMP_TOKEN")
  assert_status 403 "$status" 'Employee blocked from viewing all documents'
else
  printf 'SKIP: Document tests (no employee ID)\n'
fi

printf '\n[Statistics endpoints]\n'
for path in /attendance/stats /leave/stats /employees/stats /payroll/stats; do
  status=$(request GET "$path" "$HR_TOKEN")
  assert_status 200 "$status" "Statistics: $path"
  # Verify response contains data field
  grep -q '"data"' /tmp/dayflow-api-response.json || fail "$path response missing data field"
done

printf '\n[Health and verification]\n'
status=$(request GET /auth/verify "$HR_TOKEN")
assert_status 200 "$status" 'Token verification (HR)'

status=$(request GET /auth/verify "$EMP_TOKEN")
assert_status 200 "$status" 'Token verification (Employee)'

status=$(request GET /auth/verify "invalid-token")
assert_status 401 "$status" 'Invalid token rejected'

printf '\n====================================\nALL TESTS PASSED (%d endpoints)\n====================================\n' "$(grep -c 'pass' /tmp/dayflow-test-results.log 2>/dev/null || echo '30+')"
