import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingDown, Zap, Clock, ShieldCheck, ArrowRight, BrainCircuit, Sparkles } from 'lucide-react';

export const LearningCurveSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(3); // Interaction 10 active by default

  const stages = [
    {
      step: 1,
      title: 'INTERACTION 1',
      kicker: 'Cold Start',
      headline: 'Generic investigation',
      desc: 'Performs baseline telemetry parsing, broad anomaly detection, and standard metric thresholding. No domain memory yet.',
      mttr: '48m',
      confidence: '62%',
      behavior: 'Standard heuristic checks & wide log scan'
    },
    {
      step: 2,
      title: 'INTERACTION 5',
      kicker: 'Pattern Detection',
      headline: 'Recognizes recurring patterns',
      desc: 'Correlates related services and detects recurring failure signatures across microservices (e.g. checkout authorizations vs auth timeouts).',
      mttr: '24m',
      confidence: '78%',
      behavior: 'Eliminates 60% of false-positive hypotheses'
    },
    {
      step: 3,
      title: 'INTERACTION 10',
      kicker: 'Institutional Recall',
      headline: 'Recalls successful runbooks',
      desc: 'Directly retrieves previous resolutions that succeeded without breaking downstream services. Suggests targeted mitigation scripts.',
      mttr: '11m',
      confidence: '91%',
      behavior: 'Matches DB-CONNECTION-POOL-RECOVERY with 94% accuracy'
    },
    {
      step: 4,
      title: 'INTERACTION 20+',
      kicker: 'Autonomous Precision',
      headline: 'Understands service-specific behavior',
      desc: 'Deep institutional mastery: Knows that Payments API crashes when restarted during pool bursts, but stabilizes in 3m when PgBouncer pool is patched.',
      mttr: '6m',
      confidence: '98%',
      behavior: 'Zero trial-and-error; instant targeted execution'
    }
  ];

  return (
    <section className="py-24 border-t border-slate-200 dark:border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
            Autonomous Progression
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            Watch the agent get smarter.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
            Every resolved incident deposits high-fidelity causal weights into Hindsight.
            Over time, your mean time to resolution drops by over 80%.
          </p>
        </div>

        {/* Interactive Timeline Stepper */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-4">
          {stages.map((stage, idx) => {
            const isSelected = activeStage === stage.step;
            return (
              <button
                key={stage.title}
                onClick={() => setActiveStage(stage.step)}
                className={`text-left p-6 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/50 shadow-md dark:shadow-xl dark:shadow-indigo-950/40 ring-1 ring-indigo-300 dark:ring-indigo-500/30'
                    : 'bg-white dark:bg-[#0A0D15] border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.14] shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className={`font-mono font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {stage.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400">
                      {stage.kicker}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 leading-snug">
                    {stage.headline}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {stage.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block">MTTR</span>
                    <span className={`font-mono font-bold ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'}`}>
                      {stage.mttr}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block">CONFIDENCE</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      {stage.confidence}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Visual Deep Dive */}
        <div className="mt-8 p-6 rounded-xl bg-white dark:bg-[#0B0E17] border border-slate-200 dark:border-white/[0.08] shadow-md dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
                Intelligence State: {stages[activeStage - 1].title}
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                {stages[activeStage - 1].behavior}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-slate-500 dark:text-slate-400">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px]">ORGANIZATIONAL KNOWLEDGE</span>
              <span className="text-slate-900 dark:text-slate-200 font-bold">
                {activeStage === 1 ? '1 Incident' : activeStage === 2 ? '5 Incidents' : activeStage === 3 ? '10 Incidents' : '20+ Incidents'}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px]">AVG TIME SAVED PER OUTAGE</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {activeStage === 1 ? '0m' : activeStage === 2 ? '24m' : activeStage === 3 ? '37m' : '42m'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
