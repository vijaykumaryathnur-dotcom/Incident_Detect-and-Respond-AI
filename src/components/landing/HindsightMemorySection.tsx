import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowDown, 
  ArrowRight, 
  Search, 
  BrainCircuit, 
  Sliders, 
  FileText,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { hindsightService } from '../../services/hindsight';
import { HindsightMemory } from '../../types';

export const HindsightMemorySection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [memories, setMemories] = useState<HindsightMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<HindsightMemory | null>(null);

  useEffect(() => {
    const fetchMemories = async () => {
      const results = await hindsightService.searchMemories({
        query: searchQuery,
        limit: 4
      });
      setMemories(results);
      if (results.length > 0 && !selectedMemory) {
        setSelectedMemory(results[0]);
      }
    };
    fetchMemories();

    const unsubscribe = hindsightService.subscribe(() => {
      fetchMemories();
    });
    return () => unsubscribe();
  }, [searchQuery]);

  const flowNodes = [
    { label: 'Current Incident #304', sub: 'P1 Database Latency Spike', type: 'incident' },
    { label: 'Hindsight Memory Layer', sub: 'Vector Similarity Recall (94%)', type: 'hindsight' },
    { label: 'Related Incidents', sub: '#184, #231, #267 Found', type: 'related' },
    { label: 'Recalled Root Causes', sub: 'PgBouncer Pool Exhaustion', type: 'cause' },
    { label: 'Successful Resolutions', sub: 'Dynamic Pool Scaling (No Restart)', type: 'resolution' },
    { label: 'New Recommendation', sub: 'DB-CONNECTION-POOL-RECOVERY', type: 'output' },
  ];

  return (
    <section id="hindsight-memory" className="py-24 border-t border-slate-200 dark:border-white/[0.06] relative">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-500/5 dark:bg-purple-900/10 blur-[140px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">
            <Database className="w-3.5 h-3.5" />
            <span>The Intelligence Layer</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            Every incident makes the next one easier.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
            Your AI remembers what happened, what worked, and what didn't.
            Unlike generic LLMs that restart with a blank context every session, Hindsight creates permanent institutional memory.
          </p>
        </div>

        {/* Visual Memory Graph Flow: Current Incident → Hindsight Memory → Related Incidents → Root Causes → Successful Resolutions → New Recommendation */}
        <div className="mt-14 p-6 sm:p-8 rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/40 dark:bg-[#0A0D16]/90 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <div className="text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Autonomous Memory Traverse & Resolution Synthesis
            </span>
            <span className="hidden sm:inline text-slate-500">Continuous institutional recall</span>
          </div>

          {/* Desktop Flow Line with Connected Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 relative">
            {flowNodes.map((node, index) => {
              const isHindsightCore = node.type === 'hindsight';
              const isOutput = node.type === 'output';

              return (
                <div key={node.label} className="relative flex flex-col justify-between">
                  <div
                    className={`h-full p-3.5 rounded-lg border transition-all ${
                      isHindsightCore
                        ? 'bg-purple-100/90 dark:bg-purple-950/40 border-purple-300 dark:border-purple-500/50 shadow-md shadow-purple-200/50 dark:shadow-purple-950/50 ring-1 ring-purple-300 dark:ring-purple-500/30'
                        : isOutput
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40'
                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        STEP 0{index + 1}
                      </span>
                      {isHindsightCore && (
                        <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
                      )}
                    </div>
                    <div className={`text-xs font-bold leading-snug ${
                      isHindsightCore ? 'text-purple-900 dark:text-purple-200' : isOutput ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
                    }`}>
                      {node.label}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                      {node.sub}
                    </div>
                  </div>

                  {index < flowNodes.length - 1 && (
                    <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-purple-400/60">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Interactive Memory Explorer */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Memory Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Hindsight memory (e.g. 'connection pool', 'timeout', 'kafka')..."
                  className="w-full bg-white dark:bg-[#0B0E17] border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/50 shadow-xs transition-colors"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer"
                  title="Clear search"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Memory Cards List */}
            <div className="space-y-3">
              {memories.map((mem) => {
                const isSelected = selectedMemory?.id === mem.id;
                return (
                  <button
                    key={mem.id}
                    onClick={() => setSelectedMemory(mem)}
                    className={`w-full text-left p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/90 dark:bg-purple-950/25 border-purple-300 dark:border-purple-500/50 shadow-md dark:shadow-xl dark:shadow-purple-950/30 ring-1 ring-purple-300 dark:ring-purple-500/25'
                        : 'bg-white dark:bg-[#0B0E17] border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.14] shadow-xs'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                          MEMORY #{mem.incidentNumber}
                        </span>
                        <span className="text-slate-300 dark:text-white/20">·</span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{mem.service}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {mem.resolutionTimeMinutes}m resolution
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          {mem.outcome}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 leading-snug">
                      {mem.title}
                    </h3>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Root Cause: </strong>
                        <span className="text-slate-700 dark:text-slate-300">{mem.rootCause}</span>
                      </div>
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Resolution: </strong>
                        <span className="text-indigo-700 dark:text-indigo-300 font-mono font-medium">{mem.resolution}</span>
                      </div>
                    </div>

                    {/* Learned pattern badge */}
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-start gap-2 text-xs text-purple-900 dark:text-purple-200/90 bg-purple-50 dark:bg-purple-500/[0.04] p-2.5 rounded-lg border border-purple-200 dark:border-purple-500/10">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-purple-700 dark:text-purple-300">Learned pattern: </strong>
                        <span>{mem.learnedPattern}</span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {memories.length === 0 && (
                <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <Database className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2 opacity-50" />
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">No memories matched query</div>
                  <div className="text-xs text-slate-500 mt-1">Try querying "connection pool", "kafka", or "auth".</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Deep Heuristic Inspection (5 cols) */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E17] shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    Hindsight Institutional Synthesis
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">94.2% Similarity</span>
              </div>

              {selectedMemory ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                      Active Correlated Incident
                    </span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Incident #{selectedMemory.incidentNumber} · {selectedMemory.service}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
                    <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">VERIFIED MITIGATION STRATEGY</div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                      {selectedMemory.resolution}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30">
                    <span className="text-[11px] font-mono uppercase tracking-wide text-purple-700 dark:text-purple-300 block mb-1.5 font-bold">
                      Key Insight for Responders
                    </span>
                    <p className="text-purple-900 dark:text-purple-100 text-xs leading-relaxed italic">
                      "{selectedMemory.learnedPattern}"
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Historical MTTR:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{selectedMemory.resolutionTimeMinutes} minutes</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tags Indexed:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{selectedMemory.tags.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Persistence Guarantee:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Committed to Hindsight Knowledge Base</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-8">
                  Select a memory on the left to inspect its detailed learning graph.
                </div>
              )}
            </div>

            {/* Permanent learning quote block */}
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-slate-200 block mb-1">The SRE Memory Flywheel:</strong>
              Every outage resolved with this agent writes structured knowledge directly into Hindsight.
              The next engineer faces an AI that already mastered previous incidents.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
