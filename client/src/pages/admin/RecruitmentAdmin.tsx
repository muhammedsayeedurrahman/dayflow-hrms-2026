import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Users, TrendingUp, CheckCircle2, UserPlus } from 'lucide-react';
import { recruitmentAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { AdminPageLayout, StatsCard, LoadingState, EmptyState } from '../../components/shared';
import { toast } from '../../store/toastStore';

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
      toast.error(error.response?.data?.error || 'Failed to fetch job postings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostJob = () => {
    toast.info('Job posting form coming soon');
  };

  if (isLoading) {
    return (
      <AdminPageLayout
        title="Recruitment ATS"
        description="Job postings and candidate pipeline management"
        icon={Briefcase}
      >
        <LoadingState type="stats" />
        <div className="mt-6">
          <LoadingState type="card" rows={2} />
        </div>
      </AdminPageLayout>
    );
  }

  const openPositions = jobs.filter(j => j.status === 'OPEN').length;
  const totalCandidates = jobs.reduce((acc, j) => acc + (j.candidateCount || 0), 0);
  const activePipelines = jobs.filter(j => j.candidateCount > 0).length;
  const filledPositions = jobs.filter(j => j.status === 'FILLED').length;

  return (
    <AdminPageLayout
      title="Recruitment ATS"
      description="Job postings and candidate pipeline management"
      icon={Briefcase}
      action={{
        label: 'Post Job',
        onClick: handlePostJob,
        icon: Plus,
      }}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Open Positions"
            value={openPositions}
            icon={Briefcase}
            variant="primary"
            trend={{
              value: "Active job postings",
              isPositive: true
            }}
          />

          <StatsCard
            label="Total Candidates"
            value={totalCandidates}
            icon={Users}
            variant="primary"
            trend={{
              value: "In recruitment pipeline",
              isPositive: true
            }}
          />

          <StatsCard
            label="Active Pipelines"
            value={activePipelines}
            icon={TrendingUp}
            variant="success"
            trend={{
              value: "Jobs with candidates",
              isPositive: true
            }}
          />

          <StatsCard
            label="Filled Positions"
            value={filledPositions}
            icon={CheckCircle2}
            variant="success"
            trend={{
              value: "Completed placements",
              isPositive: true
            }}
          />
        </div>

        {/* Job Openings List */}
        <div
          className="bg-white rounded-lg transition-all duration-200"
          style={{
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            fontFamily: '"Fira Sans", sans-serif'
          }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2
              className="text-lg font-bold text-gray-900"
              style={{ fontFamily: '"Fira Code", monospace' }}
            >
              Job Openings
            </h2>
          </div>
          <div className="p-6">
            {jobs.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No Job Openings Posted"
                description="Post your first job opening to start building your recruitment pipeline and attract top talent."
                action={{
                  label: "Post First Job",
                  onClick: handlePostJob
                }}
              />
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-gray-200 rounded-lg p-4 transition-all duration-200 cursor-pointer hover:border-blue-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-800"
                    style={{ fontFamily: '"Fira Sans", sans-serif' }}
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="font-bold text-gray-900"
                            style={{ fontFamily: '"Fira Code", monospace' }}
                          >
                            {job.title}
                          </h3>
                          <Badge
                            variant={
                              job.status === 'OPEN'
                                ? 'success'
                                : job.status === 'FILLED'
                                ? 'blue'
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
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                          <span>{job.department}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500 font-medium">Candidates</p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: '#1E40AF' }}
                        >
                          {job.candidateCount || 0}
                        </p>
                      </div>
                    </div>
                    {job.postedDate && (
                      <p className="text-xs text-gray-500 mt-2 font-medium">
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
    </AdminPageLayout>
  );
};

export default RecruitmentAdmin;
