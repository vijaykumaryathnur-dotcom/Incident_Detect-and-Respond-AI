import { HindsightMemory, Incident, Postmortem, Runbook, ServiceEntity, SystemIntelligenceStats } from '../types';

export const INITIAL_STATS: SystemIntelligenceStats = {
  totalMemories: 3,
  learnedPatterns: 3,
  successfulResolutions: 3,
  avgMttrMinutes: 7.2,
  status: 'Online',
  bankId: 'Incident',
  isRealHindsight: true
};

export const INITIAL_MEMORIES: HindsightMemory[] = [
  {
    id: 'mem-184',
    incidentNumber: 184,
    title: 'Database connection pool exhaustion on peak checkout burst',
    service: 'Payments API',
    rootCause: 'Connection pool exhaustion under burst traffic; connection leak in unclosed transaction blocks',
    resolution: 'Increased connection pool max size from 100 to 250 and patched idle timeout reclaim policy',
    resolutionTimeMinutes: 11,
    outcome: 'Successful',
    confidenceScore: 0.96,
    learnedPattern: 'This service responds better to connection-pool tuning than a service restart. Restarting dropped queued webhook callbacks.',
    timestamp: '2026-06-14T14:22:00Z',
    tags: ['postgresql', 'pool-exhaustion', 'payments', 'p99-latency']
  },
  {
    id: 'mem-231',
    incidentNumber: 231,
    title: 'Database connection saturation during scheduled batch reconciliation',
    service: 'Payments API',
    rootCause: 'Batch reconciliation worker saturated reserved connections without jitter',
    resolution: 'Pool configuration change + applied concurrency limiter on reconciliation queue',
    resolutionTimeMinutes: 7,
    outcome: 'Successful',
    confidenceScore: 0.94,
    learnedPattern: 'Always isolate batch reconciliation connections from user-facing transaction pools via separate read-replica endpoints.',
    timestamp: '2026-08-02T03:15:00Z',
    tags: ['db-saturation', 'reconciliation', 'concurrency-limits']
  },
  {
    id: 'mem-267',
    incidentNumber: 267,
    title: 'Payment API database timeout leading to checkout dropoff',
    service: 'Payments API',
    rootCause: 'Lock contention on ledger row sequence during concurrent multi-currency authorizations',
    resolution: 'Applied DB-CONNECTION-POOL-RECOVERY runbook step 4 and flushed zombie prepared statements',
    resolutionTimeMinutes: 9,
    outcome: 'Successful',
    confidenceScore: 0.91,
    learnedPattern: 'Zombie prepared statement cache on proxy nodes causes false pool saturation indicators.',
    timestamp: '2026-08-28T19:40:00Z',
    tags: ['lock-contention', 'timeout', 'prepared-statements']
  },
  {
    id: 'mem-312',
    incidentNumber: 312,
    title: 'Authentication JWT key rotation cache miss storm',
    service: 'Auth Service',
    rootCause: 'JWKS public key rotation evicted cache simultaneously across all edge nodes',
    resolution: 'Staggered cache pre-warm and distributed key version grace period to 48 hours',
    resolutionTimeMinutes: 6,
    outcome: 'Successful',
    confidenceScore: 0.98,
    learnedPattern: 'Key rotation must always publish the next key 24h prior to deprecating the current verification key.',
    timestamp: '2026-09-12T11:05:00Z',
    tags: ['auth', 'jwks', 'cache-stampede', 'edge']
  },
  {
    id: 'mem-319',
    incidentNumber: 319,
    title: 'Async event worker consumer group rebalance storm',
    service: 'Billing Engine',
    rootCause: 'Kafka heartbeat timeout caused by garbage collection pause triggered recursive rebalancing',
    resolution: 'Increased max.poll.interval.ms from 30000 to 120000 and scaled consumer partitions',
    resolutionTimeMinutes: 14,
    outcome: 'Successful',
    confidenceScore: 0.89,
    learnedPattern: 'GC pause spikes directly correlated with rebalance storms; JVM heap allocation tuned to G1GC with 100ms pause target.',
    timestamp: '2026-09-21T08:12:00Z',
    tags: ['kafka', 'rebalance', 'jvm-gc', 'billing']
  }
];

