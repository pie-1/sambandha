/**
 * STEP 2: Parliament Topics Feed
 * Real parliament topics with public voting and expert opinions
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useParliament } from '../../hooks/useParliament';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ThumbsUp, ThumbsDown, MessageSquare, Calendar, MapPin, Users, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ParliamentTopics = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { topics, isLoading, voteOnTopic, addExpertOpinion } = useParliament();
  const [opinion, setOpinion] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const handleVote = async (topicId, vote) => {
    const result = await voteOnTopic.mutateAsync({ id: topicId, vote });
    if (result) {
      toast.success(`✅ ${vote === 'approve' ? 'Approved' : 'Disapproved'} successfully!`);
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
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="bg-sdg-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</span>
          <span className="font-bold text-sdg-blue">Parliament Topics</span>
        </div>
        <div className="h-px flex-1 bg-gray-200"></div>
        <span className="text-xs text-gray-400">Public Voice</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-sdg-gold" />
          <div>
            <h1 className="text-3xl font-bold text-sdg-blue">🏛️ Parliament Topics</h1>
            <p className="text-gray-600 mt-1">
              Track parliament discussions on One Health issues and share your voice
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No parliament topics available</p>
          </div>
        ) : (
          topics.map((topic) => (
            <div key={topic._id} className="card border-l-4 border-sdg-gold">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-sdg-blue">{topic.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className={`badge badge-${topic.sector}`}>
                      {topic.sector}
                    </span>
                    {topic.district && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" /> {topic.district}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(topic.parliamentDate), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-sdg-blue/70 bg-sdg-blue/5 px-2 py-0.5 rounded-full">
                      {topic.parliamentSession || 'Current Session'}
                    </span>
                  </div>
                </div>
                <div className="text-center bg-sdg-blue/5 rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold text-sdg-gold">
                    {topic.approvalPercentage?.toFixed(0) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">Approval</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mt-3 text-sm">{topic.description}</p>

              {/* Voting */}
              {user?.role === 'citizen' && (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => handleVote(topic._id, 'approve')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium"
                  >
                    <ThumbsUp className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleVote(topic._id, 'disapprove')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    <ThumbsDown className="w-4 h-4" /> Disapprove
                  </button>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {topic.totalVotes || 0} votes
                  </span>
                </div>
              )}

              {/* Expert Opinions */}
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

              {/* Expert Opinion Form */}
              {user?.role === 'expert' && (
                <div className="mt-4">
                  {selectedTopic === topic._id ? (
                    <div className="space-y-2">
                      <textarea
                        className="input-field"
                        placeholder="Add your expert opinion..."
                        value={opinion}
                        onChange={(e) => setOpinion(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExpertOpinion(topic._id)}
                          className="btn-primary text-sm px-4 py-1.5"
                        >
                          Submit Opinion
                        </button>
                        <button
                          onClick={() => setSelectedTopic(null)}
                          className="btn-secondary text-sm px-4 py-1.5"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTopic(topic._id)}
                      className="text-sm text-sdg-blue hover:text-sdg-gold transition font-medium flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" /> Add Expert Opinion
                    </button>
                  )}
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