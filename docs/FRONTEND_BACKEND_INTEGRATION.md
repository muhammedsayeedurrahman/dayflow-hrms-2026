# Frontend-Backend Integration Guide

## Current Architecture

Dayflow HRMS uses a **dual-mode architecture** that allows it to work both:
1. **Demo Mode** - With mock data (no backend required)
2. **Production Mode** - With real backend API

This design was chosen for the hackathon to allow:
- ✅ Frontend demos without backend setup
- ✅ Full-stack demos with complete API integration
- ✅ Easy testing and development

---

## Architecture Overview

### Current Setup

```
Frontend (React + Zustand)
├── Mock Data Mode (Current Default)
│   ├── data/mockData.ts         # Mock dataset
│   ├── store/hrmsStore.ts       # State management with mock data
│   └── Components consume store directly
│
└── Real API Mode (Available)
    ├── services/api.ts          # API service layer (✅ Complete)
    ├── axios interceptors       # Auth + error handling
    └── Components call API      # Direct integration ready
```

### API Service Layer Status

✅ **Complete and Ready** - All 34+ endpoints implemented:

- **Authentication:** signUp, signIn, verifyEmail
- **Employees:** getProfile, updateProfile, getAllEmployees, getEmployeeById, getEmployeeAttendance, updateEmployee, getStats
- **Attendance:** checkIn, checkOut, getTodayStatus, getMyAttendance, getAllAttendance, getStats
- **Leave:** applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getStats
- **Payroll:** getMyPayroll, getAllPayroll, updatePayroll, getSalarySlip, getStats
- **Notifications:** getMyNotifications, markAsRead, markAllAsRead
- **Documents:** upload, getEmployeeDocuments, getAllDocuments, download, delete

---

## Integration Options

### Option 1: Keep Dual Mode (Recommended for Hackathon)

**Pros:**
- Works offline for demos
- No backend setup required for UI showcase
- Fast prototyping and testing

**Cons:**
- Data doesn't persist across sessions
- Can't demo email notifications or document uploads

**Use Case:** Hackathon presentation, UI/UX demos

### Option 2: Full API Integration (Recommended for Production)

**Pros:**
- Real data persistence
- Complete feature set (emails, documents, analytics)
- Production-ready

**Cons:**
- Requires backend server running
- Needs database setup

**Use Case:** Production deployment, full-stack demos

### Option 3: Hybrid Mode (Best of Both)

**Pros:**
- API calls when backend available
- Fallback to mock data when offline
- Automatic detection

**Cons:**
- More complex implementation
- Need to handle sync between modes

**Use Case:** Development, flexible demos

---

## Quick Integration Steps

### Step 1: Start Backend Server

```bash
# Terminal 1 - Backend
cd server
npm install
cp .env.example .env
npm run prisma:seed
npm run dev  # Runs on http://localhost:5000
```

### Step 2: Update Frontend Environment

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK_DATA=false
```

### Step 3: Enable API Mode

Choose one of these approaches:

#### Approach A: Environment Variable Toggle (Simple)

Update `client/src/main.tsx`:

```typescript
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

if (!USE_MOCK_DATA) {
  console.log('🌐 Using Real Backend API');
} else {
  console.log('📦 Using Mock Data');
}
```

#### Approach B: Automatic Detection (Smart)

Update `client/src/services/api.ts`:

```typescript
// Add health check function
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

// Auto-detect on app startup
let backendAvailable = false;

export const initializeBackend = async () => {
  backendAvailable = await checkBackendHealth();
  console.log(backendAvailable ? '🌐 Backend Connected' : '📦 Using Mock Data');
  return backendAvailable;
};
```

#### Approach C: Manual Switch (Developer Control)

Add UI toggle in settings:

```typescript
const [useBackend, setUseBackend] = useState(false);

<button onClick={() => setUseBackend(!useBackend)}>
  {useBackend ? '🌐 Backend Mode' : '📦 Mock Mode'}
</button>
```

---

## Migration Guide: Mock to Real API

### Example: Update EmployeeDashboard

**Before (Mock Data):**

```typescript
// src/pages/employee/EmployeeDashboard.tsx
import { useHRMSStore } from '../../store/hrmsStore';

