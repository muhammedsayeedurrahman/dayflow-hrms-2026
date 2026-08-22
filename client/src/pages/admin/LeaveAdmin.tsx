import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Search, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { leaveAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDisplayDate } from '../../utils/format';

export const LeaveAdmin: React.FC = () => {
  const { user } = useAuthStore();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [hrComment, setHrComment] = useState('');

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const response = await leaveAPI.getAllLeaves();
      setLeaveRequests(response.data.data);
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedReq) return;
    setIsActionLoading(true);

    try {
      const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const comments = hrComment || `${action === 'APPROVE' ? 'Approved' : 'Rejected'} by HR Lead`;
      
      await leaveAPI.updateLeaveStatus(selectedReq.id, status, comments);

      setSelectedReq(null);
      setHrComment('');
      await fetchLeaves();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredRequests = leaveRequests.filter((l) => l.status === activeTab);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Approvals & Management Portal</h1>
          <p className="text-xs text-slate-500">Review employee leave applications and add approval remarks</p>
        </div>
      </div>

      {/* Tabs & Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PENDING'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Review ({leaveRequests.filter((l) => l.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'APPROVED'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approved ({leaveRequests.filter((l) => l.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'REJECTED'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rejected ({leaveRequests.filter((l) => l.status === 'REJECTED').length})
          </button>
        </div>

        {/* Requests List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No requests found in {activeTab.toLowerCase()} state.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {req.employee?.fullName || `${req.employee?.firstName} ${req.employee?.lastName}`}
                    </td>
                    <td className="py-3.5 px-4">{req.employee?.department}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{req.leaveType}</td>
                    <td className="py-3.5 px-4">
                      {formatDisplayDate(req.startDate)} to {formatDisplayDate(req.endDate)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{req.totalDays} days</td>
                    <td className="py-3.5 px-4 max-w-xs truncate">{req.reason || req.remarks}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors"
                      >
                        Review Application
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`Review Leave — ${selectedReq.employee?.fullName || 'Employee'}`}
          subtitle={`Department: ${selectedReq.employee?.department}`}
        >
          <div className="space-y-4 pt-2 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between font-bold">
                <span>{selectedReq.leaveType} Leave</span>
                <span>{selectedReq.totalDays} Day(s)</span>
              </div>
              <p className="text-slate-600">
                Dates: {formatDisplayDate(selectedReq.startDate)} to {formatDisplayDate(selectedReq.endDate)}
              </p>
              <p className="text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200">
                "{selectedReq.reason || selectedReq.remarks}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                HR Feedback Comment / Remark
              </label>
              <textarea
                rows={3}
                value={hrComment}
                onChange={(e) => setHrComment(e.target.value)}
                placeholder="Add remark or note for employee..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                disabled={isActionLoading}
                onClick={() => handleAction('REJECT')}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject Application</span>
              </button>

              <button
                disabled={isActionLoading}
                onClick={() => handleAction('APPROVE')}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Leave</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default LeaveAdmin;
