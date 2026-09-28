import React from 'react';
import { Cpu, Database, ShieldCheck, Terminal } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'landing' | 'dashboard' | 'workspace' | 'services') => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onScrollToSection }) => {
  const handleNav = (sectionId: string) => {
    onNavigate('landing');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-100/70 dark:bg-[#07080C] text-slate-600 dark:text-slate-400 text-xs py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-slate-200 dark:border-white/[0.06]">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Cpu className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-wider text-slate-900 dark:text-slate-200 uppercase">
                AI INCIDENT RESPONSE
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Autonomous incident response platform powered by Hindsight persistent memory.
              Learning from every outage, resolution, and postmortem.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Hindsight Memory Engine v1.4 · Online</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-300 mb-3">
              Platform
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('ai-investigator')}
                  className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  AI Investigator
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('hindsight-memory')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  Hindsight Memory
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('runbooks')}
                  className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Autonomous Runbooks
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('postmortems')}
                  className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Postmortem Synthesis
                </button>
              </li>
            </ul>
          </div>

          {/* Console links */}
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-300 mb-3">
              App Console
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Incident Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('workspace')}
                  className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Live Incident #304
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Service Intelligence
                </button>
              </li>
            </ul>
          </div>

          {/* SRE Infrastructure */}
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-300 mb-3">
              Reliability
            </div>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>SOC2 Type II Compliant</li>
              <li>Encrypted Vector Store</li>
              <li>Zero Data Leakage</li>
              <li>High-Availability Clusters</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div>
            © {new Date().getFullYear()} AI Incident Response Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Latency: 12ms</span>
            <span>·</span>
            <span>Cluster: US-East-1</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-500/80 font-medium">All Systems Nominal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
