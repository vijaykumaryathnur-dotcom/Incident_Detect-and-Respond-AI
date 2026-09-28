import { HindsightMemory, Incident, Postmortem, SystemIntelligenceStats } from '../types';
import { INITIAL_INCIDENTS, INITIAL_MEMORIES, INITIAL_POSTMORTEM, INITIAL_STATS } from '../data/mockData';

export interface MemorySearchParams {
  query?: string;
  service?: string;
  minConfidence?: number;
  tags?: string[];
  limit?: number;
}

export interface IncidentContextResult {
  incident: Incident;
  matchedMemories: HindsightMemory[];
  confidence: number;
  recommendedRunbookCode: string;
  learnedTakeaways: string[];
}

class HindsightMemoryService {
  private memories: HindsightMemory[] = [];
  private postmortems: Map<string, Postmortem> = new Map();
  private stats: SystemIntelligenceStats = { ...INITIAL_STATS };
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedMemories = localStorage.getItem('hindsight_memories_v1');
      if (storedMemories) {
        this.memories = JSON.parse(storedMemories);
      } else {
        this.memories = [...INITIAL_MEMORIES];
      }

      const storedStats = localStorage.getItem('hindsight_stats_v1');
      if (storedStats) {
        this.stats = JSON.parse(storedStats);
      } else {
        this.stats = { ...INITIAL_STATS, totalMemories: this.memories.length + 1280 };
      }

      this.postmortems.set(INITIAL_POSTMORTEM.incidentId, INITIAL_POSTMORTEM);
    } catch {
      this.memories = [...INITIAL_MEMORIES];
      this.stats = { ...INITIAL_STATS };
      this.postmortems.set(INITIAL_POSTMORTEM.incidentId, INITIAL_POSTMORTEM);
    }
  }

  private persistState() {
    try {
      localStorage.setItem('hindsight_memories_v1', JSON.stringify(this.memories));
      localStorage.setItem('hindsight_stats_v1', JSON.stringify(this.stats));
    } catch {
      // Ignore quota errors in constrained environments
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  /**
   * Search Hindsight for historical memories using semantic keywords & metadata
   */
  public async searchMemories(params: MemorySearchParams = {}): Promise<HindsightMemory[]> {
    const { query = '', service, minConfidence = 0, tags = [], limit = 10 } = params;
    const lowerQuery = query.toLowerCase().trim();

    return this.memories
      .filter((mem) => {
        if (service && mem.service.toLowerCase() !== service.toLowerCase()) {
          return false;
        }
        if (mem.confidenceScore < minConfidence) {
          return false;
        }
        if (tags.length > 0 && !tags.some((t) => mem.tags.includes(t.toLowerCase()))) {
          return false;
        }
        if (!lowerQuery) {
          return true;
        }

        const matchTitle = mem.title.toLowerCase().includes(lowerQuery);
        const matchRoot = mem.rootCause.toLowerCase().includes(lowerQuery);
        const matchResolution = mem.resolution.toLowerCase().includes(lowerQuery);
        const matchPattern = mem.learnedPattern.toLowerCase().includes(lowerQuery);
        const matchService = mem.service.toLowerCase().includes(lowerQuery);
        const matchNum = `#${mem.incidentNumber}`.includes(lowerQuery);

        return matchTitle || matchRoot || matchResolution || matchPattern || matchService || matchNum;
      })
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, limit);
  }

  /**
   * Store a newly validated lesson or resolution back into Hindsight
   */
  public async storeMemory(memory: Omit<HindsightMemory, 'id' | 'timestamp'>): Promise<HindsightMemory> {
    const newMemory: HindsightMemory = {
      ...memory,
      id: `mem-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Prepend to memories list
    this.memories = [newMemory, ...this.memories];
    this.stats = {
      ...this.stats,
      totalMemories: this.stats.totalMemories + 1,
      learnedPatterns: this.stats.learnedPatterns + 1,
      successfulResolutions: memory.outcome === 'Successful' ? this.stats.successfulResolutions + 1 : this.stats.successfulResolutions,
    };

    this.persistState();
    return newMemory;
  }

  /**
   * Ingest a postmortem document, distill lessons, and commit directly to Hindsight
   */
  public async storePostmortem(postmortem: Postmortem): Promise<HindsightMemory> {
    this.postmortems.set(postmortem.incidentId, {
      ...postmortem,
      savedToHindsight: true,
      savedAt: new Date().toISOString(),
    });

    const memory: Omit<HindsightMemory, 'id' | 'timestamp'> = {
      incidentNumber: postmortem.incidentNumber,
      title: postmortem.title,
      service: 'Payments API',
      rootCause: postmortem.rootCause,
      resolution: postmortem.resolution,
      resolutionTimeMinutes: 7,
      outcome: 'Successful',
      confidenceScore: 0.98,
      learnedPattern: postmortem.lessonsLearned[0] || 'Tune pool capacity and reclaim timeouts to match burst concurrency.',
      tags: ['pool-capacity', 'pgbouncer', 'postmortem-ingested', 'slo-recovery']
    };

    const savedMemory = await this.storeMemory(memory);
    return savedMemory;
  }

  /**
   * Retrieve rich historical incident context given an incoming active incident
   */
  public async retrieveIncidentContext(incident: Incident): Promise<IncidentContextResult> {
    // Retrieve linked memories or search by service / root cause keywords
    let matched = this.memories.filter((m) => incident.matchedMemories?.includes(m.id));

    if (matched.length === 0) {
      matched = await this.searchMemories({
        service: incident.service,
        limit: 3
      });
    }

    const confidence = incident.confidence || 0.94;
    const recommendedRunbookCode = 'DB-CONNECTION-POOL-RECOVERY';

    const learnedTakeaways = matched.map((m) => m.learnedPattern).filter(Boolean);

    return {
      incident,
      matchedMemories: matched,
      confidence,
      recommendedRunbookCode,
      learnedTakeaways,
    };
  }

  /**
   * Get related historical incidents by similarity
   */
  public async getRelatedIncidents(incidentId: string): Promise<HindsightMemory[]> {
    const inc = INITIAL_INCIDENTS.find((i) => i.id === incidentId);
    if (!inc) {
      return this.memories.slice(0, 3);
    }
    return this.searchMemories({
      service: inc.service,
      limit: 3
    });
  }

  public getAllMemories(): HindsightMemory[] {
    return [...this.memories];
  }

  public getPostmortem(incidentId: string): Postmortem | undefined {
    return this.postmortems.get(incidentId) || INITIAL_POSTMORTEM;
  }

  public getStats(): SystemIntelligenceStats {
    return { ...this.stats };
  }

  public resetToDefaults() {
    this.memories = [...INITIAL_MEMORIES];
    this.stats = { ...INITIAL_STATS };
    this.postmortems.set(INITIAL_POSTMORTEM.incidentId, INITIAL_POSTMORTEM);
    this.persistState();
  }
}

export const hindsightService = new HindsightMemoryService();
