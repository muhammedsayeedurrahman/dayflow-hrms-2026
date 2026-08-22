import React, { useState } from 'react';
import { DollarSign, Edit, Search, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useHRMSStore } from '../../store/hrmsStore';
import { Employee } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const PayrollAdmin: React.FC = () => {
  const { employees, updateSalary } = useHRMSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Edit Salary state
  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [pf, setPf] = useState(0);
  const [tax, setTax] = useState(0);
  const [savedMsg, setSavedMsg] = useState(false);

  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setBasic(emp.salary.basic);
    setHra(emp.salary.hra);
    setAllowance(emp.salary.specialAllowance);
    setPf(emp.salary.pfDeduction);
    setTax(emp.salary.taxDeduction);
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    updateSalary(selectedEmp.employeeId, {
      basic: Number(basic),
      hra: Number(hra),
      specialAllowance: Number(allowance),
      pfDeduction: Number(pf),
      taxDeduction: Number(tax),
    });

    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      setSelectedEmp(null);
    }, 1200);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enterprise Payroll & Compensation</h1>
          <p className="text-xs text-slate-500">Manage salary structures, allowances, and monthly payouts</p>
        </div>

        <Badge variant="indigo">August 2026 Payroll Active</Badge>
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
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Basic</th>
                <th className="py-3.5 px-4">Gross Salary</th>
                <th className="py-3.5 px-4">Deductions</th>
                <th className="py-3.5 px-4">Net Salary</th>
                <th className="py-3.5 px-4 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{emp.fullName}</td>
                  <td className="py-3.5 px-4">{emp.department}</td>
                  <td className="py-3.5 px-4">₹{emp.salary.basic.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    ₹{emp.salary.grossSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">
                    -₹{(emp.salary.pfDeduction + emp.salary.taxDeduction).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-600">
                    ₹{emp.salary.netSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => openEditModal(emp)}
                      className="flex items-center space-x-1 font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Structure</span>
                    </button>
                  </td>
                </tr>
              ))}
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
          subtitle={`Department: ${selectedEmp.department}`}
        >
          {savedMsg ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900">Salary Revised & State Saved!</h4>
              <p className="text-xs text-slate-500">Updates reflected across payroll and employee view.</p>
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
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">HRA (₹)</label>
                  <input
                    type="number"
                    value={hra}
                    onChange={(e) => setHra(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
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
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
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
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium text-rose-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase text-[10px] mb-1">TDS Tax (₹)</label>
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium text-rose-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 font-bold flex justify-between text-indigo-900">
                <span>Calculated Net Pay:</span>
                <span>₹{(Number(basic) + Number(hra) + Number(allowance) - (Number(pf) + Number(tax))).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmp(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                >
                  Save Salary Revision
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
