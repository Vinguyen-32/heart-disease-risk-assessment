import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, AlertCircle, MessageCircle, Download, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../services/api';
import type { Assessment, Prediction } from '../types';

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadResults();
    }
  }, [sessionId]);

  const loadResults = async () => {
    try {
      const assessmentData = await api.getAssessment(sessionId!);
      setAssessment(assessmentData);
      
      const predictionData = await api.getPredictionByAssessment(assessmentData.id);
      setPrediction(predictionData);
    } catch (error) {
      console.error('Failed to load results:', error);
      alert('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!assessment) return;
    try {
      const chatSession = await api.createChatSession(assessment.id);
      navigate(`/chat/${chatSession.session_token}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-xl text-gray-600">Analyzing your results...</p>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No results found</p>
        </div>
      </div>
    );
  }

  const getRiskColorClass = (level: string) => {
    const colorMap: { [key: string]: string } = {
      'low': 'bg-green-100 border-green-500 text-green-800',
      'moderate': 'bg-orange-100 border-orange-500 text-orange-800',
      'high': 'bg-red-100 border-red-500 text-red-800',
      'critical': 'bg-red-200 border-red-700 text-red-900',
    };
    return colorMap[level] || 'bg-gray-100 border-gray-500 text-gray-800';
  };

  const chartData = Object.entries(prediction.probabilities).map(([classNum, prob]) => ({
    name: `Class ${classNum}`,
    value: prob * 100,
    label: ['No Disease', 'Mild-Moderate', 'Severe-Critical'][parseInt(classNum)],
  }));

  const COLORS = ['#10b981', '#f97316', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Risk Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Heart className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Your Heart Health Assessment</h1>
              <p className="text-gray-600">Results based on AI prediction</p>
            </div>
          </div>

          <div className={`border-l-4 rounded-lg p-6 mb-6 ${getRiskColorClass(prediction.risk_level)}`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Risk Level: {prediction.risk_level.toUpperCase()}
                </h2>
                <p className="text-lg mb-2">{prediction.risk_description}</p>
                <div className="flex gap-4 text-sm">
                  <span>Predicted Class: <strong>{prediction.predicted_class}</strong></span>
                  <span>Confidence: <strong>{(prediction.confidence_score * 100).toFixed(1)}%</strong></span>
                  <span>Risk Score: <strong>{prediction.risk_score}/100</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Probability Distribution Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Probability Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Key Risk Factors */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Risk Factors</h3>
              <div className="space-y-2">
                {Object.entries(prediction.feature_importance).slice(0, 5).map(([feature, importance]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{feature.replace(/_/g, ' ')}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(importance as number) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{((importance as number) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleStartChat}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat About Your Results
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-outline flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Recommendations */}
        {prediction.recommendations && prediction.recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Personalized Recommendations</h2>
            <div className="space-y-4">
              {prediction.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Important Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Important Disclaimer</h3>
              <p className="text-sm text-yellow-700">
                This assessment is for informational purposes only and is not a substitute for 
                professional medical advice, diagnosis, or treatment. Always seek the advice of 
                your physician or other qualified health provider with any questions you may have 
                regarding a medical condition. If you think you may have a medical emergency, 
                call your doctor or emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: any }) {
  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold">{recommendation.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
          {recommendation.priority}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{recommendation.description}</p>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Action Steps:</p>
        <ul className="space-y-2">
          {recommendation.action_items.map((item: string, index: number) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}