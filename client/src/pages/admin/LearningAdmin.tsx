import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Users, TrendingUp } from 'lucide-react';
import { learningAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';

const LearningAdmin: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const coursesRes = await learningAPI.getAllCourses();
      setCourses(coursesRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
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
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Learning & Development</h1>
              <p className="text-sm text-gray-500">
                Course catalog and employee training management
              </p>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4 inline mr-2" />
          Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Courses</p>
          <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Courses</p>
          <p className="text-2xl font-bold text-green-600">
            {courses.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Enrollments</p>
          <p className="text-2xl font-bold text-indigo-600">
            {courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Avg Completion</p>
          <p className="text-2xl font-bold text-indigo-600">
            {courses.length > 0
              ? Math.round(
                  courses.reduce((acc, c) => acc + (c.completionRate || 0), 0) /
                    courses.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Course Catalog</h2>
        </div>
        <div className="p-6">
          {courses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No courses available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <Badge variant={course.isActive ? 'success' : 'neutral'}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {course.description && (
                    <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  )}
                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.enrollmentCount || 0} enrolled
                    </p>
                    {course.durationHours && (
                      <p className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {course.durationHours} hours
                      </p>
                    )}
                    {course.instructor && (
                      <p>Instructor: {course.instructor}</p>
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

export default LearningAdmin;
