import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  BrainCircuit, 
  Database, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Activity, 
  Terminal, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight,
  ChevronLeft,
  Zap,
  ExternalLink,
  Layers,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Incident } from '../../types';

export type MilestoneId = 
  | 'alert_triggered' 
  | 'investigation_started' 
  | 'hindsight_recalled' 
  | 'resolution_found';

export interface MilestoneData {
  id: MilestoneId;
  title: string;
  subtitle: string;
  shortLabel: string;
  timestamp: string;
  relativeTime: string;
  durationFromPrev: string;
  status: 'completed' | 'active';
  category: 'Telemetry Alert' | 'AI Diagnosis' | 'Vector Memory' | 'Runbook Action';
  associatedTab: 'alerts' | 'investigation' | 'hindsight' | 'runbook';
  iconType: 'alert' | 'brain' | 'database' | 'resolution';
  colorTheme: 'rose' | 'indigo' | 'purple' | 'emerald';
  description: string;
  systemActor: string;
  metrics: { label: string; value: string; isAnomaly?: boolean }[];
  logs: string[];
  keyOutcome: string;
  actionText: string;
}

interface InteractiveTimelineProps {
  incident: Incident;
  selectedMilestoneId?: MilestoneId;
  onSelectMilestone?: (milestoneId: MilestoneId) => void;
  onNavigateTab?: (tab: 'alerts' | 'investigation' | 'hindsight' | 'runbook') => void;
  compactBanner?: boolean;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  incident,
  selectedMilestoneId,
  onSelectMilestone,
  onNavigateTab,
  compactBanner = false
}) => {
  const [activeId, setActiveId] = useState<MilestoneId>(selectedMilestoneId || 'hindsight_recalled');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'milestones' | 'chronology'>('milestones');

  useEffect(() => {
    if (selectedMilestoneId) {
      setActiveId(selectedMilestoneId);
    }
  }, [selectedMilestoneId]);

  // Autoplay sequencer through milestones
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveId((prev) => {
          if (prev === 'alert_triggered') return 'investigation_started';
          if (prev === 'investigation_started') return 'hindsight_recalled';
          if (prev === 'hindsight_recalled') return 'resolution_found';
          setIsPlaying(false);
          return 'resolution_found';
        });
      }, 2600);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const milestones: MilestoneData[] = [
    {
      id: 'alert_triggered',
      title: 'Alert Triggered',
      subtitle: 'P99 Latency & Connection Pool Saturation',
      shortLabel: 'Alert',
      timestamp: '15:28:10 UTC',
      relativeTime: 'T + 00:00',
      durationFromPrev: 'Baseline',
      status: 'completed',
      category: 'Telemetry Alert',
      associatedTab: 'alerts',
      iconType: 'alert',
      colorTheme: 'rose',
      description: 'Prometheus Alertmanager fired P1 threshold breach: Payments API P99 latency breached nominal 42ms SLO target, surging to 1,840ms. PgBouncer pool climbed to 98% utilization with 342 queued requests.',
      systemActor: 'Prometheus Alertmanager / Envoy Edge Gateway',
      metrics: [
        { label: 'P99 Latency', value: '1,840ms (+4,280%)', isAnomaly: true },
        { label: 'Connection Pool', value: '98 / 100 (98%)', isAnomaly: true },
        { label: '504 Gateway Timeouts', value: '4.8% error rate', isAnomaly: true },
        { label: 'Affected Ingress', value: '/v2/charge (Checkout)', isAnomaly: false }
      ],
      logs: [
        '15:28:10.120 [ALERT] PaymentsAPI_P99LatencyThresholdExceeded value=1840ms threshold=400ms',
        '15:28:12.441 [WARN] pgbouncer_clients_waiting queue_depth=342 max_wait=3200ms',
        '15:28:14.890 [PAGE] Dispatched P1 alert to SRE Primary On-Call (Sarah Chen)',
        '15:28:16.002 [INFO] Autonomic event envelope published to AI Orchestrator bus'
      ],
      keyOutcome: 'P1 incident automatically declared. SLO breach timer initiated; on-call responder paged.',
      actionText: 'Inspect Raw Telemetry & Alerts'
    },
    {
      id: 'investigation_started',
      title: 'Investigation Started',
      subtitle: 'AI Autonomic Signal Correlation Engaged',
      shortLabel: 'Investigation',
      timestamp: '15:28:35 UTC',
      relativeTime: 'T + 00:25',
      durationFromPrev: '+25 seconds',
      status: 'completed',
      category: 'AI Diagnosis',
      associatedTab: 'investigation',
      iconType: 'brain',
      colorTheme: 'indigo',
      description: 'AI Autonomous Investigator engaged within 25 seconds of alert fire. Ingested 4 cross-tier metrics, traces, and pod health signals to isolate the bottleneck. Confirmed pod hardware resources (CPU 38%, RAM 44%) are nominal, confirming issue is isolated to database pool starvation.',
      systemActor: 'AI Incident Investigator Agent v3.4',
      metrics: [
        { label: 'Diagnosis Confidence', value: '94% High Confidence', isAnomaly: false },
        { label: 'Signals Correlated', value: '4 metrics & traces', isAnomaly: false },
        { label: 'Pod Hardware State', value: 'CPU 38% · RAM 44% (OK)', isAnomaly: false },
        { label: 'Root Cause Isolation', value: 'Pool Exhaustion (PgBouncer)', isAnomaly: true }
      ],
      logs: [
        '15:28:35.010 [AGENT] AI Investigator worker initialized with session token #304-diag',
        '15:28:38.214 [TELEMETRY] Correlated P99 latency with pg_stat_activity connection wait states',
        '15:28:44.750 [DIAGNOSIS] Hardware throttling ruled out (CPU/Memory headroom > 60%)',
        '15:28:50.119 [HYPOTHESIS] Isolated primary bottleneck: DB client pool exhaustion on peak burst'
      ],
      keyOutcome: 'Ruled out node failure & memory leak; pinpointed connection pool exhaustion with 94% confidence.',
      actionText: 'Inspect AI Telemetry & Diagnosis'
    },
    {
      id: 'hindsight_recalled',
      title: 'Hindsight Recalled',
      subtitle: '3 Historical Precedents Matched (94% Affinity)',
      shortLabel: 'Hindsight Memory',
      timestamp: '15:29:12 UTC',
      relativeTime: 'T + 01:02',
      durationFromPrev: '+37 seconds',
      status: 'completed',
      category: 'Vector Memory',
      associatedTab: 'hindsight',
      iconType: 'database',
      colorTheme: 'purple',
      description: 'Hindsight continuous memory store queried telemetry embeddings in memory bank "Incident". Recalled Incident #184 and #231 with verified semantic similarity. Retrieved vital institutional rule: "Do NOT restart Payments API pods—it drops active payment transactions. Apply connection pool expansion instead."',
      systemActor: 'Hindsight Persistent Vector Memory Store',
      metrics: [
        { label: 'Vector Similarity', value: '94% Semantic Match', isAnomaly: false },
        { label: 'Historical Precedent', value: 'Incident #184 & #231', isAnomaly: false },
        { label: 'Average MTTR', value: '8m 12s (-78% faster)', isAnomaly: false },
        { label: 'Resolution Success', value: '98% Historical Efficacy', isAnomaly: false }
      ],
      logs: [
        '15:29:12.302 [MEMORY] Synthesized telemetry embedding vector [1536 dims]',
        '15:29:14.881 [QUERY] Matched 3 historical incidents: #184 (96%), #231 (94%), #267 (91%)',
        '15:29:17.410 [HEURISTIC] Retrieved learned institutional heuristic: pod restart drops inflight handshakes',
        '15:29:20.005 [RECOMMEND] Routed recommendation DB-CONNECTION-POOL-RECOVERY to workspace'
      ],
      keyOutcome: 'Avoided catastrophic pod restart; extracted proven connection pool configuration playbook.',
      actionText: 'View Hindsight Memory Precedents'
    },
    {
      id: 'resolution_found',
      title: 'Resolution Found',
      subtitle: 'Runbook DB-CONNECTION-POOL-RECOVERY Ready',
      shortLabel: 'Resolution',
      timestamp: '15:30:05 UTC',
      relativeTime: 'T + 01:55',
      durationFromPrev: '+53 seconds',
      status: 'completed',
      category: 'Runbook Action',
      associatedTab: 'runbook',
      iconType: 'resolution',
      colorTheme: 'emerald',
      description: 'Automated policy engine mapped Hindsight recommendations to verified runbook DB-CONNECTION-POOL-RECOVERY. Pre-flight parameter checks passed. Step 4 generated executable kubectl patch to scale connection pool from 100 to 250 and tune idle connection reclaim timeout to 5s.',
      systemActor: 'Automated Runbook Orchestrator',
      metrics: [
        { label: 'Actionable Runbook', value: 'DB-CONNECTION-POOL-RECOVERY', isAnomaly: false },
        { label: 'Step 4 Patch', value: 'default_pool_size: 250', isAnomaly: false },
        { label: 'Validation Time', value: 'Validated in < 7 mins', isAnomaly: false },
        { label: 'Success Guarantee', value: '0 dropped client handshakes', isAnomaly: false }
      ],
      logs: [
        '15:30:05.112 [RUNBOOK] Matched runbook DB-CONNECTION-POOL-RECOVERY step 4 configuration',
        '15:30:10.540 [ORCHESTRATOR] Generated kubectl patch configmap for pgbouncer cluster',
        '15:30:15.220 [SAFETY] Pre-flight dry-run check succeeded with zero lock conflicts',
        '15:30:22.890 [READY] Runbook awaiting on-call execution approval or auto-remediation'
      ],
      keyOutcome: 'Targeted zero-downtime mitigation identified in under 2 minutes (T+01:55 from initial alert).',
      actionText: 'Inspect & Execute Runbook Step'
    }
  ];

  const currentMilestone = milestones.find((m) => m.id === activeId) || milestones[2];
  const activeIndex = milestones.findIndex((m) => m.id === activeId);

  const handleNodeClick = (id: MilestoneId) => {
    setActiveId(id);
    setIsPlaying(false);
    if (onSelectMilestone) {
      onSelectMilestone(id);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      handleNodeClick(milestones[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (activeIndex < milestones.length - 1) {
      handleNodeClick(milestones[activeIndex + 1].id);
    }
  };

  // Compact Banner Mode (Used at top of workspace or header)
  if (compactBanner) {
    return (
      <div className="bg-white dark:bg-[#0A0D15] border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-700 dark:text-slate-300">
              Autonomic Incident Trajectory
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              (MTTR: 1m 55s to resolution)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Click node to inspect stage:</span>
          </div>
        </div>

        {/* Horizontal Mini Rail */}
        <div className="grid grid-cols-4 gap-2 relative">
          {milestones.map((m, idx) => {
            const isSelected = m.id === activeId;
            return (
              <button
                key={m.id}
                onClick={() => handleNodeClick(m.id)}
                className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? m.colorTheme === 'rose'
                      ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/40 shadow-xs'
                      : m.colorTheme === 'indigo'
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-500/40 shadow-xs'
                      : m.colorTheme === 'purple'
                      ? 'bg-purple-50 dark:bg-purple-500/15 border-purple-300 dark:border-purple-500/40 shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                    isSelected
                      ? m.colorTheme === 'rose'
                        ? 'bg-rose-500 text-white'
                        : m.colorTheme === 'indigo'
                        ? 'bg-indigo-500 text-white'
                        : m.colorTheme === 'purple'
                        ? 'bg-purple-500 text-white'
                        : 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {m.shortLabel}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {m.relativeTime}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Full Interactive Timeline Component
  return (
    <div className="space-y-6">
      {/* Top Header Card & Playback Controls */}
      <div className="bg-white dark:bg-[#0A0D15] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm dark:shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.07]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                <Zap className="w-3 h-3 text-indigo-500" />
                AUTONOMIC TIMELINE ENGINE
              </span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">·</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                Triage MTTR: 1m 55s
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Visual Incident Event Sequence
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Click any milestone node to inspect live telemetric evidence, AI reasoning, and historical memory recalls.
            </p>
          </div>

          {/* Scrubber & Simulation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Milestone"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                  : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
              }`}
              title={isPlaying ? 'Pause replay simulation' : 'Auto-replay milestone sequence'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Playing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                  <span>Replay Flow</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={activeIndex === milestones.length - 1}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Milestone"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* VISUAL INTERACTIVE RAIL WITH CLICKABLE NODES */}
        <div className="relative pt-4 pb-2">
          {/* Base Track Rail */}
          <div className="absolute top-[42px] left-6 right-6 h-1 bg-slate-200 dark:bg-white/10 rounded-full -translate-y-1/2 z-0" />

          {/* Active Highlight Rail Progress */}
          <div
            className="absolute top-[42px] left-6 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 via-purple-500 to-emerald-500 rounded-full -translate-y-1/2 transition-all duration-500 z-0"
            style={{
              width: `${(activeIndex / (milestones.length - 1)) * 100}%`,
              maxWidth: 'calc(100% - 3rem)'
            }}
          />

          {/* 4 Clickable Milestone Nodes */}
          <div className="grid grid-cols-4 gap-2 relative z-10">
            {milestones.map((milestone, idx) => {
              const isSelected = milestone.id === activeId;
              const isPastOrCurrent = idx <= activeIndex;

              return (
                <div
                  key={milestone.id}
                  onClick={() => handleNodeClick(milestone.id)}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  {/* Clickable Node Circle */}
                  <div
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? milestone.colorTheme === 'rose'
                          ? 'bg-rose-500 text-white ring-4 ring-rose-500/25 dark:ring-rose-500/40 shadow-lg shadow-rose-500/30 scale-110'
                          : milestone.colorTheme === 'indigo'
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/25 dark:ring-indigo-500/40 shadow-lg shadow-indigo-500/30 scale-110'
                          : milestone.colorTheme === 'purple'
                          ? 'bg-purple-600 text-white ring-4 ring-purple-500/25 dark:ring-purple-500/40 shadow-lg shadow-purple-500/30 scale-110'
                          : 'bg-emerald-600 text-white ring-4 ring-emerald-500/25 dark:ring-emerald-500/40 shadow-lg shadow-emerald-500/30 scale-110'
                        : isPastOrCurrent
                        ? 'bg-white dark:bg-[#0A0D15] border-2 border-slate-400 dark:border-white/30 text-slate-700 dark:text-slate-200 group-hover:border-indigo-500 group-hover:scale-105'
                        : 'bg-slate-100 dark:bg-[#121622] border-2 border-slate-300 dark:border-white/10 text-slate-400 dark:text-slate-500 group-hover:scale-105'
                    }`}
                  >
                    {milestone.iconType === 'alert' && <BellRing className="w-5 h-5" />}
                    {milestone.iconType === 'brain' && <BrainCircuit className="w-5 h-5" />}
                    {milestone.iconType === 'database' && <Database className="w-5 h-5" />}
                    {milestone.iconType === 'resolution' && <ShieldCheck className="w-5 h-5" />}

                    {/* Ping indicator for selected node */}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-slate-900" />
                      </span>
                    )}
                  </div>

                  {/* Node Label & Relative Offset */}
                  <div className="mt-3 space-y-0.5 px-1 max-w-full">
                    <div
                      className={`text-xs font-bold tracking-tight transition-colors line-clamp-1 ${
                        isSelected
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    >
                      {milestone.title}
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono">
                      <span
                        className={`font-semibold ${
                          isSelected
                            ? milestone.colorTheme === 'rose'
                              ? 'text-rose-600 dark:text-rose-400'
                              : milestone.colorTheme === 'indigo'
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : milestone.colorTheme === 'purple'
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {milestone.relativeTime}
                      </span>
                      <span className="text-slate-300 dark:text-white/20 hidden sm:inline">·</span>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] hidden sm:inline">
                        {milestone.timestamp.split(' ')[0]}
                      </span>
                    </div>

                    {/* Step indicator badge */}
                    <span
                      className={`inline-block text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-medium mt-1 ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Step 0{idx + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SELECTED NODE DEEP-DIVE INSPECTION CARD */}
      <div
        className={`rounded-xl border p-6 shadow-sm dark:shadow-xl space-y-6 transition-all animate-fade-in ${
          currentMilestone.colorTheme === 'rose'
            ? 'bg-white dark:bg-[#0A0D15] border-rose-200 dark:border-rose-500/25 ring-1 ring-rose-500/10'
            : currentMilestone.colorTheme === 'indigo'
            ? 'bg-white dark:bg-[#0A0D15] border-indigo-200 dark:border-indigo-500/25 ring-1 ring-indigo-500/10'
            : currentMilestone.colorTheme === 'purple'
            ? 'bg-white dark:bg-[#0A0D15] border-purple-200 dark:border-purple-500/25 ring-1 ring-purple-500/10'
            : 'bg-white dark:bg-[#0A0D15] border-emerald-200 dark:border-emerald-500/25 ring-1 ring-emerald-500/10'
        }`}
      >
        {/* Detail Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  currentMilestone.colorTheme === 'rose'
                    ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
                    : currentMilestone.colorTheme === 'indigo'
                    ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30'
                    : currentMilestone.colorTheme === 'purple'
                    ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/30'
                    : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                }`}
              >
                {currentMilestone.category}
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {currentMilestone.timestamp}
              </span>
              <span className="text-slate-300 dark:text-white/20">·</span>
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                Offset: {currentMilestone.relativeTime} ({currentMilestone.durationFromPrev})
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentMilestone.title}
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Responsible actor: <strong className="text-slate-800 dark:text-slate-200 font-mono">{currentMilestone.systemActor}</strong>
            </p>
          </div>

          {/* Tab Navigation CTA Button */}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab(currentMilestone.associatedTab)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <span>{currentMilestone.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Narrative Description */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white block mb-1">
            Autonomic Analysis Summary:
          </strong>
          {currentMilestone.description}
        </div>

        {/* Metrics Grid */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
            Telemetric Signatures Captured
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentMilestone.metrics.map((metric, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border text-xs ${
                  metric.isAnomaly
                    ? 'bg-rose-50/70 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/25'
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  {metric.label}
                </div>
                <div
                  className={`text-sm font-bold font-mono mt-1 ${
                    metric.isAnomaly
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Log Stream Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              <span>Diagnostic Event Stream Trace</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">JSON-L Format</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 dark:bg-black/70 border border-slate-800 dark:border-white/10 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-x-auto">
            {currentMilestone.logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed hover:text-white transition-colors">
                <span className="text-indigo-400">$ </span>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Outcome Callout Box */}
        <div
          className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-xs ${
            currentMilestone.colorTheme === 'rose'
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
              : currentMilestone.colorTheme === 'indigo'
              ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-200'
              : currentMilestone.colorTheme === 'purple'
              ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-200'
              : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-current" />
          <div>
            <strong className="text-slate-900 dark:text-white">Milestone Outcome: </strong>
            <span>{currentMilestone.keyOutcome}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