export const INITIAL_RUNBOOKS: Runbook[] = [
  {
    id: 'rb-db-pool',
    code: 'DB-CONNECTION-POOL-RECOVERY',
    title: 'Database Connection Pool Recovery & Saturation Mitigation',
    trigger: 'Database connection saturation (>90% utilization for 2m) or latency spike > 400ms',
    recommendedByHindsight: true,
    confidence: 0.94,
    historicalSuccessRate: 0.98,
    matchedIncidents: [184, 231, 267],
    steps: [
      {
        number: '01',
        title: 'Check active connections',
        description: 'Query pg_stat_activity to inspect pool state and identify idle-in-transaction clients.',
        command: 'SELECT count(*), state, application_name FROM pg_stat_activity GROUP BY 2, 3 ORDER BY 1 DESC;',
        status: 'completed'
      },
      {
        number: '02',
        title: 'Compare pool utilization',
        description: 'Cross-reference PgBouncer active pool vs PostgreSQL server client capacity limit.',
        command: 'SHOW POOLS; SHOW CLIENTS;',
        status: 'completed'
      },
      {
        number: '03',
        title: 'Validate database health',
        description: 'Inspect CPU, disk I/O wait, and replica lag to rule out hardware throttling.',
        command: 'SELECT pid, query_start, now() - query_start AS duration, query FROM pg_stat_activity WHERE state != \'idle\' ORDER BY duration DESC LIMIT 5;',
        status: 'completed'
      },
      {
        number: '04',
        title: 'Increase pool capacity',
        description: 'Dynamically scale reserve pool allocation by +50 connections on proxy cluster.',
        command: 'kubectl patch configmap pgbouncer-config --type merge -p \'{"data":{"default_pool_size":"250"}}\' && kubectl rollout restart deploy/pgbouncer',
        status: 'pending'
      },
      {
        number: '05',
        title: 'Monitor recovery',
        description: 'Verify 5xx rate drops below 0.01% and P99 latency returns to baseline < 45ms over 3 minutes.',
        command: 'curl -s https://metrics.internal/v1/health/payments | jq \'.p99_latency_ms, .error_rate\'',
        status: 'pending'
      }
    ]
  },
  {
    id: 'rb-auth-cache',
    code: 'AUTH-CACHE-RESEED',
    title: 'JWKS & Session Cache Reseeding Procedure',
    trigger: 'Auth token verification failure rate exceeds 1% or edge cache miss storm',
    recommendedByHindsight: false,
    confidence: 0.88,
    historicalSuccessRate: 0.95,
    matchedIncidents: [312],
    steps: [
      {
        number: '01',
        title: 'Inspect edge cache rejection rate',
        description: 'Check Cloudflare & Envoy 401 response counts and upstream auth token latency.',
        command: 'vector query --metric auth.rejections.rate --range 15m',
        status: 'pending'
      },
      {
        number: '02',
        title: 'Trigger distributed pre-warm',
        description: 'Dispatch JWKS preload signal to edge nodes.',
        command: 'auth-ctl cache warm --keyset current,next --ttl 86400',
        status: 'pending'
      }
    ]
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-304',
    incidentNumber: 304,
    title: 'Database Latency Detected — Payments API',
    severity: 'P1',
    status: 'Investigating',
    service: 'Payments API',
    assignee: 'SRE On-Call (Sarah Chen)',
    createdAt: '4 mins ago',
    summary: 'Sudden spike in P99 latency across payment checkout endpoints. Database connection pool reached 98% saturation.',
    signals: [
      {
        id: 'sig-1',
        name: 'API Latency Spike',
        type: 'metric',
        status: 'critical',
        value: 'P99 Latency: 1,840ms (Baseline: 42ms)',
        timestamp: '15:28:10 UTC',
        detail: '+4,280% above nominal SLO threshold'
      },
      {
        id: 'sig-2',
        name: 'Database Connections Saturated',
        type: 'metric',
        status: 'critical',
        value: '98 / 100 max connections in use',
        timestamp: '15:28:22 UTC',
        detail: 'Queued connection requests waiting: 342'
      },
      {
        id: 'sig-3',
        name: 'Increased 5xx Responses',
        type: 'metric',
        status: 'critical',
        value: '504 Gateway Timeout: 4.8% error rate',
        timestamp: '15:28:45 UTC',
        detail: 'Downstream checkout service dropping client handshakes'
      },
      {
        id: 'sig-4',
        name: 'CPU & Memory Baseline Normal',
        type: 'metric',
        status: 'nominal',
        value: 'Pod CPU: 38% · Memory: 44%',
        timestamp: '15:29:01 UTC',
        detail: 'Hardware resources healthy; issue isolated to connection bottleneck'
      }
    ],
    likelyRootCause: 'Database connection pool exhaustion',
    confidence: 0.94,
    recommendedRunbookId: 'rb-db-pool',
    hindsightSimilarityScore: 0.94,
    matchedMemories: ['mem-184', 'mem-231', 'mem-267']
  },
  {
    id: 'inc-303',
    incidentNumber: 303,
    title: 'Authentication Token Verification Degradation',
    severity: 'P2',
    status: 'Monitoring',
    service: 'Auth Service',
    assignee: 'Identity Platform (Marcus Vance)',
    createdAt: '38 mins ago',
    summary: 'Intermittent 401 Unauthorized spikes following periodic key rotation. Edge cache warmed.',
    signals: [
      {
        id: 'sig-11',
        name: 'Auth Verification Failure',
        type: 'alert',
        status: 'warning',
        value: '1.4% rejection rate',
        timestamp: '14:52:00 UTC'
      },
      {
        id: 'sig-12',
        name: 'JWKS Cache Hit Rate',
        type: 'metric',
        status: 'warning',
        value: 'Recovered to 99.4%',
        timestamp: '15:10:00 UTC'
      }
    ],
    likelyRootCause: 'JWKS key rotation cache miss storm',
    confidence: 0.91,
    recommendedRunbookId: 'rb-auth-cache',
    hindsightSimilarityScore: 0.96,
    matchedMemories: ['mem-312']
  },
  {
    id: 'inc-301',
    incidentNumber: 301,
    title: 'Billing Queue Backlog Ingestion Delay',
    severity: 'P3',
    status: 'Acknowledged',
    service: 'Billing Engine',
    assignee: 'Data Systems (Elena Rostova)',
    createdAt: '2 hours ago',
    summary: 'Kafka consumer lag increasing on invoice calculation stream. Partition rebalance completed.',
    signals: [
      {
        id: 'sig-21',
        name: 'Consumer Lag',
        type: 'metric',
        status: 'warning',
        value: '48,200 messages behind head',
        timestamp: '13:20:00 UTC'
      }
    ],
    likelyRootCause: 'Consumer group partition rebalance delay',
    confidence: 0.89,
    hindsightSimilarityScore: 0.89,
    matchedMemories: ['mem-319']
  },
  {
    id: 'inc-299',
    incidentNumber: 299,
    title: 'TLS Handshake Latency Spike — Edge Ingress',
    severity: 'P2',
    status: 'Resolving',
    service: 'API Gateway',
    assignee: 'Platform Ops (Aisha Patel)',
    createdAt: '3 hours ago',
    summary: 'Elevated handshake latency on EU and US-East edge points of presence due to OCSP stapling cache expiration.',
    signals: [
      {
        id: 'sig-31',
        name: 'TLS Handshake P99',
        type: 'metric',
        status: 'warning',
        value: '420ms (Baseline: 24ms)',
        timestamp: '12:15:00 UTC'
      }
    ],
    likelyRootCause: 'OCSP stapling server timeout on intermediary certificate',
    confidence: 0.92,
    hindsightSimilarityScore: 0.91,
    matchedMemories: ['mem-312']
  },
  {
    id: 'inc-298',
    incidentNumber: 298,
    title: 'Elasticsearch Index Shard Allocation Throttling',
    severity: 'P3',
    status: 'Monitoring',
    service: 'Search Cluster',
    assignee: 'Infrastructure Core (Devon Park)',
    createdAt: '5 hours ago',
    summary: 'Disk watermark high threshold exceeded on 2 data nodes. Automated rebalance initiated with throttle limiter.',
    signals: [
      {
        id: 'sig-41',
        name: 'Disk Utilization',
        type: 'metric',
        status: 'warning',
        value: '86% on es-data-04',
        timestamp: '10:45:00 UTC'
      }
    ],
    likelyRootCause: 'Uncompressed log index lifecycle policy skipped tier migration',
    confidence: 0.88,
    hindsightSimilarityScore: 0.86
  },
  {
    id: 'inc-295',
    incidentNumber: 295,
    title: 'High 502 Bad Gateway Rate — Checkout Ingestion',
    severity: 'P1',
    status: 'Investigating',
    service: 'Payments API',
    assignee: 'SRE On-Call (Sarah Chen)',
    createdAt: '6 hours ago',
    summary: 'Upstream microservices dropped keep-alive TCP connections prematurely during pod auto-scaling window.',
    signals: [
      {
        id: 'sig-51',
        name: '502 Error Rate',
        type: 'metric',
        status: 'critical',
        value: '6.4% on /v2/charge',
        timestamp: '09:20:00 UTC'
      }
    ],
    likelyRootCause: 'TCP RST during graceful shutdown grace period misconfiguration',
    confidence: 0.95,
    recommendedRunbookId: 'rb-db-pool',
    hindsightSimilarityScore: 0.95,
    matchedMemories: ['mem-184']
  }
];

