import React, { useState, useEffect } from 'react';
import { Clock, Plus, Briefcase, CheckCircle } from 'lucide-react';
import { timeTrackingAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const TimeTrackingAdmin: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const projectsRes = await timeTrackingAPI.getAllProjects();
      setProjects(projectsRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch time tracking data:', error);
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
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
              <p className="text-sm text-gray-500">
                Project-based time logging and approval
              </p>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4 inline mr-2" />
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Projects</p>
          <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Projects</p>
          <p className="text-2xl font-bold text-green-600">
            {projects.filter(p => p.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Hours</p>
          <p className="text-2xl font-bold text-indigo-600">
            {projects.reduce((acc, p) => acc + (p.totalHours || 0), 0).toFixed(1)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Billable Hours</p>
          <p className="text-2xl font-bold text-indigo-600">
            {projects.reduce((acc, p) => acc + (p.billableHours || 0), 0).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Projects</h2>
        </div>
        <div className="p-6">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects created</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <Badge variant={project.isActive ? 'success' : 'neutral'}>
                      {project.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  )}
                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {project.totalHours || 0}h logged
                    </p>
                    {project.client && (
                      <p className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {project.client}
                      </p>
                    )}
                    {project.isBillable && (
                      <p className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Billable
                      </p>
                    )}
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

export default TimeTrackingAdmin;
