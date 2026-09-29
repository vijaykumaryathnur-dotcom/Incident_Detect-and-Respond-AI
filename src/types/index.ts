export type IncidentSeverity = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus = 
  | 'Investigating' 
  | 'Resolving' 
  | 'Resolved' 
  | 'Monitoring' 
  | 'Acknowledged';

export interface IncidentSignal {
  id: string;
  name: string;
  type: 'metric' | 'log' | 'trace' | 'alert';
  status: 'critical' | 'warning' | 'nominal';
  value: string;
  timestamp: string;
  detail?: string;
}

export interface Incident {
  id: string;
  incidentNumber: number;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  service: string;
  assignee: string;
  createdAt: string;
  resolvedAt?: string;
  summary: string;
  signals: IncidentSignal[];
  likelyRootCause?: string;
  confidence?: number;
  recommendedRunbookId?: string;
  hindsightSimilarityScore?: number;
  matchedMemories?: string[]; // IDs of Hindsight memories
}

export interface HindsightMemory {
  id: string;
  incidentNumber: number;
  title: string;
  service: string;
  rootCause: string;
  resolution: string;
  resolutionTimeMinutes: number;
  outcome: 'Successful' | 'Partial' | 'Ineffective';
  confidenceScore: number;
  learnedPattern: string;
  timestamp: string;
  tags: string[];
  isRealHindsight?: boolean;
  rawFactId?: string;
  factType?: 'world' | 'observation' | 'experience' | string;
  entities?: string[];
  scores?: {
    final?: number;
    semantic?: number;
    keyword?: number;
  };
}

export interface RunbookStep {
  number: string;
  title: string;
  description: string;
  command?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface Runbook {
  id: string;
  code: string;
  title: string;
  trigger: string;
  recommendedByHindsight: boolean;
  confidence: number;
  historicalSuccessRate: number;
  steps: RunbookStep[];
  matchedIncidents: number[];
}

export interface Postmortem {
  id: string;
  incidentId: string;
  incidentNumber: number;
  title: string;
  date: string;
  impact: string;
  rootCause: string;
  timeline: { time: string; event: string }[];
  resolution: string;
  whatWorked: string[];
  whatFailed: string[];
  lessonsLearned: string[];
  savedToHindsight: boolean;
  savedAt?: string;
}

export interface ServiceEntity {
  id: string;
  name: string;
  status: 'Operational' | 'Degraded' | 'Outage';
  activeIncidentsCount: number;
  onCall: string;
  dependencies: string[];
  uptimePercent: string;
  p99Latency: string;
  errorRate: string;
  historicalIncidentCount: number;
  primaryRunbook: string;
}

export interface SystemIntelligenceStats {
  totalMemories: number;
  learnedPatterns: number;
  successfulResolutions: number;
  avgMttrMinutes: number;
  status: 'Online' | 'Syncing' | 'Idle' | 'Connecting' | 'Offline';
  bankId?: string;
  isRealHindsight?: boolean;
}
