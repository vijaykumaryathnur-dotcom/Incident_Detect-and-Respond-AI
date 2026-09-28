import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Search, MessageSquare, AlertCircle, Sparkles, BrainCircuit, CheckCircle2, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export const TheProblem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');

  const beforeSteps = [
    {
      num: '01',
      title: 'Alert triggers',
      desc: 'PagerDuty fires at 02:40 AM. On-call engineer wakes up with high cognitive load.',
      icon: AlertCircle,
      time: '0m'
    },
    {
      num: '02',
      title: 'Search documentation',
      desc: 'Browsing scattered Confluence docs and stale Notion wikis from 2024.',
      icon: Search,
      time: '+12m'
    },
    {
      num: '03',
      title: 'Search old incidents',
      desc: 'Keyword queries across Slack channels (#incidents, #war-room) hoping someone remembers.',
      icon: RefreshCw,
      time: '+18m'
    },
    {
      num: '04',
      title: 'Ask engineers',
      desc: 'Pinging previous on-calls who left the company or are offline.',
      icon: MessageSquare,
      time: '+28m'
    },
    {
      num: '05',
      title: 'Try a speculative fix',
      desc: 'Guessing root cause and restarting pods, dropping active customer transactions.',
      icon: Clock,
      time: '42m MTTR'
    }
  ];

  const afterSteps = [
    {
      num: '01',
      title: 'Alert arrives',
      desc: 'AI receives raw telemetry across metrics, logs, traces, and ingress alerts instantaneously.',
      icon: AlertCircle,
      time: '0s'
    },
    {
      num: '02',
      title: 'AI Investigation',
      desc: 'Autonomous correlation identifies saturated DB connection pools and 5xx timeout signatures.',
      icon: BrainCircuit,
      time: '12s'
    },
    {
      num: '03',
      title: 'Hindsight Memory',
      desc: 'Matches historical Incident #184 and #231 with 94% vector confidence and verified runbook.',
      icon: Sparkles,
      time: '24s'
    },
    {
      num: '04',
      title: 'Relevant resolution',
      desc: 'Executes DB-CONNECTION-POOL-RECOVERY without container recycling; validates health.',
      icon: Zap,
      time: '3m'
    },
    {
      num: '05',
      title: 'Faster response & learning',
      desc: 'SLOs fully recovered in 7 minutes. Postmortem automatically distilled back into Hindsight.',
      icon: CheckCircle2,
      time: '7m MTTR'
    }
  ];

  return (
    <section id="the-problem" className="py-24 border-t border-slate-200 dark:border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
            Context Friction
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            When production breaks, context matters.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
            Traditional incident response forces on-call engineers to manually excavate historical context
            across stale documentation, fragmented Slack threads, and unmaintained runbooks.
            Our AI recalls the exact fix in seconds.
          </p>
        </div>

        {/* Interactive Mode Toggle */}
        <div className="mt-10 flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-white/[0.07] pb-5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg">
            <button
              onClick={() => setActiveTab('after')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'after'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              With AI & Hindsight Memory
            </button>
            <button
              onClick={() => setActiveTab('before')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'before'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Traditional Manual Triage
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              Estimated Mean Time to Resolution:
            </span>
            <span className={`font-bold px-2.5 py-1 rounded text-sm ${
              activeTab === 'after' 
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20' 
                : 'bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20'
            }`}>
              {activeTab === 'after' ? '7 minutes (-83%)' : '42 minutes'}
            </span>
          </div>
        </div>

        {/* Animated Process Comparison View */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'after' ? (
              <motion.div
                key="view-after"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-3"
              >
                {afterSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isHindsight = idx === 2;
                  return (
                    <div
                      key={step.num}
                      className={`relative p-5 rounded-lg border transition-all ${
                        isHindsight
                          ? 'bg-purple-50/80 dark:bg-purple-950/20 border-purple-300 dark:border-purple-500/40 shadow-md shadow-purple-200/50 dark:shadow-purple-950/40 ring-1 ring-purple-300 dark:ring-purple-500/20'
                          : 'bg-white dark:bg-[#0B0E17] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.14] shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className={`font-mono font-bold ${isHindsight ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400'}`}>
                          {step.num}
                        </span>
                        <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                          idx === 4 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold' 
                            : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400'
                        }`}>
                          {step.time}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                        <Icon className={`w-4 h-4 ${isHindsight ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>

                      {idx < 4 && (
                        <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-white/20">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="view-before"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-3"
              >
                {beforeSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.num}
                      className="relative p-5 rounded-lg border bg-slate-50 dark:bg-[#0B0E17]/60 border-slate-200 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.1]"
                    >
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="font-mono font-bold text-slate-400 dark:text-slate-500">{step.num}</span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400">
                          {step.time}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-white/[0.02] flex items-center justify-center mb-3">
                        <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </div>

                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5 line-through opacity-70">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {step.desc}
                      </p>

                      {idx < 4 && (
                        <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-white/10">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Narrative Callout */}
        <div className="mt-8 p-4 rounded-xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
            <span className="text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Why context is lost:</strong> Runbooks become outdated the moment they are written. Hindsight indexes resolutions directly from actual postmortems and real operational traces.
            </span>
          </div>
          <span className="text-indigo-600 dark:text-indigo-400 font-medium shrink-0">
            Self-updating intelligence layer
          </span>
        </div>
      </div>
    </section>
  );
};
