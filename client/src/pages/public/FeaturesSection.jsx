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
    },
    {
      icon: '💬',
      title: 'Expert Feedback',
      description: 'Verified experts can review drafts, provide threaded comments, and suggest improvements.',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      icon: '🗳️',
      title: 'Public Voting',
      description: 'Citizens can approve or disapprove finalized policies with one-tap feedback.',
      color: 'bg-green-50 border-green-200',
    },
    {
      icon: '🎥',
      title: 'Live Meetings',
      description: 'Real-time video meetings for collaborative discussions using integrated Jitsi Meet.',
      color: 'bg-red-50 border-red-200',
    },
    {
      icon: '📊',
      title: 'Impact Simulator',
      description: 'Simulate policy impact with estimated jobs, efficiency scores, and comparable cases.',
      color: 'bg-orange-50 border-orange-200',
    },
    {
      icon: '🔄',
      title: 'Version Control',
      description: 'Track every change with detailed version history showing who edited what and when.',
      color: 'bg-indigo-50 border-indigo-200',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-bodhi-gold uppercase tracking-wider">Platform Features</span>
          <h2 className="text-4xl md:text-5xl font-serif text-bodhi-navy mt-2">
            Everything You Need for{' '}
            <span className="text-bodhi-gold">Policy Co-Creation</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            Discover the powerful features that make Sambandh the ultimate platform 
            for collaborative policy-making in Nepal.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${feature.color} border`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-serif text-bodhi-navy mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h3 className="text-2xl font-serif text-bodhi-navy text-center mb-12">
            How <span className="text-bodhi-gold">Sambandh</span> Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-bodhi-gold/10 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-bodhi-gold">
                1
              </div>
              <h4 className="text-xl font-serif text-bodhi-navy mb-2">Create & Review</h4>
              <p className="text-sm text-gray-600">Officers create drafts. Experts review and provide feedback.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-bodhi-gold/10 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-bodhi-gold">
                2
              </div>
              <h4 className="text-xl font-serif text-bodhi-navy mb-2">Collaborate</h4>
              <p className="text-sm text-gray-600">Real-time discussions and live meetings for co-creation.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-bodhi-gold/10 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-bodhi-gold">
                3
              </div>
              <h4 className="text-xl font-serif text-bodhi-navy mb-2">Vote & Impact</h4>
              <p className="text-sm text-gray-600">Citizens approve/disapprove and shape Nepal's future.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!user && (
          <div className="text-center mt-16">
            <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-block">
              Join Sambandh Today
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;