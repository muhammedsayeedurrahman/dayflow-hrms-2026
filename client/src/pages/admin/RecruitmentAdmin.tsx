import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Users, TrendingUp, CheckCircle2, UserPlus } from 'lucide-react';
import { recruitmentAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { AdminPageLayout, StatsCard, LoadingState, EmptyState } from '../../components/shared';
import { toast } from '../../store/toastStore';

export const RecruitmentAdmin: React.FC = () => {
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 space-y-4">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900">
              Job Openings
            </h2>
          </div>
          
          <div>
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
                    className="bg-white border border-slate-200/60 rounded-2xl p-5 interactive-card cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xs font-bold text-slate-900">
                            {job.title}
                          </h3>
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
                          <p className="text-[11px] text-slate-500 font-semibold mb-2 line-clamp-2">
                            {job.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                          <span>{job.department}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-[10px] text-slate-400 font-bold">Candidates</p>
                        <p className="text-2xl font-extrabold text-blue-600">
                          {job.candidateCount || 0}
                        </p>
                      </div>
                    </div>
                    {job.postedDate && (
                      <p className="text-[10px] text-slate-400 font-bold mt-2 pt-2 border-t border-slate-100">
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
