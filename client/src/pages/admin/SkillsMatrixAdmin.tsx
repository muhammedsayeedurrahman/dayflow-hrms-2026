import React, { useState, useEffect } from 'react';
import { Target, Plus, Users, CheckCircle, TrendingUp, BarChart2 } from 'lucide-react';
import { skillsAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { AdminPageLayout, StatsCard, LoadingState, EmptyState } from '../../components/shared';
import { toast } from '../../store/toastStore';

export const SkillsMatrixAdmin: React.FC = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [skillsRes, statsRes] = await Promise.all([
        skillsAPI.getAllSkills(),
        skillsAPI.getStats(),
      ]);
      setSkills(skillsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch skills:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch skills data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminPageLayout
        title="Skills Matrix"
        description="Competency tracking and skill gap analysis"
        icon={Target}
      >
        <LoadingState type="stats" />
        <div className="mt-6">
          <LoadingState type="card" rows={2} />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Skills Matrix"
      description="Competency tracking and skill gap analysis"
      icon={Target}
      action={{
        label: 'Add Skill',
        onClick: () => toast.info('Add skill feature coming soon'),
        icon: Plus,
      }}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="Total Skills"
              value={stats.totalSkills}
              icon={Target}
              variant="primary"
              trend={{
                value: "Skills in catalog",
                isPositive: true
              }}
            />
            <StatsCard
              label="Employee Skills"
              value={stats.totalEmployeeSkills}
              icon={Users}
              variant="primary"
              trend={{
                value: "Total skill assignments",
                isPositive: true
              }}
            />
            <StatsCard
              label="Verified Skills"
              value={stats.verifiedSkills}
              icon={CheckCircle}
              variant="success"
              trend={{
                value: `${((stats.verifiedSkills / stats.totalEmployeeSkills) * 100).toFixed(0)}% verification rate`,
                isPositive: true
              }}
            />
            <StatsCard
              label="Avg Proficiency"
              value={`${stats.averageProficiency.toFixed(1)}/5`}
              icon={BarChart2}
              variant="warning"
              trend={{
                value: "Team competency level",
                isPositive: true
              }}
            />
          </div>
        )}

        {/* Skills Catalog */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Skills Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-semibold">
              Browse and manage all organizational competencies
            </p>
          </div>

          {skills.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No Skills Found"
              description="No skills have been added to the catalog yet. Start by adding your first skill."
              action={{
                label: "Add First Skill",
                onClick: () => toast.info('Add skill feature coming soon')
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-white border border-slate-200/60 rounded-2xl p-5 interactive-card cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900">
                      {skill.name}
                    </h3>
                    <Badge variant="indigo">{skill.category}</Badge>
                  </div>
                  {skill.description && (
                    <p className="text-[11px] text-slate-500 font-semibold mb-3 leading-relaxed">
                      {skill.description}
                    </p>
                  )}
                  {skill.department && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <TrendingUp className="h-3 w-3 text-slate-400" />
                      <p className="text-[10px] text-slate-400 font-bold">
                        Department: <span className="text-slate-700">{skill.department}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default SkillsMatrixAdmin;
