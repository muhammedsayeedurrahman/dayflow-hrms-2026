import React, { useState, useEffect } from 'react';
import { Heart, Plus, TrendingUp, Users } from 'lucide-react';
import { wellBeingAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const WellnessAdmin: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const programsRes = await wellBeingAPI.getAllPrograms();
      setPrograms(programsRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch wellness programs:', error);
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
              <Heart className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Well-Being</h1>
              <p className="text-sm text-gray-500">
                Wellness programs and activity tracking
              </p>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 cursor-pointer">
          <Plus className="w-4 h-4 inline mr-2" />
          Create Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Programs</p>
          <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Programs</p>
          <p className="text-2xl font-bold text-green-600">
            {programs.filter(p => p.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Participation</p>
          <p className="text-2xl font-bold text-blue-800">
            {programs.reduce((acc, p) => acc + (p.participantCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Activities Logged</p>
          <p className="text-2xl font-bold text-blue-800">
            {programs.reduce((acc, p) => acc + (p.activityCount || 0), 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Wellness Programs</h2>
        </div>
        <div className="p-6">
          {programs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No wellness programs created</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{program.name}</h3>
                    <Badge variant={program.isActive ? 'success' : 'neutral'}>
                      {program.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {program.description && (
                    <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                  )}
                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {program.participantCount || 0} participants
                    </p>
                    <p className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {program.activityCount || 0} activities logged
                    </p>
                    {program.category && (
                      <p>Category: {program.category}</p>
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

export default WellnessAdmin;
