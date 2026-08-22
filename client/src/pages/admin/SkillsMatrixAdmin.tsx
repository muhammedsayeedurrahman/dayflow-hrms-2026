import React, { useState, useEffect } from 'react';
import { Brain, Plus, Target, TrendingUp } from 'lucide-react';
import { skillsAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const SkillsMatrixAdmin: React.FC = () => {
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
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Skills Matrix</h1>
              <p className="text-sm text-gray-500">
                Competency tracking and skill gap analysis
              </p>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4 inline mr-2" />
          Add Skill
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Total Skills</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSkills}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Employee Skills</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalEmployeeSkills}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Verified Skills</p>
            <p className="text-2xl font-bold text-green-600">{stats.verifiedSkills}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Avg Proficiency</p>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.averageProficiency.toFixed(1)}/5
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Skills Catalog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                  <Badge variant="indigo">{skill.category}</Badge>
                </div>
                {skill.description && (
                  <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                )}
                {skill.department && (
                  <p className="text-xs text-gray-500">
                    Department: {skill.department}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsMatrixAdmin;
