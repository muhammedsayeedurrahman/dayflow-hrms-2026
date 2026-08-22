import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Users, TrendingUp } from 'lucide-react';
import { recruitmentAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const RecruitmentAdmin: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const jobsRes = await recruitmentAPI.getAllJobs();
      setJobs(jobsRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch jobs:', error);
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
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recruitment ATS</h1>
              <p className="text-sm text-gray-500">
                Job postings and candidate pipeline management
              </p>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4 inline mr-2" />
          Post Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Open Positions</p>
          <p className="text-2xl font-bold text-gray-900">
            {jobs.filter(j => j.status === 'OPEN').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Candidates</p>
          <p className="text-2xl font-bold text-indigo-600">
            {jobs.reduce((acc, j) => acc + (j.candidateCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Pipelines</p>
          <p className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.candidateCount > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Filled Positions</p>
          <p className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.status === 'FILLED').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Job Openings</h2>
        </div>
        <div className="p-6">
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No job openings posted</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <Badge
                          variant={
                            job.status === 'OPEN'
                              ? 'success'
                              : job.status === 'FILLED'
                              ? 'indigo'
                              : 'neutral'
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      {job.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{job.department}</span>
                        <span>{job.location}</span>
                        <span>{job.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Candidates</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {job.candidateCount || 0}
                      </p>
                    </div>
                  </div>
                  {job.postedDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Posted: {new Date(job.postedDate).toLocaleDateString()}
                    </p>
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

export default RecruitmentAdmin;
