import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Terminal, 
  Database, 
  BrainCircuit, 
  Sparkles, 
  UserCheck, 
  Share2, 
  FileText, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { INITIAL_INCIDENTS, INITIAL_RUNBOOKS, INITIAL_POSTMORTEM } from '../../data/mockData';
import { hindsightService } from '../../services/hindsight';
import { apiService } from '../../services/api';
import { Incident, HindsightMemory, Postmortem } from '../../types';
import { InteractiveTimeline, MilestoneId } from './InteractiveTimeline';

interface IncidentWorkspaceProps {
  incidentId: string;
  onBack: () => void;
}

type WorkspaceTab = 
  | 'overview' 
  | 'timeline' 
  | 'alerts' 
  | 'investigation' 
  | 'related' 
  | 'hindsight' 
  | 'runbook' 
  | 'notes' 
  | 'postmortem';

export const IncidentWorkspace: React.FC<IncidentWorkspaceProps> = ({
  incidentId,
  onBack
}) => {
  const [incident, setIncident] = useState<Incident>(
    () => INITIAL_INCIDENTS.find((i) => i.id === incidentId) || INITIAL_INCIDENTS[0]
  );
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('hindsight');
  const [memories, setMemories] = useState<HindsightMemory[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [currentBankId, setCurrentBankId] = useState<string>(hindsightService.getStats().bankId || 'memoryops-incidents');
  const [notes, setNotes] = useState<string[]>([
    '15:29 UTC: AI Investigator verified database connection saturation.',
    '15:30 UTC: SRE on-call approved DB-CONNECTION-POOL-RECOVERY runbook execution.'
  ]);
  const [newNote, setNewNote] = useState<string>('');
  const [postmortemSaved, setPostmortemSaved] = useState<boolean>(false);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneId>('hindsight_recalled');

  useEffect(() => {
    const fetchIncidentAndRelated = async () => {
      // 1. Fetch latest incident from backend if available
      try {
        const backendInc = await apiService.getIncident(incidentId);
        if (backendInc) {
          setIncident(backendInc);
        }
      } catch (err) {
        console.warn('Incident fetch fallback:', err);
      }

      // 2. Perform AI investigation & real Hindsight recall via apiService
      try {
        const analysis = await apiService.analyzeIncident(incident);
        if (analysis.matchedMemories && analysis.matchedMemories.length > 0) {
          setMemories(analysis.matchedMemories);
        } else {
          const rel = await hindsightService.getRelatedIncidents(incident.id);
          setMemories(rel);
        }
        if (analysis.explanation) {
          setExplanation(analysis.explanation);
        }
      } catch (err) {
        const rel = await hindsightService.getRelatedIncidents(incident.id);
        setMemories(rel);
      }

      setCurrentBankId(hindsightService.getStats().bankId || 'memoryops-incidents');
    };

    fetchIncidentAndRelated();
  }, [incidentId]);

  const handleAction = async (action: 'Acknowledge' | 'Assign' | 'Resolve') => {
    if (action === 'Acknowledge') {
      setIncident((prev) => ({ ...prev, status: 'Investigating' }));
      await apiService.updateIncidentStatus(incident.id, 'Investigating');
      setActionNotice('Incident acknowledged by On-Call SRE.');
      setTimeout(() => setActionNotice(null), 3000);
    } else if (action === 'Assign') {
      setIncident((prev) => ({ ...prev, assignee: 'You (Active Responder)' }));
      setActionNotice('Assigned to current user.');
      setTimeout(() => setActionNotice(null), 3000);
    } else if (action === 'Resolve') {
      setIncident((prev) => ({ ...prev, status: 'Resolved' }));
      await apiService.updateIncidentStatus(incident.id, 'Resolved');
      setActionNotice(`Retaining incident resolution to Hindsight memory bank "${currentBankId}"...`);
      
      // Send the resolution to the backend to store in Hindsight using retain
      try {
        await apiService.retainIncident(incident, {
          resolution: 'Applied DB-CONNECTION-POOL-RECOVERY: Scaled PgBouncer pool to 250 connections and patched idle connection reclaim timeout.',
          rootCause: incident.likelyRootCause || 'Database connection pool saturation under peak checkout burst',
          lessonsLearned: 'This service responds better to dynamic pool capacity scaling than service restart.'
        });
        await hindsightService.refreshStatusAndMemories();
        setActionNotice(`Incident #${incident.incidentNumber} resolution saved to Hindsight memory bank "${currentBankId}" via retain!`);
        setTimeout(() => setActionNotice(null), 4500);
      } catch (err: any) {
        console.warn('Retain error:', err);
        setActionNotice(`Incident resolved. (Hindsight notice: ${err?.message || 'Logged locally'})`);
        setTimeout(() => setActionNotice(null), 4500);
      }
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes((prev) => [...prev, `${new Date().toLocaleTimeString()} UTC: ${newNote.trim()}`]);
    setNewNote('');
  };

  const handleSavePostmortem = async () => {
    setActionNotice('Saving postmortem to Hindsight bank "Incident" via retain...');
    await hindsightService.storePostmortem(INITIAL_POSTMORTEM);
    setPostmortemSaved(true);
    setActionNotice('Postmortem lessons permanently retained to Hindsight memory bank "Incident"!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const tabs: { id: WorkspaceTab; label: string; highlight?: boolean }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Interactive Timeline', highlight: true },
    { id: 'hindsight', label: 'Hindsight Memory', highlight: true },
    { id: 'investigation', label: 'AI Investigation' },
    { id: 'runbook', label: 'Runbook' },
    { id: 'alerts', label: 'Alerts & Telemetry' },
    { id: 'related', label: 'Related Incidents' },
    { id: 'postmortem', label: 'Postmortem' },
    { id: 'notes', label: 'Notes' }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--bg-app)]">
      {/* Workspace Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0A0D15] space-y-4 shrink-0 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                  {incident.severity}
                </span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  INCIDENT #{incident.incidentNumber}
                </span>
                <span className="text-slate-300 dark:text-white/20">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{incident.service}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {incident.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('Acknowledge')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Acknowledge
            </button>
            <button
              onClick={() => handleAction('Assign')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Assign
            </button>
            <button
              onClick={() => handleAction('Resolve')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
                incident.status === 'Resolved'
                  ? 'bg-emerald-600/20 dark:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {incident.status === 'Resolved' ? 'Resolved ✓' : 'Resolve Incident'}
            </button>
          </div>
        </div>

        {/* Status ticker & Assignee metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                incident.status === 'Resolved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`} />
              Status: <strong className="text-slate-800 dark:text-slate-200">{incident.status}</strong>
            </span>
            <span>·</span>
            <span>Assignee: <strong className="text-slate-800 dark:text-slate-200">{incident.assignee}</strong></span>
            <span>·</span>
            <span>Created: {incident.createdAt}</span>
          </div>

          {actionNotice && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in font-medium">
              ✓ {actionNotice}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-200 dark:border-white/[0.06]">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? tab.highlight
                      ? 'bg-purple-100 dark:bg-purple-600/30 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-500/40 shadow-sm'
                      : 'bg-slate-200 dark:bg-white/[0.08] text-slate-900 dark:text-white border border-slate-300 dark:border-white/10'
                    : tab.highlight
                    ? 'text-purple-700 dark:text-purple-300/80 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.03]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Milestone Rail Mini-Banner (always accessible) */}
      <div className="px-5 sm:px-6 pt-3 shrink-0">
        <InteractiveTimeline
          incident={incident}
          compactBanner={true}
          selectedMilestoneId={selectedMilestone}
          onSelectMilestone={(milestoneId) => {
            setSelectedMilestone(milestoneId);
            const tabMap: Record<string, WorkspaceTab> = {
              alert_triggered: 'alerts',
              investigation_started: 'investigation',
              hindsight_recalled: 'hindsight',
              resolution_found: 'runbook'
            };
            if (tabMap[milestoneId]) {
              setCurrentTab(tabMap[milestoneId]);
            }
          }}
        />
      </div>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        {/* PROMINENT HINDSIGHT MEMORY TAB */}
        {currentTab === 'hindsight' && (
          <div className="space-y-6 max-w-5xl">
            {/* Memory Highlight Box required by prompt */}
            <div className="p-6 rounded-xl border border-purple-200 dark:border-purple-500/30 bg-purple-50/70 dark:bg-purple-950/20 shadow-lg dark:shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-200 dark:border-purple-500/20">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-bold block">
                        HINDSIGHT RECALL
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold">
                        Bank: {currentBankId}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {memories.length} related precedent{memories.length === 1 ? '' : 's'} recalled from Hindsight
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-500/30 px-3 py-1 rounded font-bold">
                    {memories[0]?.confidenceScore ? `${Math.round(memories[0].confidenceScore * 100)}% similarity` : 'Vector affinity'}
                  </span>
                </div>
              </div>

              {/* AI Investigator Explanation of WHY historical incidents are relevant */}
              {explanation && (
                <div className="p-3.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 text-xs font-sans space-y-1">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Investigator Telemetry Correlation:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {explanation}
                  </p>
                </div>
              )}

              {/* Memory stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-white dark:bg-black/40 border border-purple-200 dark:border-purple-500/20 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] mb-1">
                    MOST SUCCESSFUL RESOLUTION
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    DB-CONNECTION-POOL-RECOVERY
                  </div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300 mt-1">
                    Verified across {memories.length} historical instance{memories.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white dark:bg-black/40 border border-purple-200 dark:border-purple-500/20 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] mb-1">
                    AVERAGE RESOLUTION TIME
                  </span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    8m 12s
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    -78% faster than manual on-call restart
                  </div>
                </div>
              </div>

              {/* Learned heuristic reminder */}
              <div className="p-3.5 rounded-lg bg-purple-100/70 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Institutional Rule: </strong>
                  Do not restart Payments API pods during checkout bursts. Restarting drops 100% of inflight payment handshakes. Apply PgBouncer pool enlargement to stabilize in under 4 minutes.
                </div>
              </div>
            </div>

            {/* Related Incidents Memory Cards */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                Historical Memory Precedents
              </span>

              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0A0D15] space-y-2 hover:border-purple-400 dark:hover:border-purple-500/30 transition-all shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                        INCIDENT #{mem.incidentNumber}
                      </span>
                      <span className="text-slate-300 dark:text-white/20">·</span>
                      <span className="text-slate-800 dark:text-slate-300">{mem.title}</span>
                    </div>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> Resolved in {mem.resolutionTimeMinutes} min
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <div>
                      <strong className="text-slate-900 dark:text-slate-300">Root Cause: </strong>
                      {mem.rootCause}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-300">Applied Fix: </strong>
                      <span className="text-indigo-600 dark:text-indigo-300 font-mono">{mem.resolution}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {currentTab === 'overview' && (
          <div className="space-y-6 max-w-5xl">
            {/* Visual Interactive Timeline in Overview */}
            <InteractiveTimeline
              incident={incident}
              selectedMilestoneId={selectedMilestone}
              onSelectMilestone={(id) => setSelectedMilestone(id)}
              onNavigateTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
            />

            <div className="p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-4">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                Incident Summary
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {incident.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <div className="text-[11px] font-mono text-slate-500">AFFECTED SERVICE</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{incident.service}</div>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <div className="text-[11px] font-mono text-slate-500">CURRENT P99 LATENCY</div>
                  <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">1,840ms</div>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <div className="text-[11px] font-mono text-slate-500">ESTIMATED RECOVERY</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">7 minutes</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/15 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Recommended Action Ready</div>
                <div className="text-xs text-indigo-700 dark:text-indigo-300/80">
                  Hindsight recommends executing DB-CONNECTION-POOL-RECOVERY.
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('runbook')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
              >
                Inspect Runbook →
              </button>
            </div>
          </div>
        )}

        {/* INVESTIGATION TAB */}
        {currentTab === 'investigation' && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    AI Telemetry Correlation & Diagnosis
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">94% Confidence</span>
              </div>

              <div className="space-y-3">
                {incident.signals.map((sig) => (
                  <div key={sig.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {sig.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 pl-5.5">{sig.detail || sig.value}</div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{sig.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RUNBOOK TAB */}
        {currentTab === 'runbook' && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    DB-CONNECTION-POOL-RECOVERY
                  </h3>
                  <div className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                    Recommended by Hindsight persistent memory
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">98% Success Rate</span>
              </div>

              <div className="space-y-3">
                {INITIAL_RUNBOOKS[0].steps.map((st) => (
                  <div key={st.number} className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{st.number}. {st.title}</span>
                      <span className="font-mono text-slate-500">{st.status}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{st.description}</p>
                    {st.command && (
                      <code className="block p-2 rounded bg-slate-900 dark:bg-black/50 text-[11px] font-mono text-indigo-300">
                        $ {st.command}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* POSTMORTEM TAB */}
        {currentTab === 'postmortem' && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Incident Postmortem Draft
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Auto-generated from telemetry milestones
                  </div>
                </div>

                <button
                  onClick={handleSavePostmortem}
                  disabled={postmortemSaved}
                  className="px-4 py-2 text-xs font-mono font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-500 hover:to-indigo-500 cursor-pointer"
                >
                  {postmortemSaved ? 'Saved to Hindsight ✓' : 'Save to Hindsight'}
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05]">
                  <strong className="text-slate-900 dark:text-white block mb-1">Root Cause:</strong>
                  {INITIAL_POSTMORTEM.rootCause}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05]">
                  <strong className="text-slate-900 dark:text-white block mb-1">Applied Resolution:</strong>
                  {INITIAL_POSTMORTEM.resolution}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {currentTab === 'notes' && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-4">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                Responder War-Room Notes
              </span>
              <div className="space-y-2">
                {notes.map((n, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-xs text-slate-800 dark:text-slate-300 font-mono">
                    {n}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add on-call observation..."
                  className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {currentTab === 'timeline' && (
          <div className="space-y-6 max-w-5xl">
            <InteractiveTimeline
              incident={incident}
              selectedMilestoneId={selectedMilestone}
              onSelectMilestone={(id) => setSelectedMilestone(id)}
              onNavigateTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
            />

            {/* Complete Autonomic Telemetry Chronology */}
            <div className="p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                    Complete Autonomic Telemetry Chronology
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Microsecond timeline of automated triggers, correlations, and runbook step executions.
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                  {INITIAL_POSTMORTEM.timeline.length} recorded events
                </span>
              </div>

              <div className="border-l-2 border-indigo-300 dark:border-indigo-500/30 pl-4 space-y-4 ml-2">
                {INITIAL_POSTMORTEM.timeline.map((item, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 ring-2 ring-white dark:ring-[#0A0D15]" />
                    <span className="font-mono text-indigo-700 dark:text-indigo-300 font-bold mr-2">{item.time}</span>
                    <span className="text-slate-700 dark:text-slate-300">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {currentTab === 'alerts' && (
          <div className="space-y-4 max-w-4xl">
            <div className="p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-3">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                Raw Telemetry Alerts
              </span>
              {incident.signals.map((sig) => (
                <div key={sig.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{sig.name}</span>
                    <div className="text-slate-500 dark:text-slate-400 font-mono mt-0.5">{sig.value}</div>
                  </div>
                  <span className="font-mono text-slate-400 dark:text-slate-500">{sig.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RELATED INCIDENTS TAB */}
        {currentTab === 'related' && (
          <div className="space-y-4 max-w-4xl">
            <div className="p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-4">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                Correlated Historical Outages
              </span>
              {memories.map((mem) => (
                <div key={mem.id} className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Incident #{mem.incidentNumber}</span>
                    <span className="text-purple-600 dark:text-purple-300 font-mono">{(mem.confidenceScore * 100).toFixed(0)}% affinity</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">{mem.title}</div>
                  <div className="text-slate-500 font-mono">Resolved in {mem.resolutionTimeMinutes} minutes</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
