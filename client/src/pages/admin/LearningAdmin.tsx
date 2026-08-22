import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { learningAPI } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { AdminPageLayout, StatsCard, LoadingState, EmptyState } from '../../components/shared';
import { toast } from '../../store/toastStore';

export const LearningAdmin: React.FC = () => {
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 space-y-4">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900">
              Course Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-semibold">Browse and manage all training courses</p>
          </div>
          
          <div>
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
                    className="bg-white border border-slate-200/60 rounded-2xl p-5 interactive-card cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xs font-bold text-slate-900 flex-1">
                        {course.title}
                      </h3>
                      <Badge variant={course.isActive ? 'success' : 'neutral'}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {course.description && (
                      <p className="text-[11px] text-slate-500 font-semibold mb-3 leading-relaxed line-clamp-2">{course.description}</p>
                    )}
                    <div className="space-y-2 text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-3">
                      <p className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{course.enrollmentCount || 0} enrolled</span>
                      </p>
                      {course.durationHours && (
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{course.durationHours} hours</span>
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
