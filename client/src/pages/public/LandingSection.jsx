/**
 * Landing Section - Hero
 * First impression with call-to-action
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const LandingSection = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-bodhi-navy via-bodhi-navy-deep to-bodhi-maroon-deep">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-bodhi-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-bodhi-gold-light rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-bodhi-maroon rounded-full blur-3xl"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 animate-float opacity-20">
        <svg className="w-24 h-24 text-bodhi-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="absolute bottom-10 right-10 animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <svg className="w-32 h-32 text-bodhi-gold-light" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block px-6 py-2 rounded-full bg-bodhi-gold/20 border border-bodhi-gold/30 mb-8 animate-fade-in-up">
            <span className="text-sm font-medium text-bodhi-gold-light">
              🇳🇵 Codefest Nepal 2026
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 animate-fade-in-up">
            <span className="text-bodhi-gold">Sambandh</span>
            <span className="block text-2xl md:text-3xl lg:text-4xl text-bodhi-gold-light mt-2">
              {t('app.tagline')}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            A collaborative platform where citizens, experts, and government officers 
            come together to co-create policies for Nepal's sustainable development.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {user ? (
              <Link to="/dashboard" className="btn-primary text-lg px-10 py-4 btn-pulse">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-10 py-4 btn-pulse">
                  Get Started Free
                </Link>
                <Link to="/policies" className="btn-outline text-lg px-10 py-4 border-white text-white hover:bg-white hover:text-bodhi-navy">
                  Explore Policies
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-bodhi-gold">3</div>
              <div className="text-sm text-gray-400 mt-1">User Roles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-bodhi-gold">100+</div>
              <div className="text-sm text-gray-400 mt-1">Policy Drafts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-bodhi-gold">1000+</div>
              <div className="text-sm text-gray-400 mt-1">Citizen Voices</div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-bodhi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingSection;