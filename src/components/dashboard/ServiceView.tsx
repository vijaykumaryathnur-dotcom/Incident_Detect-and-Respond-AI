import React from 'react';
import { 
  Server, 
  ArrowDown, 
  Activity, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Database, 
  Terminal,
  ArrowRight
} from 'lucide-react';
import { INITIAL_SERVICES, INITIAL_MEMORIES } from '../../data/mockData';

interface ServiceViewProps {
  onSelectIncident: (id: string) => void;
}

export const ServiceView: React.FC<ServiceViewProps> = ({ onSelectIncident }) => {
  const service = INITIAL_SERVICES[0]; // Payments API
  const relatedMemories = INITIAL_MEMORIES.filter((m) => m.service === service.name);

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto bg-[var(--bg-app)]">
      {/* Service Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-500 mb-1">
            Service Catalog / Core Microservices
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {service.name.toUpperCase()}
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {service.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div>
            <span>Active Incidents: </span>
            <strong className="text-rose-600 dark:text-rose-400">{service.activeIncidentsCount}</strong>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
          <div>
            <span>On-Call: </span>
            <strong className="text-slate-800 dark:text-slate-200">{service.onCall}</strong>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0A0D15] border border-slate-200/80 dark:border-white/[0.07] shadow-sm">
          <div className="text-[11px] font-mono text-slate-500">UPTIME (30D)</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">{service.uptimePercent}</div>
          <div className="text-[10px] text-slate-500 mt-1">Within SLO budget</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0A0D15] border border-slate-200/80 dark:border-white/[0.07] shadow-sm">
          <div className="text-[11px] font-mono text-slate-500">P99 LATENCY</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">{service.p99Latency}</div>
          <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1">Exceeded threshold</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0A0D15] border border-slate-200/80 dark:border-white/[0.07] shadow-sm">
          <div className="text-[11px] font-mono text-slate-500">ERROR RATE</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">{service.errorRate}</div>
          <div className="text-[10px] text-slate-500 mt-1">Gateway timeout spike</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0A0D15] border border-slate-200/80 dark:border-white/[0.07] shadow-sm">
          <div className="text-[11px] font-mono text-slate-500">HISTORICAL MEMORIES</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-300 font-mono mt-1">{service.historicalIncidentCount}</div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">Indexed in Hindsight</div>
        </div>
      </div>

      {/* Dependency Graph & Historical Memory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dependency Chain (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.08]">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Service Dependencies
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Causal graph</span>
          </div>

          {/* Vertical Dependency Chain as requested */}
          <div className="space-y-2 py-2">
            <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold text-indigo-950 dark:text-white flex items-center justify-between">
              <span>Payment API (Primary)</span>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">Degraded</span>
            </div>

            <div className="flex justify-center text-slate-400 dark:text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="p-3.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center justify-between">
              <span>Database (PostgreSQL / PgBouncer)</span>
              <span className="font-mono text-[10px] text-rose-600 dark:text-rose-400">Pool Bottleneck</span>
            </div>

            <div className="flex justify-center text-slate-400 dark:text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs font-medium text-slate-800 dark:text-slate-300 flex items-center justify-between">
              <span>Authentication Service</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">Nominal</span>
            </div>

            <div className="flex justify-center text-slate-400 dark:text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs font-medium text-slate-800 dark:text-slate-300 flex items-center justify-between">
              <span>Payment Gateway (Stripe/Adyen)</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">Nominal</span>
            </div>
          </div>
        </div>

        {/* Right Column: Service Hindsight Memory (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0A0D15] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-purple-700 dark:text-purple-300 font-semibold">
                Historical Memory for Payments API
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">3 Verified Heuristics</span>
          </div>

          <div className="space-y-3">
            {relatedMemories.map((mem) => (
              <div key={mem.id} className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-300">
                    INCIDENT #{mem.incidentNumber}
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    Resolved in {mem.resolutionTimeMinutes}m
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {mem.title}
                </div>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-300">Learned Rule: </strong>
                  {mem.learnedPattern}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Active incident underway on this service:
            </span>
            <button
              onClick={() => onSelectIncident('inc-304')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Jump to Incident #304</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
