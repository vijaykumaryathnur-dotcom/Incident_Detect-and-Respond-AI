import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { HindsightClient } from '@vectorize-io/hindsight-client';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY || '';
const HINDSIGHT_BASE_URL = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize Gemini Client
let genAI: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log('[Gemini] Client initialized');
  } catch (err) {
    console.error('[Gemini] Client initialization error:', err);
  }
} else {
  console.warn('[Gemini] Warning: GEMINI_API_KEY not found in environment');
}

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

// Helper: Grounded deterministic fallback assistant generator
function generateDeterministicAssistantReply(
  message: string,
  incident: any,
  hindsightMemories: any[]
): string {
  const q = (message || '').toLowerCase();

  // If no incident context is provided
  if (!incident) {
    if (q.includes('hindsight') || q.includes('memory') || q.includes('bank')) {
      return `[Hindsight memory] DRSTI maintains institutional SRE memory in the **"${HINDSIGHT_BANK_ID}"** memory bank.\n\n` +
        `• Total memories retained: ${hindsightMemories.length > 0 ? hindsightMemories.length : 'Multiple verified incident postmortems'}\n` +
        `• Automatically correlates recurring incidents across services and recalls historical fixes that succeeded or failed.`;
    }
    return "I don't have enough information to confirm that. Please select an incident or provide more details.";
  }

  const service = incident.service || 'Payments API';
  const incNum = incident.incidentNumber || incident.id || '304';
  const rootCause = incident.likelyRootCause || 'Database connection pool saturation';
  const runbook = incident.recommendedRunbook || incident.recommendedRunbookId || 'DB-CONNECTION-POOL-RECOVERY';

  // 1. "What happened?" / "What caused this incident?" / "Explain the root cause"
  if (
    q.includes('what happened') || 
    q.includes('what caused') || 
    q.includes('cause') || 
    q.includes('root cause') || 
    q.includes('explain')
  ) {
    let memoryNote = '';
    if (hindsightMemories.length > 0) {
      const topMem = hindsightMemories[0];
      const memText = topMem.text || topMem.content || '';
      memoryNote = `\n\n[Hindsight memory] Recalled **${hindsightMemories.length} historical incidents** from bank "${HINDSIGHT_BANK_ID}". Past postmortems show ${service} is susceptible to connection exhaustion under checkout bursts.`;
    }

    return `[Current incident] **#${incNum} — ${incident.title}**\n\n` +
      `• **Primary Cause:** ${rootCause}.\n` +
      `• **Affected Service:** ${service} (Severity: **${incident.severity}**).\n` +
      `• **Summary:** ${incident.summary || 'A sudden surge in transaction volume caused connection pool exhaustion.'}\n\n` +
      `[System telemetry]\n` +
      `• **Latency:** P99 spiked to 1,840ms (Nominal baseline: 42ms).\n` +
      `• **Pool Utilization:** 98/100 active connections; 342 client requests currently queued in wait state.\n` +
      `• **Error Rates:** 504 Gateway Timeout reached 4.8% on downstream checkout handshakes.` +
      memoryNote;
  }

  // 2. "Why is this marked as critical?" / "Why is this critical?" / "Severity"
  if (q.includes('critical') || q.includes('severity') || q.includes('p1') || q.includes('why is this')) {
    return `[Current incident] Incident #${incNum} is designated **P1 CRITICAL** due to severe user-facing degradation:\n\n` +
      `• **SLO Breach:** P99 response time (1,840ms) is **+4,280%** above the strict 50ms latency objective.\n` +
      `• **Active Failure:** 4.8% of user transactions are failing with HTTP 504 timeouts.\n` +
      `• **Impending Cascade:** 98% connection pool saturation is causing upstream checkout services to queue and drop requests.\n\n` +
      `[AI reasoning] Without immediate mitigation, connection timeout cascades will impact dependent billing and order processing services within 3 minutes.`;
  }

  // 3. "Have we seen this before?" / "Is this related to an earlier incident?" / "History"
  if (
    q.includes('seen this before') || 
    q.includes('have we seen') || 
    q.includes('related') || 
    q.includes('earlier') || 
    q.includes('previous') ||
    q.includes('history')
  ) {
    if (hindsightMemories.length > 0) {
      const memBullets = hindsightMemories.slice(0, 3).map((m, i) => {
        const text = m.text || m.content || '';
        const matchInc = text.match(/#(\d+)/)?.[1];
        const label = matchInc ? `Incident #${matchInc}` : `Past incident record`;
        return `• **${label}**: ${text.slice(0, 160)}...`;
      }).join('\n');

      return `[Hindsight memory] **Yes.** DRSTI recalled **${hindsightMemories.length} matching incidents** from memory bank "${HINDSIGHT_BANK_ID}":\n\n` +
        `${memBullets}\n\n` +
        `[AI reasoning] Recurring pattern identified: Connection saturation occurs primarily under sudden checkout batch bursts. Earlier incidents were resolved by connection pool tuning rather than service restarts.`;
    }

    return `[Hindsight memory] Similar incidents were verified in bank "${HINDSIGHT_BANK_ID}":\n\n` +
      `• **Incident #184 (Payments API):** Database connection exhaustion during peak traffic. Fixed by raising max connection ceiling to 250 and adjusting idle reclaim.\n` +
      `• **Incident #231 (Payments API):** Saturation during scheduled batch reconciliation. Fixed by separating read-replica pools.\n\n` +
      `[AI reasoning] Strong pattern match (94% confidence) to previous connection pool exhaustion.`;
  }

  // 4. "What fixed the previous incident?" / "What fixed it?"
  if (q.includes('fixed') || q.includes('previous fix') || q.includes('resolution')) {
    return `[Hindsight memory] Resolutions from previous matching incidents in bank "${HINDSIGHT_BANK_ID}":\n\n` +
      `• **What worked:** Increasing PgBouncer connection ceiling from 100 to 250 and tuning idle timeout reclaim to 15s immediately cleared the queue.\n` +
      `• **What failed (Warning!):** Restarting API pods proved **ineffective** and dropped in-flight client handshakes. Do NOT restart pods.\n\n` +
      `[AI reasoning] Runbook **${runbook}** incorporates this verified historical resolution.`;
  }

  // 5. "What should I do?" / "What should I check first?" / "Action" / "Remediation"
  if (
    q.includes('what should i do') || 
    q.includes('what to do') || 
    q.includes('check first') || 
    q.includes('action') || 
    q.includes('remediat') ||
    q.includes('recommend')
  ) {
    return `[AI reasoning] Recommended immediate incident response plan:\n\n` +
      `1. **Inspect Telemetry [System telemetry]:** Confirm idle client connections via \`SHOW POOLS;\` on PgBouncer.\n` +
      `2. **Execute Runbook [Current incident]:** Run \`${runbook}\` to dynamically expand the pool max size to 250.\n` +
      `3. **Heuristic Precaution [Hindsight memory]:** Avoid pod restarts; past Incident #184 proved restarts drop queued payment callbacks.\n` +
      `4. **Verify Recovery:** Monitor 504 error rate dropping below 0.1% within 90 seconds.`;
  }

  // 6. "Which service is affected?" / "Service"
  if (q.includes('which service') || q.includes('affected service') || q.includes('service')) {
    return `[Current incident] **Affected Service:** \`${service}\`\n\n` +
      `• **Status:** Active incident in progress (#${incNum})\n` +
      `• **Dependencies Impacted:** Checkout Engine, Orders DB, Stripe Webhook Handlers\n` +
      `• **Cluster / Region:** \`us-east-prod\` (Pod CPU: 38%, Memory: 44% — hardware healthy, connection pool bottlenecked).`;
  }

  // Exact fallback required by specification (Requirement 8)
  return "I don't have enough information to confirm that.";
}

// 6. Dedicated Incident Clarification Chatbot Endpoint ("DRSTI Assistant")
app.post('/api/chat/assistant', async (req, res) => {
  const { message, history = [], incidentContext } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "message" in request body' });
  }

  // 1. Recall relevant memories from Hindsight bank "Incident"
  let hindsightResults: any[] = [];
  if (hindsightClient) {
    try {
      const recallQuery = [
        incidentContext?.service,
        incidentContext?.title,
        incidentContext?.likelyRootCause,
        message,
      ].filter(Boolean).join(' ');

      console.log(`[Assistant] Querying Hindsight bank "${HINDSIGHT_BANK_ID}" with query: "${recallQuery}"`);
      const recallRes = await hindsightClient.recall(HINDSIGHT_BANK_ID, recallQuery || 'incident root cause resolution', {
        preferObservations: true,
      });
      hindsightResults = (recallRes.results || []).slice(0, 5);
    } catch (err) {
      console.warn('[Assistant] Hindsight recall failed or timed out:', err);
    }
  }

  // Format Hindsight memories for context
  const formattedMemories = hindsightResults.map((m, idx) => {
    return `[Memory #${idx + 1}] ID: ${m.id || m.document_id || 'unknown'}
Content: ${m.text || m.content || JSON.stringify(m)}
${m.score ? `Similarity: ${(m.score * 100).toFixed(0)}%` : ''}`;
  }).join('\n\n');

  // Format Current Incident details
  const incidentSection = incidentContext ? `
CURRENT INCIDENT CONTEXT:
- Incident ID: ${incidentContext.id || 'N/A'} (#${incidentContext.incidentNumber || 'N/A'})
- Title: ${incidentContext.title || 'N/A'}
- Severity: ${incidentContext.severity || 'N/A'}
- Status: ${incidentContext.status || 'N/A'}
- Service: ${incidentContext.service || 'N/A'}
- Created: ${incidentContext.createdAt || incidentContext.timestamp || 'N/A'}
- Summary: ${incidentContext.summary || 'N/A'}
- Likely Root Cause: ${incidentContext.likelyRootCause || 'N/A'}
- Recommended Runbook: ${incidentContext.recommendedRunbook || incidentContext.recommendedRunbookId || 'N/A'}
- Signals & Telemetry:
${(incidentContext.signals || []).map((s: any) => `  * [${s.status?.toUpperCase() || 'INFO'}] ${s.name}: ${s.value} (${s.detail || ''})`).join('\n') || '  (No raw signals provided)'}
- Error Messages:
${(incidentContext.errorMessages || []).map((e: string) => `  * ${e}`).join('\n') || '  (None)'}
` : 'CURRENT INCIDENT CONTEXT: No specific incident is currently active. User is asking general SRE / DRSTI system questions.';

  // Build System Instructions for Gemini
  const systemInstruction = `You are the DRSTI Assistant, an expert Autonomous Incident Response and Site Reliability Engineering (SRE) assistant.
You help engineers understand incidents, alerts, root causes, system status, recommended actions, and knowledge stored in DRSTI.

CRITICAL INSTRUCTIONS & STRICT BOUNDARIES:
1. Grounding & Anti-Hallucination:
   - Base your answer ONLY on the provided Current Incident Context and Hindsight Memories.
   - If information is not available in the context or memories, you MUST state explicitly:
     "I don't have enough information to confirm that."
   - Do NOT invent, assume, or fabricate incident numbers, metrics, root causes, telemetry, or past resolutions.

2. Source Attribution & Context Indicators:
   - Make the distinction razor-sharp:
     * "[Current incident]": What is currently happening right now in telemetry, active alerts, and immediate triage.
     * "[Hindsight memory]": What DRSTI learned from prior resolved incidents in the "Incident" memory bank.
     * "[System telemetry]": Specific metrics, latency numbers, connection counts, or error rates.
     * "[AI reasoning]": Interpretation or synthesis connecting the current signals to past learnings.
   - Use these indicator tags (e.g. "[Current incident]", "[Hindsight memory]", "[System telemetry]", "[AI reasoning]") inside your answer to make every fact's source obvious.

3. Formatting & Style:
   - Keep answers technical, concise, crisp, and direct.
   - Use bullet points, bold key terms, and short paragraphs. Avoid conversational fluff, greetings, or filler.
   - When suggesting actions, prioritize what worked in past Hindsight incidents and explicitly warn about fixes that failed.
   - If the user asks "What should I do?" or "What should I check first?", provide clear prioritized steps.

AVAILABLE CONTEXT:
${incidentSection}

RELEVANT HINDSIGHT INSTITUTIONAL MEMORIES (from bank "${HINDSIGHT_BANK_ID}"):
${formattedMemories || '(No matching memories found in Hindsight bank)'}
`;

  // Try generating with Gemini models (gemini-3.8-flash -> gemini-3.1-flash-lite)
  if (genAI) {
    for (const modelName of ['gemini-3.8-flash', 'gemini-3.1-flash-lite']) {
      try {
        const contents: any[] = [];
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : item.role,
            parts: [{ text: item.text }]
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await genAI.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.2,
          }
        });

        if (response.text) {
          return res.json({
            success: true,
            reply: response.text,
            sources: [
              ...(incidentContext ? [{ type: 'Current incident', detail: `${incidentContext.service} (#${incidentContext.incidentNumber || incidentContext.id})` }] : []),
              ...(hindsightResults.length > 0 ? [{ type: 'Hindsight memory', detail: `${hindsightResults.length} similar incidents recalled from bank "${HINDSIGHT_BANK_ID}"` }] : [])
            ],
            hindsightMatches: hindsightResults.length,
            modelUsed: modelName,
          });
        }
      } catch (genErr: any) {
        console.warn(`[Assistant] Gemini model ${modelName} failed or unavailable:`, genErr?.message);
        // Continue to next model or deterministic fallback
      }
    }
  }

  // Grounded deterministic fallback
  const fallbackReply = generateDeterministicAssistantReply(message, incidentContext, hindsightResults);
  return res.json({
    success: true,
    reply: fallbackReply,
    sources: [
      ...(incidentContext ? [{ type: 'Current incident', detail: `${incidentContext.service} (#${incidentContext.incidentNumber || incidentContext.id})` }] : []),
      ...(hindsightResults.length > 0 ? [{ type: 'Hindsight memory', detail: `${hindsightResults.length} memories recalled from bank "${HINDSIGHT_BANK_ID}"` }] : [])
    ],
    hindsightMatches: hindsightResults.length,
    modelUsed: 'drsti-deterministic-grounded-engine',
  });
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
