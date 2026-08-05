/**
 * Simulator Page
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDrafts } from '../../hooks/useDrafts';
import axiosClient from '../../api/axiosClient';
import API from '../../api/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SimulatorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useDraft } = useDrafts();
  const { data: draft, isLoading } = useDraft(id);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const { data } = await axiosClient.post(API.SIMULATOR, {
        draftId: id,
        sector: draft?.sector,
        district: draft?.district,
        budgetAmount: draft?.budgetAmount,
      });
      setResults(data.data);
      toast.success('Simulation complete!');
    } catch (error) {
      toast.error('Simulation failed. Please try again.');
    } finally {
      setSimulating(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!draft) return <div className="text-center py-12">Draft not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif text-bodhi-navy">Impact Simulator</h1>
        <button
          onClick={() => navigate(`/drafts/${id}`)}
          className="btn-secondary text-sm"
        >
          ← Back to Draft
        </button>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-serif text-bodhi-navy mb-2">{draft.title}</h2>
        <p className="text-sm text-gray-500">
          {draft.sector} • {draft.district}
        </p>
        {draft.budgetAmount && (
          <p className="text-sm text-bodhi-navy mt-2">
            Budget: NPR {draft.budgetAmount.toLocaleString()}
          </p>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg text-bodhi-navy">Run Simulation</h3>
            <p className="text-sm text-gray-500">
              Analyze the potential impact of this policy
            </p>
          </div>
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="btn-primary"
          >
            {simulating ? 'Running...' : ' Run Simulation'}
          </button>
        </div>
      </div>

      {results && (
        <div className="card">
          <h3 className="font-serif text-lg text-bodhi-navy mb-4">Simulation Results</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-bodhi-cream p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-bodhi-navy">{results.estimatedJobs}</p>
              <p className="text-xs text-gray-500">Estimated Jobs Created</p>
            </div>
            <div className="bg-bodhi-cream p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-bodhi-gold">
                {(results.spendingEfficiencyScore * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">Efficiency Score</p>
            </div>
            <div className="bg-bodhi-cream p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-bodhi-maroon">
                {(results.confidence * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">Confidence Level</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-bodhi-navy mb-3">Comparable Cases</h4>
            <div className="space-y-3">
              {results.comparableCases?.map((case_, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-3">
                  <p className="font-medium text-bodhi-navy">
                    {case_.year} - {case_.district}
                  </p>
                  <p className="text-sm text-gray-600">{case_.outcome}</p>
                </div>
              ))}
            </div>
          </div>

          {results.recommendations && (
            <div>
              <h4 className="font-medium text-bodhi-navy mb-3">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {results.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              ⚠️ This is a simulation. Results are for demonstration purposes only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatorPage;