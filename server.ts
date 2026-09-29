import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { HindsightClient } from '@vectorize-io/hindsight-client';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY || '';
const HINDSIGHT_BASE_URL = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';
// Explicit user request: Use memory bank ID "Incident"
// Guard against accidental API key injection into HINDSIGHT_BANK_ID
function resolveBankId(): string {
  const envBank = (process.env.HINDSIGHT_BANK_ID || '').trim();
  // An API key begins with 'hsk_' or contains 32+ hex chars. The bank ID must be a human bank name like "Incident".
  if (envBank && !envBank.startsWith('hsk_') && !envBank.includes(' ')) {
    return envBank;
  }
  return 'Incident';
}

const HINDSIGHT_BANK_ID = resolveBankId();

app.use(express.json());

// Initialize Hindsight Client
let hindsightClient: HindsightClient | null = null;
if (HINDSIGHT_API_KEY) {
  try {
    hindsightClient = new HindsightClient({
      baseUrl: HINDSIGHT_BASE_URL,
      apiKey: HINDSIGHT_API_KEY,
    });
    console.log(`[Hindsight] Client initialized for bank "${HINDSIGHT_BANK_ID}"`);
  } catch (err) {
    console.error('[Hindsight] Initialization error:', err);
  }
} else {
  console.warn('[Hindsight] Warning: HINDSIGHT_API_KEY not found in environment');
}

// Helper: Seed default baseline incidents if bank is empty
async function seedDefaultIncidentMemories() {
  if (!hindsightClient) return;
  try {
    const existing = await hindsightClient.listMemories(HINDSIGHT_BANK_ID, { limit: 1 });
    if (existing && existing.total === 0) {
      console.log(`[Hindsight] Seeding initial baseline memories into bank "${HINDSIGHT_BANK_ID}"...`);
      await hindsightClient.retain(
        HINDSIGHT_BANK_ID,
        'Incident #184: Database connection pool exhaustion under peak checkout burst in Payments API. Resolution: Increased connection pool max size from 100 to 250 and patched idle timeout reclaim policy. Learned heuristic: This service responds better to connection-pool tuning than a service restart. Restarting dropped queued webhook callbacks.',
        {
          context: 'Payments API outage postmortem & mitigation',
          tags: ['payments', 'database', 'connection-pool', 'resolved'],
          documentId: 'doc-inc-184'
        }
      );
      await hindsightClient.retain(
        HINDSIGHT_BANK_ID,
        'Incident #231: Database connection saturation during scheduled batch reconciliation in Payments API. Resolution: Applied pool configuration change and applied concurrency limiter on reconciliation queue. Learned heuristic: Always isolate batch reconciliation connections from user-facing transaction pools via separate read-replica endpoints.',
        {
          context: 'Batch reconciliation database saturation incident',
          tags: ['payments', 'database', 'concurrency-limits', 'resolved'],
          documentId: 'doc-inc-231'
        }
      );
      await hindsightClient.retain(
        HINDSIGHT_BANK_ID,
        'Incident #312: Authentication JWT key rotation cache miss storm in Auth Service. Resolution: Staggered cache pre-warm and distributed key version grace period to 48 hours. Learned heuristic: Key rotation must always publish the next key 24h prior to deprecating the current verification key.',
        {
          context: 'Auth Service key rotation storm postmortem',
          tags: ['auth', 'cache', 'key-rotation', 'resolved'],
          documentId: 'doc-inc-312'
        }
      );
      console.log(`[Hindsight] Successfully seeded baseline memories into bank "${HINDSIGHT_BANK_ID}".`);
    }
  } catch (err: any) {
    console.warn('[Hindsight] Seeding check error:', err?.message || err);
  }
}

// ----------------------------------------------------
// Real Hindsight API Proxy Endpoints
// ----------------------------------------------------

// 1. Health & Connection Status
app.get('/api/hindsight/status', async (_req, res) => {
  if (!hindsightClient) {
    return res.json({
      connected: false,
      configured: false,
      bankId: HINDSIGHT_BANK_ID,
      totalMemories: 0,
      message: 'HINDSIGHT_API_KEY is not configured on server',
    });
  }

  try {
    const listRes = await hindsightClient.listMemories(HINDSIGHT_BANK_ID, { limit: 1 });
    return res.json({
      connected: true,
      configured: true,
      bankId: HINDSIGHT_BANK_ID,
      totalMemories: listRes?.total ?? 0,
      baseUrl: HINDSIGHT_BASE_URL,
    });
  } catch (err: any) {
    console.error('[Hindsight] Status error:', err);
    return res.json({
      connected: false,
      configured: true,
      bankId: HINDSIGHT_BANK_ID,
      totalMemories: 0,
      error: err?.message || 'Failed to connect to Hindsight Cloud',
    });
  }
});