export const EmployeeDashboard: React.FC = () => {
  const { attendance, checkIn, checkOut } = useHRMSStore();

  // Uses mock data from store
  const todayRecord = attendance.find(a => a.date === today);

  return <div>...</div>;
};
```

**After (Real API):**

```typescript
// src/pages/employee/EmployeeDashboard.tsx
import { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';

export const EmployeeDashboard: React.FC = () => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    setLoading(true);
    try {
      const { data } = await attendanceAPI.getTodayStatus();
      setTodayRecord(data.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await attendanceAPI.checkIn();
      await fetchTodayStatus(); // Refresh
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return <div>...</div>;
};
```

---

## Complete Integration Checklist

### Phase 1: Authentication (Priority)

- [ ] Update `Login.tsx` to use `authAPI.signIn()`
- [ ] Update `SignUp.tsx` to use `authAPI.signUp()`
- [ ] Store JWT token in authStore
- [ ] Add token refresh logic
- [ ] Test login/logout flow

### Phase 2: Employee Features

- [ ] Update `EmployeeDashboard.tsx`
  - [ ] Fetch today's attendance via `attendanceAPI.getTodayStatus()`
  - [ ] Implement check-in via `attendanceAPI.checkIn()`
  - [ ] Implement check-out via `attendanceAPI.checkOut()`
  - [ ] Fetch leave requests via `leaveAPI.getMyLeaves()`
  - [ ] Fetch payroll via `payrollAPI.getMyPayroll()`
  - [ ] Fetch notifications via `notificationAPI.getMyNotifications()`

- [ ] Update `AttendancePage.tsx`
  - [ ] Fetch attendance history via `attendanceAPI.getMyAttendance()`
  - [ ] Add date range filtering

- [ ] Update `LeavePage.tsx`
  - [ ] Submit leave via `leaveAPI.applyLeave()`
  - [ ] Show leave history

- [ ] Update `PayrollPage.tsx`
  - [ ] Show salary breakdown
  - [ ] Download payslip

- [ ] Update `ProfilePage.tsx`
  - [ ] Fetch profile via `employeeAPI.getProfile()`
  - [ ] Update profile via `employeeAPI.updateProfile()`

### Phase 3: Admin/HR Features

- [ ] Update `AdminDashboard.tsx`
  - [ ] Fetch statistics via stats endpoints
  - [ ] Show real-time data

- [ ] Update `EmployeeList.tsx`
  - [ ] Fetch employees via `employeeAPI.getAllEmployees()`
  - [ ] Implement search/filter

- [ ] Update `AttendanceAdmin.tsx`
  - [ ] Fetch all attendance via `attendanceAPI.getAllAttendance()`
  - [ ] Filter by employee/date

- [ ] Update `LeaveAdmin.tsx`
  - [ ] Fetch pending leaves via `leaveAPI.getAllLeaves()`
  - [ ] Approve/reject via `leaveAPI.updateLeaveStatus()`

- [ ] Update `PayrollAdmin.tsx`
  - [ ] Fetch all payroll via `payrollAPI.getAllPayroll()`
  - [ ] Update salary via `payrollAPI.updatePayroll()`

- [ ] Update `AnalyticsAdmin.tsx`
  - [ ] Fetch attendance stats via `attendanceAPI.getStats()`
  - [ ] Fetch leave stats via `leaveAPI.getStats()`
  - [ ] Fetch employee stats via `employeeAPI.getStats()`
  - [ ] Fetch payroll stats via `payrollAPI.getStats()`

### Phase 4: Document Management

- [ ] Create DocumentUpload component
- [ ] Integrate `documentAPI.upload()`
- [ ] List documents via `documentAPI.getEmployeeDocuments()`
- [ ] Download documents via `documentAPI.download()`

### Phase 5: Polish & Testing

- [ ] Add loading states (spinners)
- [ ] Add error handling (toasts/alerts)
- [ ] Add success feedback
- [ ] Test all CRUD operations
- [ ] Test authorization (employee vs HR)
- [ ] Test error scenarios
- [ ] Mobile responsive testing

---

## Error Handling Pattern

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const { data } = await someAPI.getData();
    setDataState(data.data);
  } catch (err: any) {
    const message = err.response?.data?.message || 'An error occurred';
    setError(message);
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};
```

---

## Testing Both Modes

### Test Mock Mode

```bash
cd client
npm run dev
# App loads with mock data instantly
# No backend required
```

### Test Real API Mode

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
VITE_USE_MOCK_DATA=false npm run dev
# App connects to backend
# Test login with hr@dayflow.com / Test@123
```

---

## Performance Considerations

### Mock Data (Current)
- ✅ Instant load (no network calls)
- ✅ No loading states needed
- ✅ Works offline
- ❌ No persistence
- ❌ No real-time features

### Real API
- ⚠️ Network latency (~50-200ms per request)
- ✅ Real persistence
- ✅ Email notifications
- ✅ Document uploads
- ✅ Production-ready
- ❌ Requires backend uptime

---

## Deployment Strategy

### Option 1: Mock Data Deploy (Fastest)

```bash
# Deploy only frontend
cd client
npm run build
# Deploy dist/ to Vercel/Netlify
# No backend needed
```

**Use for:** UI/UX demos, design showcase

### Option 2: Full Stack Deploy (Complete)

```bash
# Deploy backend
cd server
# Deploy to Railway/Heroku/Render

# Deploy frontend with API URL
cd client
VITE_API_URL=https://your-backend.com/api npm run build
# Deploy dist/ to Vercel/Netlify
```

**Use for:** Production, complete demos

### Option 3: Hybrid Deploy (Flexible)

```bash
# Frontend auto-detects backend
cd client
VITE_USE_MOCK_DATA=auto npm run build
# Falls back to mock if backend unavailable
```

**Use for:** Development, flexible demos

---

## Current Status

### ✅ Completed
- Backend API (34 endpoints)
- API service layer
- Authentication flow
- Mock data mode
- Dual-mode architecture

### 🔄 In Progress
- Full API integration in all pages
- Loading states
- Error handling UI

### 📋 Todo
- Real-time notifications (WebSocket)
- Document upload UI
- Advanced analytics charts
- Performance optimization

---

## Quick Reference

### Environment Variables

```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email
SMTP_PASS=your-password

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK_DATA=false
```

### NPM Scripts

```bash
# Backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run prisma:seed  # Seed database

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Support

- **Backend API Docs:** `/docs/API_TESTING.md`
- **PostgreSQL Migration:** `/docs/POSTGRESQL_MIGRATION.md`
- **README:** `/README.md`
- **GitHub:** https://github.com/muhammedsayeedurrahman/dayflow-hrms-2026

---

## Next Steps

1. ✅ **For Hackathon Demo:** Use mock data mode (current setup works perfectly)
2. ✅ **For Full-Stack Demo:** Start backend, connect frontend
3. ✅ **For Production:** Deploy both backend and frontend, use PostgreSQL

The dual-mode architecture means you're ready for both scenarios! 🚀
