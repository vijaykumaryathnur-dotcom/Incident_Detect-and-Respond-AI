import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeroProductDemo } from './HeroProductDemo';

interface HeroProps {
  onLaunchAgent: () => void;
  onSeeHowItLearns: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLaunchAgent, onSeeHowItLearns }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Deep atmospheric lighting & soft glow mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-600/15 dark:via-purple-600/10 dark:to-blue-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-purple-500/10 dark:bg-purple-700/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Minimal Kicker (clean unboxed text, no pill clutter) */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300/90 tracking-wide uppercase font-mono mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Persistent Memory for Site Reliability Engineering</span>
        </div>

        {/* Large Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.08] text-balance">
          Incidents happen.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-900 dark:from-indigo-200 dark:via-purple-200 dark:to-white">
            Your AI remembers.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed text-balance">
          An incident response agent that learns from every outage, resolution, and postmortem.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLaunchAgent}
            className="group px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-[0.98]"
          >
            <span>Launch Agent</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onSeeHowItLearns}
            className="px-6 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300/80 dark:border-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <span>See how it learns</span>
            <span aria-hidden="true" className="text-indigo-600 dark:text-indigo-400">→</span>
          </button>
        </div>

        {/* Visualized loop chain kicker */}
        <div className="mt-10 flex items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono text-slate-500 overflow-x-auto py-1">
          <span className="text-slate-700 dark:text-slate-400 font-medium">INCIDENT</span>
          <span className="text-indigo-500 dark:text-indigo-400">→</span>
          <span className="text-slate-700 dark:text-slate-400 font-medium">INVESTIGATION</span>
          <span className="text-indigo-500 dark:text-indigo-400">→</span>
          <span className="text-purple-600 dark:text-purple-300 font-semibold">HINDSIGHT MEMORY</span>
          <span className="text-indigo-500 dark:text-indigo-400">→</span>
          <span className="text-slate-700 dark:text-slate-400 font-medium">RECOMMENDATION</span>
          <span className="text-indigo-500 dark:text-indigo-400">→</span>
          <span className="text-slate-700 dark:text-slate-400 font-medium">RESOLUTION</span>
          <span className="text-indigo-500 dark:text-indigo-400">→</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">LEARNING</span>
        </div>

        {/* Cinematic Animated Product Demonstration */}
        <HeroProductDemo onLaunchWorkspace={onLaunchAgent} />
      </div>
    </section>
  );
};