// 2. Retain: Store a newly resolved incident into Hindsight memory
app.post('/api/hindsight/retain', async (req, res) => {
  if (!hindsightClient) {
    return res.status(500).json({ error: 'Hindsight client is not initialized' });
  }

  const { content, context, tags, metadata, documentId, timestamp, skipIfExists } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Missing content parameter for retain' });
  }

  try {
    // If skipIfExists is requested, verify if this documentId is already present
    if (skipIfExists && documentId) {
      try {
        const existingDoc = await hindsightClient.getDocument(HINDSIGHT_BANK_ID, documentId);
        if (existingDoc && existingDoc.id) {
          console.log(`[Hindsight] Skipping duplicate document "${documentId}" in bank "${HINDSIGHT_BANK_ID}"`);
          return res.json({
            success: true,
            skipped: true,
            documentId,
            message: `Document "${documentId}" already exists in bank "${HINDSIGHT_BANK_ID}". Retain skipped.`,
          });
        }
      } catch (_e) {
        // Document doesn't exist yet, continue with retention
      }
    }

    console.log(`[Hindsight] Retaining memory to bank "${HINDSIGHT_BANK_ID}" (doc: ${documentId || 'auto'})...`);
    const retainRes = await hindsightClient.retain(HINDSIGHT_BANK_ID, content, {
      context: context || 'SRE incident resolution and root cause analysis',
      tags: tags || ['incident', 'resolved'],
      metadata: metadata || {},
      documentId: documentId || `doc-${Date.now()}`,
      timestamp: timestamp ? new Date(timestamp) : undefined,
    });

    console.log(`[Hindsight] Memory retained successfully: items_count=${retainRes.items_count}`);
    return res.json({
      success: true,
      bankId: HINDSIGHT_BANK_ID,
      result: retainRes,
    });
  } catch (err: any) {
    console.error('[Hindsight] Retain error:', err);
    const statusCode = err?.statusCode || err?.status || 500;
    const errorMessage = err?.message || 'Failed to retain memory in Hindsight';
    const errorDetails = err?.details || undefined;
    return res.status(statusCode).json({
      error: errorMessage,
      details: errorDetails,
    });
  }
});

// 3. Recall: Semantic & temporal search over the "Incident" bank
app.post('/api/hindsight/recall', async (req, res) => {
  if (!hindsightClient) {
    return res.status(500).json({ error: 'Hindsight client is not initialized' });
  }

  const { query, tags, preferObservations = true } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter for recall' });
  }

  try {
    console.log(`[Hindsight] Recalling from bank "${HINDSIGHT_BANK_ID}" for query: "${query}"...`);
    const recallRes = await hindsightClient.recall(HINDSIGHT_BANK_ID, query, {
      tags: tags && tags.length > 0 ? tags : undefined,
      preferObservations,
    });

    return res.json({
      success: true,
      bankId: HINDSIGHT_BANK_ID,
      query,
      results: recallRes.results || [],
      entities: recallRes.entities || {},
      count: recallRes.results?.length || 0,
    });
  } catch (err: any) {
    console.error('[Hindsight] Recall error:', err);
    return res.status(err?.statusCode || 500).json({
      error: err?.message || 'Failed to recall memories from Hindsight',
      details: err?.details,
    });
  }
});

// 4. List all memories currently stored in the "Incident" bank
app.get('/api/hindsight/memories', async (req, res) => {
  if (!hindsightClient) {
    return res.status(500).json({ error: 'Hindsight client is not initialized' });
  }

  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const documentId = req.query.documentId ? String(req.query.documentId) : undefined;

  try {
    const listRes = await hindsightClient.listMemories(HINDSIGHT_BANK_ID, {
      limit,
      offset,
      documentId,
    });

    return res.json({
      success: true,
      bankId: HINDSIGHT_BANK_ID,
      items: listRes.items || [],
      total: listRes.total || 0,
    });
  } catch (err: any) {
    console.error('[Hindsight] List memories error:', err);
    return res.status(err?.statusCode || 500).json({
      error: err?.message || 'Failed to list memories from Hindsight',
      details: err?.details,
    });
  }
});

// 5. Check which demo incidents are already retained
app.get('/api/hindsight/demo-status', async (_req, res) => {
  if (!hindsightClient) {
    return res.status(500).json({ error: 'Hindsight client is not initialized' });
  }

  try {
    const loadedDocIds = new Set<string>();
    const loadedIncNumbers = new Set<number>();

    // 1. Check official documents list in Hindsight
    try {
      const docsRes = await hindsightClient.listDocuments(HINDSIGHT_BANK_ID, { limit: 100 });
      (docsRes.items || []).forEach((doc: any) => {
        if (doc.id) {
          loadedDocIds.add(doc.id);
          const match = doc.id.match(/doc-demo-inc-(\d+)/);
          if (match) {
            loadedIncNumbers.add(parseInt(match[1], 10));
          }
        }
      });
    } catch (docErr) {
      console.warn('[Hindsight] listDocuments fallback:', docErr);
    }

    // 2. Also check memories list in case any document_id exists there
    try {
      const listRes = await hindsightClient.listMemories(HINDSIGHT_BANK_ID, { limit: 100 });
      (listRes.items || []).forEach((item: any) => {
        if (item.document_id) {
          loadedDocIds.add(item.document_id);
          const match = item.document_id.match(/doc-demo-inc-(\d+)/);
          if (match) {
            loadedIncNumbers.add(parseInt(match[1], 10));
          }
        }
      });
    } catch (memErr) {
      console.warn('[Hindsight] listMemories check:', memErr);
    }

    return res.json({
      success: true,
      bankId: HINDSIGHT_BANK_ID,
      loadedDocIds: Array.from(loadedDocIds),
      loadedIncNumbers: Array.from(loadedIncNumbers).sort((a, b) => a - b),
    });
  } catch (err: any) {
    console.error('[Hindsight] Demo status check error:', err);
    return res.status(err?.statusCode || err?.status || 500).json({
      error: err?.message || 'Failed to check demo status in Hindsight',
    });
  }
});

// ----------------------------------------------------
// Vite Middleware / Static Serving Setup
// ----------------------------------------------------
async function startServer() {
  // Run background seeding if bank is fresh
  seedDefaultIncidentMemories().catch((err) => {
    console.warn('[Hindsight] Initial seed warning:', err?.message);
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] DRSTI platform listening on port ${PORT}`);
  });
}

startServer();
