import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Eye,
  Filter,
  X,
} from 'lucide-react';
import { aiInsightsAPI } from '../../services/api';
import { RiskGauge } from '../../components/ai/RiskGauge';
import { Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { AdminPageLayout } from '../../components/shared/AdminPageLayout';
import { StatsCard } from '../../components/shared/StatsCard';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';

interface AIInsight {
  id: string;
  type: string;
  employeeId: string | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  score: number | null;
  title: string;
  description: string;
  recommendation: string | null;
  metadata: any;
  confidence: number;
  isActive: boolean;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
}

interface AttritionStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  averageScore: number;
  acknowledged: number;
}

export const AIInsightsAdmin: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [stats, setStats] = useState<AttritionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterRisk, setFilterRisk] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const [insightsRes, statsRes] = await Promise.all([
        aiInsightsAPI.getAllInsights(filterType || undefined, filterRisk || undefined),
        aiInsightsAPI.getAttritionStats(),
      ]);

      setInsights(insightsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch AI insights:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [filterRisk, filterType]);

  const handleGenerateInsights = async () => {
    setShowGenerateConfirm(false);
    setIsGenerating(true);
    try {
      const response = await aiInsightsAPI.generateInsights();
      toast.success(
        `Successfully generated ${response.data.data.insightsGenerated} insights from ${response.data.data.totalEmployeesAnalyzed} employees`
      );
      fetchInsights();
    } catch (error: any) {
      console.error('Failed to generate insights:', error);
      toast.error(error.response?.data?.error || 'Failed to generate insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateClick = () => {
    if (!isGenerating) {
      setShowGenerateConfirm(true);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await aiInsightsAPI.acknowledgeInsight(id);
      toast.success('Insight acknowledged successfully');
      fetchInsights();
    } catch (error: any) {
      console.error('Failed to acknowledge insight:', error);
      toast.error(error.response?.data?.error || 'Failed to acknowledge insight');
    }
  };

  if (isLoading) {
    return (
      <AdminPageLayout
        title="AI Insights"
        description="Predictive analytics and intelligent recommendations"
        icon={Brain}
      >
        <LoadingState rows={1} type="stats" />
        <div className="mt-6">
          <LoadingState rows={3} type="card" />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="AI Insights"
      description="Predictive analytics and intelligent recommendations"
      icon={Brain}
      action={{
        label: isGenerating ? 'Generating...' : 'Generate Insights',
        onClick: handleGenerateClick,
        icon: RefreshCw,
      }}
    >
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Insights"
            value={stats.total}
            icon={Brain}
            variant="primary"
          />
          <StatsCard
            label="Critical Risk"
            value={stats.critical}
            icon={AlertTriangle}
            variant="danger"
          />
          <StatsCard
            label="Attrition Risk Score"
            value={`${stats.averageScore.toFixed(0)}%`}
            icon={TrendingUp}
            variant="danger"
          />
          <StatsCard
            label="Acknowledged"
            value={stats.acknowledged}
            icon={CheckCircle}
            variant="success"
          />
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-3xs space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-700">Filters:</span>
          </div>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          >
            <option value="">All Types</option>
            <option value="ATTRITION_RISK">Attrition Risk</option>
            <option value="LEAVE_SUGGESTION">Leave Suggestion</option>
            <option value="PERFORMANCE_ALERT">Performance Alert</option>
            <option value="TRAINING_RECOMMENDATION">Training Recommendation</option>
          </select>

          {(filterRisk || filterType) && (
            <button
              onClick={() => {
                setFilterRisk('');
                setFilterType('');
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="No Insights Available"
            description="Generate AI insights to analyze employee attrition risks and get personalized recommendations for your team."
            action={{
              label: 'Generate First Insights',
              onClick: () => setShowGenerateConfirm(true),
            }}
          />
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-white rounded-2xl p-6 border-l-4 interactive-card cursor-pointer ${
                insight.riskLevel === 'CRITICAL'
                  ? 'border-red-500'
                  : insight.riskLevel === 'HIGH'
                  ? 'border-orange-500'
                  : insight.riskLevel === 'MEDIUM'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Risk Gauge */}
                {insight.score !== null && (
                  <div className="flex-shrink-0">
                    <RiskGauge score={insight.score} size="sm" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {insight.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="indigo">{insight.type.replace(/_/g, ' ')}</Badge>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(insight.createdAt).toLocaleDateString()}
                        </span>
                        {insight.acknowledgedBy && (
                          <Badge variant="success">Acknowledged</Badge>
                        )}
                      </div>
                    </div>

                    {!insight.acknowledgedBy && (
                      <button
                        onClick={() => handleAcknowledge(insight.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-3">
                    {insight.description}
                  </p>

                  {insight.recommendation && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-3">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                        Recommendations:
                      </p>
                      <p className="text-xs font-semibold text-blue-800 leading-relaxed">
                        {insight.recommendation}
                      </p>
                    </div>
                  )}

                  {insight.metadata?.factors && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Risk Factors:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {insight.metadata.factors.map((factor: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-default"
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400">
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Modal for Generate Insights */}
      <ConfirmModal
        isOpen={showGenerateConfirm}
        onClose={() => setShowGenerateConfirm(false)}
        onConfirm={handleGenerateInsights}
        title="Generate AI Insights"
        message="This will analyze all employees and generate new AI insights. Continue?"
        confirmLabel="Generate"
        cancelLabel="Cancel"
        type="info"
      />
    </AdminPageLayout>
  );
};

export default AIInsightsAdmin;
