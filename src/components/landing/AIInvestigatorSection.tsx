import React, { useState } from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  Terminal, 
  ShieldAlert, 
  Clock, 
  ChevronRight, 
  Sliders, 
  Server,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface AIInvestigatorSectionProps {
  onOpenWorkspace?: () => void;
}

export const AIInvestigatorSection: React.FC<AIInvestigatorSectionProps> = ({ onOpenWorkspace }) => {
  const [selectedSignal, setSelectedSignal] = useState<string>('sig-1');

  const signals = [
    {
      id: 'sig-1',
      title: 'API latency spike',
      metric: 'P99: 1,840ms',
      baseline: 'Nominal 42ms',
      status: 'critical',
      source: 'Envoy Ingress Proxy',
      time: '15:28:10 UTC',
      detail: 'Latency degradation initiated following 3.2x traffic surge on /v1/checkout/authorize.'
    },
    {
      id: 'sig-2',
      title: 'Database connection saturation',
      metric: '98 / 100 utilized',
      baseline: 'Nominal 32/100',
      status: 'critical',
      source: 'PostgreSQL RDS Cluster',
      time: '15:28:22 UTC',
      detail: 'Client connection queue spiked to 342 waiting sockets; transaction idle timeouts accumulating.'
    },
    {
      id: 'sig-3',
      title: 'Increased 5xx responses',
      metric: '4.8% error rate',
      baseline: '0.00% nominal',
      status: 'critical',
      source: 'Payments API Gateway',
      time: '15:28:45 UTC',
      detail: '504 Gateway Timeout propagated to mobile & web checkout clients.'
    },
    {
      id: 'sig-4',
      title: 'Hardware & OS Nominal',
      metric: 'CPU: 38% · RAM: 44%',
      baseline: 'Healthy',
      status: 'nominal',
      source: 'Kubernetes Node Pool',
      time: '15:29:00 UTC',
      detail: 'Physical host resources unconstrained; bottleneck isolated strictly to connection pool.'
    }
  ];

  return (
    <section id="ai-investigator" className="py-24 border-t border-slate-200 dark:border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
            Autonomous Investigation
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            From alert to understanding.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
            Our AI Investigator ingests millions of telemetry data points to construct a structured causal graph.
            No unstructured chatbot prompts. Just verifiable evidence, causal links, and high-confidence diagnoses.
          </p>
        </div>

        {/* Structured Investigation Workspace Container */}
        <div className="mt-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0D15] overflow-hidden shadow-xl dark:shadow-2xl">
          {/* Workspace Title Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#07090F] gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-300">
                    AI INVESTIGATION
                  </span>
                  <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20 font-medium">
                    LIVE INCIDENT #304
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Payments API · Root Cause Isolation Pipeline
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ANALYSIS CONFIDENCE</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">94.2% Verified</div>
              </div>
              {onOpenWorkspace && (
                <button
                  onClick={onOpenWorkspace}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <span>Open Console</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Structured Output Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-white/[0.07]">
            {/* Left Column: Observed Signals (5 cols) */}
            <div className="lg:col-span-5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Observed Signals
                </span>
                <span className="text-[11px] font-mono text-slate-500">4 correlated signals</span>
              </div>

              <div className="space-y-2.5">
                {signals.map((sig) => {
                  const isSelected = selectedSignal === sig.id;
                  return (
                    <button
                      key={sig.id}
                      onClick={() => setSelectedSignal(sig.id)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-300 dark:border-indigo-500/40 shadow-xs ring-1 ring-indigo-300 dark:ring-indigo-500/20'
                          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            sig.status === 'critical' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                          }`} />
                          <span className="font-semibold text-slate-900 dark:text-slate-200">{sig.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{sig.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pl-5">
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{sig.metric}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{sig.source}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Signal Detail Box */}
              {selectedSignal && (
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-xs space-y-1">
                  <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-semibold">Selected Signal Evidence</div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {signals.find((s) => s.id === selectedSignal)?.detail}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Reasoning & Recommended Action (7 cols) */}
            <div className="lg:col-span-7 p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Historical Context Callout */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                      Historical Context
                    </span>
                    <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-medium">Retrieved via Hindsight</span>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/25 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">3 similar incidents found in memory</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Incidents #184, #231, and #267 exhibited identical pool saturation signatures.
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/10 px-3 py-1 rounded border border-purple-200 dark:border-purple-500/30 shrink-0">
                      94% Match
                    </span>
                  </div>
                </div>

                {/* Likely Root Cause */}
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block mb-2">
                    Likely Root Cause
                  </span>
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07]">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        Database connection pool exhaustion
                      </div>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        Confidence: 94%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      Burst in payment transactions saturated PgBouncer pool max threshold (100).
                      Server CPU and replica lag remain nominal, confirming issue is purely connection concurrency,
                      not query plan regression.
                    </p>
                  </div>
                </div>

                {/* Recommended Action */}
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold block mb-2">
                    Recommended Action
                  </span>
                  <div className="p-4 rounded-lg bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-900 dark:text-white">
                        <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        DB-CONNECTION-POOL-RECOVERY
                      </div>
                      <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded font-medium">
                        Auto-Executable
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900 dark:text-indigo-200/80 mt-2 leading-relaxed">
                      Dynamically allocate +50 connections on proxy cluster and enforce 5s idle transaction eviction.
                      Historical success rate: 98% across 3 occurrences.
                    </p>
                  </div>
                </div>
              </div>

              {/* Execution validation bar */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  All hypotheses tested against live telemetry invariants
                </span>
                <span className="font-mono text-slate-500">Pipeline latency: 12.4s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
