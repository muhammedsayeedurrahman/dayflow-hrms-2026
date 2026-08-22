import React, { useState, useEffect } from 'react';
import { DollarSign, Edit, Search, CheckCircle2, ShieldCheck } from 'lucide-react';
import { employeeAPI, payrollAPI } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const PayrollAdmin: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);

  // Edit Salary state
  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [pf, setPf] = useState(0);
  const [tax, setTax] = useState(0);
  const [savedMsg, setSavedMsg] = useState(false);

  const fetchPayrollData = async () => {
    setIsLoading(true);
    try {
      const [empRes, payrollRes] = await Promise.all([
        employeeAPI.getAllEmployees(),
        payrollAPI.getAllPayroll().catch(() => ({ data: { data: [] } })),
      ]);
      setEmployees(empRes.data.data);
      setPayrolls(payrollRes.data.data);
    } catch (err) {
      console.error('Failed to load payroll director:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const getEmpPayroll = (empId: string) => {
    return payrolls.find((p) => p.employeeId === empId);
  };

  const openEditModal = (emp: any) => {
    setSelectedEmp(emp);
    const pay = getEmpPayroll(emp.id);
    setBasic(pay ? pay.basicSalary : 50000);
    setHra(pay ? pay.hra || 0 : 20000);
    setAllowance(pay ? pay.otherAllowances || 0 : 5000);
    setPf(pay ? pay.providentFund || 0 : 6000);
    setTax(pay ? pay.tax || 0 : 4000);
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    setIsSubmitLoading(true);
    try {
      await payrollAPI.updatePayroll(selectedEmp.id, {
        basicSalary: Number(basic),
        hra: Number(hra),
        otherAllowances: Number(allowance),
        providentFund: Number(pf),
        tax: Number(tax),
        transportAllowance: 0,
        medicalAllowance: 0,
        otherDeductions: 0,
      });

      setSavedMsg(true);
      setTimeout(async () => {
        setSavedMsg(false);
        setSelectedEmp(null);
        await fetchPayrollData();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to update salary structure');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.user?.employeeId && e.user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enterprise Payroll & Compensation</h1>
          <p className="text-xs text-slate-500">Manage salary structures, allowances, and monthly payouts</p>
        </div>

        <Badge variant="blue">Payroll Administrator Active</Badge>
      </div>

      {/* Directory Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute top-3 left-3" />
            <input
              type="text"
              placeholder="Search employee or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Basic Pay</th>
                <th className="py-3.5 px-4">Gross Salary</th>
                <th className="py-3.5 px-4">Deductions</th>
                <th className="py-3.5 px-4">Net Salary</th>
                <th className="py-3.5 px-4 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => {
                const pay = getEmpPayroll(emp.id);
                const basicSalary = pay ? pay.basicSalary : 0;
                const grossSalary = pay ? pay.grossSalary : 0;
                const pfTax = pay ? (pay.providentFund || 0) + (pay.tax || 0) : 0;
                const netSalary = pay ? pay.netSalary : 0;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{emp.fullName}</td>
                    <td className="py-3.5 px-4">{emp.department || 'Operations'}</td>
                    <td className="py-3.5 px-4">₹{basicSalary.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      ₹{grossSalary.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-rose-600">
                      -₹{pfTax.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-800">
                      ₹{netSalary.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="flex items-center space-x-1 font-bold text-blue-800 hover:text-blue-900"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit Structure</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Salary Modal */}
      {selectedEmp && (
        <Modal
          isOpen={!!selectedEmp}
          onClose={() => setSelectedEmp(null)}
          title={`Edit Salary Structure — ${selectedEmp.fullName}`}
          subtitle={`Department: ${selectedEmp.department || 'Operations'}`}
        >
          {savedMsg ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="font-bold text-sm text-slate-900">Salary Revised & State Saved!</h4>
              <p className="text-xs text-slate-500">Updates reflected across payroll and employee views.</p>
            </div>
          ) : (
            <form onSubmit={handleSaveSalary} className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">Basic Pay (₹)</label>
                  <input
                    type="number"
                    value={basic}
                    onChange={(e) => setBasic(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">HRA (₹)</label>
                  <input
                    type="number"
                    value={hra}
                    onChange={(e) => setHra(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">
                    Special Allowance (₹)
                  </label>
                  <input
                    type="number"
                    value={allowance}
                    onChange={(e) => setAllowance(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">
                    PF Deduction (₹)
                  </label>
                  <input
                    type="number"
                    value={pf}
                    onChange={(e) => setPf(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl font-medium text-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">TDS Tax (₹)</label>
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl font-medium text-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 font-bold flex justify-between text-blue-900">
                <span>Calculated Net Pay:</span>
                <span>₹{(Number(basic) + Number(hra) + Number(allowance) - (Number(pf) + Number(tax))).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitLoading}
                  onClick={() => setSelectedEmp(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="px-5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmitLoading ? 'Saving...' : 'Save Salary Revision'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
export default PayrollAdmin;
