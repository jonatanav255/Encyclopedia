import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'data',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'Why are parameterized queries safer than string concatenation?',
      answer:
        'With concatenation, user input becomes part of the SQL string — the database parses it as code, not data. `\'; DROP TABLE users; --` is interpreted literally. Parameterized queries send the SQL and the parameter values **separately**; the database compiles the SQL once and substitutes the values without re-parsing. Injection is structurally impossible.\n\n```js\ndb.query("SELECT * FROM users WHERE email = $1", [email]);\n```',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between INNER JOIN and LEFT JOIN?',
      answer:
        '**INNER JOIN** returns rows where the join condition matches in both tables. Users without posts disappear from the result.\n\n**LEFT JOIN** returns all rows from the left table; columns from the right are NULL where no match exists. Use when you want "everything on the left, plus whatever matches on the right."',
    },
    {
      level: 'junior',
      question: 'Why is `NULL = NULL` not true?',
      answer:
        'In SQL, NULL means "unknown." Comparing two unknowns yields unknown — which evaluates as neither true nor false. Use `IS NULL` / `IS NOT NULL` for null tests. `COALESCE(col, default)` returns the first non-null value if you want a default.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'Why is `OFFSET` pagination a bad idea for large tables?',
      answer:
        '`OFFSET 1000` makes the database **walk past** 1000 rows before returning results — it doesn\'t skip the work, it just discards the rows. Page 100 is slow; page 1000 is unusable. Worse, if rows are inserted during pagination, users see duplicates / skips.\n\nUse **cursor pagination** instead: encode the last-seen row\'s sort keys (e.g., `(created_at, id)`) and filter `WHERE (created_at, id) < (last_created_at, last_id)`. Constant-time regardless of page depth, and stable under concurrent writes.',
    },
    {
      level: 'mid',
      question: 'What\'s the N+1 query problem, and how do you fix it?',
      answer:
        'Fetching a list of N items, then issuing one query per item to load its related data — 1 + N queries total. For 50 posts each needing their author, that\'s 51 round trips.\n\nFixes:\n\n- **JOIN** when the result is row-aligned: `SELECT p.*, u.* FROM posts p JOIN users u ON u.id = p.author_id`.\n- **Batch fetch**: collect all author IDs, fetch in one query (`WHERE id = ANY($1)`), build a `Map`, attach to posts.\n- **DataLoader** library batches per-tick automatically (designed for GraphQL but useful anywhere).',
    },
    {
      level: 'mid',
      question: 'Why use a connection pool, and what happens if you size it wrong?',
      answer:
        'Each Postgres connection costs ~10MB RAM (it forks a process) and ~10-50ms to establish (TCP + TLS + auth). Without a pool, every request pays this cost.\n\nWrong sizes:\n\n- **Too small**: requests queue, latency spikes, eventually `connectionTimeoutMillis` errors.\n- **Too large**: Postgres hits `max_connections`, refuses new connections; the DB itself spends time context-switching between many backend processes.\n\nFor most Node services on a managed Postgres, `max: 10` per process is reasonable. Multiply by number of process replicas to know your total — keep it below Postgres\'s `max_connections` with headroom.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between `dependencies` and `devDependencies`?',
      answer:
        '**`dependencies`** are needed at runtime — they ship with your service. Express, the DB driver, validation libraries.\n\n**`devDependencies`** are needed only for development/build — TypeScript, vitest, eslint. Consumers of your library don\'t install them.\n\nIn production Docker images, run `pnpm install --prod` to skip devDependencies, shrinking the image by hundreds of MB.',
    },
    {
      level: 'mid',
      question: 'When does an index NOT help a query?',
      answer:
        'Common reasons:\n\n1. **Low cardinality** — `WHERE active = true` where half the rows match. The planner picks a sequential scan because the index isn\'t selective.\n2. **Function on the column** — `WHERE lower(email) = ...` doesn\'t use a normal `email` index. Needs an expression index on `lower(email)`.\n3. **`LIKE \'%term%\'`** — leading wildcard prevents B-tree use. Trigram (`pg_trgm`) GIN indexes can help.\n4. **Wrong column order** in composite indexes — `(created_at, author_id)` doesn\'t help `WHERE author_id = ...` alone.\n5. **Statistics stale** — run `ANALYZE` so the planner has accurate row estimates.\n\nUse `EXPLAIN ANALYZE` to confirm whether the index is being used.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Two requests both decrement a balance. How do you prevent a lost update?',
      answer:
        'Three approaches, in order of preference:\n\n1. **Atomic update** — `UPDATE accounts SET balance = balance - $1 WHERE id = $2`. The database does the arithmetic; no read-then-write race.\n2. **Row-level locking** — `SELECT ... FOR UPDATE` inside a transaction. Subsequent reads/writes wait until you commit.\n3. **Optimistic locking** — add a `version` column. `UPDATE ... SET balance = $1, version = version + 1 WHERE id = $2 AND version = $3`. If 0 rows affected, someone else won — retry.\n\nOption 1 is best when feasible. Use locks for "I need to read the current value and make a decision before writing."',
    },
    {
      level: 'senior',
      question: 'Why is the outbox pattern needed for cross-system consistency?',
      answer:
        'You can\'t put a DB write and a queue enqueue in the same atomic transaction — they\'re different systems. Without the outbox pattern:\n\n- DB write succeeds, then process crashes before enqueue → the event is lost.\n- Enqueue succeeds, then DB write fails → the event was sent for work that doesn\'t exist.\n\nOutbox: in the same DB transaction, write an `outbox` row alongside the business write. A separate worker reads new outbox rows and enqueues them. At-least-once delivery (workers may retry → handlers must be idempotent). Eventual consistency, but no lost events. The standard pattern for "atomic DB write + queued side effect."',
    },
    {
      level: 'senior',
      question: 'Your Redis-backed rate limiter is letting more requests through than expected after the app autoscaled. What happened?',
      answer:
        'Almost always one of two things:\n\n1. **The pool size scaled but the rate-limit store didn\'t.** Each Node process talks to the same Redis, which is good — limits should still be correct. If they\'re wrong, check that all processes are pointing at the same Redis (and same key prefix).\n2. **`trust proxy` is misconfigured.** `req.ip` is the proxy IP, not the client IP — so all requests share a key, the limit applies collectively, and you under-throttle individual abusers. Set `app.set("trust proxy", N)` correctly.\n\nLess likely but worth checking: time drift between Node and Redis (window calculations are off), or a key collision with another service sharing the Redis.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Your Postgres p99 query latency spikes from 5ms to 800ms once a week. How do you diagnose it?',
      answer:
        '**Look at lock waits first** — `pg_stat_activity` filtered by `wait_event_type = \'Lock\'` during the spike. Long transactions blocking others are the most common cause; a weekly batch job that takes locks for minutes will manifest exactly this way.\n\n**Check `pg_stat_statements`** for top queries by total time over the spike window — sometimes one query suddenly chooses a bad plan after a stats update.\n\n**Autovacuum lag**: if a table is heavily updated and vacuum is behind, indexes bloat → planner falls back to seq scans. `pg_stat_user_tables` shows last vacuum time and dead tuple counts.\n\n**Connection pool saturation**: if every connection is busy waiting on the locked transaction, new queries pile up. The latency *looks* like Postgres slowed down; really it\'s queuing on the application side.\n\n**Network / IO**: check host metrics during the spike. Could be a backup, disk-bound scan, or a noisy neighbor on shared infra (RDS).\n\n**Fix path**: kill the long transaction (`pg_terminate_backend`), find the source via `application_name` and the query in `pg_stat_activity`, refactor to smaller transactions or schedule the batch off-peak. Long-term: set `statement_timeout` and `idle_in_transaction_session_timeout` to bound the blast radius.',
    },
    {
      level: 'staff',
      question: 'Design a cache layer for a high-traffic read-heavy API.',
      answer:
        '**Workload analysis first** — what\'s read 10–100× more than written? Cache those. Don\'t cache uniformly.\n\n**Topology**: Redis cluster in front of the DB, sized for the working set (LFU eviction). Application checks Redis first, falls back to DB on miss, writes back to Redis with a TTL. For very hot keys, a per-process in-memory cache (LRU, 1–10s TTL) cuts Redis round trips.\n\n**Invalidation**: the hard problem. Two patterns:\n- **TTL + best-effort invalidation**: short TTLs (30s–5min). On write, delete the cache key. Tolerates briefly stale reads. Works for "user profile" type data.\n- **Versioned keys**: cache key includes a version (`user:42:v17`). On write, bump the version. Old key remains in cache to expire naturally; readers see fresh data on the new key immediately.\n\n**Stampede prevention**: when a hot key expires, 1000 requests would all rebuild it. Mitigate via probabilistic early refresh (refresh at 80% of TTL with small chance), or single-flight (a Redis lock; one rebuilds, others wait and read).\n\n**Negative caching**: cache "not found" with a shorter TTL to prevent repeated DB hits for bad IDs.\n\n**Observability**: hit ratio per cache layer, latency, evictions, memory pressure. Hit ratio < 95% means you\'re probably caching the wrong things.\n\n**Failure mode**: if Redis is down, fall back to DB and serve directly. Bound concurrency to the DB so a cache outage doesn\'t cause a cascade.',
    },

    // --- additions for new topics ---

    // junior
    {
      level: 'junior',
      question: 'Why is UUID v7 preferred over UUID v4 for database IDs?',
      answer:
        'UUID v4 is fully random — inserts scatter across the B-tree index, hurting cache locality. UUID v7 puts a millisecond timestamp in the high bits, so IDs sort chronologically. New inserts cluster at the right edge of the index; hot pages stay hot. Same uniqueness guarantees, much better insert performance at scale. Postgres 18+ has native `uuidv7()`. In Node, use the `uuid` package (`v7()`) — `crypto.randomUUID()` is still v4 only.',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between MySQL\'s `utf8` and `utf8mb4`?',
      answer:
        'MySQL\'s `utf8` is a 3-byte encoding — it can\'t store 4-byte characters like emoji or some CJK characters. `utf8mb4` is true UTF-8 (up to 4 bytes per character). Always use `utf8mb4` for new tables: `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`. The legacy `utf8` name exists only for backwards compat; it\'s a footgun in 2026.',
    },

    // mid
    {
      level: 'mid',
      question: 'How do you implement a distributed lock with Redis?',
      answer:
        '`SET key value NX EX seconds` atomically claims the lock (set-if-not-exists + TTL). To release safely, **check ownership first** via a Lua script: `if redis.call(\'GET\', KEYS[1]) == ARGV[1] then return redis.call(\'DEL\', KEYS[1]) end`. Otherwise you might delete someone else\'s lock if yours expired mid-work. For multi-Redis safety, **Redlock** acquires from a quorum — but Martin Kleppmann\'s critique is worth reading; combine locks with idempotency keys for mission-critical correctness.',
    },
    {
      level: 'mid',
      question: 'Pick an ORM for a new TypeScript-first Node service. Why?',
      answer:
        '**Prisma** if you want the best DX — declarative `.prisma` schema, generated types, built-in migrations, but ships a Rust engine binary (cold-start cost on serverless). **Drizzle** if you want SQL-close + edge-runtime compatible (TS-defined schema, in-process, no codegen step). **Kysely** if you prefer hand-written SQL with full type safety (no relation traversal, you write joins). For most teams in 2026, Prisma or Drizzle. Reach for Kysely when you want SQL-shaped types and the ORM relation magic feels heavy.',
    },

    // senior
    {
      level: 'senior',
      question: 'What\'s wrong with using `SELECT ... FOR UPDATE` to prevent lost updates?',
      answer:
        'It works, but it\'s often the wrong tool. The pessimistic-lock pattern (`BEGIN; SELECT ... FOR UPDATE; check; UPDATE; COMMIT`) holds a row lock for the entire transaction — under concurrency, callers queue. The better pattern: **atomic UPDATE with the predicate inline** — `UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING balance`. The DB enforces "balance >= amount" without holding a row lock for read-then-write. Rowcount 0 = insufficient funds. Faster, simpler, correct. Save `FOR UPDATE` for cases where the predicate can\'t be expressed inline.',
    },
    {
      level: 'senior',
      question: 'Your distributed system needs a global ID. Compare Snowflake and UUID v7.',
      answer:
        '**Snowflake**: 64-bit integer = 41-bit timestamp + 10-bit machine ID + 12-bit sequence. Smaller storage, fits in `bigint`, sortable by time. Requires a machine ID assignment scheme.\n\n**UUID v7**: 128-bit, sortable, no coordination needed (the high bits are timestamp + the rest is random).\n\nFor most Node apps, UUID v7 wins on simplicity — no machine IDs to manage, native support in Postgres 18+. For very high-throughput systems where 8 bytes vs 16 bytes per row matters (a billion-row table), Snowflake. Otherwise UUID v7.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design caching for a read-heavy API with strict consistency on writes.',
      answer:
        '**Two-tier cache**: per-process LRU (1–5s TTL) for hottest keys + Redis cluster for shared cache. App reads LRU → Redis → DB. Writes go to DB first, then invalidate the cache key. The brief window where readers see stale (< LRU TTL) is the consistency trade-off you accept for performance.\n\n**Stricter alternative**: **versioned keys**. Each entity has a `version` counter; cache key includes it (`user:42:v17`). On write, atomically bump the version in DB and let the old cache key expire naturally. Readers always look up `current_version`, then cache key for that version → no stale reads possible.\n\n**Strictest** (read-your-writes): for the user who just wrote, route their reads to the primary (or skip cache for a short window after a write — set a per-user "recent write" timestamp in their session). Other users tolerate eventual consistency.\n\n**Stampede protection**: probabilistic early refresh (refresh at 80% of TTL with small chance) or single-flight Redis lock (one rebuilds; others wait + read result).\n\n**Failure**: if Redis is down, serve from DB with a concurrency cap (so DB doesn\'t collapse under cache-miss load).\n\n**Observability**: hit ratio per layer, miss latency, stampede counts, memory eviction rate.',
    },

    // --- additional questions ---

    // junior
    {
      level: 'junior',
      question: 'What\'s the difference between `WHERE` and `HAVING` in SQL?',
      answer:
        '`WHERE` filters rows **before** aggregation. `HAVING` filters groups **after** aggregation (so it can use aggregate functions like `COUNT`, `SUM`). Example: `SELECT country, COUNT(*) FROM users WHERE active = true GROUP BY country HAVING COUNT(*) > 100` — `WHERE active = true` excludes inactive users; `HAVING COUNT(*) > 100` only shows countries with > 100 active users.',
    },

    // mid
    {
      level: 'mid',
      question: 'You\'re joining two large tables and the query is slow. What\'s the first thing to check?',
      answer:
        '`EXPLAIN ANALYZE` the query (Postgres) or `EXPLAIN` (MySQL). Look for: **sequential scans** on large tables (need an index?), **nested loop joins** where a hash join would be faster (missing index on the join column?), **estimated vs actual rows** way off (need `ANALYZE` to refresh statistics?). The single most common fix: add an index on the foreign key column you\'re joining on. Without it, Postgres scans the entire table for each join.',
    },
    {
      level: 'mid',
      question: 'Why is `SELECT *` discouraged in production code?',
      answer:
        'Three reasons. (1) **Schema fragility**: adding a column changes what your query returns; consumer code that destructures rows breaks silently. (2) **Network and memory**: you pull bytes for columns you don\'t use — wasteful on wide tables. (3) **Index-only scans defeated**: if your query selects only indexed columns, Postgres can answer from the index without touching the table; `SELECT *` always hits the table. List columns explicitly: `SELECT id, name, email FROM users`. Boring; correct.',
    },

    // senior
    {
      level: 'senior',
      question: 'When would you reach for a NoSQL database over Postgres?',
      answer:
        'Specific use cases, not "we need NoSQL because it scales." (1) **Document stores** (MongoDB, Firestore) when your data is genuinely document-shaped and the schema varies per record. (2) **Wide-column** (Cassandra, ScyllaDB) for write-heavy workloads at huge scale with simple queries — time-series, event logs. (3) **Key-value** (Redis, DynamoDB) for low-latency lookups on known keys. (4) **Graph** (Neo4j) for graph-traversal queries that would be N joins in SQL. For 90% of CRUD apps, Postgres with JSONB columns covers the "I need flexible schemas" case without giving up transactions, joins, and SQL.',
    },

    // staff
    {
      level: 'staff',
      question: 'A 2TB Postgres database needs zero-downtime migration to add a non-null column with a default. Walk through.',
      answer:
        '**Don\'t** run `ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT \'pending\'` blindly. Pre-Postgres 11, this rewrote every row holding an exclusive lock — hours of downtime.\n\n**Postgres 11+** has a fast path: adding a NOT NULL column with a *constant* default is instant (uses the default lazily). Check first: on PG 11+, this is metadata-only.\n\n**For non-constant defaults or older PG**, multi-step:\n\n1. **Add nullable column**: `ALTER TABLE users ADD COLUMN status TEXT`. Fast — metadata only.\n2. **Backfill in batches**: `UPDATE users SET status = \'pending\' WHERE status IS NULL AND id BETWEEN 1 AND 10000`. Loop with sleep. Avoid one giant transaction.\n3. **Code deploys** to write status on all new rows.\n4. **Add NOT NULL via CHECK constraint**: `ALTER TABLE users ADD CONSTRAINT users_status_not_null CHECK (status IS NOT NULL) NOT VALID`. Instant.\n5. **Validate in background**: `ALTER TABLE users VALIDATE CONSTRAINT users_status_not_null`. Scans table without blocking writes.\n6. **In PG 12+**, once the CHECK is validated, you can promote to a column-level NOT NULL cheaply.\n\n**Monitor**: lock waits (`pg_stat_activity` with `wait_event_type = Lock`), replication lag (the backfill generates WAL).\n\n**For index creation**: always `CREATE INDEX CONCURRENTLY` — builds without exclusive lock.\n\n**Reversibility**: rollback plan at each step. Test on a production-sized replica first.',
    },
  ],
};
