import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle, Clock } from 'lucide-react';
import { onboardingAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const OnboardingAdmin: React.FC = () => {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const journeysRes = await onboardingAPI.getAllJourneys();
      setJourneys(journeysRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Onboarding Management</h1>
              <p className="text-sm text-gray-500">
                Automated onboarding workflows and task tracking
              </p>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4 inline mr-2" />
          Start Journey
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Journeys</p>
          <p className="text-2xl font-bold text-gray-900">
            {journeys.filter(j => j.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {journeys.filter(j => j.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Avg Completion</p>
          <p className="text-2xl font-bold text-indigo-600">
            {journeys.length > 0
              ? Math.round(
                  journeys.reduce((acc, j) => acc + j.completionPercentage, 0) /
                    journeys.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Onboarding Journeys</h2>
        </div>
        <div className="p-6">
          {journeys.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No onboarding journeys started</p>
          ) : (
            <div className="space-y-4">
              {journeys.map((journey) => (
                <div key={journey.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {journey.employeeName || `Employee #${journey.employeeId}`}
                      </h3>
                      <p className="text-sm text-gray-600">{journey.templateName}</p>
                    </div>
                    <Badge
                      variant={
                        journey.status === 'COMPLETED'
                          ? 'success'
                          : journey.status === 'IN_PROGRESS'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {journey.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {journey.completionPercentage}% Complete
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Started: {new Date(journey.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${journey.completionPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingAdmin;
