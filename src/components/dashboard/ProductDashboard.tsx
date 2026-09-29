import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Filter, 
  Terminal, 
  BrainCircuit, 
  Database, 
  ExternalLink,
  Plus,
  BellRing,
  Sparkles,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ArrowUpDown,
  User,
  Server,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  LayoutList,
  LayoutGrid,
  Activity,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { INITIAL_INCIDENTS, INITIAL_STATS } from '../../data/mockData';
import { hindsightService } from '../../services/hindsight';
import { apiService, API_BASE_URL } from '../../services/api';
import { Incident, SystemIntelligenceStats } from '../../types';
import { useToast } from '../../context/ToastContext';

interface ProductDashboardProps {
  onSelectIncident: (incidentId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProductDashboard: React.FC<ProductDashboardProps> = ({ onSelectIncident }) => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [stats, setStats] = useState<SystemIntelligenceStats>(hindsightService.getStats());
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  
  // Filtering states
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Sorting states
  const [sortBy, setSortBy] = useState<'severity' | 'recency' | 'incidentNumber' | 'aiAffinity' | 'service'>('severity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // View density mode
  const [viewDensity, setViewDensity] = useState<'expanded' | 'compact'>('expanded');

  const { triggerP1Alert, soundEnabled, toggleSound } = useToast();
  const hasAutoTriggered = useRef(false);

  useEffect(() => {
    // 1. Fetch live system status & memory stats from backend
    const loadBackendData = async () => {
      try {
        const health = await apiService.getSystemStatus();
        setIsBackendConnected(health.online);
        setStats({
          totalMemories: health.totalMemories,
          learnedPatterns: health.learnedPatterns,
          successfulResolutions: health.successfulResolutions,
          avgMttrMinutes: 7.2,
          status: health.online ? 'Online' : 'Offline',
          bankId: health.bankId,
          isRealHindsight: true
        });

        // 2. Fetch incidents from backend
        const backendIncidents = await apiService.getIncidents();
        if (backendIncidents && backendIncidents.length > 0) {
          setIncidents(backendIncidents);
        }
      } catch (err) {
        setIsBackendConnected(false);
        setStats(prev => ({ ...prev, status: 'Offline' }));
      }
    };

    loadBackendData();

    const unsub = hindsightService.subscribe(() => {
      setStats(hindsightService.getStats());
      setIsBackendConnected(hindsightService.getStats().status !== 'Offline');
    });
    return () => unsub();
  }, []);

  // Subtle auto-demonstration on first visit to the dashboard
  useEffect(() => {
    if (!hasAutoTriggered.current) {
      hasAutoTriggered.current = true;
      const timer = setTimeout(() => {
        triggerP1Alert();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [triggerP1Alert]);

  const handleSimulateNewP1 = () => {
    const newIncidentNumber = 305 + Math.floor(Math.random() * 80);
    const newInc: Incident = {
      id: `inc-${newIncidentNumber}`,
      incidentNumber: newIncidentNumber,
      title: 'Database Latency & Pool Saturation — Payments API',
      severity: 'P1',
      status: 'Investigating',
      service: 'Payments API',
      assignee: 'SRE On-Call (Sarah Chen)',
      createdAt: 'Just now',
      summary: 'Sudden burst in checkout authorizations saturated connection pool to 98%. AI Investigator engaged.',
      signals: [
        {
          id: `sig-${Date.now()}-1`,
          name: 'P99 Latency Surge',
          type: 'metric',
          status: 'critical',
          value: '1,920ms (+4,400%)',
          timestamp: 'Just now',
          detail: 'Payment authorization timeout'
        },
        {
          id: `sig-${Date.now()}-2`,
          name: 'PgBouncer Pool Utilization',
          type: 'metric',
          status: 'critical',
          value: '98/100 connections',
          timestamp: 'Just now',
          detail: '342 pending connection requests'
        }
      ],
      likelyRootCause: 'Database connection pool exhaustion',
      confidence: 0.94,
      recommendedRunbookId: 'rb-db-pool',
      hindsightSimilarityScore: 0.94,
      matchedMemories: ['mem-184', 'mem-231']
    };

    setIncidents((prev) => [newInc, ...prev.filter((i) => i.id !== newInc.id)]);
    
    // As per user requirement: When a new incident comes in, search Hindsight using recall and update Memory page
    hindsightService.retrieveIncidentContext(newInc).then((ctx) => {
      if (ctx.matchedMemories.length > 0) {
        newInc.hindsightSimilarityScore = ctx.confidence;
        newInc.matchedMemories = ctx.matchedMemories.map(m => m.id);
      }
    }).catch(console.warn);

    triggerP1Alert({
      incidentId: newInc.id,
      incidentNumber: newInc.incidentNumber,
      title: newInc.title,
      service: newInc.service,
      summary: newInc.summary,
      similarityScore: 0.94,
      hindsightMatchesCount: 3,
      recommendedRunbook: 'DB-CONNECTION-POOL-RECOVERY'
    });
  };

  // Helper to extract short assignee name e.g. "Sarah Chen" from "SRE On-Call (Sarah Chen)"
  const getAssigneeDisplayName = (assignee: string) => {
    const match = assignee.match(/\(([^)]+)\)/);
    return match ? match[1] : assignee;
  };

  // Extract unique available values for dynamic dropdown options
  const uniqueServices = useMemo(() => {
    const services = Array.from(new Set(incidents.map((i) => i.service))).filter(Boolean);
    return services.sort();
  }, [incidents]);

  const uniqueAssignees = useMemo(() => {
    const assignees = Array.from(new Set(incidents.map((i) => i.assignee))).filter(Boolean);
    return assignees.sort();
  }, [incidents]);

  const uniqueStatuses = useMemo(() => {
    const statuses = Array.from(new Set(incidents.map((i) => i.status))).filter(Boolean);
    return statuses.sort();
  }, [incidents]);

  // Aggregate counts for quick badges
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { all: incidents.length, P1: 0, P2: 0, P3: 0 };
    incidents.forEach((inc) => {
      if (counts[inc.severity] !== undefined) {
        counts[inc.severity]++;
      }
    });
    return counts;
  }, [incidents]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((inc) => {
      counts[inc.status] = (counts[inc.status] || 0) + 1;
    });
    return counts;
  }, [incidents]);

  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((inc) => {
      counts[inc.service] = (counts[inc.service] || 0) + 1;
    });
    return counts;
  }, [incidents]);

