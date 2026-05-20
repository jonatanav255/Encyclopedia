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
  ],
};
