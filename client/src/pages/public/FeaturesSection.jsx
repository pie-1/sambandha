/**
 * Features Section
 * Platform features and how it works
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const FeaturesSection = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: '📝',
      title: 'Policy Drafting',
      description: 'Government officers can create, edit, and manage policy drafts with version history tracking.',
      color: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      icon: '💬',
      title: 'Expert Feedback',
      description: 'Verified experts can review drafts, provide threaded comments, and suggest improvements.',
      color: 'bg-purple-50 border-purple-200',
      iconBg: 'bg-purple-100',
    },
    {
      icon: '🗳️',
      title: 'Public Voting',
      description: 'Citizens can approve or disapprove finalized policies with one-tap feedback.',
      color: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100',
    },
    {
      icon: '🎥',
      title: 'Live Meetings',
      description: 'Real-time video meetings for collaborative discussions using integrated Jitsi Meet.',
      color: 'bg-red-50 border-red-200',
      iconBg: 'bg-red-100',
    },
    {
      icon: '📊',
      title: 'Impact Simulator',
      description: 'Simulate policy impact with estimated jobs, efficiency scores, and comparable cases.',
      color: 'bg-orange-50 border-orange-200',
      iconBg: 'bg-orange-100',
    },
    {
      icon: '🔄',
      title: 'Version Control',
      description: 'Track every change with detailed version history showing who edited what and when.',
      color: 'bg-indigo-50 border-indigo-200',
      iconBg: 'bg-indigo-100',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-bodhi-gold/10 text-bodhi-gold text-xs font-semibold tracking-wider uppercase mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-bodhi-navy mb-4">
            Everything You Need for{' '}
            <span className="text-bodhi-gold">Policy Co-Creation</span>
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Discover the powerful features that make Sambandh the ultimate platform 
            for collaborative policy-making in Nepal.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${feature.color}`}
            >
              {/* Icon with background */}
              <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center text-3xl mb-4`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-serif text-bodhi-navy mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-bodhi-gold uppercase tracking-wider">Process</span>
            <h3 className="text-2xl md:text-3xl font-serif text-bodhi-navy mt-2">
              How <span className="text-bodhi-gold">Sambandh</span> Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-bodhi-gold/10 flex items-center justify-center mx-auto mb-4 text-2xl font-mono font-bold text-bodhi-gold transition-transform duration-300 group-hover:scale-110">
                1
              </div>
              <h4 className="text-xl font-serif text-bodhi-navy mb-2">Create & Review</h4>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Officers create drafts. Experts review and provide feedback.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-bodhi-gold/10 flex items-center justify-center mx-auto mb-4 text-2xl font-mono font-bold text-bodhi-gold transition-transform duration-300 group-hover:scale-110">
                2
              </div>
              <h4 className="text-xl font-serif text-bodhi-navy mb-2">Collaborate</h4>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Real-time discussions and live meetings for co-creation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-bodhi-gold/10 flex items-center justify-center mx-auto mb-4 text-2xl font-mono font-bold text-bodhi-gold transition-transform duration-300 group-hover:scale-110">
                3
              </div>
              <h4 className="text-xl font-serif text-bodhi-navy mb-2">Vote & Impact</h4>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Citizens approve/disapprove and shape Nepal's future.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="text-center mt-16">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-bodhi-gold text-white px-8 py-3.5 rounded-full font-semibold hover:bg-bodhi-maroon transition-all duration-300 shadow-lg shadow-bodhi-gold/25 hover:shadow-xl hover:scale-105"
            >
              Join Sambandh Today
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;