  const assigneeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((inc) => {
      counts[inc.assignee] = (counts[inc.assignee] || 0) + 1;
    });
    return counts;
  }, [incidents]);

  // Filter & Sort Incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // 1. Severity filter (P1, P2, P3)
        if (filterSeverity !== 'all' && inc.severity !== filterSeverity) {
          return false;
        }
        // 2. Status filter
        if (filterStatus !== 'all' && inc.status.toLowerCase() !== filterStatus.toLowerCase()) {
          return false;
        }
        // 3. Service filter
        if (filterService !== 'all' && inc.service !== filterService) {
          return false;
        }
        // 4. Assignee filter
        if (filterAssignee !== 'all' && inc.assignee !== filterAssignee) {
          return false;
        }
        // 5. Search query (title, ID, service, assignee, summary, root cause)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = inc.title.toLowerCase().includes(q);
          const matchesService = inc.service.toLowerCase().includes(q);
          const matchesId = `#${inc.incidentNumber}`.toLowerCase().includes(q) || `${inc.incidentNumber}`.includes(q);
          const matchesAssignee = inc.assignee?.toLowerCase().includes(q);
          const matchesSummary = inc.summary?.toLowerCase().includes(q);
          const matchesRootCause = inc.likelyRootCause?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesService && !matchesId && !matchesAssignee && !matchesSummary && !matchesRootCause) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'severity') {
          const severityRank: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
          const rankA = severityRank[a.severity] ?? 99;
          const rankB = severityRank[b.severity] ?? 99;
          // In 'desc', P1 comes first (rank 1 < rank 2)
          comparison = sortDirection === 'desc' ? rankA - rankB : rankB - rankA;
        } else if (sortBy === 'recency' || sortBy === 'incidentNumber') {
          comparison = sortDirection === 'desc' 
            ? b.incidentNumber - a.incidentNumber 
            : a.incidentNumber - b.incidentNumber;
        } else if (sortBy === 'aiAffinity') {
          const scoreA = a.hindsightSimilarityScore ?? 0;
          const scoreB = b.hindsightSimilarityScore ?? 0;
          comparison = sortDirection === 'desc'
            ? scoreB - scoreA
            : scoreA - scoreB;
        } else if (sortBy === 'service') {
          comparison = sortDirection === 'desc'
            ? b.service.localeCompare(a.service)
            : a.service.localeCompare(b.service);
        }
        return comparison;
      });
  }, [incidents, filterSeverity, filterStatus, filterService, filterAssignee, searchQuery, sortBy, sortDirection]);

  // Count active filters
  const activeFiltersCount = 
    (filterSeverity !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (filterService !== 'all' ? 1 : 0) +
    (filterAssignee !== 'all' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const resetAllFilters = () => {
    setFilterSeverity('all');
    setFilterStatus('all');
    setFilterService('all');
    setFilterAssignee('all');
    setSearchQuery('');
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto bg-[var(--bg-app)]">
      {/* Top Header & Cluster Meta */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.07]">
        <div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cluster: us-east-prod / SRE Operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Incident Command Overview
          </h1>
        </div>

        {/* Action Controls & AI Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Audio Cue Toggle */}
          <button
            onClick={toggleSound}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 shadow-xs'
                : 'bg-slate-100 dark:bg-white/[0.02] text-slate-500 border-slate-200 dark:border-white/[0.07] hover:text-slate-700 dark:hover:text-slate-400'
            }`}
            title={soundEnabled ? 'P1 Audio Alerts: ACTIVE (click to mute)' : 'P1 Audio Alerts: MUTED (click to enable)'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Audio Cue: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Audio Cue: MUTED</span>
              </>
            )}
          </button>

          {/* Simulate P1 Incident Button */}
          <button
            onClick={handleSimulateNewP1}
            className="group relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-300 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500/50 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
            title="Simulate incoming P1 incident to test real-time toast alert & audio cue"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <BellRing className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 group-hover:rotate-12 transition-transform" />
            <span>Simulate P1 Incident</span>
          </button>

          {/* Compact AI Status Area */}
          <div className="flex items-center gap-4 bg-slate-100/90 dark:bg-[#090C12] border border-slate-200 dark:border-white/[0.08] px-4 py-2 rounded-lg text-xs font-mono shadow-xs">
            <div className="flex items-center gap-2 pr-3 border-r border-slate-300 dark:border-white/10">
              <span className={`w-2 h-2 rounded-full ${stats.status === 'Offline' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-slate-900 dark:text-slate-300 font-semibold">AI INVESTIGATOR</span>
              <span className={`font-medium ${stats.status === 'Offline' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {stats.status === 'Offline' ? 'Offline' : 'Online'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
              <div>
                <span>Memory: </span>
                <strong className="text-slate-900 dark:text-white font-bold">{stats.totalMemories.toLocaleString()}</strong>
              </div>
              <div>
                <span>Patterns: </span>
                <strong className="text-purple-700 dark:text-purple-300 font-bold">{stats.learnedPatterns}</strong>
              </div>
              <div>
                <span>Resolved: </span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{statusCounts['Resolved'] || stats.successfulResolutions}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERING AND SORTING TOOLBAR */}
      <div className="bg-white dark:bg-[#0A0D15] rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-sm dark:shadow-xl space-y-4">
        {/* Row 1: Search bar, Severity quick pills, and View Mode Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, service, assignee, #ID, or root cause..."
              className="w-full bg-slate-50 dark:bg-[#090C12] border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 shadow-xs transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Severity Quick Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#090C12] border border-slate-200 dark:border-white/[0.07] rounded-lg shrink-0 overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 uppercase px-2 py-0.5 select-none font-semibold">
              Severity:
            </span>
            {(['all', 'P1', 'P2', 'P3'] as const).map((sev) => {
              const isActive = filterSeverity === sev;
              const count = severityCounts[sev] || 0;
              return (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded cursor-pointer transition-all ${
                    isActive
                      ? sev === 'P1'
                        ? 'bg-rose-600 text-white font-bold shadow-xs'
                        : sev === 'P2'
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : sev === 'P3'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {sev !== 'all' && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${
                        sev === 'P1' ? 'bg-rose-400' : sev === 'P2' ? 'bg-amber-400' : 'bg-blue-400'
                      }`}
                    />
                  )}
                  <span>{sev.toUpperCase()}</span>
                  <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-black/20 text-white' : 'text-slate-600 dark:text-slate-300 font-semibold'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Density Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#090C12] border border-slate-200 dark:border-white/[0.07] rounded-lg shrink-0">
            <button
              onClick={() => setViewDensity('expanded')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewDensity === 'expanded'
                  ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              title="Expanded view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewDensity('compact')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewDensity === 'compact'
                  ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              title="Compact view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Deep Dropdown Filters & Sorting Toolbar */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Status */}
            <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-[#090C12] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 shadow-xs">
              <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label htmlFor="filter-status" className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Status:
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                  All Statuses ({incidents.length})
                </option>
                {uniqueStatuses.map((st) => (
                  <option key={st} value={st} className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                    {st} ({statusCounts[st] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Service */}
            <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-[#090C12] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 shadow-xs">
              <Server className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label htmlFor="filter-service" className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Service:
              </label>
              <select
                id="filter-service"
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer pr-1 max-w-[150px] truncate"
              >
                <option value="all" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                  All Services ({incidents.length})
                </option>
                {uniqueServices.map((svc) => (
                  <option key={svc} value={svc} className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                    {svc} ({serviceCounts[svc] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Assignee */}
            <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-[#090C12] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 shadow-xs">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label htmlFor="filter-assignee" className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Assignee:
              </label>
              <select
                id="filter-assignee"
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer pr-1 max-w-[160px] truncate"
              >
                <option value="all" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                  All Assignees ({incidents.length})
                </option>
                {uniqueAssignees.map((asg) => (
                  <option key={asg} value={asg} className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                    {getAssigneeDisplayName(asg)} ({assigneeCounts[asg] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset All Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-lg transition-colors cursor-pointer"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3 h-3 text-indigo-500" />
                <span>Reset Filters ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          {/* Sorting Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-[#090C12] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label htmlFor="sort-by" className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Sort:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="severity" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                  Severity (P1 → P3)
                </option>
                <option value="recency" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                  Time / Most Recent
                </option>
                <option value="aiAffinity" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                  Hindsight AI Match %
                </option>
                <option value="service" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                  Service Name
                </option>
                <option value="incidentNumber" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">
                  Incident # ID
                </option>
              </select>
            </div>

            {/* Sort Direction Toggle Button */}
            <button
              onClick={toggleSortDirection}
              className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-50 dark:bg-[#090C12] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xs cursor-pointer transition-colors"
              title={sortDirection === 'desc' ? 'Current: Descending (click for Ascending)' : 'Current: Ascending (click for Descending)'}
            >
              <span className="text-[11px] font-mono font-semibold uppercase">
                {sortDirection === 'desc' ? '↓ DESC' : '↑ ASC'}
              </span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips Pill Bar (visible when any filter is active) */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-semibold">Active filters:</span>
            
            {filterSeverity !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
                <span>Severity: {filterSeverity}</span>
                <button
                  onClick={() => setFilterSeverity('all')}
                  className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterStatus !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
                <span>Status: {filterStatus}</span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterService !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
                <span>Service: {filterService}</span>
                <button
                  onClick={() => setFilterService('all')}
                  className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterAssignee !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
                <span>Assignee: {getAssigneeDisplayName(filterAssignee)}</span>
                <button
                  onClick={() => setFilterAssignee('all')}
                  className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
                <span>Query: "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={resetAllFilters}
              className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline ml-1 cursor-pointer font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ACTIVE INCIDENTS Section Header & Counts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold">
              ACTIVE INCIDENTS
            </span>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
              Showing {filteredIncidents.length} of {incidents.length}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Hindsight vector affinity enabled · Auto-correlating telemetry
          </span>
        </div>

        {/* Empty State when no incidents match */}
        {filteredIncidents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-white/50 dark:bg-[#0A0D15]/50 p-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-400 dark:text-slate-500">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                No incidents match your filter criteria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                No active incidents matched the selected severity, status, service, or assignee filters.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
              <button
                onClick={handleSimulateNewP1}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 text-rose-500" />
                <span>Simulate Incident</span>
              </button>
            </div>
          </div>
        ) : (
          /* Incidents Table / Cards */
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0D15] overflow-hidden divide-y divide-slate-200 dark:divide-white/[0.06] shadow-sm dark:shadow-xl">
            {filteredIncidents.map((incident) => {
              const isP1 = incident.severity === 'P1';
              const isP2 = incident.severity === 'P2';
              const isP3 = incident.severity === 'P3';

              return (
                <div
                  key={incident.id}
                  onClick={() => onSelectIncident(incident.id)}
                  className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                    viewDensity === 'compact' ? 'p-3.5' : 'p-5'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    {/* Meta row: Severity badge, #ID, Service, Assignee, CreatedAt, Status */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Severity pill */}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterSeverity(incident.severity);
                        }}
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] cursor-pointer hover:opacity-80 transition-opacity ${
                          isP1
                            ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                            : isP2
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                            : 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30'
                        }`}
                        title={`Filter by ${incident.severity}`}
                      >
                        {incident.severity}
                      </span>

                      {/* Incident ID */}
                      <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">
                        #{incident.incidentNumber}
                      </span>
                      <span className="text-slate-300 dark:text-white/20">·</span>

                      {/* Service */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterService(incident.service);
                        }}
                        className="inline-flex items-center gap-1 font-medium text-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        title={`Filter by service: ${incident.service}`}
                      >
                        <Server className="w-3 h-3 text-slate-400" />
                        <span>{incident.service}</span>
                      </button>
                      <span className="text-slate-300 dark:text-white/20">·</span>

                      {/* Assignee */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterAssignee(incident.assignee);
                        }}
                        className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 transition-colors cursor-pointer"
                        title={`Filter by assignee: ${incident.assignee}`}
                      >
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{getAssigneeDisplayName(incident.assignee)}</span>
                      </button>
                      <span className="text-slate-300 dark:text-white/20">·</span>

                      {/* Timestamp */}
                      <span className="text-slate-500 dark:text-slate-400 font-mono inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{incident.createdAt}</span>
                      </span>

                      {/* Status badge */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterStatus(incident.status);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono ml-auto md:ml-0 font-medium cursor-pointer hover:opacity-85 transition-opacity ${
                          incident.status === 'Investigating'
                            ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/20'
                            : incident.status === 'Monitoring'
                            ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/20'
                            : incident.status === 'Resolving'
                            ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        }`}
                        title={`Filter by status: ${incident.status}`}
                      >
                        {incident.status}
                      </button>
                    </div>

                    {/* Incident Title */}
                    <h3 className={`font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors ${
                      viewDensity === 'compact' ? 'text-sm' : 'text-base'
                    }`}>
                      {incident.title}
                    </h3>

                    {/* Summary (hidden in compact mode or limited) */}
                    {viewDensity === 'expanded' && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        {incident.summary}
                      </p>
                    )}
                  </div>

                  {/* Right Area: Hindsight correlation & Action */}
                  <div className="flex items-center gap-4 shrink-0">
                    {incident.hindsightSimilarityScore && (
                      <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400 font-semibold flex items-center gap-1">
                          <BrainCircuit className="w-3 h-3" />
                          <span>HINDSIGHT RECALL</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {(incident.hindsightSimilarityScore * 100).toFixed(0)}% Similar
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {incident.matchedMemories?.length || 1} past match
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      <span className="hidden sm:inline">Inspect</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Intelligence summary footer callout */}
      <div className="p-4 rounded-xl bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Hindsight Continuous Learning:</strong> Every incident resolution is retained directly in Hindsight memory bank "{stats.bankId || 'Incident'}". Recalled in real-time on incoming alerts.
          </span>
        </div>
        <button
          onClick={() => onSelectIncident('inc-304')}
          className="text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white font-mono shrink-0 underline cursor-pointer font-medium"
        >
          View live triage on #304 →
        </button>
      </div>
    </div>
  );
};
