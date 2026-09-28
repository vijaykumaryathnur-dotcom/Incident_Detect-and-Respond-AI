import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  CheckCircle2, 
  Database, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { INITIAL_POSTMORTEM } from '../../data/mockData';
import { hindsightService } from '../../services/hindsight';
import { Postmortem } from '../../types';

export const PostmortemSection: React.FC = () => {
  const [postmortem, setPostmortem] = useState<Postmortem>(INITIAL_POSTMORTEM);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveToHindsight = async () => {
    setIsSaving(true);
    // Simulate slight indexing latency
    await new Promise((res) => setTimeout(res, 600));
    await hindsightService.storePostmortem(postmortem);
    setIsSaving(false);
    setSavedSuccess(true);
    setPostmortem((prev) => ({ ...prev, savedToHindsight: true }));
  };

  return (
    <section id="postmortems" className="py-24 border-t border-slate-200 dark:border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">
            Institutional Feedback Loop
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            Resolution isn't the end.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
            Incident resolution is only half the battle. Without institutional memory, the same outage happens again 6 months later.
            Our AI generates postmortems and feeds hard-won lessons back into Hindsight.
          </p>
        </div>

        {/* Postmortem Card Interface */}
        <div className="mt-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0D15] overflow-hidden shadow-xl dark:shadow-2xl">
          {/* Header Bar */}
          <div className="p-6 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#07090F] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {postmortem.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  <span>Incident #304</span>
                  <span>·</span>
                  <span>Date: {postmortem.date}</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Status: Completed</span>
                </div>
              </div>
            </div>

            {/* SAVE TO HINDSIGHT BUTTON */}
            <div>
              <button
                onClick={handleSaveToHindsight}
                disabled={isSaving || savedSuccess}
                className={`group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.98] ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 ring-1 ring-white/15'
                }`}
              >
                {isSaving ? (
                  <>
                    <Database className="w-4 h-4 animate-spin text-purple-200" />
                    <span>EMBEDDING INTO HINDSIGHT...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>SAVED TO HINDSIGHT PERMANENTLY</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
                    <span>SAVE TO HINDSIGHT</span>
                    <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Postmortem Content Grid */}
          <div className="p-6 sm:p-8 space-y-6 text-xs">
            {/* Impact & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide block mb-1">
                  Incident Impact
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {postmortem.impact}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide block mb-1">
                  Identified Root Cause
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {postmortem.rootCause}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-3 font-semibold">
                Incident Timeline & Autonomic Milestones
              </span>
              <div className="space-y-2 border-l-2 border-purple-400 dark:border-purple-500/30 pl-4 ml-2">
                {postmortem.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 ring-4 ring-white dark:ring-[#0A0D15]" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                      <span className="font-mono text-purple-700 dark:text-purple-300 font-bold shrink-0">
                        {event.time}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {event.event}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="p-4 rounded-lg bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 uppercase tracking-wide block mb-1 font-semibold">
                Permanent Resolution Applied
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                {postmortem.resolution}
              </p>
            </div>

            {/* What Worked & What Failed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-500/25">
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block mb-2 font-semibold">
                  What Worked
                </span>
                <ul className="space-y-2">
                  {postmortem.whatWorked.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-rose-50/80 dark:bg-rose-950/15 border border-rose-200 dark:border-rose-500/25">
                <span className="text-[11px] font-mono text-rose-700 dark:text-rose-400 uppercase tracking-wide block mb-2 font-semibold">
                  What Failed / Vulnerabilities
                </span>
                <ul className="space-y-2">
                  {postmortem.whatFailed.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lessons Learned */}
            <div className="p-4 rounded-lg bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300 uppercase tracking-wide font-semibold">
                  Lessons Learned (Ingested into Hindsight)
                </span>
                <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                  Embeddings: Vector Cluster 84
                </span>
              </div>
              <ul className="space-y-2">
                {postmortem.lessonsLearned.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-purple-950 dark:text-purple-100">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feedback banner when saved */}
          <AnimatePresence>
            {savedSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-emerald-100/90 dark:bg-emerald-500/10 border-t border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Knowledge successfully committed to Hindsight memory. Future database pool saturation incidents will automatically recall this resolution!
                  </span>
                </div>
                <button
                  onClick={() => setSavedSuccess(false)}
                  className="font-mono text-[11px] underline text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white cursor-pointer ml-3 shrink-0"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
