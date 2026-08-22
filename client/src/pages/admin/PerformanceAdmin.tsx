import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Award, Plus, Star, Search, Sparkles, CheckCircle2, Filter, AlertCircle, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { AdminPageLayout } from '../../components/shared/AdminPageLayout';
import { StatsCard } from '../../components/shared/StatsCard';
import { LoadingState } from '../../components/shared/LoadingState';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

interface Review {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  rating: number;
  period: string;
  feedback: string;
  goals: string;
  date: string;
}

interface ValidationErrors {
  employeeId?: string;
  feedback?: string;
  goals?: string;
}

const MAX_FEEDBACK_LENGTH = 500;
const MAX_GOALS_LENGTH = 500;
const SEARCH_DEBOUNCE_MS = 300;

export const PerformanceAdmin: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [rating, setRating] = useState(5);
  const [period, setPeriod] = useState('Q4 2026');
  const [feedback, setFeedback] = useState('');
  const [goals, setGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Default reviews - in production, these would come from API
  const defaultReviews: Review[] = useMemo(() => [
    {
      id: 'rev-1',
      employeeId: 'emp-1',
      employeeName: 'Sarah Jenkins',
      designation: 'Senior Cloud Engineer',
      department: 'Engineering',
      rating: 5,
      period: 'Q3 2026',
      feedback: 'Sarah has shown exemplary dedication in completing the cloud migration milestone. Exceptional troubleshooting skills.',
      goals: 'Lead the containerization project, mentor junior hires',
      date: '2026-10-15',
    },
    {
      id: 'rev-2',
      employeeId: 'emp-2',
      employeeName: 'Rohan Sharma',
      designation: 'UI Developer',
      department: 'Product Design',
      rating: 4,
      period: 'Q3 2026',
      feedback: 'Excellent work on the HRMS components overhaul. Attention to UX details and fluid micro-interactions is outstanding.',
      goals: 'Expand skillsets in headless CMS architectures, lead accessibility compliance audits',
      date: '2026-10-14',
    },
    {
      id: 'rev-3',
      employeeId: 'emp-3',
      employeeName: 'David Mercer',
      designation: 'Talent Acquisition Executive',
      department: 'Human Resources',
      rating: 4,
      period: 'Q3 2026',
      feedback: 'Successfully onboarded 15 new engineers this quarter. Maintained positive candidate satisfaction scores throughout.',
      goals: 'Reduce overall time-to-hire by 10%, refine recruitment pipeline stats reports',
      date: '2026-10-12',
    },
  ], []);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const empRes = await api.get('/employees');
      setEmployees(empRes.data.data);
      setReviews(defaultReviews);
    } catch (err) {
      console.error('Failed to load performance data:', err);
      setReviews(defaultReviews);
    } finally {
      setIsLoading(false);
    }
  }, [defaultReviews]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!employeeId) {
      errors.employeeId = 'Please select an employee';
    }

    if (!feedback.trim()) {
      errors.feedback = 'Feedback is required';
    } else if (feedback.length > MAX_FEEDBACK_LENGTH) {
      errors.feedback = `Feedback must not exceed ${MAX_FEEDBACK_LENGTH} characters`;
    }

    if (goals.length > MAX_GOALS_LENGTH) {
      errors.goals = `Goals must not exceed ${MAX_GOALS_LENGTH} characters`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const emp = employees.find(e => e.id === employeeId);
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        employeeId,
        employeeName: emp?.fullName || 'Unknown Employee',
        designation: emp?.employee?.designation || 'Staff Member',
        department: emp?.employee?.department || 'Operations',
        rating,
        period,
        feedback,
        goals,
        date: new Date().toISOString().split('T')[0],
      };

      const updated = [newReview, ...reviews];
      setReviews(updated);

      // Reset form
      setEmployeeId('');
      setRating(5);
      setPeriod('Q4 2026');
      setFeedback('');
      setGoals('');
      setValidationErrors({});
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = ['All', ...Array.from(new Set(reviews.map((r) => r.department)))];

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = r.employeeName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          r.feedback.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesDept = selectedDept === 'All' || r.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0';
  const goalCompletionRate = 84; // Mock data - in production would come from API

  if (isLoading) {
    return (
      <AdminPageLayout
        title="Performance Management"
        description="Monitor goals, track appraisals, and submit comprehensive performance reviews."
        icon={Award}
      >
        <LoadingState type="stats" />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Performance Management"
      description="Monitor goals, track appraisals, and submit comprehensive performance reviews."
      icon={Award}
      action={{
        label: 'New Review',
        onClick: () => setIsModalOpen(true),
        icon: Plus,
      }}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatsCard
            label="Average Appraisal Rating"
            value={`${avgRating} / 5.0`}
            icon={Star}
            variant="warning"
            trend={{
              value: `Based on ${reviews.length} reviews`,
              isPositive: true,
            }}
          />

          <StatsCard
            label="Active Goals Completed"
            value={`${goalCompletionRate}%`}
            icon={CheckCircle2}
            variant="success"
            trend={{
              value: '+6% from last quarter',
              isPositive: true,
            }}
          />

          <StatsCard
            label="Total Reviews"
            value={reviews.length}
            icon={Award}
            variant="primary"
            trend={{
              value: 'Verified by HR team',
              isPositive: true,
            }}
          />
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all cursor-pointer"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No performance records matched your filters.</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 hover:bg-slate-50 transition-all duration-200 space-y-3 cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-sm group-hover:bg-blue-100 transition-colors">
                        {rev.employeeName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{rev.employeeName}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {rev.designation} • <span className="font-semibold text-slate-600">{rev.department}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant="info">{rev.period}</Badge>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pl-0 sm:pl-13 space-y-3">
                    <div>
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Evaluation & Feedback
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{rev.feedback}</p>
                    </div>
                    {rev.goals && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start space-x-3 hover:border-blue-200 transition-colors">
                        <Sparkles className="h-4 w-4 text-blue-800 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Quarterly Objectives (KPIs)
                          </span>
                          <p className="text-sm text-slate-700 font-medium">{rev.goals}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>Reviewed on {rev.date}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal - New Review appraisal dialog */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setValidationErrors({});
            setEmployeeId('');
            setRating(5);
            setPeriod('Q4 2026');
            setFeedback('');
            setGoals('');
          }}
          title="Submit Performance Review"
          subtitle="File a quarterly or annual evaluation record for active employee profiles."
          maxWidth="xl"
        >
          <form onSubmit={handleSubmitReview} className="space-y-5">
            {/* Select Employee */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setValidationErrors({ ...validationErrors, employeeId: undefined });
                }}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all cursor-pointer ${
                  validationErrors.employeeId ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                required
              >
                <option value="">Choose an employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employee?.designation || 'Staff'})
                  </option>
                ))}
              </select>
              {validationErrors.employeeId && (
                <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.employeeId}</span>
                </div>
              )}
            </div>

            {/* Appraisal period & Rating */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Review Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="Q3 2026">Q3 2026</option>
                  <option value="Q4 2026">Q4 2026</option>
                  <option value="Annual 2026">Annual 2026</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Appraisal Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Excellent Performance</option>
                  <option value={4}>⭐⭐⭐⭐ Above Expectations</option>
                  <option value={3}>⭐⭐⭐ Meets Expectations</option>
                  <option value={2}>⭐⭐ Below Expectations</option>
                  <option value={1}>⭐ Unsatisfactory</option>
                </select>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Manager Evaluation & Feedback <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-medium ${
                  feedback.length > MAX_FEEDBACK_LENGTH ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {feedback.length}/{MAX_FEEDBACK_LENGTH}
                </span>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  setValidationErrors({ ...validationErrors, feedback: undefined });
                }}
                placeholder="Detail accomplishments, strengths, work ethics, areas of improvement..."
                className={`w-full px-3 py-2.5 border rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent min-h-[110px] resize-none transition-all ${
                  validationErrors.feedback ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                required
                maxLength={MAX_FEEDBACK_LENGTH}
              />
              {validationErrors.feedback && (
                <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.feedback}</span>
                </div>
              )}
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Quarterly Objectives & Goals (KPIs)
                </label>
                <span className={`text-xs font-medium ${
                  goals.length > MAX_GOALS_LENGTH ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {goals.length}/{MAX_GOALS_LENGTH}
                </span>
              </div>
              <textarea
                value={goals}
                onChange={(e) => {
                  setGoals(e.target.value);
                  setValidationErrors({ ...validationErrors, goals: undefined });
                }}
                placeholder="e.g. Mentor junior devs, complete accessibility audits, lead migration project..."
                className={`w-full px-3 py-2.5 border rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent min-h-[80px] resize-none transition-all ${
                  validationErrors.goals ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                maxLength={MAX_GOALS_LENGTH}
              />
              {validationErrors.goals && (
                <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{validationErrors.goals}</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setValidationErrors({});
                  setEmployeeId('');
                  setRating(5);
                  setPeriod('Q4 2026');
                  setFeedback('');
                  setGoals('');
                }}
                className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 cursor-pointer hover:opacity-90 hover:-translate-y-0.5"
                style={{ backgroundColor: '#F59E0B' }}
              >
                {isSubmitting ? 'Filing Record...' : 'Submit Appraisal'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminPageLayout>
  );
};

export default PerformanceAdmin;
