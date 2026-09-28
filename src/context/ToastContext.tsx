import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { P1ToastData, ToastContextType } from '../types/toast';
import { ToastContainer } from '../components/toast/ToastContainer';
import { audioCueService } from '../services/audioCue';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const SAMPLE_P1_SCENARIOS: Omit<P1ToastData, 'id' | 'timestamp'>[] = [
  {
    incidentId: 'inc-304',
    incidentNumber: 304,
    title: 'Database Latency Detected — Payments API',
    service: 'Payments API',
    summary: 'P99 latency spiked to 1,840ms. PgBouncer client connection pool reached 98% saturation.',
    hindsightMatchesCount: 3,
    similarityScore: 0.94,
    likelyRootCause: 'Database connection pool exhaustion',
    recommendedRunbook: 'DB-CONNECTION-POOL-RECOVERY',
    durationMs: 9000,
  },
  {
    incidentId: 'inc-308',
    incidentNumber: 308,
    title: 'Redis Token Cluster Memory Saturation',
    service: 'Authentication Service',
    summary: 'Eviction rate exceeded 4,500 keys/sec; session verification requests experiencing 800ms delays.',
    hindsightMatchesCount: 2,
    similarityScore: 0.91,
    likelyRootCause: 'JWT session cache stampede following edge key rollover',
    recommendedRunbook: 'AUTH-CACHE-RESEED',
    durationMs: 9000,
  },
  {
    incidentId: 'inc-311',
    incidentNumber: 311,
    title: 'Kafka Consumer Lag Spike on Checkout Authorizations',
    service: 'Billing Engine',
    summary: 'Partition lag reached 124,000 messages. JVM garbage collection pause triggered consumer rebalance storm.',
    hindsightMatchesCount: 2,
    similarityScore: 0.89,
    likelyRootCause: 'Consumer group heartbeat timeout from GC pause',
    recommendedRunbook: 'KAFKA-CONSUMER-REBALANCE',
    durationMs: 9000,
  }
];

interface ToastProviderProps {
  children: React.ReactNode;
  onInspectIncident: (incidentId: string) => void;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  onInspectIncident,
}) => {
  const [toasts, setToasts] = useState<P1ToastData[]>([]);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => audioCueService.isEnabled());

  const toggleSound = useCallback(() => {
    const next = audioCueService.toggle();
    setSoundEnabledState(next);
  }, []);

  const playAudioCue = useCallback(() => {
    audioCueService.playP1Alert();
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const triggerP1Alert = useCallback((customData?: Partial<P1ToastData>) => {
    const scenario = SAMPLE_P1_SCENARIOS[scenarioIndex % SAMPLE_P1_SCENARIOS.length];
    setScenarioIndex((idx) => idx + 1);

    const newToast: P1ToastData = {
      ...scenario,
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      ...customData,
    };

    // Trigger audio cue unless explicitly silenced
    if (!newToast.silent) {
      audioCueService.playP1Alert();
    }

    setToasts((prev) => {
      // Keep up to 3 toasts active at once
      const filtered = prev.filter((t) => t.incidentId !== newToast.incidentId);
      return [newToast, ...filtered].slice(0, 3);
    });
  }, [scenarioIndex]);

  return (
    <ToastContext.Provider value={{ 
      toasts, 
      soundEnabled, 
      toggleSound, 
      playAudioCue, 
      triggerP1Alert, 
      dismissToast, 
      clearAllToasts 
    }}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onInspect={onInspectIncident}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

