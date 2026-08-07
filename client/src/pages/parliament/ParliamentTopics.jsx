/**
 * Parliament Topics Page - Citizens Can Vote
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useParliament } from '../../hooks/useParliament';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ParliamentTopics = () => {
  const { user } = useAuth();
  const { topics, isLoading, refetch, voteOnTopic, addExpertOpinion } = useParliament();
  const [opinion, setOpinion] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [votingLoading, setVotingLoading] = useState(false);

  // ✅ Handle vote with loading state and refetch
  const handleVote = async (topicId) => {
    setVotingLoading(true);
    try {
      const result = await voteOnTopic.mutateAsync({ id: topicId, vote: 'approve' });
      if (result) {
        toast.success('✅ Vote recorded successfully!');
        // ✅ Refetch topics to update vote count
        await refetch();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to vote');
    } finally {
      setVotingLoading(false);
    }
  };

  const handleExpertOpinion = async (topicId) => {
    if (!opinion.trim()) {
      toast.error('Please enter your opinion');
      return;
    }
    const result = await addExpertOpinion.mutateAsync({ id: topicId, opinion });
    if (result) {
      toast.success('✅ Expert opinion added!');
      setOpinion('');
      setSelectedTopic(null);
      await refetch();
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏛️</span>
          <div>
            <h1 className="text-2xl font-bold text-bodhi-navy">Parliament Topics</h1>
            <p className="text-gray-500 text-sm mt-1">
              Track parliament discussions and share your voice
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {topics.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">No parliament topics available</p>
          </div>
        ) : (
          topics.map((topic) => (
            <div key={topic._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-bodhi-navy">{topic.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      topic.sector === 'health' ? 'bg-green-100 text-green-700' :
                      topic.sector === 'environment' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {topic.sector}
                    </span>
                    {topic.district && (
                      <span className="text-xs text-gray-500">📍 {topic.district}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      📅 {format(new Date(topic.parliamentDate), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-sambandh-brass/70 bg-sambandh-brass/5 px-2 py-0.5 rounded-full">
                      {topic.parliamentSession || 'Current Session'}
                    </span>
                  </div>
                </div>
                <div className="text-center bg-sambandh-brass/5 rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold text-sambandh-brass">
                    {topic.totalVotes || 0}
                  </div>
                  <div className="text-xs text-gray-500">Total Votes</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mt-3 text-sm">{topic.description}</p>

              {/* ✅ VOTING - Single Vote Button for Citizens */}
              {user?.role === 'citizen' && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleVote(topic._id)}
                    disabled={votingLoading}
                    className="flex items-center gap-1.5 px-5 py-2 bg-sambandh-brass text-white rounded-lg hover:bg-sambandh-brass-light transition font-medium disabled:opacity-50"
                  >
                    {votingLoading ? '⏳ Voting...' : '🗳️ Vote'}
                  </button>
                  <span className="text-xs text-gray-400">
                    {topic.totalVotes || 0} votes received
                  </span>
                </div>
              )}

              {/* ✅ Experts can give opinions */}
              {user?.role === 'expert' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {selectedTopic === topic._id ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
                        placeholder="Add your expert opinion..."
                        value={opinion}
                        onChange={(e) => setOpinion(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExpertOpinion(topic._id)}
                          className="px-4 py-2 bg-bodhi-navy text-white rounded-lg hover:bg-bodhi-navy-deep transition"
                        >
                          Submit Opinion
                        </button>
                        <button
                          onClick={() => setSelectedTopic(null)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTopic(topic._id)}
                      className="text-sm text-bodhi-navy hover:text-sambandh-brass transition font-medium"
                    >
                      💬 Add Expert Opinion
                    </button>
                  )}
                </div>
              )}

              {/* Expert Opinions Display */}
              {topic.expertOpinions?.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-2">👨‍🔬 Expert Opinions</p>
                  {topic.expertOpinions.map((op, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <p className="text-sm text-gray-700">💬 {op.opinion}</p>
                      <p className="text-xs text-gray-400">
                        - {op.expertId?.name || 'Expert'} • {format(new Date(op.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParliamentTopics;