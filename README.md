# Dayflow HRMS

**Every workday, perfectly aligned.**

A complete, polished, responsive, and interactive Human Resource Management System (HRMS) frontend built for the **Odoo x NMIT Bangalore Hackathon 2026**.

---

## 🚀 Demo Quick Start for Hackathon Judges

To run the application locally:

```bash
cd client
npm install
npm run dev
```

The application will launch at `http://localhost:5173`.

### 🔑 Demo Accounts & Quick Switcher

For seamless judging, one-click demo login buttons are provided on the Login page:

| Role | Demo Credentials | Default Persona | Dashboard Route |
|---|---|---|---|
| **Employee** | `employee@dayflow.demo` / `password` | Alex Vance (Senior Frontend Engineer) | `/employee/dashboard` |
| **HR / Admin** | `hr@dayflow.demo` / `password` | Sarah Jenkins (HR Lead & People Ops) | `/admin/dashboard` |

> 💡 **Judge Tip**: Use the **"Employee View"** and **"HR Admin View"** quick-switcher buttons located in the top navigation bar to toggle between roles instantly from any page!

---

## 📌 Problem Statement & Solution

Modern enterprise workforce management requires seamless coordination between employees and HR operations. Traditional tools suffer from fragmented check-ins, slow leave approval cycles, opaque payroll visibility, and lack of automated workforce telemetry.

**Dayflow HRMS** solves this by unifying:
1. **Daily Attendance Tracking**: Interactive check-in/out console with live duration timers and status badging.
2. **Leave & Time-Off Approvals**: End-to-end leave application, duration auto-calculator, and HR feedback remarks with instant real-time propagation across roles.
3. **Payroll & Salary Transparency**: Detailed salary component breakdowns (Basic, HRA, Allowances, PF, Tax) and digital printable payslips.
4. **Workforce Intelligence (Smart HR Insights)**: Attendance anomaly detection, department leave concentration alerts, and a unified HR Action Center.

---

## 🎨 Technology Stack & Architecture

- **Frontend Framework**: React 19 + TypeScript 6 + Vite 8
- **Styling & UI**: Tailwind CSS v4 + Lucide Icons + Custom Enterprise Design Tokens
- **Interactive Telemetry**: Recharts (Line, Bar, Donut, and Area charts)
- **State Management**: Zustand with `localStorage` persistent state sync
- **Forms & Validation**: React Hook Form + Zod client validation

```
dayflow-hrms-2026/
├── client/                      # Complete React + Vite Frontend App
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # AppLayout, Sidebar, Topbar, MobileNav
│   │   │   ├── ui/              # Badge, Modal, StatCard, Skeleton
│   │   │   └── payslip/         # Digital Payslip modal generator
│   │   ├── pages/
│   │   │   ├── auth/            # Login, SignUp, VerifyEmail, ForgotPassword
│   │   │   ├── employee/        # Dashboard, Profile, Attendance, Leave, Payroll, Notifications
│   │   │   └── admin/           # Dashboard, EmployeeList, AttendanceAdmin, LeaveAdmin, PayrollAdmin, AnalyticsAdmin, NotificationsAdmin
│   │   ├── data/                # Enterprise mock dataset (12+ employees across 6 departments)
│   │   ├── services/            # Mock service abstraction layer (`mockService.ts`)
│   │   ├── store/               # Domain state stores (`authStore.ts`, `hrmsStore.ts`)
│   │   ├── types/               # TypeScript domain interfaces (`index.ts`)
│   │   └── App.tsx              # App router & role navigation guards
│   └── package.json
├── docs/
│   ├── REQUIREMENTS.md          # Complete 42-requirement traceability matrix
│   ├── PROGRESS.md              # Hourly milestone commit log
│   └── FINAL_REQUIREMENTS_AUDIT.md # Audit checklist
└── README.md
```

---

## ✨ Features Overview

### 👤 Employee Portal
- **Dashboard**: Greeting header, live check-in/out widget, leave balance metric cards, upcoming payroll preview, and recent alert feed.
- **Profile Management**: Inline editable fields (Phone, Address, Avatar upload preview) with read-only badges for HR-controlled fields (Employee ID, Department, Designation, Salary).
- **Attendance**: Daily interactive check-in/out with work duration calculation, daily & weekly history log, status badging (`PRESENT`, `ABSENT`, `HALF_DAY`, `ON_LEAVE`).
- **Leave Requests**: Apply for Paid, Sick, Casual, or Unpaid leave with auto-calculated duration, track request statuses, and read HR approval comments.
- **Salary & Payslips**: Read-only breakdown of Basic, HRA, Allowances, PF, Tax, Net Pay, monthly payment history table, and digital printable payslip generator.
- **Notifications**: Notification hub with read/unread filtering.

### 🛡️ HR / Admin Portal
- **Executive Dashboard**: Company workforce metrics, attendance rate %, pending approvals counter, monthly payroll expense, and urgent action queue.
- **Employee Directory**: Filterable employee directory table and cards with search by name/ID/title, view employee modal, and add new employee form.
- **Attendance Matrix**: Company-wide attendance logs with date range and status filters.
- **Leave Approval Portal**: Pending, approved, rejected queues; approval/rejection modal requiring mandatory HR feedback comment input.
- **Enterprise Payroll**: Salary directory with component edit modal and gross/net recalculations.
- **Analytics & Reports**: Interactive `Recharts` visualizations (Attendance Trends, Leave Distribution, Department Headcount, Payroll Expenses) and CSV report download simulation.
- **Notifications & Alerts**: Broadcast company-wide announcement dispatcher.

### 🧠 Smart HR Insights (Hackathon Differentiators)
- **Attendance Anomaly Alerts**: Automatically detects employees with late check-ins (>9:30 AM) or unusually short workdays.
- **Department Leave Concentration**: Identifies upcoming leave spikes in critical teams (e.g. Engineering).
- **Consolidated HR Action Center**: Groups all pending items into a single resolution workflow.

---

## 🔒 Security & Scope Disclaimer

> **Note**: This repository contains the Dayflow HRMS frontend prototype. Backend APIs, database persistence, server-side authentication, and authorization are outside the scope of this frontend implementation.
>
> The frontend architecture incorporates a clean mock service abstraction (`src/services/mockService.ts`) making it effortless to connect to a real backend in production.

---

## 📜 Team & License

Built for **Odoo x NMIT Bangalore Hackathon 2026**.
