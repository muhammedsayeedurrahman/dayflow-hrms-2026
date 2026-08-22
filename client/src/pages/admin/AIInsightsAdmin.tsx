import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { aiInsightsAPI } from '../../services/api';
import { RiskGauge } from '../../components/ai/RiskGauge';
import { Badge } from '../../components/ui/Badge';

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
      alert(error.response?.data?.error || 'Failed to fetch AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [filterRisk, filterType]);

  const handleGenerateInsights = async () => {
    if (
      !confirm(
        'This will analyze all employees and generate new AI insights. Continue?'
      )
    )
      return;

    setIsGenerating(true);
    try {
      const response = await aiInsightsAPI.generateInsights();
      alert(
        `Successfully generated ${response.data.data.insightsGenerated} insights from ${response.data.data.totalEmployeesAnalyzed} employees`
      );
      fetchInsights();
    } catch (error: any) {
      console.error('Failed to generate insights:', error);
      alert(error.response?.data?.error || 'Failed to generate insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await aiInsightsAPI.acknowledgeInsight(id);
      fetchInsights();
    } catch (error: any) {
      console.error('Failed to acknowledge insight:', error);
      alert(error.response?.data?.error || 'Failed to acknowledge insight');
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
              <p className="text-sm text-gray-500">
                Predictive analytics and intelligent recommendations
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`}
          />
          {isGenerating ? 'Generating...' : 'Generate Insights'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Insights</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageScore.toFixed(1)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.critical + stats.high}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.acknowledged}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Insights Available
            </h3>
            <p className="text-gray-500 mb-4">
              Generate AI insights to analyze employee attrition risks and get
              recommendations.
            </p>
            <button
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Generate First Insights
            </button>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                insight.riskLevel === 'CRITICAL'
                  ? 'border-red-500'
                  : insight.riskLevel === 'HIGH'
                  ? 'border-orange-500'
                  : insight.riskLevel === 'MEDIUM'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
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
                      <h3 className="text-lg font-semibold text-gray-900">
                        {insight.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="indigo">{insight.type.replace(/_/g, ' ')}</Badge>
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
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Acknowledge
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3">{insight.description}</p>

                  {insight.recommendation && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-indigo-900 mb-1">
                        Recommendations:
                      </p>
                      <p className="text-sm text-indigo-700">
                        {insight.recommendation}
                      </p>
                    </div>
                  )}

                  {insight.metadata?.factors && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Risk Factors:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {insight.metadata.factors.map((factor: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
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
    </div>
  );
};
export default AIInsightsAdmin;
