import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  BrainCircuit, 
  Sliders, 
  FileText,
  RotateCcw,
  ShieldCheck,
  Plus,
  Send,
  Check,
  Tag,
  Layers,
  Activity,
  Server,
  Download,
  Loader2,
  AlertTriangle,
  X
} from 'lucide-react';
import { hindsightService } from '../../services/hindsight';
import { HindsightMemory, SystemIntelligenceStats } from '../../types';
import { DEMO_INCIDENTS, DemoIncidentItem } from '../../data/demoIncidents';

export const HindsightMemorySection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [memories, setMemories] = useState<HindsightMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<HindsightMemory | null>(null);
  const [stats, setStats] = useState<SystemIntelligenceStats>(hindsightService.getStats());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Retain Form state
  const [isRetainFormOpen, setIsRetainFormOpen] = useState<boolean>(false);
  const [retainTitle, setRetainTitle] = useState<string>('');
  const [retainService, setRetainService] = useState<string>('Payments API');
  const [retainResolution, setRetainResolution] = useState<string>('');
  const [retainLesson, setRetainLesson] = useState<string>('');
  const [retainStatus, setRetainStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [retainMessage, setRetainMessage] = useState<string>('');

  // Demo Data Loader state
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [demoProgress, setDemoProgress] = useState<{
    loaded: number;
    failed: number;
    total: number;
    currentIncident?: DemoIncidentItem;
    statusText: string;
    isComplete?: boolean;
    allAlreadyLoaded?: boolean;
    errorMessage?: string;
    errors?: Array<{ incidentNumber: number; service: string; error: string }>;
  } | null>(null);
  const [loadedDemoIncidents, setLoadedDemoIncidents] = useState<Set<number>>(new Set());

  const fetchMemories = async (query = searchQuery) => {
    setIsLoading(true);
    try {
      const results = await hindsightService.searchMemories({
        query,
        limit: 8
      });
      setMemories(results);
      if (results.length > 0) {
        setSelectedMemory(results[0]);
      }
      setStats(hindsightService.getStats());
    } catch (err) {
      console.warn('Memory search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();

    hindsightService.getLoadedDemoIncidentNumbers().then((nums) => {
      setLoadedDemoIncidents(nums);
    });

    const unsubscribe = hindsightService.subscribe(() => {
      setStats(hindsightService.getStats());
      const current = hindsightService.getAllMemories();
      if (current.length > 0) {
        setMemories(current);
        if (!selectedMemory) {
          setSelectedMemory(current[0]);
        }
      }
      hindsightService.getLoadedDemoIncidentNumbers().then(setLoadedDemoIncidents);
    });
    return () => unsubscribe();
  }, []);

  const handleLoadDemoData = async () => {
    if (isDemoLoading) return;

    // Check existing loaded
    const existing = await hindsightService.getLoadedDemoIncidentNumbers();
    setLoadedDemoIncidents(existing);

    const unloadded = DEMO_INCIDENTS.filter(item => !existing.has(item.incidentNumber));
    if (unloadded.length === 0) {
      setDemoProgress({
        loaded: DEMO_INCIDENTS.length,
        failed: 0,
        total: DEMO_INCIDENTS.length,
        statusText: `Loaded ${DEMO_INCIDENTS.length} of ${DEMO_INCIDENTS.length}, failed 0`,
        isComplete: true,
        allAlreadyLoaded: true,
        errors: [],
      });
      return;
    }

    setIsDemoLoading(true);
    const initialLoadedCount = DEMO_INCIDENTS.length - unloadded.length;
    setDemoProgress({
      loaded: initialLoadedCount,
      failed: 0,
      total: DEMO_INCIDENTS.length,
      statusText: `Loaded ${initialLoadedCount} of ${DEMO_INCIDENTS.length}, failed 0. Retaining remaining demo incidents one at a time with 1s delay...`,
      errors: [],
    });

    try {
      const result = await hindsightService.loadDemoIncidents({
        onProgress: (loaded, total, currentInc, errorMsg, inProgress) => {
          setDemoProgress(prev => {
            const currentFailed = errorMsg ? (prev?.failed || 0) + 1 : (prev?.failed || 0);
            const currentErrors = errorMsg 
              ? [...(prev?.errors || []), { incidentNumber: currentInc.incidentNumber, service: currentInc.service, error: errorMsg }]
              : (prev?.errors || []);

            let statusText = '';
            if (inProgress) {
              statusText = `Retaining Incident #${currentInc.incidentNumber} [${currentInc.service}]... (Loaded ${loaded} of ${total})`;
            } else if (errorMsg) {
              statusText = `Incident #${currentInc.incidentNumber} [${currentInc.service}] failed: ${errorMsg}. Continuing with remaining incidents...`;
            } else {
              statusText = `Loaded ${loaded} of ${total}: Incident #${currentInc.incidentNumber} [${currentInc.service}] retained!`;
            }

            return {
              loaded,
              failed: currentFailed,
              total,
              currentIncident: currentInc,
              statusText,
              errorMessage: errorMsg || prev?.errorMessage,
              errors: currentErrors,
            };
          });
        },
        onError: (incident, errorMsg) => {
          console.warn(`[DemoLoader] Incident #${incident.incidentNumber} error:`, errorMsg);
        }
      });

      // Update state and refresh
      const updatedExisting = await hindsightService.getLoadedDemoIncidentNumbers();
      setLoadedDemoIncidents(updatedExisting);
      await fetchMemories();

      const finalStatus = `Loaded ${result.loadedCount} of ${result.total}, failed ${result.failedCount}`;
      setDemoProgress({
        loaded: result.loadedCount,
        failed: result.failedCount,
        total: result.total,
        statusText: finalStatus,
        isComplete: true,
        errors: result.errors,
      });
    } catch (err: any) {
      console.error('Demo load error:', err);
      setDemoProgress(prev => {
        const finalFailed = (prev?.failed || 0) + 1;
        return {
          loaded: prev?.loaded || 0,
          failed: finalFailed,
          total: DEMO_INCIDENTS.length,
          statusText: `Loaded ${prev?.loaded || 0} of ${DEMO_INCIDENTS.length}, failed ${finalFailed}: ${err?.message || 'Error communicating with Hindsight'}`,
          errorMessage: err?.message,
          isComplete: true,
          errors: prev?.errors || [],
        };
      });
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMemories(searchQuery);
  };

  const handleRetainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retainTitle.trim() || !retainResolution.trim()) return;

    setRetainStatus('saving');
    try {
      const incNum = 310 + Math.floor(Math.random() * 50);
      await hindsightService.retainIncident({
        id: `inc-${incNum}`,
        incidentNumber: incNum,
        title: retainTitle,
        severity: 'P1',
        status: 'Resolved',
        service: retainService,
        assignee: 'SRE Responder',
        createdAt: 'Just now',
        summary: retainResolution,
        signals: []
      }, {
        resolution: retainResolution,
        lessonsLearned: retainLesson || 'Always tune limits before performing restarts.'
      });

      setRetainStatus('saved');
      setRetainMessage(`Retained to Hindsight bank "${stats.bankId || 'Incident'}"!`);
      setRetainTitle('');
      setRetainResolution('');
      setRetainLesson('');

      setTimeout(() => {
        setRetainStatus('idle');
        setIsRetainFormOpen(false);
      }, 2500);

      // Refresh memories
      fetchMemories();
    } catch (err: any) {
      setRetainStatus('error');
      setRetainMessage(err?.message || 'Failed to retain memory');
      setTimeout(() => setRetainStatus('idle'), 4000);
    }
  };

  const flowNodes = [
    { label: 'Incoming Incident', sub: 'P1 Database Latency Surge', type: 'incident' },
    { label: 'Hindsight Memory Bank', sub: 'Semantic Recall (Bank: Incident)', type: 'hindsight' },
    { label: 'Correlated Precedents', sub: 'Targeted Outage Embeddings', type: 'related' },
    { label: 'Extracted Facts', sub: 'PgBouncer Pool Exhaustion', type: 'cause' },
    { label: 'Verified Resolution', sub: 'Dynamic Pool Scaling', type: 'resolution' },
    { label: 'Active Playbook', sub: 'DB-CONNECTION-POOL-RECOVERY', type: 'output' },
  ];

  const quickPills = [
    'checkout-api Redis cache',
    'payments-api PgBouncer pool',
    'auth-service JWT signing key',
    'search-api memory leak LRU',
    'notification-service Kafka consumer lag',
    'orders-db PostgreSQL missing index',
    'api-gateway rate limit config',
    'inventory-service row-level locking'
  ];

  return (
    <section id="hindsight-memory" className="py-12 lg:py-16 border-t border-slate-200 dark:border-white/[0.06] relative">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-500/5 dark:bg-purple-900/10 blur-[140px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Real Connection Status Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">
              <Database className="w-3.5 h-3.5" />
              <span>Real Hindsight Memory Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
              Persistent Institutional Memory
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
              Connected directly to Hindsight memory bank <strong className="text-purple-700 dark:text-purple-300 font-mono">"{stats.bankId || 'Incident'}"</strong>.
              Every resolved incident is retained with vector & temporal embeddings, and recalled automatically during live triage.
            </p>
          </div>

          {/* Real Status Indicator & Retain Action */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-xs font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                Bank: {stats.bankId || 'Incident'}
              </span>
              <span className="text-slate-400 dark:text-slate-500">·</span>
              <span className="text-purple-700 dark:text-purple-300 font-bold">
                {stats.totalMemories} {stats.totalMemories === 1 ? 'memory' : 'memories'}
              </span>
            </div>

            {/* Load Demo Data Button */}
            <button
              onClick={handleLoadDemoData}
              disabled={isDemoLoading}
              title={loadedDemoIncidents.size >= DEMO_INCIDENTS.length ? 'All 12 demo incidents already loaded into Hindsight' : 'Load 12 canonical SRE incidents into Hindsight'}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-purple-700 dark:text-purple-200 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 border border-purple-300 dark:border-purple-500/40 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isDemoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600 dark:text-purple-300" />
              ) : (
                <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
              )}
              <span>
                {isDemoLoading
                  ? `Loading ${demoProgress?.loaded || 0} of ${demoProgress?.total || DEMO_INCIDENTS.length}`
                  : loadedDemoIncidents.size >= DEMO_INCIDENTS.length
                  ? `Demo Data Loaded (12/12)`
                  : loadedDemoIncidents.size > 0
                  ? `Load Demo Data (${loadedDemoIncidents.size}/12)`
                  : 'Load Demo Data'}
              </span>
            </button>

            <button
              onClick={() => setIsRetainFormOpen(!isRetainFormOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Retain to Hindsight</span>
            </button>
          </div>
        </div>

        {/* Live Progress Banner for Demo Loading */}
        <AnimatePresence>
          {demoProgress && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 p-4 rounded-xl border border-purple-300 dark:border-purple-500/40 bg-purple-50/90 dark:bg-purple-950/30 shadow-md backdrop-blur-xs flex flex-col gap-3 text-xs font-mono"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isDemoLoading ? (
                      <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
                    ) : demoProgress.failed > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : demoProgress.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {demoProgress.isComplete 
                        ? `Loaded ${demoProgress.loaded} of ${demoProgress.total}, failed ${demoProgress.failed}`
                        : `Retaining Demo Incidents (${demoProgress.loaded} of ${demoProgress.total})`}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-[11px] font-bold">
                      Loaded {demoProgress.loaded} of {demoProgress.total}
                    </span>
                    {demoProgress.failed > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-[11px] font-bold">
                        Failed: {demoProgress.failed}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300">
                    {demoProgress.statusText}
                  </div>
                </div>

                {/* Visual Progress Bar & Dismiss Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-full sm:w-56 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span>{Math.round((demoProgress.loaded / demoProgress.total) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${demoProgress.failed > 0 ? 'bg-amber-500' : 'bg-purple-600 dark:bg-purple-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(demoProgress.loaded / demoProgress.total) * 100}%` }}
                        transition={{ ease: 'easeOut', duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setDemoProgress(null)}
                    title="Dismiss"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Exact Error Message Details if any incident failed */}
              {demoProgress.errors && demoProgress.errors.length > 0 && (
                <div className="mt-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] space-y-1">
                  <div className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Failed Incident Details:</span>
                  </div>
                  {demoProgress.errors.map((errItem, idx) => (
                    <div key={idx} className="text-rose-700 dark:text-rose-300/90 pl-5">
                      • Incident #{errItem.incidentNumber} [{errItem.service}]: <code className="bg-rose-100 dark:bg-rose-900/60 px-1 py-0.5 rounded">{errItem.error}</code>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible Retain Memory Drawer Form */}
        <AnimatePresence>
          {isRetainFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-6"
            >
              <div className="p-6 rounded-xl border border-purple-300 dark:border-purple-500/40 bg-purple-50/70 dark:bg-purple-950/20 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-200 dark:border-purple-500/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Retain Incident Resolution into Hindsight Bank "{stats.bankId || 'Incident'}"
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
                    Operation: retain()
                  </span>
                </div>

                <form onSubmit={handleRetainSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        Incident Title / Root Cause:
                      </label>
                      <input
                        type="text"
                        required
                        value={retainTitle}
                        onChange={(e) => setRetainTitle(e.target.value)}
                        placeholder="e.g. Database connection pool exhaustion during peak checkout"
                        className="w-full bg-white dark:bg-[#090C12] border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        Affected Service:
                      </label>
                      <select
                        value={retainService}
                        onChange={(e) => setRetainService(e.target.value)}
                        className="w-full bg-white dark:bg-[#090C12] border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Payments API">Payments API</option>
                        <option value="Auth Service">Auth Service</option>
                        <option value="Billing Engine">Billing Engine</option>
                        <option value="API Gateway">API Gateway</option>
                        <option value="Search Cluster">Search Cluster</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Verified Resolution & Mitigation Action:
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={retainResolution}
                      onChange={(e) => setRetainResolution(e.target.value)}
                      placeholder="e.g. Increased PgBouncer default_pool_size from 100 to 250 and set idle_transaction_timeout to 5s."
                      className="w-full bg-white dark:bg-[#090C12] border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Learned Institutional Heuristic (What worked / what to avoid):
                    </label>
                    <input
                      type="text"
                      value={retainLesson}
                      onChange={(e) => setRetainLesson(e.target.value)}
                      placeholder="e.g. Do not restart pods during transaction bursts; tune proxy pool capacity instead."
                      className="w-full bg-white dark:bg-[#090C12] border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      Extracts entities, temporal scopes, and graph edges automatically.
                    </span>

                    <div className="flex items-center gap-3">
                      {retainStatus === 'saving' && (
                        <span className="text-xs font-mono text-purple-600 dark:text-purple-400 animate-pulse">
                          Retaining to Hindsight...
                        </span>
                      )}
                      {retainStatus === 'saved' && (
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{retainMessage}</span>
                        </span>
                      )}
                      {retainStatus === 'error' && (
                        <span className="text-xs font-mono text-rose-600 dark:text-rose-400">
                          {retainMessage}
                        </span>
                      )}

                      <button
                        type="submit"
                        disabled={retainStatus === 'saving'}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Commit Memory</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visual Memory Graph Flow: Current Incident → Hindsight Memory → Related Incidents → Root Causes → Successful Resolutions → Active Playbook */}
        <div className="mt-8 p-6 sm:p-8 rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/40 dark:bg-[#0A0D16]/90 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <div className="text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400 font-semibold mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Hindsight Cognitive Recall Pipeline
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Bank ID: {stats.bankId || 'Incident'}
            </span>
          </div>

          {/* Flow Line with Connected Nodes */}
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

        {/* Real Hindsight Interactive Memory Explorer */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Memory Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search Input & Quick Query Pills */}
            <div className="space-y-2">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Hindsight with recall() (e.g. 'connection pool', 'timeout', 'jwt key')..."
                    className="w-full bg-white dark:bg-[#0B0E17] border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500/50 shadow-xs transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        fetchMemories('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-medium shadow-xs cursor-pointer transition-colors"
                >
                  {isLoading ? 'Recalling...' : 'Recall'}
                </button>
              </form>

              {/* Quick Query Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Queries:</span>
                {quickPills.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => {
                      setSearchQuery(pill);
                      fetchMemories(pill);
                    }}
                    className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 hover:bg-purple-100 dark:bg-white/[0.04] dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-300 border border-slate-200 dark:border-white/5 transition-colors cursor-pointer"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Recalled Memory Cards List */}
            <div className="space-y-3">
              {memories.map((mem) => {
                const isSelected = selectedMemory?.id === mem.id;
                const scoreDisplay = mem.scores?.final 
                  ? `${Math.round(mem.scores.final * 100)}% Match` 
                  : `${Math.round(mem.confidenceScore * 100)}% Match`;

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
                        {mem.factType && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                            {mem.factType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                          {scoreDisplay}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 leading-snug">
                      {mem.title}
                    </h3>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Resolution: </strong>
                        <span className="text-indigo-700 dark:text-indigo-300 font-mono font-medium">{mem.resolution}</span>
                      </div>
                    </div>

                    {/* Entities tags extracted by Hindsight */}
                    {mem.entities && mem.entities.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">Entities:</span>
                        {mem.entities.map((ent, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                          >
                            {ent}
                          </span>
                        ))}
                      </div>
                    )}

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

              {memories.length === 0 && !isLoading && (
                <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <Database className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2 opacity-50" />
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">No memories matched query</div>
                  <div className="text-xs text-slate-500 mt-1">Try querying "connection pool", "database", or retain a new memory above.</div>
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
                    Hindsight Memory Inspection
                  </span>
                </div>
                {selectedMemory && (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {selectedMemory.scores?.final 
                      ? `${Math.round(selectedMemory.scores.final * 100)}% Match` 
                      : `${Math.round(selectedMemory.confidenceScore * 100)}% Match`}
                  </span>
                )}
              </div>

              {selectedMemory ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                      Active Correlated Memory
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

                  {/* Fact Metadata */}
                  <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Memory Bank:</span>
                      <strong className="text-purple-700 dark:text-purple-300 font-mono">{stats.bankId || 'Incident'}</strong>
                    </div>
                    {selectedMemory.rawFactId && (
                      <div className="flex justify-between">
                        <span>Fact ID:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono truncate max-w-[180px]">
                          {selectedMemory.rawFactId}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Indexed Tags:</span>
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
                  Select a memory on the left to inspect its extracted entities and mitigation strategy.
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
