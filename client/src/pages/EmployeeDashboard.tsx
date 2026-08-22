import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import {
  employeeAPI,
  attendanceAPI,
  leaveAPI,
  payrollAPI,
  notificationAPI,
} from '../services/api';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, todayRes, leavesRes, payrollRes, notifRes] =
          await Promise.all([
            employeeAPI.getProfile(),
            attendanceAPI.getTodayStatus(),
            leaveAPI.getMyLeaves(),
            payrollAPI.getMyPayroll(),
            notificationAPI.getMyNotifications(),
          ]);

        setProfile(profileRes.data.data);
        setTodayAttendance(todayRes.data.data);
        setRecentLeaves(leavesRes.data.data.slice(0, 3));
        setPayroll(payrollRes.data.data);
        setNotifications(notifRes.data.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      const response = await attendanceAPI.getTodayStatus();
      setTodayAttendance(response.data.data);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      const response = await attendanceAPI.getTodayStatus();
      setTodayAttendance(response.data.data);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to check out');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.firstName || user?.fullName}!
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {profile?.designation || 'Employee'} •{' '}
            {profile?.department || 'General'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Attendance Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Today's Attendance</h3>
                <svg
                  className="h-8 w-8 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              {!todayAttendance ? (
                <button
                  onClick={handleCheckIn}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Check In
                </button>
              ) : !todayAttendance.checkOutTime ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Checked in at{' '}
                    {new Date(todayAttendance.checkInTime).toLocaleTimeString()}
                  </p>
                  <button
                    onClick={handleCheckOut}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Check Out
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-green-600 font-semibold mb-2">✓ Complete</p>
                  <p className="text-sm text-gray-600">
                    {todayAttendance.workHours?.toFixed(1)} hours worked
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leave Balance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Leave Requests</h3>
                <svg
                  className="h-8 w-8 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold">
                    {recentLeaves.filter((l) => l.status === 'PENDING').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-semibold text-green-600">
                    {recentLeaves.filter((l) => l.status === 'APPROVED').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Monthly Salary</h3>
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              {payroll ? (
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{payroll.netSalary?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Net Salary</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not configured</p>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <svg
                  className="h-8 w-8 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unread</span>
                  <span className="font-semibold text-red-600">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">{notifications.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leaves */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLeaves.length === 0 ? (
                <p className="text-sm text-gray-500">No leave requests yet</p>
              ) : (
                <div className="space-y-3">
                  {recentLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {leave.leaveType} Leave
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(leave.startDate).toLocaleDateString()} -{' '}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          leave.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : leave.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg ${
                        notif.isRead ? 'bg-gray-50' : 'bg-blue-50'
                      }`}
                    >
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
