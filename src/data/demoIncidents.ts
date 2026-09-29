export interface DemoIncidentItem {
  date: string;
  incidentNumber: number;
  service: string;
  symptom: string;
  rootCause: string;
  fixThatWorked: string;
  failedFix?: string;
  note?: string;
  tags: string[];
}

export const DEMO_INCIDENTS: DemoIncidentItem[] = [
  {
    date: '2026-03-04',
    incidentNumber: 101,
    service: 'checkout-api',
    symptom: 'HTTP 504 timeouts during a sale.',
    rootCause: 'Redis cache cluster ran out of memory and evicted session keys.',
    fixThatWorked: 'Increased Redis maxmemory and enabled the allkeys-lru policy.',
    failedFix: 'Restarting checkout-api pods did not help.',
    tags: ['checkout-api', 'redis', 'cache-eviction', 'allkeys-lru', 'resolved']
  },
  {
    date: '2026-03-19',
    incidentNumber: 112,
    service: 'payments-api',
    symptom: '502 errors and slow responses.',
    rootCause: 'PgBouncer connection pool exhausted after deploy v2.3 lowered max connections.',
    fixThatWorked: 'Rolled back the deploy and raised the pool size to 200.',
    failedFix: 'Scaling up the database instance did not help.',
    tags: ['payments-api', 'pgbouncer', 'connection-pool', 'rollback', 'resolved']
  },
  {
    date: '2026-04-02',
    incidentNumber: 125,
    service: 'auth-service',
    symptom: 'Users randomly logged out.',
    rootCause: 'JWT signing key rotated on one node but not the others.',
    fixThatWorked: 'Synced the key across all nodes and restarted auth pods in sequence.',
    tags: ['auth-service', 'jwt', 'key-rotation', 'desync', 'resolved']
  },
  {
    date: '2026-04-17',
    incidentNumber: 133,
    service: 'search-api',
    symptom: 'Memory climbing until pods were OOMKilled every 6 hours.',
    rootCause: 'Memory leak in the query result cache with no size limit.',
    fixThatWorked: 'Added an LRU cache size limit and shipped a patch.',
    failedFix: 'Raising pod memory limits only delayed the crash.',
    tags: ['search-api', 'memory-leak', 'cache-limit', 'lru', 'oom', 'resolved']
  },
  {
    date: '2026-05-06',
    incidentNumber: 141,
    service: 'notification-service',
    symptom: 'Emails delayed by over 2 hours.',
    rootCause: 'Kafka consumer lag after a partition rebalance.',
    fixThatWorked: 'Increased consumer instances from 3 to 8 and tuned max.poll.interval.',
    tags: ['notification-service', 'kafka', 'consumer-lag', 'partition-rebalance', 'resolved']
  },
  {
    date: '2026-05-22',
    incidentNumber: 150,
    service: 'orders-db (PostgreSQL)',
    symptom: 'P1 database latency spike, queries taking over 10 seconds.',
    rootCause: 'Missing index on the orders.customer_id column after a schema migration.',
    fixThatWorked: 'Created the index concurrently.',
    failedFix: 'Restarting the database caused a longer outage.',
    tags: ['orders-db', 'postgresql', 'missing-index', 'create-index-concurrently', 'resolved']
  },
  {
    date: '2026-06-09',
    incidentNumber: 158,
    service: 'api-gateway',
    symptom: '429 errors for legitimate users.',
    rootCause: 'Rate limit config pushed to production with the limit set to 10 requests per minute instead of 1000.',
    fixThatWorked: 'Reverted the config change and added a config validation check to the pipeline.',
    tags: ['api-gateway', 'rate-limiting', 'config-error', 'pipeline-validation', 'resolved']
  },
  {
    date: '2026-06-25',
    incidentNumber: 166,
    service: 'image-service',
    symptom: 'Uploads failing with "no space left on device".',
    rootCause: 'Temp directory filled by unrotated processing files.',
    fixThatWorked: 'Cleared old temp files and added a cron job with log rotation.',
    tags: ['image-service', 'disk-full', 'temp-cleanup', 'logrotate', 'resolved']
  },
  {
    date: '2026-07-14',
    incidentNumber: 172,
    service: 'payments-api',
    symptom: 'Intermittent 500 errors, connection timeouts to the database.',
    rootCause: 'PgBouncer pool exhaustion again after a traffic spike.',
    fixThatWorked: 'Dynamic pool scaling without a restart.',
    note: 'This is a repeat of incident #112.',
    tags: ['payments-api', 'pgbouncer', 'pool-exhaustion', 'dynamic-scaling', 'repeat-incident', 'resolved']
  },
  {
    date: '2026-08-03',
    incidentNumber: 180,
    service: 'cdn-edge',
    symptom: 'Stale content served after a release.',
    rootCause: 'Cache invalidation job failed silently due to an expired API token.',
    fixThatWorked: 'Rotated the token and manually purged the cache. Added token expiry alerts.',
    tags: ['cdn-edge', 'cache-invalidation', 'expired-token', 'purge', 'resolved']
  },
  {
    date: '2026-08-21',
    incidentNumber: 189,
    service: 'inventory-service',
    symptom: 'Overselling items.',
    rootCause: 'Race condition in stock decrement logic under high concurrency.',
    fixThatWorked: 'Added row-level locking.',
    failedFix: 'Adding a retry loop made it worse.',
    tags: ['inventory-service', 'race-condition', 'row-level-locking', 'concurrency', 'resolved']
  },
  {
    date: '2026-09-10',
    incidentNumber: 197,
    service: 'user-service',
    symptom: 'Login latency tripled after deploy.',
    rootCause: 'New ORM version generated N+1 queries.',
    fixThatWorked: 'Rolled back the deploy and added eager loading before redeploying.',
    tags: ['user-service', 'orm', 'n-plus-one', 'eager-loading', 'rollback', 'resolved']
  }
];

export function formatDemoIncidentContent(item: DemoIncidentItem): string {
  const parts = [
    `Date: ${item.date}. Incident #${item.incidentNumber}.`,
    `Service: ${item.service}.`,
    `Symptom: ${item.symptom}`,
    `Root cause: ${item.rootCause}`,
    `Fix that worked: ${item.fixThatWorked}`
  ];

  if (item.failedFix) {
    parts.push(`Failed fix: ${item.failedFix}`);
  }

  if (item.note) {
    parts.push(`Note: ${item.note}`);
  }

  return parts.join(' ');
}
