import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, AlertCircle, Clock, Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHRMSStore } from '../../store/hrmsStore';
import { LeaveType } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const LeavePage: React.FC = () => {
  const { user } = useAuthStore();
  const { leaveRequests, submitLeaveRequest } = useHRMSStore();
  const empId = user?.employeeId || 'EMP-1001';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('PAID');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const myRequests = leaveRequests.filter((l) => l.employeeId === empId);
  const approvedRequests = myRequests.filter((l) => l.status === 'APPROVED');
  const usedDays = approvedRequests.reduce((acc, l) => acc + l.totalDays, 0);

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    submitLeaveRequest({
      employeeId: empId,
      employeeName: user?.fullName || 'Alex Vance',
      department: user?.department || 'Engineering',
      leaveType,
      startDate,
      endDate,
      totalDays: calculateDays(),
      reason,
    });

    setIsModalOpen(false);
    setReason('');
    setStartDate('');
    setEndDate('');
    setFeedbackMsg('Leave request submitted successfully for HR review!');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header & Apply Action */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave & Time-Off Management</h1>
          <p className="text-xs text-slate-500">Apply for leave, track approval status, and check balance</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Apply New Leave</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Paid Leave Balance</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{Math.max(0, 12 - usedDays)} Days</span>
            <span className="text-xs text-slate-400 font-medium">12 allocated</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${(usedDays / 12) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sick Leave Balance</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">6 Days</span>
            <span className="text-xs text-slate-400 font-medium">6 allocated</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-0" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unpaid / Casual</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">Unlimited</span>
            <span className="text-xs text-slate-400 font-medium">Subject to approval</span>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900">My Leave Applications</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">Type</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 rounded-r-xl">HR Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No leave requests found. Click 'Apply New Leave' to submit.
                  </td>
                </tr>
              ) : (
                myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{req.leaveType}</td>
                    <td className="py-3.5 px-4">
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {req.totalDays} day{req.totalDays > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700">{req.reason}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          req.status === 'APPROVED'
                            ? 'success'
                            : req.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic">{req.hrComment || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Leave / Time-Off"
        subtitle="Submit leave details for HR approval"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="PAID">Paid Leave (Annual Allocation)</option>
              <option value="SICK">Sick Leave (Medical Emergency)</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-800 font-semibold flex justify-between">
              <span>Total Leave Duration:</span>
              <span>
                {calculateDays()} day{calculateDays() > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Remarks
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for leave application..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Leave Application</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default LeavePage;
