import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'system-design',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'What is the difference between architecture, system design, and implementation?',
      answer:
        '**Architecture** is the highest-level structure: major subsystems and constraints (latency budgets, consistency, deployment). Survives a rewrite.\n\n**System design** is how each subsystem is shaped: APIs, data models, sharding, caching, replication, failure handling. What you draw on the whiteboard in an interview.\n\n**Implementation** is the code, libraries, query plans, struct layouts. Changes weekly while architecture changes yearly.\n\nThe skills differ: implementation needs language knowledge; system design needs trade-off recognition; architecture needs organizational fit.',
    },
    {
      level: 'junior',
      question: 'How many seconds are in a day, and why does it matter for back-of-envelope math?',
      answer:
        '~86,400, which we round to **10⁵**. It\'s the single most useful number in capacity estimation.\n\nAnything per day → divide by 10⁵ to get per second. 100M DAU × 50 actions/day = 5B actions/day = 50K QPS average.\n\nMultiply by 3 for peak. The whole "is this 100 QPS or 1M QPS?" question gets answered with one mental division.',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between vertical and horizontal scaling?',
      answer:
        '**Vertical (scale up)**: bigger box. More CPU/RAM/disk on one machine. Simple; no code changes; ceiling at single-machine limits; one box failing takes everything down.\n\n**Horizontal (scale out)**: more boxes. Distribute load across many. No ceiling (in principle); requires stateless services or sharding; survives single-box failure.\n\nVertical is usually right until you hit limits or need redundancy. Horizontal requires architecture investment but is the only way past one machine\'s capacity.',
    },
    {
      level: 'junior',
      question: 'What does it mean for a service to be stateless?',
      answer:
        'No per-client memory between requests. Any replica can serve any request because the state lives elsewhere (database, cache, message broker).\n\nWhy it matters: trivially scalable (add or remove replicas), trivially resilient (a replica dying just causes a retry to another), trivially deployable (no in-flight state to drain).\n\n"Stateless" doesn\'t mean "no state" — it means state isn\'t kept in this service\'s memory. A session in Redis is fine; a session in the service\'s local variable is not.',
    },
    {
      level: 'junior',
      question: 'What is a load balancer, and why do you need one?',
      answer:
        'A device or service that distributes incoming requests across multiple backend instances. Sits between clients and your service replicas.\n\nWhy: (1) Survive single-instance failures — LB stops sending traffic to dead nodes. (2) Scale throughput linearly with replicas. (3) Apply cross-cutting concerns (TLS termination, rate limiting, routing).\n\nFlavors: L4 (TCP/UDP) is faster but only knows source/dest. L7 (HTTP-aware) can route by path, header, or content but costs more compute.',
    },
    {
      level: 'junior',
      question: 'What\'s a CDN and how does it help?',
      answer:
        'A Content Delivery Network puts copies of your content on hardware in cities near your users. Requests are served from a nearby POP instead of your origin halfway around the world.\n\nTwo wins: **lower latency** (no round-trip to origin) and **less origin load** (most requests don\'t reach you). For typical setups, a CDN cuts origin traffic by ~99% and shaves 100s of ms off page loads.\n\nCDNs cache static assets (images, JS, CSS) by default; modern ones (Cloudflare, Fastly) also cache dynamic content with short TTLs and run edge code.',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between SQL and NoSQL?',
      answer:
        '**SQL (relational)**: tables with strict schemas, ACID transactions, joins, mature query language. Postgres, MySQL.\n\n**NoSQL**: umbrella term covering document stores (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra), graph (Neo4j). Schemas more flexible; scale-out story stronger; transactions and joins limited.\n\nDefault to SQL. Reach for NoSQL only with a measured reason: massive write throughput, schema flexibility, specific query shape. "We need to scale" is rarely the real reason.',
    },
    {
      level: 'junior',
      question: 'What is caching, and what does it cost you?',
      answer:
        'Caching: storing recently-computed or recently-fetched data closer to the consumer, so future requests skip the expensive lookup.\n\nWhat you buy: lower latency, less load on the origin (database, service), often lower cost at scale.\n\nWhat you pay: **staleness** (the cache holds an old value while the truth has moved on), **complexity** (invalidation, eviction, hot keys, stampede), **operational moving part** (the cache itself can fail).\n\nThe famous quote: "There are only two hard things in computer science: cache invalidation and naming things."',
    },
    {
      level: 'junior',
      question: 'What does "eventually consistent" mean?',
      answer:
        'If writes stop, replicas of the data will eventually converge to the same value. No bound on how long.\n\nIn practice: a write to one replica is asynchronously replicated to others. A read might see the old value for some time. Stale-read window typically milliseconds to seconds.\n\nGood for: caches, view counts, feeds, search indexes, recommendations. Bad for: money, inventory, identity, uniqueness — anything where stale data has real consequences.',
    },
    {
      level: 'junior',
      question: 'What\'s a back-of-envelope estimate for the storage needed for 100M users × 20 messages/day × 200 bytes/message over a year?',
      answer:
        '100M × 20 × 200 = 400 GB/day. × 365 ≈ **146 TB/year**.\n\nThat\'s a fundamentally different problem from a 50 GB transactional database. It forces architecture choices: archive cold tier, separate hot/cold paths, columnar storage for analytics.\n\nThe value of the math is **eliminating designs** — you can\'t plausibly fit 150 TB in a Postgres instance, so the design must include sharding, separate stores, or external archive.',
    },
    {
      level: 'junior',
      question: 'What are SLA, SLO, and SLI?',
      answer:
        '- **SLI** (Service Level Indicator): a measurement. "p99 latency of POST /orders."\n- **SLO** (Service Level Objective): an internal target. "p99 latency under 200ms over 30 days."\n- **SLA** (Service Level Agreement): a customer contract with consequences. "If availability drops below 99.5%, customers get 10% credit."\n\nRelationship: SLI < SLO < SLA in strictness. SLI is what you measure; SLO is what you aim for internally; SLA is the worst public promise. Real performance hopefully beats all three.',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between p50 and p99 latency?',
      answer:
        'p50 (median): the latency that 50% of requests are faster than. Typical request experience.\n\np99: the latency that 99% of requests are faster than. The slow tail. 1 in 100 requests is worse.\n\nWhy p99 matters more than the mean: averages hide tails. A service with 50ms mean might have 5-second p99 — meaning 1% of users have an awful experience.\n\nFor user-facing services, target p99 (and at scale, p999); the mean is the least informative number you can publish.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'What is cache-aside, and what\'s the common pitfall?',
      answer:
        'Pattern: on read, check cache first; if miss, fetch from DB, populate cache, return. On write, update DB and invalidate (or update) cache.\n\nPitfall: **race between concurrent write and read**. Reader gets cache miss, queries DB. Writer updates DB, invalidates cache. Reader writes the now-stale DB value into the cache. Cache has stale data until TTL.\n\nMitigations: short TTLs, write-through cache, or read-after-write read from primary briefly to repopulate.',
    },
    {
      level: 'mid',
      question: 'How does consistent hashing reduce data movement when nodes are added or removed?',
      answer:
        'Without it: with N shards and `hash(key) % N`, adding one shard reshuffles **all** keys.\n\nWith consistent hashing: keys and nodes are placed on a ring. A key belongs to the next node clockwise. Adding a node only inherits the segment between it and its predecessor — about **1/N** of keys move.\n\nVnodes (virtual nodes) scatter each physical node across many ring positions, balancing load and limiting impact of node-specific movement. Used in Cassandra, Dynamo, distributed caches.',
    },
    {
      level: 'mid',
      question: 'What is CAP theorem, and why is "pick two" misleading?',
      answer:
        'CAP says: under network partition, a system must choose between **Consistency** (linearizable reads) and **Availability** (continue serving). Partition tolerance is not optional in a distributed system; the choice is C vs A only during a partition.\n\n"Pick two" is misleading because: (1) partition-free operation is the common case, and during it both C and A are achievable; (2) the choice isn\'t for the whole system, but per operation; (3) it ignores latency, which **PACELC** (the better framing) adds.\n\nUseful: every distributed system\'s design implicitly answers "under partition, do we refuse or serve?"',
    },
    {
      level: 'mid',
      question: 'When should you cursor paginate instead of offset paginate?',
      answer:
        'Almost always, for any list that might grow.\n\n**Offset pagination** (`LIMIT 100 OFFSET 1000`): DB walks past 1000 rows on every page. Slower the deeper you scroll. Inserts/deletes shift results, producing duplicates and skips.\n\n**Cursor pagination** (`WHERE id < lastCursor LIMIT 100`): DB seeks directly via index. Constant-time regardless of depth. Stable under inserts.\n\nUse offset only for small bounded result sets where "jump to page 5" is a UX requirement.',
    },
    {
      level: 'mid',
      question: 'What\'s a circuit breaker and when does it trip?',
      answer:
        'Wraps a downstream call. If the downstream fails repeatedly, **trip the circuit** — stop calling for a window. Future calls fail fast (returning fallback) instead of blocking.\n\nThree states: **closed** (normal), **open** (skip the downstream), **half-open** (probe with a single call to see if it\'s recovered).\n\nTrip when error rate or latency exceeds a threshold over a window. Pair with a **fallback** (cached data, default value, graceful degradation). The pattern saves cascading failure when a downstream gets sick.',
    },
    {
      level: 'mid',
      question: 'Why are idempotency keys needed for retries?',
      answer:
        'Networks fail; clients retry. Without idempotency, "charge this card $100" retried twice might charge twice. Same for "send email," "decrement inventory," etc.\n\nIdempotency key: client generates a UUID per **logical** operation. Server stores result by the key. Subsequent requests with the same key return the stored result without re-executing.\n\nPair with retries: the key is generated once per logical operation, not per attempt. Stripe pioneered this; standard pattern for non-idempotent POST endpoints.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between rolling, blue-green, and canary deployment?',
      answer:
        '- **Rolling**: replace instances one at a time. No extra infrastructure, both versions live during transition.\n- **Blue-green**: two complete environments. Switch traffic between them. 2x infra; instant rollback.\n- **Canary**: roll out to a small subset of traffic first. Monitor. Expand. Lowest risk; longest total rollout.\n\nMost production: shadow for validation → canary at 1-5% → progressive rollout. Each adds soak time, catching bad releases before they reach everyone.',
    },
    {
      level: 'mid',
      question: 'How does read-replica replication lag impact application behavior?',
      answer:
        'A read from a replica may return an older value than was just written to the primary. Window typically milliseconds to seconds, can spike to minutes under load.\n\nImpact: user updates their profile, refreshes, sees the old version. "Read-your-writes" is broken.\n\nMitigations: route reads from a user to the primary briefly after they wrote (sticky-leader), pass a "minimum log position" token, or accept the lag with optimistic UI showing the new value client-side.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between row-based and column-based storage?',
      answer:
        '**Row-based** (Postgres, MySQL): all of one row\'s columns stored together. Great for "fetch this whole row" — one disk seek gets everything. The OLTP default.\n\n**Column-based** (ClickHouse, Druid, BigQuery): all values of one column stored together. Great for "sum this column across millions of rows" — only the needed columns are read; compression is dramatic (10-20×).\n\nUse row for transactional operations; column for analytical scans. Modern lakehouses (Delta, Iceberg, Parquet files) are all column-based.',
    },
    {
      level: 'mid',
      question: 'What\'s an API gateway, and where does it shine vs where does it hurt?',
      answer:
        'A single entrypoint in front of a set of backend services. Handles cross-cutting concerns: auth, rate limiting, routing, protocol translation, request/response shaping.\n\n**Shines**: centralizes concerns; client sees one URL; lets backends evolve without breaking clients; offloads TLS, auth, throttling from backends.\n\n**Hurts**: can become a bottleneck (single point of failure for everything); adds latency (extra hop); over-engineering for small systems where direct backend calls work.\n\nWorth it past a few backend services. Skip it for single-service systems.',
    },
    {
      level: 'mid',
      question: 'How does a write-through cache differ from write-back?',
      answer:
        '**Write-through**: app writes the cache and DB **synchronously**. Cache always in sync; write latency = cache + DB time.\n\n**Write-back (write-behind)**: app writes the cache; DB updated **asynchronously** in batches. Highest write throughput. Risk: cache dies before flushing → data loss.\n\nWrite-through suits read-heavy with occasional writes. Write-back suits write-heavy where some lag is acceptable. Modern caches (Redis with persistence) often combine: write-through + async snapshot for durability.',
    },
    {
      level: 'mid',
      question: 'What is a bulkhead pattern?',
      answer:
        'Partition resources (threads, connections, memory) so that exhaustion in one part doesn\'t starve others. Borrowed from ships: a flooded compartment doesn\'t sink the whole ship.\n\nExample: instead of one shared HTTP-client thread pool, use **separate pools per downstream**. A slow downstream X consumes only its 30 threads; Y and Z keep working.\n\nPairs with circuit breakers: bulkheads cap how much a slow dependency can hurt; breakers stop calling broken ones.',
    },
    {
      level: 'mid',
      question: 'What\'s a hot key and how do you fix it?',
      answer:
        'A single key (cache entry, DB row, Kafka partition) receives disproportionate traffic. One shard overloads while others idle. The cluster\'s total capacity is wasted on imbalance.\n\nFixes by pattern: \n- **Read-heavy hot key**: replicate the key to N cache copies, read round-robin.\n- **Write-heavy hot key**: split into N sub-counters; aggregate on read.\n- **Routing**: send hot keys to dedicated higher-resource nodes.\n\nDesign-time prevention: high-cardinality partition keys; avoid singletons (global counters, "next ID").',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between at-least-once, at-most-once, and exactly-once delivery?',
      answer:
        '- **At-most-once**: a message might be delivered, might not. Cheap, lossy.\n- **At-least-once**: a message is delivered at least once; might be duplicated. The standard for message brokers.\n- **Exactly-once**: delivered exactly once. Not a property of the broker alone — it requires idempotent consumers or transactional producers.\n\nKafka can do exactly-once with transactions + idempotent producers + idempotent consumers. "Exactly-once" is an end-to-end property of the **pipeline**, not the broker.',
    },
    {
      level: 'mid',
      question: 'What\'s the four golden signals?',
      answer:
        'The Google SRE recommendation for monitoring every user-facing service:\n\n1. **Latency** — how long requests take. Track percentiles (p50, p99).\n2. **Traffic** — how many requests / connections / bytes / sec.\n3. **Errors** — rate of failed requests (explicit 5xx + implicit slow timeouts).\n4. **Saturation** — how full the service is (CPU, memory, queue depth).\n\nGraph these for every service; alert on changes. Together they cover ~80% of production issues.',
    },
    {
      level: 'mid',
      question: 'When should you use a message queue vs a synchronous HTTP call?',
      answer:
        'HTTP/sync when: the caller needs the result before proceeding, latency-critical, low fan-out, simple two-party call.\n\nMessage queue/async when: work is slow and the caller can\'t wait, multiple consumers want the event, bursty load that downstream can\'t absorb, decoupled deployments.\n\nMany endpoints are hybrid: sync DB write for the critical path; enqueue side effects (email, analytics, search indexing) for background workers. Don\'t force one model across all operations.',
    },
    {
      level: 'mid',
      question: 'What\'s a dead-letter queue (DLQ) and why is it needed?',
      answer:
        'A queue for messages that **cannot be processed successfully** after retries. Poison messages (malformed, depending on a deleted entity, exposing an unfixed bug).\n\nWithout a DLQ: bad messages block the queue (retried forever), poison the consumer (crashes, restarts, processes the same bad message again), or are silently dropped.\n\nWith a DLQ: route them aside after N attempts. Surface for human review. Reprocess once the underlying bug is fixed. The operational discipline of "actually drain the DLQ" matters as much as having one.',
    },
    {
      level: 'mid',
      question: 'What\'s the trade-off between rate limiting at the edge vs at the service?',
      answer:
        'Edge (LB, API gateway, CDN): fast rejection, doesn\'t use backend resources, but limited view of business logic.\n\nService-level: knows about specific endpoints, user tiers, quota allocations; but the request already paid auth + parsing cost by the time it gets rejected.\n\nMost production systems combine: coarse rate limit at the edge (per-IP, per-user); fine-grained quota at the service (per-endpoint, per-feature).',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between scale up (vertical) and scale out (horizontal) for a database?',
      answer:
        '**Scale up**: bigger box. More CPU, RAM, disk on the same Postgres instance. Works to a point (hundreds of GB to a few TB on managed cloud); single point of failure; ceiling at instance limits.\n\n**Scale out**: shard the data across multiple instances. Past the single-instance ceiling. Requires application support for shard-aware queries; cross-shard joins and transactions become expensive.\n\nThe order: scale up until painful, then add read replicas, then shard. Sharding is the last resort because it changes the application contract.',
    },
    {
      level: 'mid',
      question: 'How does an inverted index work?',
      answer:
        'Maps **term → list of documents containing it** (instead of forward index: doc → terms).\n\nFor "kafka tutorial": look up posting lists for "kafka" and "tutorial", intersect → docs containing both.\n\nKey storage tricks: delta-encode doc IDs (store deltas instead of full IDs), var-byte encode (small ints take fewer bytes). Posting lists compress 10× this way.\n\nFoundation of Elasticsearch, Solr, Postgres FTS, every modern search engine. Combined with BM25 ranking, scatter-gather across shards, and re-rank pipelines for production search.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Explain PACELC and how it improves on CAP.',
      answer:
        'CAP: **under partition**, choose C or A. Useful but incomplete — most of the time there\'s no partition.\n\nPACELC: **Partition** → C or A; **Else** → L (latency) or C (consistency). It captures the everyday trade-off: even without partition, strong consistency costs latency (waiting for replicas, consensus).\n\nReal systems: Spanner is PC/EC (consistent under partition; consistent at the cost of latency normally). DynamoDB is PA/EL (available under partition; low-latency eventual normally).\n\nPACELC is the framing that actually matches what real systems do.',
    },
    {
      level: 'senior',
      question: 'How do you mitigate cache stampede when a hot key expires?',
      answer:
        'Multiple techniques, combined:\n\n1. **Request coalescing (single-flight)**: when N concurrent requests miss the same key, only one queries the origin; others wait on the in-flight result.\n2. **Probabilistic early refresh**: refresh hot keys with rising probability as they approach expiration; the cache stays warm.\n3. **Lock + serve stale**: on miss, take a lock; the first request refreshes; others get the stale value briefly.\n4. **TTL jitter**: spread expirations across a window instead of synchronizing them.\n5. **Refresh-ahead**: background job refreshes hot keys before they expire.\n\nAll cheap; the cost of not having them is a melting database during the next viral spike.',
    },
    {
      level: 'senior',
      question: 'What is the outbox pattern and what problem does it solve?',
      answer:
        'Problem: a service writes to its DB AND publishes an event to a broker. Network failure between the two writes leaves them inconsistent.\n\nSolution: write the event to an **outbox table in the same DB transaction** as the state change. A separate process polls the outbox and publishes to the broker, marking the row published when ack\'d.\n\nResult: domain change and event are committed atomically. The publish is eventual but never lost. Standard fix for dual-write inconsistency in microservices.',
    },
    {
      level: 'senior',
      question: 'Explain serializability vs linearizability.',
      answer:
        'Different properties of different things:\n\n**Linearizability**: a property of **single objects**. Each operation appears to happen at a single instant between its invocation and return. Equivalent to "single copy of the data."\n\n**Serializability**: a property of **transactions**. Any concurrent execution is equivalent to **some serial order** of those transactions. Doesn\'t require real-time ordering.\n\n**Strict serializable** = both. The true gold standard. Spanner and CockroachDB target this. A serializable-not-linearizable system can return "stale" data; most production "SERIALIZABLE" actually delivers strict serializable.',
    },
    {
      level: 'senior',
      question: 'When does eventual consistency cause user-visible bugs, and how do you hide them?',
      answer:
        'Common bugs: user updates their profile, refreshes, sees the old version. Likes counter shows 5, then 4, then 5. Comment posted, then briefly disappears.\n\nMitigations:\n- **Read-your-writes**: route a user\'s reads to the leader briefly after they wrote. Or pass a "minimum log position" token.\n- **Monotonic reads**: sticky-route a user to one replica so their successive reads don\'t go backwards.\n- **Optimistic UI**: render their change immediately client-side without waiting.\n- **Causal tokens**: client carries a token forward across services so each waits for the right minimum state.\n\nNone of these make the system linearizable; they hide the eventual consistency from the user\'s session.',
    },
    {
      level: 'senior',
      question: 'How does Raft achieve consensus, and why did it largely replace Paxos?',
      answer:
        'Raft splits consensus into three subproblems: **leader election** (followers vote for a leader), **log replication** (leader appends entries, followers replicate), **safety** (rules ensuring committed entries are durable).\n\nKey insight: there\'s **always a leader** (except briefly during elections). All writes go through the leader. Followers only acknowledge entries from the current leader. Simpler than Paxos\'s multi-decree complexity.\n\nReplaced Paxos because: more understandable (Raft\'s paper is "in search of an understandable consensus algorithm"); easier to implement correctly; widely available in libraries (etcd-raft, hashicorp-raft, OpenRaft).',
    },
    {
      level: 'senior',
      question: 'What\'s the difference between fanout-on-write and fanout-on-read for a newsfeed?',
      answer:
        '**Fanout-on-write**: when a user posts, immediately copy the post into every follower\'s feed. Read = single lookup of "my feed." Fast reads, expensive writes. Worst case: celebrity with 100M followers → 100M writes per post.\n\n**Fanout-on-read**: when a user reads their feed, query the latest posts from every user they follow. No write fanout. Reads are heavier (must scatter to many sources, merge, sort).\n\nProduction systems do hybrid: fanout-on-write for users with normal follower counts; fanout-on-read (or a "celebrity tier" with caching) for highly-followed accounts. Twitter\'s approach historically.',
    },
    {
      level: 'senior',
      question: 'How do you handle write-skew in snapshot isolation?',
      answer:
        'Write-skew: two transactions both read overlapping rows, both decide based on the read, both write disjoint rows that together violate a multi-row invariant.\n\nClassic example: two doctors checking "is at least one other doctor on call?", both seeing yes, both clocking off. Invariant violated.\n\nFixes:\n- **SERIALIZABLE isolation**: explicit serial-order enforcement. Postgres SSI tracks read-write conflicts and aborts; CockroachDB uses SSI by default.\n- **Explicit row locks**: `SELECT ... FOR UPDATE` on rows you intend to base writes on.\n- **Application-level**: re-check invariants in a final atomic step, or use a unique constraint as a guard.',
    },
    {
      level: 'senior',
      question: 'How does a saga differ from a distributed transaction (2PC)?',
      answer:
        '**2PC**: all participants vote to commit; coordinator decides; either all commit or all roll back. Strong atomicity; coordinator failure is catastrophic; blocking holds locks.\n\n**Saga**: a long-running business transaction split into a sequence of local transactions, each with a **compensating action** to undo if a later step fails. No global lock; partial state visible between steps; intentionally eventual.\n\nUse 2PC for tight coupling within one trust boundary (DB-internal); use sagas across microservices where you can\'t afford holding cross-service locks or coordinator dependence.',
    },
    {
      level: 'senior',
      question: 'How do hedged requests cut tail latency?',
      answer:
        'After p95 has elapsed without a response from replica A, send the same request to replica B. Use whichever finishes first.\n\nMath: with per-call p99 of 100ms and 10 backends in fan-out, user-facing p99 ≈ 700ms (slowest of 10 wins). Hedging cuts this dramatically because the chance that **both** replicas are simultaneously slow is much lower than one being slow.\n\nCost: ~5% extra load (the 5% of requests that hedged). Idempotent reads only; for writes you need idempotency keys. From Jeff Dean\'s "Tail at Scale."',
    },
    {
      level: 'senior',
      question: 'What\'s an error budget and how does it change product decisions?',
      answer:
        'Error budget = 1 − SLO over a window. For 99.9% SLO over 30 days, budget = 43 minutes of "bad" time per month.\n\nIt aligns product and SRE on a shared number:\n- Budget healthy → ship aggressively; risk is OK.\n- Budget burning fast → slow down launches; invest in reliability.\n- Budget exhausted → launch freeze until budget refreshes.\n\nWithout the budget, "we\'re worried about reliability" has no measurable counter; with it, decisions are about minutes-of-budget-remaining, not feelings.',
    },
    {
      level: 'senior',
      question: 'When would you choose Kafka over RabbitMQ?',
      answer:
        '**Kafka**: distributed log; pulls from consumers; retains messages for days/weeks; replays from any offset; massive throughput (millions of msgs/sec); ordering per partition.\n\n**RabbitMQ**: traditional message queue; pushes to consumers; acks remove from queue; retains briefly; lower throughput; richer routing (topic exchanges, headers, fanout).\n\nPick Kafka for: high-volume event streams, event sourcing, log-driven architectures, replay capability.\n\nPick RabbitMQ for: traditional task queues, RPC-style request/reply, complex routing rules, lower-volume work queues.',
    },
    {
      level: 'senior',
      question: 'How does an LSM tree work, and what\'s the cost vs B-tree?',
      answer:
        'LSM (Log-Structured Merge tree): writes go to an in-memory memtable. When full, flush as an immutable sorted SSTable. Periodically merge (compact) SSTables.\n\n**B-tree (Postgres, MySQL InnoDB)**: updates in place. Reads hit one B-tree page. Writes do random I/O.\n\n**LSM (RocksDB, Cassandra, LevelDB)**: writes are sequential (cheap). Reads check multiple SSTables (more expensive). Compaction has high write amplification (rewriting same data multiple times).\n\nLSM dominates write-heavy workloads; B-trees still win for read-heavy with low write rate. RocksDB underlies many modern systems including TiKV, CockroachDB, MyRocks.',
    },
    {
      level: 'senior',
      question: 'What\'s the strangler fig pattern?',
      answer:
        'Migration approach for replacing a legacy system: instead of rewriting and switching at the end, build the new system alongside and **gradually route slices of traffic** to it.\n\n1. Put a routing layer in front of the legacy.\n2. Implement one endpoint in the new system; route that endpoint there.\n3. Continue, endpoint by endpoint.\n4. When the legacy serves nothing, retire it.\n\nAvoids the big-bang rewrite that historically fails 80% of the time. Named after the strangler fig that grows around its host tree and eventually replaces it.',
    },
    {
      level: 'senior',
      question: 'How do you design a system to be idempotent end-to-end?',
      answer:
        'Three rules:\n\n1. **Client generates an idempotency key** per logical operation, not per attempt.\n2. **Server stores the result keyed by the idempotency key**. Subsequent requests with the same key return the stored result without re-executing the side effect.\n3. **All side-effecting operations are wrapped** so the idempotency check happens before any work.\n\nFor downstream chains (service A calls B calls C), the key propagates. Each service\'s idempotency layer dedupes independently. The end-to-end pipeline is safe to retry from any point.',
    },
    {
      level: 'senior',
      question: 'What does it mean for an architecture to be "cell-based"?',
      answer:
        'Partition the entire stack into **independent cells**, each serving a subset of users end-to-end. Each cell has its own compute, DB, queue, cache, load balancer.\n\nA cell failure or bad deploy affects only its users — typically 5-25% of total. Deploys roll out cell-by-cell with bake time; bad releases stop before reaching everyone.\n\nUsed by AWS, Slack, Shopify for blast-radius isolation. High operational cost (each cell is a complete system); pays off only at large scale or strict availability requirements.',
    },
    {
      level: 'senior',
      question: 'What\'s the difference between vector clocks and HLC?',
      answer:
        '**Vector clocks**: one integer per writer in the system. Captures exact happens-before relationships and detects true concurrency. Size grows with the number of writers.\n\n**HLC (Hybrid Logical Clock)**: pair of (physical timestamp, logical counter). Bounded size. Approximates concurrency detection within NTP skew.\n\nVector clocks: precise but unbounded. HLC: bounded but aligned with real time (debugging-friendly).\n\nProduction trend: HLC has largely replaced vector clocks. Used in CockroachDB, MongoDB, YugabyteDB. Vector clocks survive in CRDT correctness proofs and conflict-resolving stores.',
    },
    {
      level: 'senior',
      question: 'When should you use CQRS, and what does it cost?',
      answer:
        'CQRS = Command-Query Responsibility Segregation. Separate the model that handles writes (commands) from the model that handles reads (queries). The read side is built from events emitted by the write side.\n\nWorth it when: read and write patterns differ sharply (writes go to normalized tables; reads need a denormalized view), read scale far exceeds write scale, multiple read views of the same data.\n\nCosts: more moving parts; eventual consistency between read and write models (user just wrote — won\'t see it in read model for some ms); projection builders to maintain; rebuild plumbing for fixing bugs.',
    },
    {
      level: 'senior',
      question: 'How does HTTP/2 multiplexing help, and what\'s its limitation?',
      answer:
        'HTTP/1.1: one request per connection (or HoL-blocked pipelining). N parallel requests need N connections.\n\nHTTP/2: multiple requests over one connection, each as a separate "stream" with its own flow control. No HoL within a connection at the HTTP layer.\n\n**Limitation: HoL blocking at the TCP layer**. Lost packet stalls all streams on that connection (TCP must wait for retransmit).\n\nFix: HTTP/3 (over QUIC, which has stream-level flow control independent of TCP). For services within a datacenter, HTTP/2 is fine; for high-latency or lossy links, HTTP/3 wins.',
    },
    {
      level: 'senior',
      question: 'Why is sharding by user_id not always a good idea?',
      answer:
        'Common pitfalls:\n\n- **Hot keys**: power users with 1000× normal traffic concentrate on one shard.\n- **Cross-user queries become expensive**: "show all orders in last hour" scatters across all shards.\n- **Rebalancing is hard**: doubling shards requires moving half the data.\n- **Some users grow**: a single user accumulates 10TB of data; their shard becomes a hot spot.\n\nAlternatives: compound key (user_id + hour), tenant_id with explicit tenant isolation, hash-based with consistent hashing + vnodes, or geographic partitioning.',
    },
    {
      level: 'senior',
      question: 'What is exactly-once stream processing and how is it achieved?',
      answer:
        'A property of the **pipeline**, not the broker. End-to-end exactly-once means: a message is fully processed and side effects applied exactly once, even with crashes and retries.\n\nKafka + Flink approach:\n- **Idempotent producers**: same message can\'t be written twice (per-producer sequence numbers).\n- **Kafka transactions**: produce + consume offsets in one atomic step.\n- **Flink checkpoints**: include the operator state AND consumer offsets, atomically.\n- **Idempotent sinks**: external writes deduped by event ID.\n\nThe four-stage interlock gives end-to-end exactly-once. The broker alone can\'t.',
    },
    {
      level: 'senior',
      question: 'What\'s the right way to think about which consistency to use per operation?',
      answer:
        'Per-operation, not per-system. Different operations in the same product need different consistency.\n\n- **Linearizable** for money, inventory, identity, uniqueness, distributed locks, configuration.\n- **Causal/session-consistent** for "user just acted, must see their result."\n- **Eventual** for counters, search indexes, feeds, recommendations, cross-region read replicas.\n\nThe wrong answer is "we use ACID everywhere" or "we\'re eventually consistent." The right answer names the model per operation, and the cost of each.',
    },
    {
      level: 'senior',
      question: 'When would you replicate a hot read-only key, and how?',
      answer:
        'When one cache key gets disproportionate reads — viral content, celebrity profile, popular product. The shard that owns it gets overloaded while others idle.\n\nFix: replicate to N cache keys (`post:viral:0..N`), route reads round-robin. Writes go to all copies (more expensive but rare).\n\nTrade-off: N× write cost for ~N× read scaling. Worth it only when read/write ratio is extreme. Used at Twitter for celebrity timelines, in any CDN that mirrors popular content across POPs.',
    },
    {
      level: 'senior',
      question: 'How do you safely retry a non-idempotent operation?',
      answer:
        'You don\'t — you make it idempotent first.\n\nThe pattern:\n1. **Client generates an Idempotency-Key** UUID for the logical operation.\n2. **Server stores the result by key** before returning success.\n3. **Retries with the same key return the stored result** without re-executing.\n\nThe server\'s idempotency check is the critical piece. Without it, a retry of "charge $100" charges twice. With it, the retry is provably safe.\n\nFor operations with side effects you can\'t store (sending an email, dispatching a truck), you can\'t retry; either accept loss or design a different recovery model (callback, eventual reconciliation).',
    },
    {
      level: 'senior',
      question: 'What\'s the trade-off in choosing materialization vs view-time computation?',
      answer:
        '**Materialized**: pre-compute the result, store it, read from storage. Read cost = lookup. Write cost = update the materialized form on every change.\n\n**View-time**: compute on demand. Read cost = compute every time. Write cost = none.\n\nMaterialize when: read frequency × compute cost > write frequency × update cost. Default for dashboards, news feeds, search indexes, anything where read scale far exceeds write scale.\n\nDon\'t materialize when: data changes frequently relative to reads, or the view has many variants (per user / per filter). The combinatorial explosion of materialized views is real.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'How do you decide between a monolith and microservices for a new product?',
      answer:
        'Default to monolith. Most teams under ~30 engineers don\'t need microservices.\n\nMove when one of these is true: (1) Multiple teams that can\'t deploy together without coordination overhead. (2) Genuinely different scaling profiles per subsystem. (3) Different reliability requirements per path. (4) Polyglot tech requirements. (5) Independent deploy cadence is essential.\n\nMicroservices cost: CI/CD per service, distributed tracing, service mesh, schema versioning, SRE capacity. Real, ongoing.\n\nMiddle ground: **modular monolith** — strict module boundaries inside one deployable. Extract services later when actually needed. Used at Shopify, Stack Overflow, GitHub.',
    },
    {
      level: 'staff',
      question: 'How would you design idempotent payment processing across services?',
      answer:
        'Components:\n\n1. **Client-generated Idempotency-Key** per payment.\n2. **Payment service stores attempts** keyed by key. Returns the stored result on duplicate.\n3. **Outbox pattern** for events from the payment service to downstream consumers (ledger, notifications). Events tagged with the same idempotency key.\n4. **Inbox pattern** in each consumer: dedupe events by ID before processing.\n5. **Reconciliation job**: compares payment provider records (Stripe) with the ledger nightly. Surfaces discrepancies.\n6. **Saga pattern** for cross-service flows (charge → fulfill → notify), with compensating actions for failures.\n\nDouble-charging requires multiple independent layer failures; the system survives any single layer\'s glitches.',
    },
    {
      level: 'staff',
      question: 'How do you architect for region failure to achieve RPO ~30s and RTO ~5min?',
      answer:
        '- **Primary region** with synchronous replication to a same-region replica (multi-AZ).\n- **Async cross-region replication** to a hot standby region. Lag typically 1-30s.\n- **Stateless services** running in both regions; routing controlled by global LB / DNS.\n- **DB write routing**: only one region writes; failover promotes the other.\n- **Failover automation**: detection (multi-signal health check), decision (gated by error rate over a window), execution (promote secondary, update routing).\n\nRPO = the async replication lag at the moment of failure. RTO = detection + promote + DNS propagation.\n\nTested via regular game-day drills; otherwise the runbook bit-rots and the team forgets the procedure.',
    },
    {
      level: 'staff',
      question: 'How would you implement strong global ordering when you have many writers across regions?',
      answer:
        'Honestly: you usually don\'t need it. Most "global ordering" requirements are actually per-partition ordering masked as global.\n\nIf you really need it:\n- **Single global leader**: every write routes through one node. Latency for far-away writers. Spanner does this with TrueTime; CockroachDB with HLC.\n- **TrueTime-class clocks**: tight uncertainty bounds let writes get a globally-meaningful timestamp without crossing rounds with each other.\n- **Consensus per write**: every write goes through Raft/Paxos. Expensive.\n\nFor most products, per-entity ordering (sharded by entity ID) is sufficient and dramatically cheaper.',
    },
    {
      level: 'staff',
      question: 'Design a real-time analytics system for ad-click events at 1M events/sec.',
      answer:
        '- **Ingest**: Kafka, partitioned by campaign_id or ad_id, replication factor 3. Producer with idempotent send.\n- **Dedup**: every event has a client-generated UUID. Stream consumer dedupes via Redis SET NX with 24h TTL.\n- **Stream aggregator** (Flink/ksqlDB): per-window counts, joined with dimension data. Checkpoints state every minute for exactly-once.\n- **Hot store**: ClickHouse or Druid for sub-second queries; pre-aggregated at multiple grains (1-min, 1-hr, 1-day).\n- **Batch reconciliation**: nightly Spark job re-aggregates from raw events into the warehouse (Snowflake/BigQuery). Billing uses batch numbers.\n- **Fraud filtering**: ML model scores events inline; suspicious ones are flagged but kept for audit.\n\nThe combination: realtime dashboard via stream; exact billing via batch.',
    },
    {
      level: 'staff',
      question: 'How do you design a multi-tenant SaaS to avoid noisy-neighbor problems?',
      answer:
        '- **Per-tenant rate limits** at the API gateway.\n- **Per-tenant concurrency caps** in service layer.\n- **Per-tenant connection pools** to the database (PgBouncer pool per tenant for big tenants).\n- **Per-tenant queues** with bounded depth — one tenant\'s burst doesn\'t starve others.\n- **Per-tenant fair scheduling** in shared background workers.\n- **Tenant tier isolation**: enterprise tenants get dedicated infrastructure (silo model); SMB share infrastructure (pool model).\n- **Cell-based partitioning** for the largest customers — they live in their own cells.\n\nWithout these, one bad tenant\'s usage can destroy SLO for the rest.',
    },
    {
      level: 'staff',
      question: 'How do you handle a hot partition in a sharded database?',
      answer:
        'Diagnose first: per-shard QPS / CPU / memory metrics tell you which partition is hot. Application-level traces tell you which keys.\n\nMitigations by pattern:\n- **Read-heavy hot key**: replicate to multiple cache keys; read round-robin. Or scale that shard with read replicas.\n- **Write-heavy hot key**: split into sub-keys (`counter:0..N`); aggregate on read.\n- **Aggregation-heavy hot partition**: pre-roll into a separate columnar store.\n- **Adaptive resharding**: DynamoDB / Spanner can split a hot partition online.\n\nAt design time, choose high-cardinality partition keys; avoid (user_id, current_day) shapes for write-heavy workloads (today\'s data hot, yesterday\'s cold).',
    },
    {
      level: 'staff',
      question: 'Why is event sourcing not the right default for most systems?',
      answer:
        'It pays off when you genuinely need: full audit trail, time travel, multiple read views from the same events, recovery from bugs by replay.\n\nIt costs: more storage (logs grow), eventual consistency on reads, no ad-hoc SQL queries, schema evolution complexity (events are forever), side-effect-in-handlers gotchas on replay.\n\nFor most products, CRUD + audit log + occasional CDC streaming is simpler and gives most of the benefit. Reach for event sourcing when audit and replay are core requirements (financial systems, healthcare, regulated industries), not because it sounds modern.',
    },
    {
      level: 'staff',
      question: 'How do you avoid the distributed-monolith antipattern when adopting microservices?',
      answer:
        'Distributed monolith: microservices that must deploy together, share a database, or call each other synchronously in long chains.\n\nAvoid by:\n- **Asynchronous coupling** for non-critical paths: events, not RPC. Deploy independence requires that B doesn\'t block on A.\n- **Schema-per-service**: never share databases across services. If you need cross-service data, expose via API or stream.\n- **Bounded contexts**: DDD-style service boundaries, not technical layers ("frontend service," "business logic service" is wrong).\n- **Resilience patterns mandatory**: every cross-service call has timeout + circuit breaker + fallback.\n- **Independent deployability** as a test: can team A deploy without coordinating with team B today? If no, you have a distributed monolith.',
    },
    {
      level: 'staff',
      question: 'How would you design a chat system for 1B users with sub-second message delivery?',
      answer:
        '- **Persistent connections**: WebSocket or QUIC from clients to gateway. Gateway servers hold 50-100K concurrent connections each.\n- **Message routing**: gateway looks up recipient\'s gateway via a distributed registry (Redis-backed). Push directly between gateways via internal Kafka topic.\n- **Storage**: messages written to a sharded log (Cassandra or DynamoDB), partitioned by conversation_id.\n- **Offline delivery**: APNs / FCM push for users with no active connection.\n- **End-to-end encryption** (optional but required for serious chat): keys distributed via X3DH / signal protocol; server can\'t see content.\n- **Group fanout**: per-room consumer group reads new messages and pushes to all online members.\n- **Multi-region**: per-region message stores; cross-region async replication; conversation home in user\'s primary region.',
    },
    {
      level: 'staff',
      question: 'What architectural patterns prevent cascading failures?',
      answer:
        '- **Circuit breakers** stop calling failed downstreams.\n- **Bulkheads** isolate resource pools per dependency.\n- **Timeouts everywhere** prevent threads from blocking forever.\n- **Backpressure** signals upstream to slow down rather than dropping or OOMing.\n- **Load shedding** drops low-priority work under overload.\n- **Graceful degradation** loses features before losing availability.\n- **Async decoupling** with brokers prevents direct sync chains.\n- **Cell isolation** caps blast radius if all else fails.\n\nNo single pattern is enough — cascading failure exploits whichever defense is missing. The full Nygard catalog (Release It!) is the playbook.',
    },
    {
      level: 'staff',
      question: 'How do you bound write amplification when adopting LSM-based storage?',
      answer:
        '- **Compaction strategy choice**: leveled vs size-tiered. Leveled has high write amp but bounded read amp; size-tiered has lower write amp but worse read.\n- **Right-size memtable**: bigger means fewer small SSTables but longer recovery on crash.\n- **Throttle compaction**: bound how much disk IO compaction can consume; don\'t starve foreground writes.\n- **Tiered storage**: cold data on object storage with aggressive recompression; hot data on local NVMe with light compaction.\n- **Workload tuning**: time-windowed compaction (Cassandra TWCS) for time-series; per-table compaction strategy per workload.\n\nMeasure: write amp factor (bytes written to disk / logical bytes). Should be 10-20× for LSM; if it\'s 50× something\'s wrong.',
    },
    {
      level: 'staff',
      question: 'How do you achieve SLO of 99.99% with components at 99.9%?',
      answer:
        'You can\'t — math says you can\'t beat your weakest single dependency. The "SLA inversion" antipattern.\n\nFixes:\n- **Reduce dependencies on the critical path**. Eliminate calls; cache aggressively; cut features that need fragile dependencies.\n- **Redundancy for critical dependencies**. Multiple providers; client-side failover (e.g., two payment processors).\n- **Async / degradable** for non-critical. Email delivery failing shouldn\'t kill signup.\n- **Higher reliability for critical dependencies**. Manage them yourself; pay for premium tiers; deploy multi-region.\n- **Adjust the SLO target**. Sometimes the honest answer is 99.95% is the achievable bound; promising 99.99% is fiction.',
    },
    {
      level: 'staff',
      question: 'How do you design a system for "infinite" historical analytics over years of data?',
      answer:
        '- **Lakehouse pattern**: raw events in object storage (parquet/Iceberg). Cheap, multi-engine.\n- **Tiered storage**: hot 30 days on SSD-backed warehouse (Snowflake/BigQuery). Cold years on object storage with rollups.\n- **Medallion layering**: bronze (raw) → silver (cleaned) → gold (aggregated). Each layer rebuildable from the layer above.\n- **Time-partitioned tables**: queries on a time range scan only relevant partitions.\n- **Pre-aggregation** at multiple grains (hourly, daily, monthly) for common queries.\n- **dbt** for transformations; version-controlled SQL.\n- **Query engine** (Trino, BigQuery, Snowflake) that can join hot + cold transparently.\n\nThe lakehouse is the source of truth; warehouses are accelerators for common queries.',
    },
    {
      level: 'staff',
      question: 'What\'s your approach to a "rewrite vs incremental migration" decision?',
      answer:
        'Default to incremental. Rewrites fail 80% of the time.\n\nUse the **strangler fig pattern**: build the new alongside, route slices of traffic to it, retire old endpoint by endpoint. The legacy keeps working until everything\'s replaced.\n\nWhen rewrite is right:\n- The architecture is fundamentally broken in a way that incremental can\'t fix.\n- The legacy is small enough to rewrite quickly (a few thousand lines).\n- The team has done it before successfully.\n\nEven then, dual-running both systems in parallel until proven equivalent (shadow traffic; compare outputs) is safer than a hard cutover.\n\nThe biggest mistake: declaring the rewrite "complete" with 80% feature parity. Real users use the 20% you skipped.',
    },
    {
      level: 'staff',
      question: 'How would you approach designing for "graceful degradation" of a complex product?',
      answer:
        'Classify each dependency as **required** or **optional**. Required failures fail the request; optional failures activate fallback.\n\nPer-feature playbook:\n- **Search service down** → hide search bar; serve listing pages.\n- **Recommendation service down** → show popular items.\n- **Personalization service down** → generic feed.\n- **Image CDN down** → placeholder images with retry.\n- **Email service down** → queue and retry; show "we\'ll email shortly."\n- **Live inventory down** → show last cached availability with stale marker.\n\nKey practices:\n- **Pre-build fallback paths** for every optional dependency.\n- **Test in production** via chaos engineering — untested fallbacks fail.\n- **Surface degraded state** to the user when many fallbacks compound ("we\'re experiencing issues").\n- **Some paths can\'t degrade** (auth, payment) — invest in redundancy there.',
    },
    {
      level: 'staff',
      question: 'How do you design a system that\'s observable enough to debug at 3 AM?',
      answer:
        '- **Three pillars in place**: structured logs (queryable, with context), metrics (RED + USE), distributed traces (request-level propagation).\n- **Correlation IDs** flow through every request across every service.\n- **SLO dashboards** before custom dashboards — show what users feel.\n- **Per-service ownership tags** — every alert names a team.\n- **Runbooks linked from alerts** — the on-call doesn\'t hunt for context.\n- **Pre-built queries / saved searches** for common diagnostic scenarios.\n- **Synthetic / canary monitoring** continuously running golden-path tests.\n- **Tail-based trace sampling** keeps the interesting (slow, errored) traces; drops the rest.\n- **Audit logging** for "who did what" — incident timelines often need this.\n\nObservability invested before the incident pays back 10× during the incident.',
    },
    {
      level: 'staff',
      question: 'How would you architect a system where the same data is served to user-facing APIs (low latency) and analytics (heavy queries)?',
      answer:
        'Separate the workloads — they fundamentally conflict.\n\n- **OLTP store** (Postgres / DynamoDB) serves the user-facing API. Tight latency SLOs; small focused queries.\n- **CDC / replication** streams changes from OLTP to an OLAP store.\n- **OLAP store** (Snowflake / ClickHouse / BigQuery) for analytics. Heavy queries don\'t touch OLTP.\n- **Materialized views** in OLAP for common dashboards.\n- **Real-time analytics** layer (Pinot / Druid) for sub-second queries on recent data, if needed.\n\nThe two stores have different shapes (normalized vs star schema), different consistency (strong vs eventual), different scaling. Replication keeps them in sync; consumers route to the right one.',
    },
    {
      level: 'staff',
      question: 'When does it make sense to build vs buy infrastructure components?',
      answer:
        'Default to **managed services**. The fully-loaded cost of self-hosting (engineering time, on-call, infrastructure, upgrades, security patches) usually exceeds the managed bill.\n\nBuild when:\n- The component is a core product differentiator (Stripe\'s billing, Google\'s MapReduce).\n- No mature product fits your specific requirements.\n- You have an SRE team with capacity to operate it 24/7.\n- The total cost of managed services at your scale is genuinely prohibitive.\n\nBuy / OSS when:\n- A mature product fits reasonably well.\n- You want self-hosting for compliance.\n- You have ops capacity but not invention capacity.\n\nHybrid is fine: managed for the common, self-hosted for the differentiating edge.',
    },
    {
      level: 'staff',
      question: 'How do you make a decision-making framework for cross-team architectural choices?',
      answer:
        '- **Architecture Decision Records (ADRs)**: lightweight markdown for each significant decision, including alternatives and reasoning.\n- **Fitness functions**: automated tests for architectural properties (no service calls more than 3 others, no shared DB writes, all public APIs have OpenAPI specs). From "Building Evolutionary Architectures."\n- **Architecture review board** for cross-cutting changes — small, focused, time-boxed.\n- **Spike + prototype** for high-uncertainty decisions; commit only after measurement.\n- **Reversible vs irreversible** distinction: reversible decisions can be made fast; irreversible deserve serious analysis.\n\nAvoid: design-by-committee paralysis, architecture astronauts, premature standardization. Document the rule + the exception process; both matter.',
    },
    {
      level: 'staff',
      question: 'What\'s your approach to migrating data while staying online?',
      answer:
        '- **Expand-contract schema pattern**: add new columns first; deploy code that writes both; backfill; deploy code that reads new; deploy code that writes only new; finally remove old columns. Each step is independently rollbackable.\n- **Dual-write phase**: writes go to both old and new schemas. Reads can switch independently. Verifies data parity before cutover.\n- **Shadow traffic** to validate the new system\'s behavior against real traffic before cutover.\n- **CDC for backfill**: stream changes from old to new while initial dump is loading.\n- **Per-tenant migration** for multi-tenant systems — migrate one tenant at a time, observe, rollback if needed.\n- **Continuous data validation**: comparison job running through migration confirming new = old.\n- **Slow rollout of read paths**: 1% → 10% → 50% → 100% with metric gates.\n\nBig-bang migrations fail. Incremental migrations succeed.',
    },

    // --- references-grounded ---

    {
      level: 'senior',
      question: 'Per the Spanner paper, what does "commit-wait" achieve and what does it cost?',
      answer:
        'Commit-wait gives Spanner **external consistency** (strict serializability) at global scale despite imperfect clocks.\n\nAt commit time the coordinator picks `commit_ts = TT.now().latest` (the upper bound of the TrueTime interval), then **waits** until `TT.now().earliest > commit_ts` before releasing the commit. After the wait, every observer\'s "now" is provably after the commit timestamp.\n\nCost: the commit takes ~5–10 ms longer (in the original 2012 paper; sub-1 ms p99 by 2023 per Google\'s reports). Spanner\'s latency floor *is* the TrueTime uncertainty bound. Better clocks ⇒ faster transactions.\n\nThis is why TrueTime needs GPS antennas + atomic clocks — software-only NTP\'s ~10–100 ms uncertainty would make the wait latency prohibitive.',
    },
    {
      level: 'senior',
      question: 'What did the AWS S3 us-east-1 outage of February 2017 teach about blast radius?',
      answer:
        'Three lessons from the AWS post-event summary:\n\n1. **An engineer\'s typo took down more servers than intended.** The debugging command removed capacity from two subsystems instead of one. Mitigation: input validation + capacity floors on operational tools.\n2. **Subsystems hadn\'t been restarted in years.** When forced to cold-start, they took hours to recover because of slow metadata rebuilds. Mitigation: regularly exercise cold-start paths.\n3. **The AWS status dashboard ran on S3.** The dashboard couldn\'t report S3\'s outage *because* of S3\'s outage. Mitigation: blast-radius isolation — control-plane and status systems must not depend on the data plane they monitor.\n\nThe meta-lesson: blast radius is what your software can produce on the worst day, not what your customers usually do.',
    },
    {
      level: 'senior',
      question: 'In Raft, why is the leader-election timeout randomized?',
      answer:
        'Per Ongaro & Ousterhout (2014): each follower waits a randomized timeout (typically 150–300 ms) before starting a new election when it stops hearing from the leader.\n\nIf timeouts were deterministic, every follower would time out simultaneously, all become candidates at once, split the vote N ways, and need another election. Randomization spreads the timeouts so that one candidate usually starts first, gathers votes, and wins before others time out.\n\nThe paper shows that even with poorly-chosen ranges (e.g., 12–24 ms on a fast network), Raft converges quickly. The point isn\'t the specific range — it\'s that the protocol relies on time + randomness to break symmetry, not on a coordinator.',
    },
    {
      level: 'staff',
      question: 'The Tail at Scale (Dean & Barroso, 2013) proposes hedged and tied requests. What\'s the difference?',
      answer:
        '**Hedged request**: send the same query to two (or more) replicas immediately. Take the first response. Cancel the loser. Effective but doubles backend load.\n\n**Tied request**: send to replica A first. If A doesn\'t respond within X ms (a small threshold, often around p50), *also* send to replica B. Whichever finishes first wins; cancel the other. Costs much less backend load than hedging because the second request only fires for slow cases.\n\nThe paper reports that tied requests reduce p99 latency by ~40% with only ~2% extra load, because the tail of slow requests is small.\n\nUse hedged when you must minimize p99 and can afford the load. Use tied when load matters and you only want to chase the tail.',
    },
    {
      level: 'senior',
      question: 'What does Stripe\'s "idempotency" post recommend for safe retries, and why does it matter?',
      answer:
        'Brandur Leach\'s 2017 post defines the canonical pattern:\n\n1. **Client generates an idempotency key** (UUID) per logical operation and sends it with the request.\n2. **Server records** `(idempotency_key → outcome)` in a database with a TTL.\n3. **On retry**, server looks up the key — if the previous attempt succeeded, return the cached result; if it\'s still in-flight, return 409 or block; if it failed deterministically, return the same failure.\n4. **The key is scoped per-customer per-endpoint** to avoid cross-tenant collisions.\n\nWhy it matters: without this, a network timeout on a "create payment" request means the client doesn\'t know whether to retry. With it, retries are safe — the worst case is one extra DB lookup instead of a double-charge. The pattern shows up in Stripe, Square, AWS\'s service APIs, and every webhooks design that needs to claim "at least once delivery without duplicates."',
    },
    {
      level: 'senior',
      question: 'What happened in the GitHub MySQL split-brain incident of October 2018?',
      answer:
        'Per the GitHub post-incident analysis:\n\n- A network partition split the Atlantic between East and West coast MySQL clusters.\n- Both sides briefly accepted writes — for 43 seconds — believing themselves to be the primary.\n- Orchestrator (their leader-election service) eventually picked a single primary, but reconciling the diverged writes required 24 hours of careful manual work.\n- Real customer-visible impact: 24h+ of degraded service while engineers diff\'d the two write streams and merged them.\n\nLessons:\n\n1. **Even with leader election, split-brain windows exist** during the time the election takes to detect and resolve a partition.\n2. **Fencing tokens / semi-sync replication** can shrink but not eliminate this window.\n3. **A 43-second window of dual-writes produced 24 hours of recovery.** The asymmetry between failure duration and recovery cost is the actual operational risk.',
    },
    {
      level: 'staff',
      question: 'What did the Cloudflare "Byzantine failure in the real world" post teach about fault models?',
      answer:
        'Lianza & Snook (2020) describe a real Byzantine failure in production:\n\n- A network switch silently corrupted ~1-in-10⁷ etcd packets in a *specific* way (flipping certain bits).\n- etcd\'s Raft tolerates **crash faults** — nodes that stop — but not **Byzantine faults** — nodes (or networks) that produce arbitrary corrupted messages that pass protocol-level checks.\n- The fault model assumption broke: the protocol assumed messages are either delivered intact or not at all. Reality delivered some messages with corrupted contents that still parsed as valid Raft messages.\n- Mitigation: application-layer checksums on top of TLS, because TLS alone didn\'t catch the specific corruption.\n\nThe takeaway: most distributed-systems algorithms assume crash-fault model. Real-world hardware sometimes produces Byzantine-shaped faults. Assume your fault model and reality may disagree, and add detection (application checksums, audit comparisons) for the assumptions you can\'t verify.',
    },
    {
      level: 'staff',
      question: 'Why does the Dynamo paper use vector clocks, and what problem do they solve that timestamps don\'t?',
      answer:
        'Per DeCandia et al. (2007):\n\nDynamo is leaderless and eventually consistent. Two replicas can accept concurrent writes to the same key. When the writes meet, the system must determine: did one write happen-before the other (in which case the later one wins) or are they truly concurrent (in which case both must be kept as siblings for application-level conflict resolution)?\n\nWall-clock timestamps can\'t distinguish "concurrent" from "ordered" — they\'re subject to clock skew and don\'t capture causality. Two writes with timestamps 100ms apart might be causally independent; two writes with the same timestamp might have a causal relationship.\n\n**Vector clocks** attach a per-node counter to each write. A write A causally precedes B if every component of A\'s vector is ≤ B\'s. They are *concurrent* if neither dominates. This gives Dynamo a sound way to detect "real conflict" vs "stale write" without requiring synchronized clocks.\n\nCost: storage overhead per object, and the vector can grow over time (Dynamo prunes it with heuristics). But it solves a correctness problem that timestamps alone can\'t.',
    },
  ],
};
