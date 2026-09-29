# AI Incident Response: an on-call agent that remembers

> Incidents happen. Your AI remembers.

An incident response agent for SRE teams, built for **HackwithHyderabad 3.0** on top of **Hindsight** (Vectorize) agent memory. Every resolved incident is stored as long-term memory. When a new incident arrives, the agent recalls what happened before, what fixed it, and what did *not* work, so each outage is easier than the last.

- **Live demo:** `<add your AI Studio / published app link>`
- **Demo video:** `<add your video link>`
- **Team:** `<names>`

---

## The problem

When production breaks, on-call engineers dig through old Slack threads, stale wikis and outdated runbooks to find out whether this has happened before. Context lives in people's heads and is lost when they leave. Standard LLM assistants do not help much, because they start from a blank context every session.

## The solution

An agent with persistent memory. It learns from every incident and postmortem:

1. **An incident arrives** (alert plus symptoms).
2. **The agent recalls** similar past incidents from Hindsight.
3. **It recommends a fix**, prioritizing what worked before and warning about what failed before.
4. **The engineer resolves the incident**, and the outcome is saved back to memory.
5. **The next similar incident is handled with that knowledge.**

---

## How Hindsight is used (the core of the project)

All memory lives in one Hindsight memory bank called **`Incident`**.

| Hindsight operation | Where it is used in the app |
|---|---|
| **Retain** | Each resolved incident is stored as its own document with a unique `document_id` (for example `doc-demo-inc-101`), plus tags (service, root cause, `resolved`) and metadata (`date`, `service`, `incidentNumber`). The "Retain to Hindsight" drawer and the "Save to Hindsight" button on the Postmortems page write new memories. |
| **Recall** | The Memory page and the AI Investigator search the bank for incidents similar to the current one (symptoms, service, error text). Results show the recalled incident, its root cause, the fix that worked and the extracted entities. |
| **Automatic extraction** | Hindsight extracts entities (services, components, incident IDs) and links memories together. Related incidents connect through shared entities such as *Payments API* and *PgBouncer*. |
| **Observations** | Hindsight consolidates repeated facts into learned patterns, which are shown as "Learned pattern" on recall results. |

### The learning loop

```
Incident -> Recall from Hindsight -> Recommended fix -> Resolution
    ^                                                       |
    +---------- Retain outcome + postmortem lesson <--------+
```

Example: a postmortem for Payments API incident #304 is saved to Hindsight. On the next recall for Payments API database problems, that lesson (scale the PgBouncer pool instead of restarting pods) comes back with the earlier PgBouncer incidents.

### Bank configuration

The bank has retain, observation and reflect missions set so that memory stays focused on incident data: affected service, symptoms, root cause, the fix that worked, and fixes that failed.

---

## Seed data

To make recall meaningful, the app includes a **"Load Demo Data"** button that retains 12 realistic incidents (checkout-api Redis eviction, payments-api PgBouncer pool exhaustion, auth-service JWT key rotation, search-api memory leak, notification-service Kafka lag, orders-db missing index, api-gateway bad rate limit config, and more). Several include **failed fixes** (for example, "scaling up the database did not help"), so the agent can warn engineers away from things that already failed.

Incidents #112 and #172 are deliberate repeats (PgBouncer pool exhaustion on payments-api) to show memory paying off on a recurring issue.

---

## Tech stack

- **Memory:** Hindsight Cloud (Vectorize)
- **LLM:** Google Gemini (via Google AI Studio)
- **Frontend:** React (generated in Google AI Studio)
- **Secrets:** API keys are stored as environment secrets and are not committed to the repository

## Running it

1. Clone the repository.
2. Create a Hindsight Cloud account and an API key, then create a memory bank named `Incident`.
3. Set the environment variables:
   ```
   GEMINI_API_KEY=your_gemini_key
   HINDSIGHT_API_KEY=your_hindsight_key
   ```
4. Install and start:
   ```
   npm install
   npm run dev
   ```
5. Open the app, go to **Memory (Hindsight)**, and click **Load Demo Data**.
6. Search for `payments-api database connection problem` and see the past incidents come back.

---

## Suggested demo flow

1. Open **Memory (Hindsight)**, load the demo data, and show the bank filling up in the Hindsight dashboard.
2. Search `payments-api database connection problem`. The related PgBouncer incidents are recalled, with the fix that worked.
3. Open the **Postmortems** page and click **Save to Hindsight** to store the new lesson.
4. Recall again and show the new lesson appear.
5. Show the Hindsight **Entities** view, where incidents, services and components are linked.

---

## What is real and what is simulated

We want to be upfront about this:

- **Real:** storing memories, recalling memories, entity extraction, learned patterns, the memory count, and the postmortem save-and-recall loop. All of these run against a live Hindsight bank.
- **Simulated / demo data:** the alert feed and live incident list, service health numbers (latency, uptime, error rate), and runbook step execution. Runbook commands are shown for illustration and are **not executed** against real infrastructure.

## Limitations and next steps

- Connect real alert sources (PagerDuty, Datadog, Prometheus) instead of simulated incidents.
- Execute runbook steps with human approval.
- Add a "memory on / memory off" comparison view to show the difference in answer quality.
- Use Hindsight mental models to summarize recurring failure patterns per service.

## Acknowledgements

Built for HackwithHyderabad 3.0 using [Hindsight](https://hindsight.vectorize.io) by Vectorize.
