import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  BrainCircuit, 
  CheckCircle2, 
  Play, 
  Pause, 
  Database, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Layers,
  Terminal,
  RotateCcw
} from 'lucide-react';

interface HeroProductDemoProps {
  onLaunchWorkspace?: () => void;
}

const STEPS = [
  { id: 1, label: 'Incident Arrives' },
  { id: 2, label: 'AI Investigation' },
  { id: 3, label: 'Hindsight Memory' },
  { id: 4, label: 'AI Recommendation' },
  { id: 5, label: 'Resolution' },
  { id: 6, label: 'Learning' }
];

export const HeroProductDemo: React.FC<HeroProductDemoProps> = ({ onLaunchWorkspace }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 6, y: y * -6 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Auto-advance loop
  useEffect(() => {
    if (!isPlaying) return;
    const stepDurations: Record<number, number> = {
      1: 3400,
      2: 3800,
      3: 4500,
      4: 3800,
      5: 3600,
      6: 4200
    };

    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev >= 6 ? 1 : prev + 1));
    }, stepDurations[currentStep] || 3800);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto mt-12 sm:mt-16 px-2 sm:px-4 perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* Ambient background glows */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/20 via-purple-600/15 to-blue-500/20 rounded-2xl blur-xl opacity-70 pointer-events-none -z-10" />

      {/* Floating 3D Tilt Card */}
      <motion.div
        animate={{
          rotateY: mousePos.x,
          rotateX: mousePos.y,
          y: [-2, 2, -2]
        }}
        transition={{
          rotateY: { type: 'spring', damping: 20, stiffness: 100 },
          rotateX: { type: 'spring', damping: 20, stiffness: 100 },
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }}
        className="relative rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0C0F17]/95 shadow-2xl shadow-slate-300/40 dark:shadow-black/80 overflow-hidden backdrop-blur-xl transition-colors"
      >
        {/* Subtle top specular sheen */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 dark:via-white/25 to-transparent" />

        {/* Dashboard Window Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/[0.07] bg-slate-100/90 dark:bg-[#090C12]/80">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pl-3">
              console.internal / incidents / #304
            </span>
          </div>

          {/* Stepper navigation bar */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.04] p-1 rounded-lg border border-slate-300/60 dark:border-white/[0.05]">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  currentStep === s.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/40 dark:hover:bg-white/[0.03]'
                }`}
              >
                <span className="opacity-60 mr-1">0{s.id}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Auto-cycle' : 'Resume Auto-cycle'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Stage */}
        <div className="p-5 sm:p-7 min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* STEP 1: INCIDENT ARRIVES */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center font-mono font-bold text-xs bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                      P1 CRITICAL
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                      Database Latency Detected
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                    <span>Service: <strong className="text-slate-900 dark:text-slate-200">Payments API</strong></span>
                    <span className="text-slate-300 dark:text-white/20">/</span>
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                      Status: Investigating
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06]">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Impact Scope</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                      4.8% <span className="text-xs font-normal text-rose-600 dark:text-rose-400 font-sans">Error Rate</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Payment authorization failures</div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06]">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Latency Spike</div>
                    <div className="text-xl font-bold text-rose-600 dark:text-rose-400 tracking-tight font-mono">
                      1,840ms <span className="text-xs text-slate-500 font-sans">(Nominal: 42ms)</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">P99 response degrading rapidly</div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06]">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Pool Saturation</div>
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                      98 / 100 <span className="text-xs font-normal text-slate-600 dark:text-slate-400 font-sans">Connections</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">342 connection requests waiting</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    <span className="text-xs text-indigo-900 dark:text-indigo-200">
                      Telemetry anomaly detected. AI Investigator engaged for autonomous triage.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 font-medium">T+00:12s</span>
                </div>
              </motion.div>
            )}

            {/* STEP 2: AI INVESTIGATION */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block font-semibold">
                        AI Investigator
                      </span>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Analyzing incident evidence & telemetry...
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded border border-slate-200 dark:border-white/[0.08]">
                    Evidence Collected: 3 Signals
                  </span>
                </div>

                <div className="space-y-2.5">
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">API latency increased</span>
                    </div>
                    <span className="text-xs font-mono text-rose-600 dark:text-rose-300 font-medium">P99 +4,280% above baseline</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">Database connections saturated</span>
                    </div>
                    <span className="text-xs font-mono text-amber-600 dark:text-amber-300 font-medium">98/100 pool max reached</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">5xx responses increased</span>
                    </div>
                    <span className="text-xs font-mono text-rose-600 dark:text-rose-300 font-medium">4.8% timeout dropoff</span>
                  </motion.div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 pt-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>Synthesizing multi-modal telemetry vectors for Hindsight query...</span>
                </div>
              </motion.div>
            )}

            {/* STEP 3: HINDSIGHT MEMORY */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 block font-semibold">
                        Searching Hindsight Memory...
                      </span>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        3 similar historical incidents found
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-2.5 py-1 rounded font-medium">
                    Vector Match: 94%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300">INCIDENT #184</span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> 11 min
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                      Database connection pool exhaustion
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Resolved via PgBouncer reserve pool increase.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300">INCIDENT #231</span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> 7 min
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                      Database connection saturation
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Resolved via pool configuration change & jitter.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300">INCIDENT #267</span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> 9 min
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                      Payment API database timeout
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Resolved via idle statement eviction.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>
                    <strong className="text-slate-900 dark:text-white">Learned heuristic:</strong> Restarting the service fails 80% of the time under pool load; dynamic pool scaling recovers service in under 8 minutes.
                  </span>
                </div>
              </motion.div>
            )}

            {/* STEP 4: AI RECOMMENDATION */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block font-semibold">
                      AI Recommendation Engine
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Synthesized from 3 historical resolutions
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Confidence</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">94%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07]">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                      Likely Root Cause
                    </span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Database connection pool exhaustion
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      Caused by sudden burst in checkout authorizations exceeding max 100 connection capacity.
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
                    <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 uppercase tracking-wide block mb-1 font-semibold">
                      Recommended Runbook
                    </span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      DB-CONNECTION-POOL-RECOVERY
                    </div>
                    <div className="text-xs text-indigo-900 dark:text-indigo-200/80 mt-2">
                      Applies step 4: dynamically scale reserve pool allocation to 250 without container restart.
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>Target MTTR reduction: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">-72% vs manual triage</strong></span>
                  <span className="text-slate-500">Hindsight Match ID: mem-184 / mem-231</span>
                </div>
              </motion.div>
            )}

            {/* STEP 5: RESOLUTION */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block font-semibold">
                      Automated Mitigation Completed
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Resolution completed in 7 minutes
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    RESOLVED
                  </div>
                </div>

                {/* State transition bar */}
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 text-center py-2 px-3 rounded bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-xs text-slate-600 dark:text-slate-400">
                    <span className="block font-mono text-[10px] text-slate-400 dark:text-slate-500">STAGE 1</span>
                    INVESTIGATING
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <div className="flex-1 text-center py-2 px-3 rounded bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                    <span className="block font-mono text-[10px] text-indigo-500 dark:text-indigo-400">STAGE 2</span>
                    RESOLVING
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <div className="flex-1 text-center py-2 px-3 rounded bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <span className="block font-mono text-[10px] text-emerald-600 dark:text-emerald-400">STAGE 3</span>
                    RESOLVED (7m)
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[11px] text-slate-500 font-mono">P99 LATENCY</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">38ms</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Nominal baseline</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-mono">ERROR RATE</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">0.00%</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Recovered</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-mono">POOL CAPACITY</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">250 Conn</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Auto-scaled</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: LEARNING */}
            {currentStep === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-500/40">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 block font-semibold">
                        Hindsight Persistent Memory
                      </span>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Memory Updated & Ingested into Graph
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/10 px-2.5 py-1 rounded border border-purple-200 dark:border-purple-500/20 font-medium">
                    ID #304 Stored
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-purple-50/80 dark:bg-purple-950/15 border border-purple-200 dark:border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Root Cause:</span>
                    <span className="text-slate-900 dark:text-white font-medium">Connection pool exhaustion</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Resolution:</span>
                    <span className="text-indigo-700 dark:text-indigo-300 font-mono font-medium">Increase pool capacity to 250</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Outcome:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Successful
                    </span>
                  </div>
                  <div className="pt-2 border-t border-purple-200 dark:border-purple-500/20 text-xs text-purple-900 dark:text-purple-200">
                    <strong>Permanent Rule Stored:</strong> Prioritize PgBouncer dynamic expansion over pod recycle when Payments API experiences sudden authorization surges.
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium">
                    <BrainCircuit className="w-4 h-4" />
                    Knowledge weight increased by +12% for Payments API cluster
                  </span>
                  <span className="text-slate-500 font-mono">Loop resets in 4s</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Bar: Action & Deep Dive */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Hindsight Memory Layer Active
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-white/10">|</span>
              <span className="hidden sm:inline font-mono text-[11px] text-slate-500">
                1,284 memories indexed
              </span>
            </div>

            {onLaunchWorkspace && (
              <button
                onClick={onLaunchWorkspace}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-800 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-all cursor-pointer shadow-xs"
              >
                <span>Open in Live Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
