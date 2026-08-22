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

printf '\n====================================\nALL REQUIRED TESTS PASSED\n====================================\n'
