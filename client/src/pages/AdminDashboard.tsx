import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import {
  employeeAPI,
  attendanceAPI,
  leaveAPI,
  payrollAPI,
} from '../services/api';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, leavesRes, attendanceRes] = await Promise.all([
        employeeAPI.getAllEmployees(),
        leaveAPI.getAllLeaves(),
        attendanceAPI.getAllAttendance(),
      ]);

      const employeesData = employeesRes.data.data;
      const leavesData = leavesRes.data.data;
      const attendanceData = attendanceRes.data.data;

      setEmployees(employeesData);
      setPendingLeaves(leavesData.filter((l: any) => l.status === 'PENDING'));

      // Calculate today's attendance
      const today = new Date().toDateString();
      const todayRecords = attendanceData.filter(
        (a: any) => new Date(a.date).toDateString() === today
      );
      setTodayAttendance(todayRecords);

      // Calculate stats
      const presentToday = todayRecords.filter(
        (a: any) => a.status === 'PRESENT'
      ).length;
      const onLeave = todayRecords.filter((a: any) => a.status === 'LEAVE')
        .length;

      setStats({
        totalEmployees: employeesData.length,
        presentToday,
        onLeave,
        pendingApprovals: leavesData.filter((l: any) => l.status === 'PENDING')
          .length,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (
    leaveId: string,
    status: 'APPROVED' | 'REJECTED',
    comments?: string
  ) => {
    try {
      await leaveAPI.updateLeaveStatus(leaveId, status, comments);
      await fetchDashboardData();
      alert(`Leave ${status.toLowerCase()} successfully`);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to update leave');
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
            Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage employees, attendance, and leave requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Employees
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalEmployees}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Present Today
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.presentToday}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Leave</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.onLeave}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg
                    className="h-8 w-8 text-yellow-600"
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Approvals
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.pendingApprovals}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Leave Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLeaves.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No pending leave requests
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingLeaves.slice(0, 5).map((leave) => (
                    <div
                      key={leave.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {leave.employee.fullName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {leave.employee.designation} •{' '}
                            {leave.employee.department}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {leave.leaveType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {new Date(leave.startDate).toLocaleDateString()} -{' '}
                        {new Date(leave.endDate).toLocaleDateString()} (
                        {leave.totalDays} days)
                      </p>
                      {leave.reason && (
                        <p className="text-xs text-gray-600 mb-3">
                          Reason: {leave.reason}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleLeaveAction(leave.id, 'APPROVED', 'Approved')
                          }
                          className="flex-1 bg-green-600 text-white text-sm py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleLeaveAction(leave.id, 'REJECTED', 'Rejected')
                          }
                          className="flex-1 bg-red-600 text-white text-sm py-2 px-3 rounded-md hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee List */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employees.slice(0, 8).map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {employee.firstName?.[0]}
                        {employee.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {employee.fullName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {employee.designation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {employee.user.employeeId}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          employee.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Attendance */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Today's Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayAttendance.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No attendance records for today
                      </td>
                    </tr>
                  ) : (
                    todayAttendance.slice(0, 10).map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.employee.fullName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {record.employee.department}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.checkInTime
                              ? new Date(
                                  record.checkInTime
                                ).toLocaleTimeString()
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.checkOutTime
                              ? new Date(
                                  record.checkOutTime
                                ).toLocaleTimeString()
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.workHours
                              ? record.workHours.toFixed(1)
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'PRESENT'
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'ABSENT'
                                ? 'bg-red-100 text-red-800'
                                : record.status === 'HALF_DAY'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
