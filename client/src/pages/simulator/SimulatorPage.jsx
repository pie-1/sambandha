/**
 * Simulator Page - ML Integration
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SimulatorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useDraft } = useDrafts();
  const { data: draft, isLoading } = useDraft(id);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Only Officers and Experts can access
  if (!user || (user.role !== 'officer' && user.role !== 'expert')) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-600">Access Denied</h2>
        <p className="text-gray-500">Only Officers and Experts can use the simulator</p>
      </div>
    );
  }

  const handleSimulate = async () => {
    setSimulating(true);
    setError(null);
    try {
      // Call the ML prediction endpoint
      const { data } = await axiosClient.get(`/drafts/${id}/ml-prediction`);
      
      const prediction = data.prediction;
      
      // Transform the prediction data for display
      setResults({
        successProbability: prediction.successModel?.probability || 0.5,
        efficiencyScore: prediction.impactModel?.best?.marginalPerCrore || 0.3,
        riskLevel: prediction.successModel?.probability > 0.7 ? 'Low' : 
                   prediction.successModel?.probability > 0.4 ? 'Medium' : 'High',
        estimatedJobs: Math.round((draft?.budgetAmount || 10000000) / 100000),
        confidenceScore: prediction.successModel?.probability || 0.5,
        budgetAmount: draft?.budgetAmount || 10000000,
        riskFactors: prediction.consensus?.filter(c => c.level === 'negative').map(c => c.text) || [],
        recommendations: prediction.consensus?.filter(c => c.level === 'positive').map(c => c.text) || [],
        drivers: prediction.successModel?.drivers || [],
        // Friend's ML model specific fields
        tagging: prediction.tagging,
        impactModel: prediction.impactModel,
        claimsModel: prediction.claimsModel,
        sources: prediction.sources,
      });
      
    } catch (err) {
      console.error('Simulation error:', err);
      setError('Failed to run simulation. Please try again.');
    } finally {
      setSimulating(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!draft) return <div className="text-center py-12">Draft not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/drafts/${id}`)}
          className="text-bodhi-navy hover:text-sambandh-brass transition"
        >
          ← Back to Policy
        </button>
        <div>
          <h1 className="text-2xl font-bold text-bodhi-navy">Impact Simulator</h1>
          <p className="text-sm text-gray-500">ML-powered policy impact prediction</p>
        </div>
      </div>

      {/* Draft Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-bold text-bodhi-navy">{draft.title}</h3>
        <p className="text-sm text-gray-500">
          {draft.sector} • {draft.district}
        </p>
        {draft.budgetAmount && (
          <p className="text-sm text-bodhi-navy font-medium mt-1">
            Budget: NPR {draft.budgetAmount.toLocaleString()}
          </p>
        )}
      </div>

      {/* Simulate Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 text-center">
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="px-10 py-3 bg-sambandh-brass text-white rounded-lg font-semibold hover:bg-sambandh-brass-light transition disabled:opacity-50"
        >
          {simulating ? 'Analyzing policy impact...' : 'Run ML Simulation'}
        </button>
        <p className="text-xs text-gray-400 mt-2">
          ML model trained on Nepal health and environmental data
        </p>
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-bodhi-navy mb-4">ML Prediction Results</h3>

          {/* Success Probability */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Success Probability</span>
              <span className="text-lg font-bold text-bodhi-navy">
                {(results.successProbability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  results.successProbability > 0.7 ? 'bg-green-500' :
                  results.successProbability > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${results.successProbability * 100}%` }}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-bodhi-navy">
                {results.estimatedJobs || 0}
              </div>
              <div className="text-xs text-gray-500">Jobs Created</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-sambandh-brass">
                {(results.efficiencyScore * 100 || 0).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">Efficiency</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-bodhi-navy">
                {results.riskLevel || 'Medium'}
              </div>
              <div className="text-xs text-gray-500">Risk Level</div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confidence Score</span>
              <span className="text-lg font-bold text-bodhi-navy">
                {(results.confidenceScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Risk Factors */}
          {results.riskFactors && results.riskFactors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-bodhi-navy mb-2">Risk Factors</h4>
              <ul className="space-y-1">
                {results.riskFactors.map((risk, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500">•</span> {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-bodhi-navy mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {results.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-sambandh-brass">•</span> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Drivers (from friend's ML model) */}
          {results.drivers && results.drivers.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-bodhi-navy mb-2">Key Drivers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {results.drivers.slice(0, 4).map((driver, i) => (
                  <div key={i} className="text-sm text-gray-600 border border-gray-100 rounded-lg p-2">
                    <span className="font-medium">{driver.label}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {driver.direction === 'positive' ? '⬆' : '⬇'} {driver.impact.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources (from friend's ML model) */}
          {results.sources && results.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-bodhi-navy mb-2">Data Sources</h4>
              <ul className="space-y-1">
                {results.sources.map((source, i) => (
                  <li key={i} className="text-xs text-gray-400">
                    • {source.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulatorPage;