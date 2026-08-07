/**
 * How It Works - Step by Step Guide
 * 4 simple steps showing the policy process
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const HowItWorks = () => {
  const { user } = useAuth();

  const steps = [
    {
      number: '01',
      title: 'Draft',
      description: 'Officers create policy drafts with full version history. Every change is tracked.',
      color: 'text-sambandh-brass',
    },
    {
      number: '02',
      title: 'Review',
      description: 'Verified experts review drafts, provide feedback, and build consensus.',
      color: 'text-bodhi-navy',
    },
    {
      number: '03',
      title: 'Vote',
      description: 'Citizens vote on finalized policies. Your voice shapes Nepal\'s future.',
      color: 'text-sambandh-sage',
    },
    {
      number: '04',
      title: 'Track',
      description: 'Every edit, vote, and decision stays on the public record forever.',
      color: 'text-sambandh-brass-light',
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-white">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-sambandh-brass mb-4 font-medium">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-bodhi-navy mb-4">
            Policy in <span className="text-sambandh-brass">four steps</span>
          </h2>
          <p className="text-gray-600 leading-relaxed">
            From draft to decision — every step is open, recorded, and accountable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className={`text-4xl font-serif font-bold ${step.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-bodhi-navy mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block text-gray-300 text-2xl mt-4">→</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center max-w-xl mx-auto p-6 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-bodhi-navy">100% transparent.</span>{' '}
            Every version, comment, and vote is recorded and visible.
          </p>
        </div>

        {!user && (
          <div className="text-center mt-12">
            <Link
              to="/register"
              className="bg-bodhi-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-bodhi-navy-deep transition inline-flex items-center gap-2"
            >
              Join Sambandha
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default HowItWorks;