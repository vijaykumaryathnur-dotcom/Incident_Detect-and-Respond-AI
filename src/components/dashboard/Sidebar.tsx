import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Server, 
  BrainCircuit, 
  Database, 
  Terminal, 
  FileText, 
  ArrowLeft,
  Cpu,
  Layers
} from 'lucide-react';
import { ThemeToggle } from '../layout/ThemeToggle';

export type DashboardTab = 
  | 'overview' 
  | 'incidents' 
  | 'services' 
  | 'investigator' 
  | 'memory' 
  | 'runbooks' 
  | 'postmortems';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onBackToLanding: () => void;
  activeIncidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onBackToLanding,
  activeIncidentsCount = 3
}) => {
  const navItems: { id: DashboardTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle, count: activeIncidentsCount },
    { id: 'services', label: 'Services', icon: Server },
    { id: 'investigator', label: 'AI Investigator', icon: BrainCircuit },
    { id: 'memory', label: 'Memory (Hindsight)', icon: Database },
    { id: 'runbooks', label: 'Runbooks', icon: Terminal },
    { id: 'postmortems', label: 'Postmortems', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-50 dark:bg-[#090B10] border-r border-slate-200 dark:border-white/[0.07] flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors">
      <div className="p-4 space-y-6">
        {/* Brand Lockup & Theme Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold tracking-wider text-slate-900 dark:text-slate-100 uppercase font-mono">
              DRSTI
            </span>
          </div>

          <ThemeToggle />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isMemory = item.id === 'memory';

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-900 dark:text-white border border-indigo-200 dark:border-indigo-500/30 shadow-xs'
                    : isMemory
                    ? 'text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/[0.04]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isMemory ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-800 dark:text-indigo-200 font-bold' : 'bg-slate-200 dark:bg-white/[0.06] text-slate-700 dark:text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: AI Status & Back button */}
      <div className="p-4 border-t border-slate-200 dark:border-white/[0.07] space-y-3">
        {/* Compact AI Status Area */}
        <div className="p-3 rounded-lg bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
              AI Investigator
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className="text-slate-900 dark:text-slate-200 font-bold">1,284 incidents</span>
            </div>
            <div className="flex justify-between">
              <span>Learned Patterns:</span>
              <span className="text-purple-700 dark:text-purple-300 font-bold">342</span>
            </div>
            <div className="flex justify-between">
              <span>Resolutions:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">891</span>
            </div>
          </div>
        </div>

        {/* Back to Landing */}
        <button
          onClick={onBackToLanding}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Website</span>
        </button>
      </div>
    </aside>
  );
};