export const INITIAL_SERVICES: ServiceEntity[] = [
  {
    id: 'svc-payments',
    name: 'Payments API',
    status: 'Degraded',
    activeIncidentsCount: 1,
    onCall: 'Engineering Team (Primary: Sarah Chen)',
    dependencies: ['Database (PostgreSQL Cluster)', 'Authentication Service', 'Payment Gateway (Stripe/Adyen)'],
    uptimePercent: '99.94%',
    p99Latency: '1,840ms (High)',
    errorRate: '4.8%',
    historicalIncidentCount: 18,
    primaryRunbook: 'DB-CONNECTION-POOL-RECOVERY'
  },
  {
    id: 'svc-auth',
    name: 'Authentication Service',
    status: 'Operational',
    activeIncidentsCount: 0,
    onCall: 'Security & Identity Team',
    dependencies: ['Redis Token Store', 'KMS Key Vault'],
    uptimePercent: '99.99%',
    p99Latency: '18ms',
    errorRate: '0.02%',
    historicalIncidentCount: 8,
    primaryRunbook: 'AUTH-CACHE-RESEED'
  },
  {
    id: 'svc-billing',
    name: 'Billing Engine',
    status: 'Operational',
    activeIncidentsCount: 0,
    onCall: 'Revenue Platform Team',
    dependencies: ['Kafka Event Bus', 'Ledger DB', 'Payments API'],
    uptimePercent: '99.95%',
    p99Latency: '45ms',
    errorRate: '0.1%',
    historicalIncidentCount: 12,
    primaryRunbook: 'KAFKA-CONSUMER-REBALANCE'
  },
  {
    id: 'svc-gateway',
    name: 'API Gateway',
    status: 'Operational',
    activeIncidentsCount: 0,
    onCall: 'Edge Infrastructure Team',
    dependencies: ['Cloudflare WAF', 'Envoy Ingress'],
    uptimePercent: '100.00%',
    p99Latency: '8ms',
    errorRate: '0.00%',
    historicalIncidentCount: 4,
    primaryRunbook: 'GATEWAY-TRAFFIC-SHED'
  }
];

