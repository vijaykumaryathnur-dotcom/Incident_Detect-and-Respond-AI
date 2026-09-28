import React, { useState } from 'react';
import { Terminal, CheckCircle2, Play, Sparkles, Clock, AlertTriangle, ArrowRight, Copy, Check } from 'lucide-react';
import { INITIAL_RUNBOOKS } from '../../data/mockData';

export const RunbooksSection: React.FC = () => {
  const runbook = INITIAL_RUNBOOKS[0]; // DB-CONNECTION-POOL-RECOVERY
  const [activeStepIndex, setActiveStepIndex] = useState<number>(3); // Step 04 active
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (command: string, idx: number) => {
    navigator.clipboard?.writeText(command);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="runbooks" className="py-24 border-t border-slate-200 dark:border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
            Execution & Runbooks
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            Turn experience into action.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
            Static runbooks in wikis rot. Our AI matches live telemetry against runbooks that succeeded
            in past incidents, ranked by verified Hindsight memory.
          </p>
        </div>

        {/* Runbook Interface */}
        <div className="mt-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0D15] overflow-hidden shadow-xl dark:shadow-2xl">
          {/* Runbook Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#07090F] flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {runbook.code}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                  <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  Recommended by Hindsight
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-300">Trigger: </strong>
                {runbook.trigger}
              </div>
            </div>

            {/* Historical Link Metrics */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <div className="text-[10px] text-slate-500">HISTORICAL SUCCESS</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {(runbook.historicalSuccessRate * 100).toFixed(0)}%
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
              <div className="text-right">
                <div className="text-[10px] text-slate-500">VALIDATED IN</div>
                <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
                  #{runbook.matchedIncidents.join(', #')}
                </div>
              </div>
            </div>
          </div>

          {/* Runbook Steps List */}
          <div className="p-6 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-2">
              Automated Runbook Steps
            </div>

            {runbook.steps.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              const isPast = idx < activeStepIndex;

              return (
                <div
                  key={step.number}
                  className={`p-4 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-500/40 shadow-xs ring-1 ring-indigo-300 dark:ring-indigo-500/20'
                      : isPast
                      ? 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-90'
                      : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/[0.04] opacity-60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        isPast
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                          : isActive
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30'
                          : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400'
                      }`}>
                        {step.number}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPast && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                      {isActive && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Executing
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 pl-9">
                    {step.description}
                  </p>

                  {step.command && (
                    <div className="mt-3 ml-9 p-2.5 rounded bg-slate-900 text-indigo-200 dark:bg-black/60 border border-slate-800 dark:border-white/[0.08] flex items-center justify-between gap-2 shadow-inner">
                      <code className="text-[11px] font-mono text-indigo-300 dark:text-indigo-200 overflow-x-auto whitespace-pre">
                        $ {step.command}
                      </code>
                      <button
                        onClick={() => handleCopy(step.command!, idx)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/[0.08] transition-colors shrink-0 cursor-pointer"
                        title="Copy command"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recommendation Origin Footer */}
          <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>
                <strong className="text-slate-900 dark:text-white">Why this runbook?</strong> Recalled from Incident #184: Previous service restarts caused cascading checkout dropped sessions; PgBouncer pool scaling resolved outage in 7 min.
              </span>
            </div>
            <span className="text-purple-700 dark:text-purple-300 font-mono shrink-0 font-medium">
              Vector affinity: 0.942
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
