# Dayflow HRMS - Requirements Traceability

Source: Dayflow - Human Resource Management System.pdf

## Requirements Mapping

| Requirement | Source | Module | Status | Testing | Notes |
|------------|--------|--------|--------|---------|-------|
| **1. Authentication & Authorization** |||||
| Sign Up | 3.1.1 | Authentication | Pending | Not Started | Employee ID, Email, Password, Role |
| Password Security | 3.1.1 | Authentication | Pending | Not Started | Security rules enforcement |
| Email Verification | 3.1.1 | Authentication | Pending | Not Started | Verification architecture |
| Sign In | 3.1.2 | Authentication | Pending | Not Started | Email + Password |
| Error Messages | 3.1.2 | Authentication | Pending | Not Started | Invalid credentials handling |
| Dashboard Redirect | 3.1.2 | Authentication | Pending | Not Started | Role-based routing |
| **2. Dashboard** |||||
| Employee Dashboard | 3.2.1 | Dashboard | Pending | Not Started | Quick-access cards |
| Profile Access | 3.2.1 | Dashboard | Pending | Not Started | Navigation |
| Attendance Access | 3.2.1 | Dashboard | Pending | Not Started | Navigation |
| Leave Requests Access | 3.2.1 | Dashboard | Pending | Not Started | Navigation |
| Recent Activity/Alerts | 3.2.1 | Dashboard | Pending | Not Started | Activity feed |
| Admin Dashboard | 3.2.2 | Dashboard | Pending | Not Started | Management view |
| Employee List | 3.2.2 | Dashboard | Pending | Not Started | All employees |
| Attendance Records | 3.2.2 | Dashboard | Pending | Not Started | Overview |
| Leave Approvals | 3.2.2 | Dashboard | Pending | Not Started | Pending requests |
| Employee Switching | 3.2.2 | Dashboard | Pending | Not Started | View different employees |
| **3. Employee Profile Management** |||||
| View Personal Details | 3.3.1 | Profiles | Pending | Not Started | Employee view |
| View Job Details | 3.3.1 | Profiles | Pending | Not Started | Employee view |
| View Salary Structure | 3.3.1 | Profiles | Pending | Not Started | Employee view |
| View Documents | 3.3.1 | Profiles | Pending | Not Started | Employee view |
| View Profile Picture | 3.3.1 | Profiles | Pending | Not Started | Employee view |
| Edit Limited Fields | 3.3.2 | Profiles | Pending | Not Started | Address, phone, picture only |
| Admin Edit All | 3.3.2 | Profiles | Pending | Not Started | Full access for admin |
| **4. Attendance Management** |||||
| Daily View | 3.4.1 | Attendance | Pending | Not Started | Calendar view |
| Weekly View | 3.4.1 | Attendance | Pending | Not Started | Week summary |
| Check-In | 3.4.1 | Attendance | Pending | Not Started | Employee action |
| Check-Out | 3.4.1 | Attendance | Pending | Not Started | Employee action |
| Present Status | 3.4.1 | Attendance | Pending | Not Started | Status type |
| Absent Status | 3.4.1 | Attendance | Pending | Not Started | Status type |
| Half-Day Status | 3.4.1 | Attendance | Pending | Not Started | Status type |
| Leave Status | 3.4.1 | Attendance | Pending | Not Started | Status type |
| Employee Own View | 3.4.2 | Attendance | Pending | Not Started | Restricted view |
| Admin All View | 3.4.2 | Attendance | Pending | Not Started | All employees |
| **5. Leave & Time-Off Management** |||||
| Apply for Leave | 3.5.1 | Leave | Pending | Not Started | Employee action |
| Leave Type Selection | 3.5.1 | Leave | Pending | Not Started | Paid, Sick, Unpaid |
| Date Range | 3.5.1 | Leave | Pending | Not Started | From-to dates |
| Remarks | 3.5.1 | Leave | Pending | Not Started | Optional notes |
| Pending Status | 3.5.1 | Leave | Pending | Not Started | Default status |
| Approved Status | 3.5.1 | Leave | Pending | Not Started | After approval |
| Rejected Status | 3.5.1 | Leave | Pending | Not Started | After rejection |
| View All Requests | 3.5.2 | Leave | Pending | Not Started | Admin view |
| Approve Requests | 3.5.2 | Leave | Pending | Not Started | Admin action |
| Reject Requests | 3.5.2 | Leave | Pending | Not Started | Admin action |
| Add Comments | 3.5.2 | Leave | Pending | Not Started | Admin feedback |
| Immediate Reflection | 3.5.2 | Leave | Pending | Not Started | Real-time updates |
| **6. Payroll/Salary Management** |||||
| Employee Payroll View | 3.6.1 | Payroll | Pending | Not Started | Read-only |
| Admin View All Payroll | 3.6.2 | Payroll | Pending | Not Started | All employees |
| Update Salary Structure | 3.6.2 | Payroll | Pending | Not Started | Admin edit |
| Ensure Accuracy | 3.6.2 | Payroll | Pending | Not Started | Validation |
| **7. Future Enhancements** |||||
| Email Alerts | 6 | Notifications | Pending | Not Started | Enhancement |
| In-App Notifications | 6 | Notifications | Pending | Not Started | Enhancement |
| Analytics Dashboard | 6 | Analytics | Pending | Not Started | Enhancement |
| Salary Slips Report | 6 | Reports | Pending | Not Started | Enhancement |
| Attendance Reports | 6 | Reports | Pending | Not Started | Enhancement |

## Priority Levels

### P0 - Critical (Must Have for Demo)
- Authentication (Sign Up, Sign In)
- Role-based access control
- Employee Dashboard
- Admin Dashboard
- Basic profile viewing
- Attendance check-in/check-out
- Leave application
- Leave approval

### P1 - High (Should Have)
- Email verification architecture
- Profile editing
- Daily/weekly attendance views
- Payroll viewing
- Admin payroll management

### P2 - Medium (Nice to Have)
- In-app notifications
- Recent activity feed
- Analytics dashboard
- Reports

### P3 - Low (Future)
- Email alerts
- Advanced analytics
- Document management

## Non-Functional Requirements

### Security
- Password hashing (bcrypt)
- JWT authentication
- Role-based authorization on backend
- Input validation
- SQL injection prevention
- XSS protection

### Performance
- Responsive design (mobile, tablet, desktop)
- Fast load times
- Optimized database queries

### Usability
- Intuitive navigation
- Clear error messages
- Professional UI/UX
- Smooth transitions
- Loading states
- Empty states

## Success Criteria

✅ All P0 requirements implemented and tested
✅ All P1 requirements implemented
✅ Responsive on all devices
✅ No security vulnerabilities
✅ Clean, professional UI
✅ Smooth demo flow (Employee + Admin)
✅ Comprehensive README
✅ Hourly commit history