export const INITIAL_POSTMORTEM: Postmortem = {
  id: 'pm-304',
  incidentId: 'inc-304',
  incidentNumber: 304,
  title: 'Postmortem: Payments API Latency & DB Pool Exhaustion',
  date: '2026-09-28',
  impact: 'Payment checkout endpoints experienced 4.8% error rate for 7 minutes, impacting approximately 280 transactions. No customer funds lost.',
  rootCause: 'PostgreSQL client connection pool limit (100) was saturated by a sudden 3x burst in checkout traffic combined with an idle connection reclaim timeout that was set too conservatively (30s).',
  timeline: [
    { time: '15:28 UTC', event: 'Alert fired: Payments API P99 latency exceeded 400ms threshold.' },
    { time: '15:29 UTC', event: 'AI Investigator received incident and initiated signal correlation.' },
    { time: '15:29 UTC', event: 'Hindsight recalled Incident #184 & #231 (94% similarity).' },
    { time: '15:30 UTC', event: 'Runbook DB-CONNECTION-POOL-RECOVERY suggested; step 4 executed.' },
    { time: '15:35 UTC', event: 'Pool size increased to 250; idle connection timeout reconfigured.' },
    { time: '15:36 UTC', event: 'Latency normalized to 42ms; error rate returned to 0.00%.' }
  ],
  resolution: 'Dynamically increased PgBouncer maximum pool capacity to 250 connections and decreased idle transaction reclaim to 5s. Auto-recovery validated in 7 minutes.',
  whatWorked: [
    'Hindsight recalled #184 immediately, preventing unnecessary pod restarts that would have dropped active payment handshakes.',
    'DB-CONNECTION-POOL-RECOVERY runbook steps were precisely matched to telemetry signatures.',
    'Cross-service alerting notified downstream checkout consumers before user retries cascaded.'
  ],
  whatFailed: [
    'Baseline connection limit had not been scaled since last quarter\'s traffic expansion.',
    'Alert thresholds on connection saturation fired at 95% instead of a progressive 80% warning.'
  ],
  lessonsLearned: [
    'Connection pool limits must scale automatically with pod horizontal auto-scaling (HPA).',
    'Tune PgBouncer idle transaction timeout down to 5s across all customer-facing microservices.',
    'Store this resolution into Hindsight to permanently reinforce pool capacity adjustment over restart.'
  ],
  savedToHindsight: false
};
