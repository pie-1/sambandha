import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";

function VideoBackground({ onError }) {
  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        onError={onError}
        className="absolute inset-0 w-full h-full object-cover scale-105 animate-[slowZoom_20s_linear_infinite_alternate]"
      >
        <source src="/videos/landing_video3.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/20 to-slate-950/80" />
    </>
  );
}

export default function Hero() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [videoFailed, setVideoFailed] = useState(false);

  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const targets = [titleRef.current, subtitleRef.current, buttonRef.current, scrollRef.current];
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    gsap.set(targets, { opacity: 1, y: 0 });

    if (mql.matches) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.fromTo(titleRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 })
      .fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.45")
      .fromTo(buttonRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
      .fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.3");
  }, []);

  return (
    <section className="relative isolate overflow-hidden min-h-screen flex items-center justify-center bg-slate-950">
      {!videoFailed ? (
        <VideoBackground onError={() => setVideoFailed(true)} />
      ) : (
        <>
          <img src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/60" />
        </>
      )}
      <div className="absolute -top-52 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[180px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <div ref={titleRef}>
          <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl px-6 py-2.5 text-xs tracking-[0.28em] uppercase text-amber-300 font-bold shadow-xl">
            {t("app.eyebrow", "A Public Record of How Policy Gets Made")}
          </span>

          <h1 className="mt-8 font-serif font-bold leading-[0.95]">
            <span
              className="block text-white"
              style={{
                fontSize: "clamp(4rem,10vw,8rem)",
                textShadow: "0 5px 30px rgba(0,0,0,0.9), 0 10px 60px rgba(0,0,0,0.7)",
              }}
            >
              सम्बन्ध
            </span>
            <span
              className="block mt-8 font-sans font-bold text-white"
              style={{
                fontSize: "clamp(1.4rem,3vw,2.5rem)",
                textShadow: "0 4px 20px rgba(0,0,0,0.9)",
              }}
            >
              {t("app.tagline", "Where Nepal's Policies Get Written in the Open")}
            </span>
          </h1>
        </div>

        <div ref={subtitleRef} className="mt-10 max-w-3xl mx-auto">
          <p
            className="text-white font-medium leading-9"
            style={{
              fontSize: "clamp(1rem,2vw,1.35rem)",
              textShadow: "0 2px 15px rgba(0,0,0,0.95), 0 4px 30px rgba(0,0,0,0.7)",
            }}
          >
            Officers draft legislation, experts review every proposal,
            citizens participate openly, and every revision remains
            permanently visible for complete transparency.
          </p>
        </div>

        <div ref={buttonRef} className="mt-14 flex flex-wrap justify-center gap-5">
          {user ? (
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-3 rounded-xl bg-amber-400 px-9 py-4 font-bold text-slate-900 shadow-2xl transition hover:scale-105 hover:bg-amber-300"
            >
              Go to Dashboard
              <ArrowRight className="transition group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 rounded-xl bg-amber-400 px-9 py-4 font-bold text-slate-900 shadow-2xl transition hover:scale-105 hover:bg-amber-300"
              >
                Get Started
                <ArrowRight className="transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/policies"
                className="rounded-xl border border-white/30 bg-black/30 backdrop-blur-xl px-9 py-4 font-semibold text-white transition hover:bg-white hover:text-slate-900"
              >
                Explore Policies
              </Link>
            </>
          )}
        </div>

        <div ref={scrollRef} className="mt-24 flex flex-col items-center">
          <span className="mb-3 text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
            Scroll
          </span>
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/30">
            <div className="mt-2 h-2 w-2 animate-bounce rounded-full bg-amber-400" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
      `}</style>
    </section>
  );
}