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

const AIInsightsAdmin: React.FC = () => {
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
            label="Average Risk Score"
            value={stats.averageScore.toFixed(1)}
            icon={TrendingUp}
            variant="warning"
          />
          <StatsCard
            label="High Risk"
            value={stats.critical + stats.high}
            icon={AlertTriangle}
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

      {/* Filters */}
      <div
        className="bg-white rounded-lg p-4 transition-all duration-200"
        style={{
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          fontFamily: '"Fira Sans", sans-serif',
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" style={{ color: '#1E40AF' }} />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer hover:border-blue-400"
            style={{
              fontFamily: '"Fira Sans", sans-serif',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#1E40AF';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(30, 64, 175, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer hover:border-blue-400"
            style={{
              fontFamily: '"Fira Sans", sans-serif',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#1E40AF';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(30, 64, 175, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                color: '#1E40AF',
                fontFamily: '"Fira Sans", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EFF6FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1E40AF';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(30, 64, 175, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <X className="w-4 h-4" />
              Clear Filters
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
              className={`bg-white rounded-lg p-6 border-l-4 transition-all duration-200 cursor-pointer ${
                insight.riskLevel === 'CRITICAL'
                  ? 'border-red-500'
                  : insight.riskLevel === 'HIGH'
                  ? 'border-orange-500'
                  : insight.riskLevel === 'MEDIUM'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
              style={{
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                fontFamily: '"Fira Sans", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex gap-6">
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
                      <h3
                        className="text-lg font-semibold text-gray-900"
                        style={{ fontFamily: '"Fira Code", monospace' }}
                      >
                        {insight.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="blue">{insight.type.replace(/_/g, ' ')}</Badge>
                        <span className="text-xs text-gray-500">
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
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                          color: '#1E40AF',
                          fontFamily: '"Fira Sans", sans-serif',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#EFF6FF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#1E40AF';
                          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(30, 64, 175, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Acknowledge
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3">{insight.description}</p>

                  {insight.recommendation && (
                    <div
                      className="border rounded-lg p-3 mb-3"
                      style={{
                        backgroundColor: '#EFF6FF',
                        borderColor: '#BFDBFE',
                      }}
                    >
                      <p
                        className="text-sm font-semibold mb-1"
                        style={{
                          color: '#1E40AF',
                          fontFamily: '"Fira Code", monospace',
                        }}
                      >
                        Recommendations:
                      </p>
                      <p className="text-sm" style={{ color: '#1E3A8A' }}>
                        {insight.recommendation}
                      </p>
                    </div>
                  )}

                  {insight.metadata?.factors && (
                    <div>
                      <p
                        className="text-xs font-medium text-gray-500 mb-2"
                        style={{ fontFamily: '"Fira Code", monospace' }}
                      >
                        Risk Factors:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {insight.metadata.factors.map((factor: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded transition-colors cursor-default"
                            style={{
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              fontFamily: '"Fira Sans", sans-serif',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#E5E7EB';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#F3F4F6';
                            }}
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
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
