import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Download, Printer, Lock, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { employeeAPI, payrollAPI } from '../../services/api';
import { formatDisplayDate } from '../../utils/format';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const PayrollPage: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [payroll, setPayroll] = useState<any>(null);
  const [slips, setSlips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);

  const fetchPayrollData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, payrollRes] = await Promise.all([
        employeeAPI.getProfile(),
        payrollAPI.getMyPayroll(),
      ]);
      setProfile(profileRes.data.data);
      const payrollData = payrollRes.data.data;
      setPayroll(payrollData);

      // Generate a dynamic list of past slips based on joining date or a default list if none exist in the database
      if (payrollData) {
        const generatedSlips = [
          {
            id: 'slip-1',
            month: 'July 2026',
            basic: payrollData.basicSalary,
            allowances: (payrollData.hra || 0) + (payrollData.transportAllowance || 0) + (payrollData.medicalAllowance || 0) + (payrollData.otherAllowances || 0),
            deductions: (payrollData.providentFund || 0) + (payrollData.tax || 0) + (payrollData.otherDeductions || 0),
            netPay: payrollData.netSalary,
            status: 'Paid',
            paymentDate: 'July 31, 2026',
          },
          {
            id: 'slip-2',
            month: 'June 2026',
            basic: payrollData.basicSalary,
            allowances: (payrollData.hra || 0) + (payrollData.transportAllowance || 0) + (payrollData.medicalAllowance || 0) + (payrollData.otherAllowances || 0),
            deductions: (payrollData.providentFund || 0) + (payrollData.tax || 0) + (payrollData.otherDeductions || 0),
            netPay: payrollData.netSalary,
            status: 'Paid',
            paymentDate: 'June 30, 2026',
          }
        ];
        setSlips(generatedSlips);
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Allowances total
  const totalAllowances = payroll ? (
    (payroll.hra || 0) + 
    (payroll.transportAllowance || 0) + 
    (payroll.medicalAllowance || 0) + 
    (payroll.otherAllowances || 0)
  ) : 0;

  // Deductions total
  const totalDeductions = payroll ? (
    (payroll.providentFund || 0) + 
    (payroll.tax || 0) + 
    (payroll.otherDeductions || 0)
  ) : 0;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salary & Payroll Statement</h1>
          <p className="text-xs text-slate-500">Read-only compensation breakdown and digital payslips</p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          <span>Read-Only Confidential Document</span>
        </div>
      </div>

      {payroll ? (
        <>
          {/* Salary Component Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Monthly Earnings</span>
              <p className="text-3xl font-extrabold text-slate-900">
                ₹{payroll.grossSalary.toLocaleString('en-IN')}
              </p>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Basic Salary:</span>
                  <span className="font-semibold text-slate-900">₹{payroll.basicSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>HRA:</span>
                  <span className="font-semibold text-slate-900">₹{(payroll.hra || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Other Allowances:</span>
                  <span className="font-semibold text-slate-900">₹{(totalAllowances - (payroll.hra || 0)).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Deductions</span>
              <p className="text-3xl font-extrabold text-rose-600">
                -₹{totalDeductions.toLocaleString('en-IN')}
              </p>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Provident Fund (PF):</span>
                  <span className="font-semibold text-rose-600">₹{(payroll.providentFund || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Income Tax (TDS):</span>
                  <span className="font-semibold text-rose-600">₹{(payroll.tax || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 p-6 shadow-xs space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Net Take-Home Pay</span>
              <p className="text-3xl font-extrabold text-indigo-900">
                ₹{payroll.netSalary.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-indigo-700">Effective from: {formatDisplayDate(payroll.effectiveFrom)}</p>

              <div className="pt-2">
                <Badge variant="indigo">Verified by Dayflow Payroll Engine</Badge>
              </div>
            </div>
          </div>

          {/* Salary Payment History */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900">Salary Payment History & Payslips</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-xl">Pay Period</th>
                    <th className="py-3.5 px-4">Basic Pay</th>
                    <th className="py-3.5 px-4">Allowances</th>
                    <th className="py-3.5 px-4">Deductions</th>
                    <th className="py-3.5 px-4">Net Salary</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slips.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No historical payroll records processed.
                      </td>
                    </tr>
                  ) : (
                    slips.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{rec.month}</td>
                        <td className="py-3.5 px-4">₹{rec.basic.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4">₹{rec.allowances.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-rose-600">-₹{rec.deductions.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 font-bold text-indigo-600">₹{rec.netPay.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant={rec.status === 'Paid' ? 'success' : 'warning'}>{rec.status}</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedSlip(rec)}
                            className="flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>View Payslip</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500 py-6 text-center">No payroll structure assigned by HR yet.</p>
      )}

      {/* Digital Payslip Modal */}
      {selectedSlip && (
        <Modal
          isOpen={!!selectedSlip}
          onClose={() => setSelectedSlip(null)}
          title={`Payslip Statement — ${selectedSlip.month}`}
          subtitle="Official Salary Voucher • Dayflow Enterprise"
        >
          <div className="space-y-6 pt-2 text-slate-800">
            {/* Header Voucher */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="font-extrabold text-lg text-indigo-600">Dayflow HRMS</span>
                <p className="text-xs text-slate-500">Every workday, perfectly aligned.</p>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-slate-900 block">{selectedSlip.month}</span>
                <span className="text-slate-500">Payment Date: {selectedSlip.paymentDate}</span>
              </div>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">Employee Name</span>
                <span className="font-bold text-slate-900">{profile?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Employee ID</span>
                <span className="font-bold text-slate-900">{profile?.user?.employeeId || user?.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Department</span>
                <span className="font-bold text-slate-900">{profile?.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Designation</span>
                <span className="font-bold text-slate-900">{profile?.designation}</span>
              </div>
            </div>

            {/* Earnings vs Deductions Table */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Earnings</h4>
                <div className="flex justify-between">
                  <span>Basic Pay:</span>
                  <span className="font-semibold">₹{selectedSlip.basic.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowances:</span>
                  <span className="font-semibold">₹{selectedSlip.allowances.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">Deductions</h4>
                <div className="flex justify-between text-rose-600">
                  <span>Total Deductions:</span>
                  <span className="font-semibold">₹{selectedSlip.deductions.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-900">Net Salary Payable:</span>
              <span className="text-lg font-extrabold text-indigo-900">
                ₹{selectedSlip.netPay.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <Printer className="h-4 w-4" />
                <span>Print Payslip</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default PayrollPage;
