import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { FaArrowRight, FaUserTie, FaUserGraduate, FaUser, FaCheckCircle } from 'react-icons/fa';
import { gsap } from 'gsap';

function VideoBackground({ onVideoError, onVideoReady, reducedMotion }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base layer — always visible, video fades in on top of this once ready */}
      <div className="absolute inset-0 bg-gradient-to-br from-bodhi-navy to-[#0E2338]" />

      {!reducedMotion && (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/videos/landing-poster.jpg"
          onError={onVideoError}
          onLoadedData={onVideoReady}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700"
          id="hero-bg-video"
        >
          <source src="/videos/landing_video3.mp4" type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-bodhi-navy/70 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-bodhi-navy/80 via-bodhi-navy/60 to-transparent" />
    </div>
  );
}

const STATS = [
  { icon: FaUserTie, label: 'Officers', sub: 'Create & manage drafts', accent: 'text-[#7FA8CC]' },
  { icon: FaUserGraduate, label: 'Experts', sub: 'Review & provide feedback', accent: 'text-sambandh-brass-light' },
  { icon: FaUser, label: 'Citizens', sub: 'Vote & shape policies', accent: 'text-[#6FC796]' },
  { icon: FaCheckCircle, label: '100%', sub: 'Transparent process', accent: 'text-sambandh-brass-light' },
];

export default function Hero() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [videoFailed, setVideoFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const statsRef = useRef(null);
  const scrollRef = useRef(null);

  const handleVideoReady = () => {
    const video = document.getElementById('hero-bg-video');
    if (video) video.classList.remove('opacity-0');
  };

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);

    if (mql.matches) {
      // No entrance choreography, no autoplay video — content is just present
      gsap.set([titleRef.current, subtitleRef.current, buttonRef.current, statsRef.current, scrollRef.current], {
        opacity: 1,
        y: 0,
      });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(titleRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo(subtitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .fromTo(buttonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo(statsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1')
      .fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.1');
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {!videoFailed && (
        <VideoBackground
          onVideoError={() => setVideoFailed(true)}
          onVideoReady={handleVideoReady}
          reducedMotion={reducedMotion}
        />
      )}
      {videoFailed && <div className="absolute inset-0 bg-gradient-to-br from-bodhi-navy to-[#0E2338]" />}

      {/* Quiet top accent — replaces the badge, no text competing with the headline */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sambandh-brass/60 to-transparent" />

      <div className="container-custom relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div ref={titleRef}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-4 leading-tight drop-shadow-lg">
              <span className="text-sambandh-brass-light">सम्बन्ध</span>
              <span className="block text-xl md:text-2xl lg:text-3xl text-slate-300 mt-3 font-sans font-normal">
                {t('app.tagline', 'A policy co-creation platform for Nepal')}
              </span>
            </h1>
          </div>

          <div ref={subtitleRef} className="max-w-2xl mx-auto mt-6 mb-10">
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed drop-shadow-md">
              Where officers, experts, and citizens come together to{' '}
              <span className="text-sambandh-brass-light font-medium">co-create policy</span> — every version recorded.
            </p>
          </div>

          <div ref={buttonRef} className="flex flex-wrap gap-4 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sambandh-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-bodhi-navy"
              >
                Dashboard <FaArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-sambandh-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-bodhi-navy"
                >
                  Get Started <FaArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/policies"
                  className="text-base px-8 py-3.5 rounded-md border border-white/40 text-white hover:bg-white hover:text-bodhi-navy transition-all backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bodhi-navy"
                >
                  View Policies
                </Link>
              </>
            )}
          </div>

          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
            {STATS.map(({ icon: Icon, label, sub, accent }) => (
              <div
                key={label}
                className="text-center bg-black/25 backdrop-blur-sm rounded-lg p-4 border border-white/10 transition-colors hover:bg-black/35"
              >
                <div className={`flex items-center justify-center gap-2 text-xl font-bold ${accent}`}>
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
                <div className="text-xs text-gray-300 mt-1.5">{sub}</div>
              </div>
            ))}
          </div>

          <div ref={scrollRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-300">Scroll to explore</span>
            <div className="w-5 h-8 border-2 border-gray-300/30 rounded-full flex justify-center">
              <div className="w-1.5 h-2.5 bg-sambandh-brass rounded-full animate-bounce mt-1.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}