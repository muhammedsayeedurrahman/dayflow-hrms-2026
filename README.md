# Dayflow HRMS

**Every workday, perfectly aligned.**

A comprehensive Human Resource Management System built for the Odoo x NMIT Bangalore Hackathon 2026.

## Problem Statement

Dayflow aims to digitize and streamline core HR operations including:
- Employee onboarding and profile management
- Attendance tracking with check-in/check-out
- Leave and time-off management
- Payroll visibility and management
- Approval workflows for HR officers

## Features

### Authentication & Authorization
- Secure sign up with email verification
- Role-based access control (Employee vs Admin/HR)
- JWT-based authentication

### Employee Features
- Personal dashboard with quick access
- Profile management (limited editing)
- Daily attendance check-in/check-out
- Leave application and tracking
- Salary/payroll viewing

### Admin/HR Features
- Comprehensive management dashboard
- Employee management and switching
- Attendance approval and tracking
- Leave request approval/rejection workflow
- Payroll management and updates
- Analytics and reporting

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt

## Project Structure

```
dayflow-hrms-2026/
├── client/          # React frontend
├── server/          # Express backend
├── database/        # Database schema and migrations
└── docs/            # Documentation and requirements
```

## Progress

**Hours Completed**: 2 / 24
- ✅ Hour 00: Requirements analysis and project initialization
- ✅ Hour 01: Complete project scaffolding
- ✅ Hour 02: Complete backend API implementation
- ⏳ Hour 03+: Frontend dashboards, analytics, UI polish

## Quick Start

### Backend

```bash
cd server
npm install
npm run prisma:seed  # Seed database with test data
npm run dev          # Start server on port 5000
```

### Frontend

```bash
cd client
npm install
npm run dev          # Start dev server on port 5173
```

### Test Accounts

- **HR Admin**: hr@dayflow.com / Test@123
- **Employee**: employee1@dayflow.com / Test@123

## API Endpoints

- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `GET /api/auth/verify` - Verify token
- `GET /api/employees/profile` - Get own profile
- `PUT /api/employees/profile` - Update own profile
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `POST /api/leave/apply` - Apply for leave
- `GET /api/payroll/me` - View own payroll
- `GET /api/notifications/me` - Get notifications

...and 15+ more endpoints for admin operations

## Team

Built for Odoo x NMIT Bangalore Hackathon 2026

---

**Status**: Backend Complete ✅ | Frontend In Progress 🚧
