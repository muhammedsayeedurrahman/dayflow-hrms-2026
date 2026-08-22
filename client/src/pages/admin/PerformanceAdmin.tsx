import React, { useState, useEffect } from 'react';
import { Target, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import { performanceAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const PerformanceAdmin: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [feedbackRequests, setFeedbackRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [goalsRes, feedbackRes] = await Promise.all([
        performanceAPI.getAllGoals(),
        performanceAPI.getFeedbackRequests(),
      ]);
      setGoals(goalsRes.data.data);
      setFeedbackRequests(feedbackRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ON_TRACK: 'success',
      AT_RISK: 'warning',
      DELAYED: 'danger',
      COMPLETED: 'indigo',
      CANCELLED: 'neutral',
    };
    return colors[status] || 'neutral';
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
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Management</h1>
              <p className="text-sm text-gray-500">
                OKRs, goal tracking, and 360-degree feedback
              </p>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4 inline mr-2" />
          Create Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Active Goals & OKRs
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {goals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No goals created yet</p>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <Badge variant={getStatusColor(goal.status) as any}>
                      {goal.status}
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Progress: {goal.progress}%
                    </span>
                    <span>Target: {goal.targetValue}</span>
                    <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              360° Feedback Requests
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {feedbackRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No feedback requests</p>
            ) : (
              feedbackRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {request.revieweeName || 'Employee Review'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Review period: {request.reviewPeriod}
                      </p>
                    </div>
                    <Badge variant={request.status === 'COMPLETED' ? 'success' : 'warning'}>
                      {request.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    <p>Due: {new Date(request.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAdmin;
