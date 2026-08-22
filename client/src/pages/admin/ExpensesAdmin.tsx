import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { expenseAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const ExpensesAdmin: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const claimsRes = await expenseAPI.getAllClaims();
      setClaims(claimsRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch expense claims:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (claimId: number) => {
    try {
      await expenseAPI.approveClaim(String(claimId));
      fetchData();
    } catch (error: any) {
      console.error('Failed to approve claim:', error);
    }
  };

  const handleReject = async (claimId: number) => {
    try {
      const reason = prompt('Enter rejection reason:');
      if (reason) {
        await expenseAPI.rejectClaim(String(claimId), reason);
        fetchData();
      }
    } catch (error: any) {
      console.error('Failed to reject claim:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'danger',
      PAID: 'indigo',
    };
    return colors[status] || 'neutral';
  };

  const totalAmount = claims.reduce((acc, claim) => acc + claim.amount, 0);
  const pendingAmount = claims
    .filter(c => c.status === 'PENDING')
    .reduce((acc, claim) => acc + claim.amount, 0);
  const approvedAmount = claims
    .filter(c => c.status === 'APPROVED')
    .reduce((acc, claim) => acc + claim.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
              <p className="text-sm text-gray-500">
                Review and approve expense claims
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Claims</p>
          <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-orange-600">${pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">${approvedAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Expense Claims</h2>
        </div>
        <div className="p-6">
          {claims.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expense claims submitted</p>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{claim.category}</h3>
                        <Badge variant={getStatusColor(claim.status) as any}>
                          {claim.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{claim.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Employee: {claim.employeeName || `ID ${claim.employeeId}`}</span>
                        <span>Date: {new Date(claim.claimDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${claim.amount.toFixed(2)}</p>
                    </div>
                  </div>
                  {claim.status === 'PENDING' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(claim.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(claim.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesAdmin;
