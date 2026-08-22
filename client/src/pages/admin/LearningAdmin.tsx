import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { learningAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { AdminPageLayout, StatsCard, LoadingState, EmptyState } from '../../components/shared';
import { toast } from '../../store/toastStore';

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
      toast.error(error.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = () => {
    toast.info('Course creation coming soon');
  };

  if (isLoading) {
    return (
      <AdminPageLayout
        title="Learning & Development"
        description="Course catalog and employee training management"
        icon={BookOpen}
      >
        <LoadingState type="stats" />
        <div className="mt-6">
          <LoadingState type="card" rows={2} />
        </div>
      </AdminPageLayout>
    );
  }

  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.isActive).length;
  const totalEnrollments = courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0);
  const avgCompletion = courses.length > 0
    ? Math.round(courses.reduce((acc, c) => acc + (c.completionRate || 0), 0) / courses.length)
    : 0;

  return (
    <AdminPageLayout
      title="Learning & Development"
      description="Course catalog and employee training management"
      icon={BookOpen}
      action={{
        label: 'Create Course',
        onClick: handleCreateCourse,
        icon: Plus,
      }}
    >
      <div className="space-y-6">
        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Courses"
            value={totalCourses}
            icon={BookOpen}
            variant="primary"
            trend={{
              value: `${activeCourses} active courses`,
              isPositive: true
            }}
          />

          <StatsCard
            label="Active Courses"
            value={activeCourses}
            icon={CheckCircle}
            variant="success"
            trend={{
              value: `${totalCourses - activeCourses} inactive`,
              isPositive: activeCourses > 0
            }}
          />

          <StatsCard
            label="Total Enrollments"
            value={totalEnrollments}
            icon={Users}
            variant="primary"
            trend={{
              value: "Across all courses",
              isPositive: true
            }}
          />

          <StatsCard
            label="Avg Completion"
            value={`${avgCompletion}%`}
            icon={TrendingUp}
            variant="warning"
            trend={{
              value: "Completion rate",
              isPositive: avgCompletion >= 70
            }}
          />
        </div>

        {/* Course Catalog Section */}
        <div
          className="bg-white rounded-lg transition-all duration-200"
          style={{
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            fontFamily: '"Fira Sans", sans-serif'
          }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2
              className="text-lg font-semibold text-gray-900"
              style={{ fontFamily: '"Fira Code", monospace' }}
            >
              Course Catalog
            </h2>
            <p className="text-xs text-gray-500 mt-1">Browse and manage all training courses</p>
          </div>
          <div className="p-6">
            {courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Courses Available"
                description="Create your first course to start building your learning and development program."
                action={{
                  label: "Create First Course",
                  onClick: handleCreateCourse
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg p-4 transition-all duration-200 cursor-pointer hover:border-blue-800 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-800"
                    style={{ fontFamily: '"Fira Sans", sans-serif' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="font-semibold text-gray-900 flex-1"
                        style={{ fontFamily: '"Fira Code", monospace' }}
                      >
                        {course.title}
                      </h3>
                      <Badge variant={course.isActive ? 'success' : 'neutral'}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {course.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    )}
                    <div className="space-y-2 text-xs text-gray-500 font-medium">
                      <p className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" style={{ color: '#1E40AF' }} />
                        <span>{course.enrollmentCount || 0} enrolled</span>
                      </p>
                      {course.durationHours && (
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" style={{ color: '#1E40AF' }} />
                          <span>{course.durationHours} hours</span>
                        </p>
                      )}
                      {course.instructor && (
                        <p className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-700">Instructor:</span>
                          <span>{course.instructor}</span>
                        </p>
                      )}
                      {course.completionRate !== undefined && (
                        <p className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                          <span>{course.completionRate}% completion</span>
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
    </AdminPageLayout>
  );
};

export default LearningAdmin;
