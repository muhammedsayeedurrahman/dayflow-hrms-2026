import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Users } from 'lucide-react';
import { shiftAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const ShiftsAdmin: React.FC = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [swapRequests, setSwapRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const shiftsRes = await shiftAPI.getShifts();
      setShifts(shiftsRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch shifts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shift Scheduling</h1>
              <p className="text-sm text-gray-500">
                Manage shifts, rosters, and swap requests
              </p>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 cursor-pointer">
          <Plus className="w-4 h-4 inline mr-2" />
          Create Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Shifts</p>
          <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Assigned</p>
          <p className="text-2xl font-bold text-green-600">
            {shifts.filter(s => s.employeeId).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Unassigned</p>
          <p className="text-2xl font-bold text-orange-600">
            {shifts.filter(s => !s.employeeId).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Swap Requests</p>
          <p className="text-2xl font-bold text-blue-800">
            {shifts.filter(s => s.swapRequested).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Shift Schedule</h2>
        </div>
        <div className="p-6">
          {shifts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No shifts scheduled</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map((shift) => (
                <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{shift.name}</h3>
                    <Badge variant={shift.employeeId ? 'success' : 'warning'}>
                      {shift.employeeId ? 'Assigned' : 'Open'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(shift.date).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {shift.startTime} - {shift.endTime}
                    </p>
                    {shift.employeeName && (
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {shift.employeeName}
                      </p>
                    )}
                  </div>
                  {shift.swapRequested && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Badge variant="warning">Swap Requested</Badge>
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

export default ShiftsAdmin;
