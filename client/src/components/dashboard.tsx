import React from 'react';
import { useAuthStore } from '../store/authStore';
import { EmployeeDashboard } from '../pages/employee/EmployeeDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  
  if (user?.role === 'HR' || user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  
  return <EmployeeDashboard />;
};
export default Dashboard;
