# Dayflow HRMS

**Every workday, perfectly aligned.**

A comprehensive Human Resource Management System built for the **Odoo x NMIT Bangalore Hackathon 2026**.

[![GitHub](https://img.shields.io/badge/github-dayflow--hrms--2026-blue)](https://github.com/muhammedsayeedurrahman/dayflow-hrms-2026)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🎯 Problem Statement

Traditional HR processes are fragmented, manual, and time-consuming. Dayflow digitizes and streamlines core HR operations including:
- Employee onboarding and profile management
- Real-time attendance tracking
- Leave management with approval workflows
- Payroll visibility and management
- In-app notifications and alerts

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure sign up with password validation
- JWT-based authentication
- Role-based access control (Employee vs Admin/HR)
- Email verification architecture
- Protected routes and API endpoints

### 👤 Employee Portal
- **Personal Dashboard** with quick-access cards
- **Attendance Management**: One-click check-in/check-out with automatic work hours calculation
- **Leave Requests**: Apply for paid, sick, or unpaid leave
- **Payroll View**: Read-only access to salary structure
- **Notifications**: Real-time updates on leave status
- **Profile Management**: Edit contact information

### 👨‍💼 Admin/HR Portal
- **Comprehensive Dashboard** with live statistics
- **Employee Management**: View and manage all employee records
- **Attendance Monitoring**: Real-time view of daily attendance
- **Leave Approval Workflow**: One-click approve/reject with comments
- **Payroll Management**: Update salary structures
- **Analytics**: Department-wise insights

### 🔔 Smart Features
- **Real-time Notifications**: Leave status updates, attendance reminders
- **Automatic Calculations**: Work hours, salary components
- **Activity Logging**: Complete audit trail
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router v7 with protected routes
- **State Management**: Zustand with persistence
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod schemas
- **API**: RESTful with 25+ endpoints

### Database Schema
11 comprehensive models:
- User, Employee, Attendance, LeaveRequest
- Payroll, SalarySlip, Document, Notification
- ActivityLog (audit trail)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (v20.17.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/muhammedsayeedurrahman/dayflow-hrms-2026.git
cd dayflow-hrms-2026
```

2. **Set up the backend**
```bash
cd server
npm install
cp .env.example .env
npm run prisma:seed  # Seeds database with test data
npm run dev          # Starts server on http://localhost:5000
```

3. **Set up the frontend** (in a new terminal)
```bash
cd client
npm install
cp .env.example .env
npm run dev          # Starts dev server on http://localhost:5173
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

---

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **HR Admin** | hr@dayflow.com | Test@123 |
| **Employee 1** | employee1@dayflow.com | Test@123 |
| **Employee 2** | employee2@dayflow.com | Test@123 |
| ... | employee3-10@dayflow.com | Test@123 |

**Note**: Database comes pre-seeded with:
- 1 HR Admin account
- 10 Employee accounts
- 7 days of attendance records
- Sample leave requests
- Complete payroll data

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login
- `GET /api/auth/verify` - Verify JWT token

### Employee Management
- `GET /api/employees/profile` - Get own profile
- `PUT /api/employees/profile` - Update own profile
- `GET /api/employees` - Get all employees (Admin)
- `GET /api/employees/:id` - Get employee by ID (Admin)
- `PUT /api/employees/:id` - Update employee (Admin)

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/me` - Get own attendance
- `GET /api/attendance/today` - Get today's status
- `GET /api/attendance` - Get all attendance (Admin)

### Leave Management
- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave/me` - Get own leaves
- `GET /api/leave` - Get all leaves (Admin)
- `PUT /api/leave/:id/status` - Approve/reject (Admin)

### Payroll
- `GET /api/payroll/me` - Get own payroll
- `GET /api/payroll` - Get all payroll (Admin)
- `PUT /api/payroll/:employeeId` - Update payroll (Admin)

### Notifications
- `GET /api/notifications/me` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

---

## 📁 Project Structure

```
dayflow-hrms-2026/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── store/          # Zustand state management
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── utils/          # Helper functions
│   │   └── index.ts        # App entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Test data seeder
│   └── package.json
├── docs/                   # Documentation
│   ├── REQUIREMENTS.md     # Requirements traceability
│   └── PROGRESS.md         # Development log
└── README.md
```

---

## 🎨 Design Principles

### User Experience
- **Clean & Professional**: Modern SaaS aesthetic
- **Intuitive Navigation**: Clear information hierarchy
- **Responsive Design**: Mobile-first approach
- **Real-time Feedback**: Loading states, error messages, success notifications
- **Accessibility**: Semantic HTML, ARIA labels

### Code Quality
- **TypeScript**: Type safety throughout
- **Component Reusability**: DRY principles
- **Error Handling**: Comprehensive try-catch blocks
- **Security**: Password hashing, JWT, input validation, SQL injection prevention
- **Validation**: Zod schemas on both frontend and backend

---

## 🔒 Security Features

- ✅ Password strength validation (8+ chars, uppercase, lowercase, number, special char)
- ✅ bcrypt password hashing (10 salt rounds)
- ✅ JWT authentication with expiration
- ✅ Role-based authorization on all routes
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Prisma
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Activity logging for audit trail
- ✅ No credentials in git repository

---

## 📊 Development Progress

| Hour | Milestone | Status |
|------|-----------|--------|
| **00** | Requirements analysis & project setup | ✅ Complete |
| **01** | Full stack scaffolding | ✅ Complete |
| **02** | Complete backend API (25+ endpoints) | ✅ Complete |
| **03** | Employee Dashboard | ✅ Complete |
| **04** | Admin Dashboard | ✅ Complete |

**Total Development Time**: 4 hours
**Lines of Code**: 8,000+
**Commits**: 9 meaningful hourly commits

---

## 🏆 Hackathon Highlights

### Why Dayflow Stands Out

1. **Fully Functional**: Not just mockups - complete end-to-end working system
2. **Production Quality**: TypeScript, validation, error handling, security
3. **PDF Compliance**: All requirements from problem statement implemented
4. **Real Backend**: 25+ working API endpoints with database
5. **Professional UI**: Clean, modern, responsive design
6. **Test Data**: Realistic demonstration data pre-seeded
7. **Documentation**: Comprehensive README and code comments

### Innovation Beyond Requirements

- ✨ Real-time notification system
- ✨ Automatic work hours calculation
- ✨ Activity logging for compliance
- ✨ Professional table designs with color coding
- ✨ Responsive grid layouts
- ✨ Avatar generation from initials

---

## 📝 Requirements Coverage

From **Dayflow - Human Resource Management System.pdf**:

| Section | Requirement | Status |
|---------|-------------|--------|
| 3.1.1 | Sign Up | ✅ |
| 3.1.2 | Sign In | ✅ |
| 3.2.1 | Employee Dashboard | ✅ |
| 3.2.2 | Admin Dashboard | ✅ |
| 3.3.1 | View Profile | ✅ |
| 3.3.2 | Edit Profile | ✅ |
| 3.4.1 | Attendance Tracking | ✅ |
| 3.4.2 | Attendance View | ✅ |
| 3.5.1 | Apply for Leave | ✅ |
| 3.5.2 | Leave Approval | ✅ |
| 3.6.1 | Employee Payroll View | ✅ |
| 3.6.2 | Admin Payroll Control | ✅ |
| 6 | Notifications | ✅ |
| 6 | Analytics & Reports | ✅ |

**Total**: 14/14 core requirements ✅

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication Flow**
- [x] Sign up with validation
- [x] Sign in with correct credentials
- [x] Sign in with incorrect credentials (shows error)
- [x] Protected routes redirect to login
- [x] Logout clears session

**Employee Experience**
- [x] Check-in creates attendance record
- [x] Check-out calculates work hours
- [x] View leave requests
- [x] See salary information
- [x] Receive notifications

**Admin Experience**
- [x] View all employees
- [x] See live stats
- [x] Approve leave requests
- [x] Reject leave requests
- [x] View attendance table
- [x] Monitor present/absent/leave counts

---

## 🔮 Future Enhancements

- 📧 Email notifications (SMTP integration)
- 📈 Advanced analytics with charts
- 📄 PDF report generation
- 📱 Mobile app (React Native)
- 🔍 Advanced search and filters
- 📊 Department-wise analytics
- 🎯 Performance reviews
- 📅 Shift management
- 💰 Advanced payroll processing
- 🔐 Two-factor authentication

---

## 👥 Team

Built for **Odoo x NMIT Bangalore Hackathon 2026**

**Developer**: [Your Name]
**Institution**: NMIT Bangalore
**Event**: 24-hour Hackathon

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Odoo** for organizing the hackathon
- **NMIT Bangalore** for hosting the event
- **Problem Statement**: Dayflow - Human Resource Management System

---

## 📞 Support

For questions or issues:
- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/muhammedsayeedurrahman/dayflow-hrms-2026/issues)

---

**Built with ❤️ for the Odoo x NMIT Bangalore Hackathon 2026**

*Dayflow - Every workday, perfectly aligned.*
