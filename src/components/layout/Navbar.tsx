import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Cpu, Terminal, ShieldAlert } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'workspace' | 'services';
  onNavigate: (view: 'landing' | 'dashboard' | 'workspace' | 'services') => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onScrollToSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 dark:bg-[#08090D]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.07] py-3.5 shadow-sm dark:shadow-2xl dark:shadow-black/40'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Single element wordmark as required by Top Bar contract */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="group flex items-center gap-2.5 text-left transition-opacity hover:opacity-90 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                AI INCIDENT RESPONSE
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-400">
            <button
              onClick={() => handleNavClick('the-problem')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              Product
            </button>
            <button
              onClick={() => handleNavClick('ai-investigator')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              AI Investigator
            </button>
            <button
              onClick={() => handleNavClick('hindsight-memory')}
              className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer text-indigo-600 dark:text-indigo-400/90 font-semibold"
            >
              Memory
            </button>
            <button
              onClick={() => handleNavClick('runbooks')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              Runbooks
            </button>
            <button
              onClick={() => handleNavClick('postmortems')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              Postmortems
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3">
            <a
              href="#docs"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('runbooks');
              }}
              className="hidden lg:inline-flex text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors px-2 py-1.5"
            >
              Docs
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors px-2 py-1.5"
            >
              GitHub
            </a>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {currentView === 'landing' ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="relative group inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg shadow-md shadow-indigo-600/25 ring-1 ring-white/15 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <span>Launch Agent</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('landing')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300/80 dark:border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Marketing View</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`h-0.5 w-full bg-slate-700 dark:bg-slate-300 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-0.5 w-full bg-slate-700 dark:bg-slate-300 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-full bg-slate-700 dark:bg-slate-300 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-2 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/95 dark:bg-[#0A0D15]/95 p-4 rounded-xl shadow-lg">
            <button
              onClick={() => handleNavClick('the-problem')}
              className="text-left px-2 py-1.5 hover:text-slate-900 dark:hover:text-white"
            >
              Product
            </button>
            <button
              onClick={() => handleNavClick('ai-investigator')}
              className="text-left px-2 py-1.5 hover:text-slate-900 dark:hover:text-white"
            >
              AI Investigator
            </button>
            <button
              onClick={() => handleNavClick('hindsight-memory')}
              className="text-left px-2 py-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Memory
            </button>
            <button
              onClick={() => handleNavClick('runbooks')}
              className="text-left px-2 py-1.5 hover:text-slate-900 dark:hover:text-white"
            >
              Runbooks
            </button>
            <button
              onClick={() => handleNavClick('postmortems')}
              className="text-left px-2 py-1.5 hover:text-slate-900 dark:hover:text-white"
            >
              Postmortems
            </button>
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
              <ThemeToggle showLabel className="flex-1 justify-center" />
              <button
                onClick={() => {
                  onNavigate(currentView === 'landing' ? 'dashboard' : 'landing');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 text-center py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg shadow-sm"
              >
                {currentView === 'landing' ? 'Launch Agent' : 'Back to Home'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

