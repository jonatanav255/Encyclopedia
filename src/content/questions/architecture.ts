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
  ],
};
