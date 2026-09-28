import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Database, 
  ArrowRight, 
  X, 
  Sparkles, 
  Clock, 
  Terminal,
  Activity,
  Volume2,
  VolumeX
} from 'lucide-react';
import { P1ToastData } from '../../types/toast';
import { useToast } from '../../context/ToastContext';

interface ToastNotificationProps {
  toast: P1ToastData;
  onDismiss: (id: string) => void;
  onInspect: (incidentId: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onDismiss,
  onInspect,
}) => {
  const duration = toast.durationMs || 9000;
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const { soundEnabled, toggleSound, playAudioCue } = useToast();

  useEffect(() => {
    if (isPaused) return;

    const intervalMs = 100;
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= intervalMs) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - intervalMs;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, toast.id, onDismiss]);

  const progressPercentage = Math.max(0, (remainingTime / duration) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -25, scale: 0.92, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -18, scale: 0.94, filter: 'blur(4px)', transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full max-w-md rounded-xl bg-white/95 dark:bg-[#0B0E17]/95 border border-rose-500/40 shadow-2xl shadow-slate-900/15 dark:shadow-black/90 backdrop-blur-xl overflow-hidden pointer-events-auto transition-colors"
      role="alert"
      aria-live="assertive"
    >
      {/* Top Specular Sheen Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/80 to-transparent" />

      {/* Atmospheric ambient glow behind card */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-600/10 dark:bg-rose-600/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar of Toast */}
      <div className="p-4 sm:p-4.5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Pulsing P1 Critical Radar Badge */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>

            <span className="font-mono text-[11px] font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/40">
              P1 CRITICAL
            </span>

            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              #{toast.incidentNumber}
            </span>

            <span className="text-slate-300 dark:text-white/20">·</span>

            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {toast.service}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio cue replay / toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudioCue();
              }}
              className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Replay P1 audio cue"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400/80" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              )}
            </button>

            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              {toast.timestamp}
            </span>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Incident Headline & Summary */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
            {toast.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {toast.summary}
          </p>
        </div>

        {/* Hindsight Intelligence Callout */}
        <div className="p-2.5 rounded-lg bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/20 dark:border-purple-500/30 flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
          <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-tight space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-800 dark:text-purple-200">
                Hindsight: {toast.hindsightMatchesCount || 3} similar incidents recalled
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {toast.similarityScore ? `${(toast.similarityScore * 100).toFixed(0)}%` : '94%'} match
              </span>
            </div>
            {toast.recommendedRunbook && (
              <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono text-[10px] pt-0.5">
                <Terminal className="w-3 h-3 text-purple-600 dark:text-purple-300" />
                <span>Runbook: {toast.recommendedRunbook}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-1 flex items-center justify-between gap-3">
          <div className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">
            {isPaused ? 'Auto-dismiss paused' : 'AI Investigator dispatched'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDismiss(toast.id)}
              className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-md transition-colors cursor-pointer"
            >
              Acknowledge
            </button>
            <button
              onClick={() => {
                onInspect(toast.incidentId);
                onDismiss(toast.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md shadow-rose-900/30 ring-1 ring-white/10 transition-all cursor-pointer active:scale-95"
            >
              <span>Inspect in Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Countdown Progress Bar */}
      <div className="h-0.5 w-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-100 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </motion.div>
  );
};
