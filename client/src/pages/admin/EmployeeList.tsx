import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Mail, Phone, Building, Briefcase, Eye, Lock } from 'lucide-react';
import { employeeAPI, payrollAPI, authAPI } from '../../services/api';
import { formatDisplayDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Employee Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Software Engineer');
  const [basicSalary, setBasicSalary] = useState(60000);

  const fetchDirectoryData = async () => {
    setIsLoading(true);
    try {
      const [empRes, payrollRes] = await Promise.all([
        employeeAPI.getAllEmployees(),
        payrollAPI.getAllPayroll().catch(() => ({ data: { data: [] } })),
      ]);
      setEmployees(empRes.data.data);
      setPayrolls(payrollRes.data.data);
    } catch (err) {
      console.error('Failed to load employee list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectoryData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsSubmitLoading(true);
    try {
      const generatedEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // 1. Sign up the user (with default password and generated employeeId)
      await authAPI.signUp({
        email,
        password: 'Password123!',
        employeeId: generatedEmpId,
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ')[1] || '',
      });

      // 2. Fetch employees to find the newly created record's DB uuid
      const empListRes = await employeeAPI.getAllEmployees();
      const allEmps = empListRes.data.data;
      const newEmp = allEmps.find((e: any) => e.user?.employeeId === generatedEmpId);

      if (newEmp) {
        // 3. Update employee department, designation, and other fields
        await employeeAPI.updateEmployee(newEmp.id, {
          department,
          designation,
          phone: '+91 98765 00000',
          address: 'Bangalore, Karnataka, India',
        });

        // 4. Create/Update payroll
        await payrollAPI.updatePayroll(newEmp.id, {
          basicSalary: Number(basicSalary),
          hra: Math.round(Number(basicSalary) * 0.4),
          transportAllowance: 1600,
          medicalAllowance: 1250,
          otherAllowances: Math.round(Number(basicSalary) * 0.1),
          providentFund: Math.round(Number(basicSalary) * 0.12),
          tax: Math.round(Number(basicSalary) * 0.08),
        });
      }

      setIsAddModalOpen(false);
      setFullName('');
      setEmail('');
      
      // Refresh directory
      await fetchDirectoryData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to onboard new employee');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const getEmpPayroll = (empId: string) => {
    return payrolls.find((p) => p.employeeId === empId);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.user?.employeeId && emp.user.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256`;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Directory & Management</h1>
          <p className="text-xs text-slate-500">View and edit organization employee profiles</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-lg shadow-blue-800/30 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute top-3 left-3" />
            <input
              type="text"
              placeholder="Search by name, ID, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-800 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Product Management">Product Management</option>
            <option value="QA Engineering">QA Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No employees found matching the search filters.
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={emp.profilePicture || defaultAvatar}
                    alt={emp.fullName}
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="truncate">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{emp.fullName}</h4>
                    <p className="text-xs text-blue-800 font-medium truncate">{emp.designation || 'Staff'}</p>
                    <span className="text-[10px] font-mono text-slate-400">{emp.user?.employeeId}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{emp.department || 'Operations'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{emp.user?.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant={emp.isActive ? 'success' : 'warning'}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <button
                    onClick={() => setSelectedEmp(emp)}
                    className="flex items-center space-x-1 text-xs font-bold text-blue-800 hover:text-blue-900"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Employee Details Modal */}
      {selectedEmp && (
        <Modal
          isOpen={!!selectedEmp}
          onClose={() => setSelectedEmp(null)}
          title={`Employee Record — ${selectedEmp.fullName}`}
          subtitle={`Employee ID: ${selectedEmp.user?.employeeId}`}
        >
          <div className="space-y-5 pt-2 text-xs text-slate-800">
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <img src={selectedEmp.profilePicture || defaultAvatar} alt={selectedEmp.fullName} className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedEmp.fullName}</h4>
                <p className="text-blue-800 font-semibold">{selectedEmp.designation || 'Staff'}</p>
                <p className="text-slate-500">{selectedEmp.department || 'Operations'} • Joined: {formatDisplayDate(selectedEmp.joiningDate)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block">Phone:</span>
                <span className="font-semibold">{selectedEmp.phone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email:</span>
                <span className="font-semibold">{selectedEmp.user?.email || '-'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Address:</span>
                <span className="font-semibold">{selectedEmp.address || '-'}</span>
              </div>
            </div>

            {getEmpPayroll(selectedEmp.id) ? (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                <span className="font-bold text-blue-900 uppercase text-[10px]">Salary Compensation</span>
                <div className="flex justify-between font-semibold text-blue-950">
                  <span>Gross Monthly: ₹{getEmpPayroll(selectedEmp.id).grossSalary.toLocaleString('en-IN')}</span>
                  <span>Net Monthly: ₹{getEmpPayroll(selectedEmp.id).netSalary.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-center text-slate-500">
                No salary compensation structure assigned yet.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        subtitle="Onboard a new employee to Dayflow HRMS"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya.s@dayflow.demo"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product Management">Product Management</option>
                <option value="QA Engineering">QA Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Designation
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. QA Engineer"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Basic Monthly Salary (₹)
            </label>
            <input
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              disabled={isSubmitLoading}
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitLoading}
              className="px-5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {isSubmitLoading ? 'Onboarding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default EmployeeList;
