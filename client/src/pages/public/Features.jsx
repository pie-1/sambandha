/**
 * Features Section - Homepage
 * Shows all platform features with icons
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Users, ThumbsUp, Video, BarChart3, GitBranch, Shield, ArrowRight } from 'lucide-react';

const Features = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FileText,
      title: 'Policy Drafting',
      description: 'Create and manage policy drafts with full version history. Every change is tracked and attributed.',
      color: 'bg-sdg-blue/10',
      iconColor: 'text-sdg-blue',
    },
    {
      icon: Users,
      title: 'Expert Review',
      description: 'Verified experts review drafts, provide feedback, and build consensus before policies are finalized.',
      color: 'bg-sambandh-brass/10',
      iconColor: 'text-sambandh-brass',
    },
    {
      icon: ThumbsUp,
      title: 'Public Voting',
      description: 'Citizens vote on finalized policies with one-tap approve/disapprove. Your voice shapes Nepal\'s future.',
      color: 'bg-sdg-green/10',
      iconColor: 'text-sdg-green',
    },
    {
      icon: Video,
      title: 'Live Meetings',
      description: 'Real-time video discussions for officers and experts using integrated Jitsi Meet. Collaborate seamlessly.',
      color: 'bg-sdg-blue-light/10',
      iconColor: 'text-sdg-blue-light',
    },
    {
      icon: BarChart3,
      title: 'Impact Simulator',
      description: 'ML-powered policy impact simulation with job creation estimates, efficiency scores, and risk assessment.',
      color: 'bg-sambandh-brass/10',
      iconColor: 'text-sambandh-brass',
    },
    {
      icon: GitBranch,
      title: 'Version Control',
      description: 'Every edit is timestamped and attributed. The complete history stays public for full transparency.',
      color: 'bg-sdg-blue/10',
      iconColor: 'text-sdg-blue',
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 bg-white">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-sambandh-brass mb-4 font-medium">
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-bodhi-navy mb-4">
            Built for <span className="text-sambandh-brass">transparent</span> governance
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Every feature is designed to make policy-making open, accountable, and participatory.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-sambandh-brass/30"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={1.75} />
                </div>

                <h3 className="text-xl font-bold text-bodhi-navy mb-2">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Small indicator */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {feature.title === 'Policy Drafting' && '📝 For Officers'}
                    {feature.title === 'Expert Review' && '🔬 For Experts'}
                    {feature.title === 'Public Voting' && '🗳️ For Citizens'}
                    {feature.title === 'Live Meetings' && '🤝 For Collaboration'}
                    {feature.title === 'Impact Simulator' && '🧠 AI-Powered'}
                    {feature.title === 'Version Control' && '📋 Full Transparency'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* SDG Alignment */}
        <div className="mt-16 max-w-4xl mx-auto bg-sambandh-paper rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-sambandh-brass" />
            <h3 className="text-xl font-semibold text-bodhi-navy">Aligned with SDG 16</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Sambandha contributes to <strong>Peace, Justice and Strong Institutions</strong> by making 
            policy-making transparent, participatory, and accountable. Every feature is built on 
            principles of openness and citizen engagement.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;