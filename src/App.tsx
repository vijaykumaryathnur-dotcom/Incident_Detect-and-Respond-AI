import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/landing/Hero';
import { TheProblem } from './components/landing/TheProblem';
import { AIInvestigatorSection } from './components/landing/AIInvestigatorSection';
import { HindsightMemorySection } from './components/landing/HindsightMemorySection';
import { LearningCurveSection } from './components/landing/LearningCurveSection';
import { RunbooksSection } from './components/landing/RunbooksSection';
import { PostmortemSection } from './components/landing/PostmortemSection';
import { Sidebar, DashboardTab } from './components/dashboard/Sidebar';
import { ProductDashboard } from './components/dashboard/ProductDashboard';
import { IncidentWorkspace } from './components/dashboard/IncidentWorkspace';
import { ServiceView } from './components/dashboard/ServiceView';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'workspace'>('landing');
  const [activeDashboardTab, setActiveDashboardTab] = useState<DashboardTab>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('inc-304');

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchAgent = () => {
    setCurrentView('dashboard');
    setActiveDashboardTab('overview');
  };

  const handleSelectIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setCurrentView('workspace');
  };

  const handleSidebarTabSelect = (tab: DashboardTab) => {
    setActiveDashboardTab(tab);
    setCurrentView('dashboard');
  };

  const handleNavigate = (view: 'landing' | 'dashboard' | 'workspace' | 'services') => {
    if (view === 'services') {
      setCurrentView('dashboard');
      setActiveDashboardTab('services');
    } else {
      setCurrentView(view as 'landing' | 'dashboard' | 'workspace');
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider onInspectIncident={handleSelectIncident}>
        <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200">
          {currentView === 'landing' ? (
            /* ==================== MARKETING / LANDING VIEW ==================== */
            <div className="flex-1 flex flex-col">
              <Navbar 
                currentView="landing" 
                onNavigate={handleNavigate} 
                onScrollToSection={scrollToSection} 
              />

              <main className="flex-1">
                {/* HERO with CINEMATIC 6-STEP ANIMATED PRODUCT DEMO */}
                <Hero
                  onLaunchAgent={handleLaunchAgent}
                  onSeeHowItLearns={() => scrollToSection('hindsight-memory')}
                />

                {/* SECTION: THE PROBLEM (Before / After context comparison) */}
                <TheProblem />

                {/* SECTION: AI INVESTIGATOR (Structured evidence & signals) */}
                <AIInvestigatorSection 
                  onOpenWorkspace={() => handleSelectIncident('inc-304')} 
                />

                {/* SECTION: HINDSIGHT MEMORY (The most important intelligence section!) */}
                <HindsightMemorySection />

                {/* SECTION: LEARNING CURVE (Watch the agent get smarter progression) */}
                <LearningCurveSection />

                {/* SECTION: RUNBOOKS (Turn experience into action) */}
                <RunbooksSection />

                {/* SECTION: POSTMORTEMS (Resolution isn't the end & Save to Hindsight) */}
                <PostmortemSection />
              </main>

              <Footer 
                onNavigate={handleNavigate} 
                onScrollToSection={scrollToSection} 
              />
            </div>
          ) : currentView === 'workspace' ? (
            /* ==================== INCIDENT WORKSPACE VIEW ==================== */
            <IncidentWorkspace
              incidentId={selectedIncidentId}
              onBack={() => setCurrentView('dashboard')}
            />
          ) : (
            /* ==================== DASHBOARD / CONSOLE VIEW ==================== */
            <div className="flex-1 flex h-screen overflow-hidden">
              <Sidebar
                currentTab={activeDashboardTab}
                onSelectTab={handleSidebarTabSelect}
                onBackToLanding={() => setCurrentView('landing')}
              />

              {activeDashboardTab === 'overview' ? (
                <ProductDashboard
                  currentTab="overview"
                  onSelectIncident={handleSelectIncident}
                  onNavigateTab={(tab) => handleSidebarTabSelect(tab as DashboardTab)}
                />
              ) : activeDashboardTab === 'incidents' ? (
                <ProductDashboard
                  currentTab="incidents"
                  onSelectIncident={handleSelectIncident}
                  onNavigateTab={(tab) => handleSidebarTabSelect(tab as DashboardTab)}
                />
              ) : activeDashboardTab === 'services' ? (
                <ServiceView onSelectIncident={handleSelectIncident} />
              ) : activeDashboardTab === 'investigator' ? (
                <div className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
                  <AIInvestigatorSection onOpenWorkspace={() => handleSelectIncident('inc-304')} />
                </div>
              ) : activeDashboardTab === 'memory' ? (
                <div className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
                  <HindsightMemorySection />
                </div>
              ) : activeDashboardTab === 'runbooks' ? (
                <div className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
                  <RunbooksSection />
                </div>
              ) : activeDashboardTab === 'postmortems' ? (
                <div className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
                  <PostmortemSection />
                </div>
              ) : (
                <ProductDashboard
                  currentTab="overview"
                  onSelectIncident={handleSelectIncident}
                  onNavigateTab={(tab) => handleSidebarTabSelect(tab as DashboardTab)}
                />
              )}
            </div>
          )}
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}


