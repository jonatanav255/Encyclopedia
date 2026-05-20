import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'architecture',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'What does it mean for an API to be "RESTful"?',
      answer:
        'In practical terms: URLs identify **resources** (`/users`, `/users/42`), HTTP **methods** describe actions (`GET`, `POST`, `PUT`, `DELETE`). Same URL, different methods do different things. Status codes are used correctly (2xx success, 4xx client error, 5xx server error).\n\nThe academic definition is stricter (HATEOAS, statelessness, layered system) but almost no APIs follow it fully. What matters in practice: predictable, method-correct, status-code-correct, plural resource URLs.',
    },
    {
      level: 'junior',
      question: 'Why is `POST /users/createNew` a bad URL?',
      answer:
        'The action is in the URL instead of the HTTP method. The whole point of HTTP verbs is to express action; using POST + an action verb is redundant. The right shape: `POST /users` (POST already means "create"; `users` is the collection).\n\nSame for `GET /getUser?id=42` (should be `GET /users/42`) and `POST /deleteUser` (should be `DELETE /users/42`). HTTP gives you the verb; let it.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'When would you use cursor pagination over offset pagination?',
      answer:
        'Almost always, for any list that might grow. Cursor pagination encodes "the row after this point" — the database seeks directly to it via index, constant-time regardless of page depth. Offset pagination makes the DB walk past N rows on every page, getting slower as users scroll. It also produces duplicates/skips when rows are inserted during pagination.\n\nUse offset only for small, bounded result sets where page numbers are a UX requirement. Otherwise: cursor. Tables grow.',
    },
    {
      level: 'mid',
      question: 'Why do payment APIs require an `Idempotency-Key` header?',
      answer:
        'Networks fail; clients retry. Without idempotency, a retry of "charge this card $100" might charge twice. The Idempotency-Key is a client-generated UUID per logical operation. The server stores the result keyed by the value; a retry with the same key returns the original result without re-executing.\n\nStripe pioneered this pattern. Standard in any API where retries can\'t be made naturally idempotent (most POST endpoints).',
    },
    {
      level: 'mid',
      question: 'Webhook handlers should respond fast. Why?',
      answer:
        'The sender has a timeout (Stripe: 30s, GitHub: ~10s). If you take longer, they retry — sending the *same event* again, which you must dedupe, while the original is still running. Pile-up.\n\nThe pattern: in the HTTP handler, **verify signature → enqueue → respond 200**. Do the actual work in a background worker. The sender stops retrying as soon as you ack. The worker can take as long as it needs.',
    },
    {
      level: 'mid',
      question: 'Why prefer URL versioning (`/v1/users`) over header versioning?',
      answer:
        'Pragmatic reasons: **visible in logs/traces/dashboards**, **easy to route** at the proxy (different versions can hit different services), **easy to deprecate** (drop traffic to `/v1` at the proxy). Header-based is "more RESTful" by some readings but operationally fiddly.\n\nFor most APIs, URL versioning is the default. Use header versioning when there\'s a specific reason — e.g., you want URLs to stay constant across versions for SEO.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Why pair retries with a circuit breaker?',
      answer:
        'Retries handle **transient** failures (one packet drop, a brief blip). They make the system robust against noise.\n\nA **circuit breaker** handles **sustained** failures. When a downstream is consistently failing, retrying just amplifies the load — you\'re hammering an already-broken service. The breaker opens after N failures, returning errors immediately for a cooldown window, then probes to see if it\'s recovered.\n\nTogether: retries smooth out noise, the breaker prevents amplifying real outages. Without the breaker, retries can turn one downstream\'s 5-minute hiccup into your own service\'s 30-minute outage as retry storms exhaust resources.',
    },
    {
      level: 'senior',
      question: 'How would you build "schedule an email for 24 hours from now"?',
      answer:
        '**Don\'t** use `setTimeout(send, 24 * 60 * 60 * 1000)`. Process restarts lose the timer. Cluster autoscale leaves orphaned timers. Single process means single point of failure.\n\nUse a job queue with delayed jobs:\n\n```js\nawait queue.add("send-email", { userId }, {\n  delay: 24 * 60 * 60 * 1000,\n  attempts: 3,\n  backoff: { type: "exponential", delay: 1000 },\n});\n```\n\nBullMQ persists to Redis; the job survives restarts and is picked up by whichever worker is available. Pair with idempotency at the handler so retries don\'t send duplicate emails.',
    },
    {
      level: 'senior',
      question: 'Why does "deploying != releasing" matter, and how do feature flags help?',
      answer:
        'The riskiest moment in any deploy is when the new code path first runs for a user. If deploy and release are the same moment, you can\'t test in production safely.\n\nFlags let you ship code disabled, then:\n\n1. Enable for internal users — verify it works against real data.\n2. Enable for 1% of users — watch metrics for impact.\n3. Ramp gradually to 100% based on telemetry.\n4. If something\'s wrong, flip back instantly — no rollback deploy needed.\n\nDeploy becomes mechanical; release becomes a measurable, reversible decision. This is one of the single biggest reliability investments a team can make.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Design an event-driven architecture for a system that ingests 50k events/sec.',
      answer:
        '**Front the system with a partitioned log** (Kafka, Kinesis, RedPanda) sized for retention + replay (typically 7–30 days). Partition by entity ID (`userId`, `orderId`) — keeps per-entity ordering and enables parallel consumers.\n\n**Producers**: durable writes with at-least-once semantics; use the partition key. Buffer in-memory with backpressure to the upstream HTTP layer (return 429 if Kafka publish lags).\n\n**Consumers**: idempotent handlers, processing offsets committed only after side-effects succeed. For exactly-once semantics, use the outbox pattern + dedupe table keyed by `(event_id, consumer_group)`.\n\n**Stateful processing**: Flink or a Kafka-Streams equivalent for joins/aggregations. Stateless: just consumer groups with auto-scaling.\n\n**Schemas**: Avro / Protobuf in a registry. All breaking changes go through versioned topics or backward-compat fields. Never `JSON.parse` raw without schema.\n\n**Failure handling**: poison-message → dead-letter topic; retry with exponential backoff for transient. Alert on DLQ depth.\n\n**Observability**: lag per consumer group is the most important metric. End-to-end latency (event published → side effect applied) via trace IDs propagated through the event payload.\n\n**Cost**: 50k/s × ~1KB = ~50MB/s sustained → ~4TB/day of retention at 7 days = ~30TB. Plan partition count for parallelism (rule of thumb: 10–50 MB/s per partition).',
    },
    {
      level: 'staff',
      question: 'How do you decide between a monolith, modular monolith, and microservices?',
      answer:
        '**Start with a monolith.** One repo, one deploy, one database. Refactor freely. Microservices add network boundaries (latency, retries, eventual consistency, distributed tracing) before you know where the real boundaries are.\n\n**Move to a modular monolith** when the codebase has 10+ engineers stepping on each other. Same deploy, but enforced internal boundaries — one module owns its tables, others go through its exported API. No new infra to operate.\n\n**Extract a microservice** only when one of:\n- Different scaling needs (the embedding service needs GPUs; the rest is CPU).\n- Different reliability/SLO (payments must stay up while marketing experiments deploy weekly).\n- Independent ownership at the team level — the friction of cross-team coordination outweighs the friction of network calls.\n- Technology divergence (Python ML stack vs Node API).\n\n**Anti-pattern**: extracting microservices because "it\'s best practice." Cost: distributed transactions, eventual consistency, deploys that need orchestration, observability across N services, an order-of-magnitude more failure modes. Pay this cost only when the wins exceed it.\n\nThe modular monolith is undersold — most "we need microservices" situations are actually "we need module boundaries."',
    },

    // --- additions for new topics ---

    // junior
    {
      level: 'junior',
      question: 'What\'s the difference between a work queue and pub/sub?',
      answer:
        '**Work queue (point-to-point)**: each message goes to **exactly one** worker. Scale workers horizontally to process faster. Use for: send email, process upload, generate PDF.\n\n**Pub/sub (fanout)**: each message goes to **every subscriber**. Each consumer is independent. Use for: "user signed up" notifying analytics, billing, mailing list, all from one event.\n\nBullMQ does work queues. Redis Pub/Sub or NATS does fanout. Kafka and RabbitMQ can do both via consumer groups / topic exchanges.',
    },

    // mid
    {
      level: 'mid',
      question: 'When would you reach for gRPC instead of REST?',
      answer:
        'Internal **high-volume service-to-service** RPCs. Wins: strongly-typed `.proto` contracts shared across languages, HTTP/2 multiplexing, smaller wire size (Protobuf vs JSON ≈ 50–80% smaller), streaming in either direction. Skip for browser-facing APIs (browsers can\'t speak gRPC natively — use REST or Connect-RPC) or for tiny services where REST\'s familiarity wins. Pair with `buf.build` for schema management + breaking-change detection in CI.',
    },
    {
      level: 'mid',
      question: 'What\'s the outbox pattern, and why does it matter?',
      answer:
        'For "atomic DB write + send event," the outbox pattern writes to your business table and an `outbox` table **in the same transaction**. A separate worker tails the outbox and publishes to the broker. Either both happen (transaction commits) or neither (rollback) — you never have "DB updated but downstream never notified" or "event sent for work that didn\'t commit." Standard solution for cross-system consistency without distributed transactions. CDC (Debezium) is the streaming variant.',
    },

    // senior
    {
      level: 'senior',
      question: 'How do you handle eventual consistency in event-driven architectures?',
      answer:
        '**At-least-once delivery** is the default; consumers must be idempotent (dedup by event ID in Redis or DB). **Reasonable staleness windows** in the UI — "your settings will update within a few seconds" beats blocking the write. **Sagas** for multi-step workflows: each step has a compensating action; failure triggers rollback. **Read-your-writes**: route the originating user\'s reads through the primary (or stick them to a "fresh" replica) for a short window. **Observability**: trace event flow across services with W3C `traceparent` propagation. The big mental shift: design for eventual consistency from day one, not as a remediation later.',
    },

    // staff
    {
      level: 'staff',
      question: 'You\'re choosing between choreography and orchestration for a multi-step workflow. Trade-offs?',
      answer:
        '**Choreography**: each service listens for events, acts, publishes new events. "Order placed" → Inventory reserves → publishes "Inventory reserved" → Payment charges → publishes "Payment succeeded" → Shipping ships. No central coordinator.\n\n**Pros**: decentralized, services don\'t know about each other, easy to add a new step.\n**Cons**: the workflow is implicit. Tracing it requires reading many services. Compensations (rollback when later steps fail) get tangled — who reverses what?\n\n**Orchestration**: a central coordinator drives the flow. Like a state machine with explicit transitions. Tools: **Temporal**, **AWS Step Functions**, **Camunda**.\n\n**Pros**: the workflow is explicit, debuggable, testable. Rollback logic lives in one place. Long-running workflows (days, weeks) handled correctly.\n**Cons**: the coordinator is a coupling point and an operational concern.\n\n**Honest recommendation**: orchestration for anything with > 3 steps, money, or rollback semantics. Choreography for simple "fanout to N reactions" without coordination. Most teams start choreographed and migrate to orchestration when they hit a hairy bug or compliance audit.',
    },
  ],
};
