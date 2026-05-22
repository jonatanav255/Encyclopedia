import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'sql',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'What does it mean to say SQL is a "declarative" language?',
      answer:
        'You describe **what** you want, not **how** to get it. `SELECT name FROM users WHERE active = true ORDER BY name LIMIT 50` doesn\'t tell the database to walk a B-tree, use an index, sort in memory, or stop after 50 rows. The **query planner** figures out the access path based on table statistics and indexes. The benefit: SQL has barely changed since the 1980s, but underlying engines have gotten dramatically smarter, and your old queries get faster for free.',
    },
    {
      level: 'junior',
      question: 'Why does a foreign key matter — what would go wrong without one?',
      answer:
        'A foreign key constraint means `posts.author_id` must point at a real row in `users.id`. The database enforces it: you can\'t insert an orphan post, you can\'t delete a user who still has posts (without `ON DELETE CASCADE`). Without it, you rely on application code to maintain integrity — and bugs that *do* create orphans go undetected for months. Whole categories of "we have rows referencing deleted users" bugs become impossible with the constraint declared.',
    },
    {
      level: 'junior',
      question: 'What is the difference between PRIMARY KEY and UNIQUE in SQL?',
      answer:
        'A **PRIMARY KEY** is `UNIQUE + NOT NULL + indexed`, and a table has exactly one. It identifies the row. A **UNIQUE** constraint just requires distinct values; columns can be NULL (multiple NULLs allowed, since `NULL = NULL` is not true), and a table can have many UNIQUE constraints. Use PRIMARY KEY for the identity column (usually `id`), UNIQUE for other "no duplicates" rules like `email` or `(team_id, slug)`.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'Explain ACID using a money-transfer example.',
      answer:
        '`UPDATE accounts SET balance = balance - 100 WHERE id = 1; UPDATE accounts SET balance = balance + 100 WHERE id = 2` inside a transaction.\n\n**A**tomicity — both updates happen or neither does. If the process crashes between them, the first is rolled back.\n\n**C**onsistency — constraints (`CHECK (balance >= 0)`, foreign keys) hold before and after. A transfer that would leave a negative balance is rejected.\n\n**I**solation — concurrent transactions don\'t see each other\'s partial state. Without it, two simultaneous withdrawals might both succeed reading the same starting balance.\n\n**D**urability — once `COMMIT` returns, the change survives a crash. Achieved via write-ahead log + `fsync`.',
    },
    {
      level: 'mid',
      question: 'You\'re picking a SQL database for a new Node service in 2026. What do you pick and why?',
      answer:
        '**Postgres**, almost always. Reasons: rich type system (JSONB defeats most "we need MongoDB" arguments), excellent SQL standards compliance, generous open-source license, mature ecosystem, `RETURNING` in INSERT/UPDATE/DELETE, extensions (PostGIS, pgvector, TimescaleDB) for specialized needs without leaving SQL. Pick MySQL only if you\'re inheriting a stack or need the LAMP-ecosystem familiarity. Pick SQLite for embedded use, tests, or small services with one writer (Litestream / LiteFS extend it further). Pick distributed SQL (Cockroach, Yugabyte, Aurora DSQL) only if you\'ve genuinely outgrown vertical Postgres + read replicas + caching.',
    },
    {
      level: 'mid',
      question: 'What are the four standard SQL isolation levels?',
      answer:
        'Weakest to strongest:\n\n- **Read Uncommitted** — sees uncommitted writes from other transactions (dirty reads).\n- **Read Committed** — Postgres default. No dirty reads, but the same query in the same transaction can return different values (non-repeatable reads).\n- **Repeatable Read** — MySQL/InnoDB default. Within a transaction, the same query returns the same data. Phantom reads (new matching rows appearing) are theoretically possible — Postgres prevents them at this level via snapshot isolation.\n- **Serializable** — strongest. Concurrent transactions execute as if serially. Postgres uses Serializable Snapshot Isolation (SSI), which aborts transactions that would have produced a non-serializable outcome.\n\nMost apps stay on the default. Bump to Serializable when correctness under contention matters and the retry cost is acceptable.',
    },
    {
      level: 'mid',
      question: 'What\'s the execution order of a SELECT clause vs the order you write it?',
      answer:
        'You write FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. But the **logical execution** order is:\n\n1. FROM + JOIN — figure out which rows to consider.\n2. WHERE — filter rows.\n3. GROUP BY — collapse rows into groups.\n4. HAVING — filter groups.\n5. SELECT — compute output columns / aggregates.\n6. ORDER BY — sort.\n7. LIMIT / OFFSET — paginate.\n\nThis is why you can\'t use a `SELECT` alias in `WHERE` (the alias doesn\'t exist yet) but you can in `ORDER BY` (sort happens after select). Knowing this stops a class of "why doesn\'t this work" confusion.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Walk through how you\'d scale a Postgres-backed service from "single instance" to "running at significant scale" without leaving SQL.',
      answer:
        'The path most teams take:\n\n1. **Tune the single instance first.** Add missing indexes. Fix N+1 queries. Tune `work_mem`, `shared_buffers`. Use `EXPLAIN ANALYZE`. Vertical Postgres on modern hardware handles tens of thousands of QPS. Most "we need to scale" problems are missing indexes.\n2. **Add a connection pool** (PgBouncer or app-level). Each PG connection forks a process; without pooling, throughput collapses.\n3. **Add read replicas** for read scaling. Now you have replication lag — route reads from a user back to the primary for a short window after they write, or accept slight staleness.\n4. **Add a Redis cache** for hot reads. Single-digit-ms reads, drops DB load 90%+. Invalidation is the hard part — short TTLs + explicit invalidation on writes covers most cases.\n5. **Partition** big tables by time (or another natural axis). Hypertables via TimescaleDB if it\'s time-series.\n6. **CQRS / derived stores.** Push search to Elasticsearch, analytics to ClickHouse / a warehouse. The OLTP DB stops doing everything.\n7. **Only now consider sharding or distributed SQL.** And only if you\'ve measured that the previous steps aren\'t enough.\n\nMost teams never reach step 7. Vertical + replicas + cache covers more scale than people think.',
    },
    {
      level: 'senior',
      question: 'What\'s the fundamental cost of distributed SQL (Cockroach, Spanner) vs single-node Postgres?',
      answer:
        'Every write must reach consensus across replicas — typically Raft (Cockroach, Yugabyte) or Paxos (Spanner) — which means one network round-trip-time between the leader and a majority of followers. In a single data center, that\'s sub-millisecond. Across regions, it\'s 50–200ms.\n\nSo: **distributed SQL adds latency per write** in exchange for horizontal write scale and automatic node-failure tolerance. Single-node Postgres has sub-ms writes but caps out at one machine and requires manual failover.\n\nSecondary costs: serializable isolation means more retry-on-serialization-failure errors (apps need retry loops); the extension/feature surface is smaller than Postgres; per-byte cost is higher.\n\nThe practical implication: distributed SQL is the right tool for genuinely global apps and write workloads beyond what a vertical Postgres can absorb. For everything else, the vanilla Postgres + replicas + cache stack is faster *and* cheaper.',
    },
    {
      level: 'senior',
      question: 'A teammate proposes adding a `JSONB` column for "flexibility." What\'s the right way to use JSONB, and what\'s the trap?',
      answer:
        '**Right way:** use JSONB for data that\'s genuinely variable per row (event payloads, settings blobs, third-party API responses) where you don\'t need to query into it constantly. You get schemaless storage, JSON path operators (`->`, `->>`), and indexable expression indexes — all without leaving the relational world.\n\n**Trap:** treating JSONB as a substitute for proper schema. If `data->>\'user_id\'` is your primary access pattern for half your queries, that should be a real column with a foreign key. Querying into JSON has overhead, no FK enforcement, no NOT NULL constraint, and any typo (`data->>\'userid\'`) silently returns NULL instead of erroring.\n\n**Rule of thumb:** if you find yourself filtering, joining, or sorting by a JSON field constantly, promote it to a real column. JSONB is for the truly variable parts. The relational columns are for everything you query against — they\'re faster, safer, and self-documenting.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Design the SQL schema for a multi-tenant SaaS where some tenants have strict data-isolation requirements (e.g., regulated industries).',
      answer:
        'Three viable patterns, each with trade-offs:\n\n**1. Single shared schema, `tenant_id` on every table.** Simplest, cheapest, hardest to isolate. Every query needs `WHERE tenant_id = $current_tenant`. Easy to forget — leak risk. Mitigate with **row-level security (RLS)** in Postgres: `CREATE POLICY tenant_isolation ON users USING (tenant_id = current_setting(\'app.tenant_id\')::uuid)`. Now the DB enforces isolation even if app code forgets the predicate.\n\n**2. Schema-per-tenant.** Same database, separate schema per tenant. `SET search_path = tenant_42, public`. Better isolation, easier to back up / restore per tenant. Cost: connection pooling gets harder (each connection has a search_path), and DDL changes touch N schemas.\n\n**3. Database-per-tenant.** Strongest isolation, easiest compliance story (per-tenant backups, geographic placement, DSR / GDPR data deletion). Cost: operational complexity scales linearly. You need a routing layer (\'which DB is tenant 42 on?\') and migration tooling that touches N databases.\n\n**My pick for SaaS with regulated tenants:** shared schema + RLS for normal tenants, database-per-tenant for the regulated ones who pay for it. Same app code; the routing layer picks the connection. Migrations target all databases via a deploy pipeline.\n\n**Additional considerations:** encryption-at-rest with per-tenant keys (if regulatory), pgaudit for compliance audit trails, separate read replicas if some tenants have analytics workloads that would crush others on a shared box.',
    },
    {
      level: 'staff',
      question: 'Your Postgres p99 latency is climbing. Walk through how you\'d diagnose and fix it.',
      answer:
        '**Establish what changed.** Recent deploys? Traffic growth? New query patterns? Schema changes? Knowing the timeline narrows the hypothesis space.\n\n**`pg_stat_statements`** is the first stop. Find queries with the highest total time, the worst mean time, and the biggest recent regressions. The 80/20 rule applies — usually one or two queries are responsible.\n\n**`EXPLAIN ANALYZE`** the worst offenders. Look for: sequential scans on big tables (missing or unused index), nested loops on large joins (should be hash join), estimated vs actual rows wildly off (stale statistics — run `ANALYZE`).\n\n**`pg_stat_activity`** during a latency spike. Filter `wait_event_type = \'Lock\'`. Long transactions blocking others is the most common cause of weekly/daily spikes. Look at `query` and `application_name` to find the culprit.\n\n**Autovacuum lag.** Heavily updated tables accumulate dead tuples; if vacuum is behind, indexes bloat and the planner falls back to sequential scans. Check `pg_stat_user_tables` for `n_dead_tup` and `last_autovacuum`.\n\n**Connection pool saturation.** If app processes are queuing on `pool.connect()`, the DB looks slow but really queries are waiting in line. PgBouncer in transaction mode is the standard fix at scale.\n\n**Replication lag.** If read replicas are behind, reads against them can be inconsistent or slow. Check `pg_stat_replication`.\n\n**Disk / IO / network.** Underlying host metrics: IOPS exhausted, CPU pegged, network saturation. On RDS, watch out for burst-credit exhaustion on `gp2` storage.\n\n**Fix path:** kill the long transaction (`pg_terminate_backend`), add missing indexes (`CREATE INDEX CONCURRENTLY`), refactor pathological queries, add `statement_timeout` and `idle_in_transaction_session_timeout` to bound the blast radius of future incidents. Long-term: track query latency in `pg_stat_statements` over time and alert on regressions before they become incidents.',
    },
  ],
};
