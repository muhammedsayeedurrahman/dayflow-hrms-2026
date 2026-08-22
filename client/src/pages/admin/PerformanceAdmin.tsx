import React, { useState, useEffect } from 'react';
import { Award, Plus, Star, Search, Sparkles, CheckCircle2, Filter } from 'lucide-react';
import { api } from '../../services/api';
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

export const PerformanceAdmin: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  
  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [rating, setRating] = useState(5);
  const [period, setPeriod] = useState('Q4 2026');
  const [feedback, setFeedback] = useState('');
  const [goals, setGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preseeded mock review list to avoid initial empty state
  const defaultReviews: Review[] = [
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
  ];

  const fetchInitialData = async () => {
    try {
      const empRes = await api.get('/employees');
      setEmployees(empRes.data.data);
      
      const localRev = localStorage.getItem('dayflow_performance_reviews');
      if (localRev) {
        setReviews(JSON.parse(localRev));
      } else {
        localStorage.setItem('dayflow_performance_reviews', JSON.stringify(defaultReviews));
        setReviews(defaultReviews);
      }
    } catch (err) {
      console.error('Failed to load performance data:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
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
      localStorage.setItem('dayflow_performance_reviews', JSON.stringify(updated));
      setReviews(updated);
      
      // Reset form
      setEmployeeId('');
      setRating(5);
      setPeriod('Q4 2026');
      setFeedback('');
      setGoals('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = ['All', ...Array.from(new Set(reviews.map((r) => r.department)))];

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.feedback.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || r.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="space-y-6 page-enter-transition">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Performance Management</h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor goals, track appraisals, and submit comprehensive performance reviews.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Review</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Appraisal Rating</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1 flex items-center space-x-1.5">
                <span>{avgRating}</span>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Star className="h-5 w-5 fill-current" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-3">Calculated from {reviews.length} reviews</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Goals Completed</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">84%</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-green-600 font-bold mt-3">+6% from last quarter</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appraisal Reviews</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{reviews.length}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-3">Fully verified by HR team</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No performance records matched your filters.</div>
          ) : (
            filteredReviews.map((rev) => (
              <div key={rev.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {rev.employeeName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.employeeName}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {rev.designation} • <span className="font-bold text-slate-400">{rev.department}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="info">{rev.period}</Badge>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pl-11 space-y-2">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Evaluation & Feedback</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-0.5">{rev.feedback}</p>
                  </div>
                  {rev.goals && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start space-x-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Quarterly Objectives (KPIs)</span>
                        <p className="text-[11px] text-slate-600 font-semibold mt-0.5">{rev.goals}</p>
                      </div>
                    </div>
                  )}
                  <span className="block text-[9px] text-slate-400 font-bold">Reviewed on {rev.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal - New Review appraisal dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Performance Review"
        subtitle="File a quarterly or annual evaluation record for active employee profiles."
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 pt-2 pb-1">
          {/* Select Employee */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Select Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Choose an employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employee?.designation || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          {/* Appraisal period & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Review Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Q3 2026">Q3 2026</option>
                <option value="Q4 2026">Q4 2026</option>
                <option value="Annual 2026">Annual 2026</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Appraisal Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={5}>5 - Excellent Performance</option>
                <option value={4}>4 - Above Expectations</option>
                <option value={3}>3 - Meets Expectations</option>
                <option value={2}>2 - Below Expectations</option>
                <option value={1}>1 - Unsatisfactory</option>
              </select>
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Manager Evaluation & Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Detail accomplishments, strengths, work ethics..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[90px]"
              required
            />
          </div>

          {/* Goals */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Quarterly Objectives & Goals (KPIs)</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Mentor junior devs, complete accessibility audits..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px]"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Filing Record...' : 'Submit Appraisal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default PerformanceAdmin;
