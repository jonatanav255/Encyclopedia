import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'nosql',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'Name the five main families of NoSQL databases and a representative system for each.',
      answer:
        '**Key-value** — Redis, DynamoDB. `Map<key, bytes>` semantics. Cache, sessions, rate limiting.\n\n**Document** — MongoDB, Firestore. JSON-shaped records with flexible schemas. CMS, event payloads, catalogs.\n\n**Wide-column** — Cassandra, ScyllaDB. Partitioned tables for write-heavy workloads. Time-series, event logs at scale.\n\n**Graph** — Neo4j, Dgraph. Nodes + edges, traversal queries. Social graphs, fraud detection, recommendations.\n\n**Search** — Elasticsearch, OpenSearch, Meilisearch. Inverted indexes over text. Site search, log aggregation.\n\nTime-series (TimescaleDB, InfluxDB) and vector (pgvector, Pinecone, Qdrant) are increasingly counted as separate families.',
    },
    {
      level: 'junior',
      question: 'Does "NoSQL" mean "no schema"?',
      answer:
        'No. Many NoSQL databases have schemas: Cassandra requires `CREATE TABLE` with types; DynamoDB requires you to declare partition and sort keys. Even MongoDB recommends schema validation (Mongoose, Zod, or built-in JSON Schema validation) once you stop being a prototype.\n\nEven when the database doesn\'t enforce a schema, **the schema doesn\'t go away — it moves to your application code**. Every reader of the data has to handle whatever fields might or might not exist. Year three, you have 14 variants of `user` and code that does `user.email_address ?? user.email ?? user.emails?.[0]?.address`. The actual choice is *where* the schema lives, not whether one exists.',
    },
    {
      level: 'junior',
      question: 'What is a key-value store good at, and what is it bad at?',
      answer:
        '**Good at:** lookups by known key. Single-digit-ms or single-digit-µs reads regardless of dataset size. Atomic operations on a single key (INCR, SET-NX). Caches, sessions, rate-limit counters, feature flags, distributed locks.\n\n**Bad at:** querying by anything other than the key. There\'s no `WHERE`, no joins, no scanning by content. If you want "all users older than 30," you\'d have to look at every key — defeating the point.\n\nThe right pattern: KV store as a high-speed lookup layer alongside a primary database that supports rich queries. Redis + Postgres is the most common shape in production.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'In a document store, when do you embed related data vs reference it?',
      answer:
        '**Embed** when the relationship is bounded, owned, and read together. Order line items inside an order. Address blocks inside a user. You get one-document reads and atomic single-doc writes.\n\n**Reference** when the relationship is unbounded, shared, or independently queryable. A `user_id` on a post (the user isn\'t owned by the post; the post-count is unbounded). A `tag_ids` array referencing a separate tags collection.\n\nThe failure mode is embedding **mutable shared data**: embedding the user\'s name inside every comment looks fast — until they rename and you have to find every copy. The relational instinct ("normalize shared data") still applies; you\'re just choosing per-document instead of per-table.\n\nThe decision is one-way under load. Migrating from embedded to referenced means rewriting every document. Get it right early.',
    },
    {
      level: 'mid',
      question: 'Why do Cassandra and other wide-column stores require you to "design tables for queries"?',
      answer:
        'Wide-column stores partition data by a **partition key** — all rows with the same partition key live on the same node, sorted by the **clustering key**. Queries that include the partition key in the predicate hit one node and are fast. Queries without it would have to fan out to every node — slow or forbidden outright.\n\nSo if you need both "events by user" and "events by type," you build **two tables** (`events_by_user` partitioned by user_id, `events_by_type` partitioned by type), kept in sync at write time. Same data, two tables, optimized for two access patterns.\n\nThis is the cost of wide-column scalability: massive write throughput and predictable lookups, in exchange for inflexibility. Ad-hoc queries that don\'t match a pre-designed table are slow, expensive, or require streaming the data into a separate analytics store like ClickHouse or Elasticsearch.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between a graph database and SQL recursive CTEs?',
      answer:
        'Modern SQL has recursive CTEs (`WITH RECURSIVE`) that can traverse hierarchies and shallow graphs. For tree-shaped data and 2–3 hop queries, they work fine.\n\n**Graph databases shine when the queries are fundamentally graph-shaped**: variable-depth traversals ("find connections 1–6 hops away"), pattern matching across multiple typed relationships ("users who follow X also liked Y"), and shortest-path queries.\n\nThe architectural difference: Neo4j stores **edges as direct pointers** between nodes, so traversal is constant-time per hop regardless of dataset size. SQL recursive CTEs work by repeated joins — each hop multiplies row counts, and performance degrades quickly at depth.\n\n**Rule of thumb:** if your "graph" queries are 1–2 hops, stay in SQL. If you\'re writing 50-line queries with 5 self-joins and they\'re slow, that\'s when a graph database earns its place. Often as a derived index alongside your primary SQL DB, not a replacement.',
    },
    {
      level: 'mid',
      question: 'When does Postgres `JSONB` defeat the case for a document store?',
      answer:
        'Almost always for app data. `JSONB` gives you schemaless storage inside a row — you can index JSON paths, query into nested fields, and still have transactions, joins, foreign keys, and `EXPLAIN ANALYZE` for everything else.\n\nThe case for MongoDB has to be more specific than "our schema is flexible": you need horizontally-partitioned writes beyond a single primary, *or* documents large enough that you genuinely want per-document independence, *or* the real-time replication features (Firestore, Mongo change streams) are central to your product.\n\nMost teams that picked MongoDB for flexibility later wish they had Postgres + JSONB. They get the flexibility they wanted plus the joins, transactions, and reporting they didn\'t realize they\'d need.',
    },
    {
      level: 'mid',
      question: 'What is a "derived index" and why is Elasticsearch best used as one?',
      answer:
        'A **derived index** is a read-optimized copy of your data, populated from your primary database, used for queries your primary DB can\'t answer well. The primary remains the source of truth; the derived index can be wiped and rebuilt at any time.\n\nElasticsearch fits this pattern: it\'s great at full-text search, faceted filters, log aggregation, and (now) vector similarity — none of which Postgres handles as well at scale. But Elasticsearch is **not a system of record**: shards corrupt occasionally, it\'s eventually consistent, indexed writes appear after a flush interval (~1s), and there are no real transactions.\n\nThe pattern: write to Postgres → propagate to Elasticsearch via CDC (Debezium), outbox pattern, or dual-write → search queries hit Elasticsearch → if you need full record details, fetch from Postgres by ID. If Elasticsearch dies, you rebuild it from Postgres. The reverse isn\'t true.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Explain CAP and PACELC, and why PACELC is the more useful framing.',
      answer:
        '**CAP** (Brewer 2000): under a network partition, a distributed system must choose **Consistency** or **Availability**. Partition tolerance is non-negotiable in real networks. A CP system (MongoDB default, etcd, HBase, Spanner) refuses requests it can\'t guarantee consistent; an AP system (Cassandra default, DynamoDB) accepts writes everywhere and reconciles later.\n\n**PACELC** (Abadi 2010) adds the steady-state case: **E**lse (no partition), the system trades **L**atency for **C**onsistency. Even with a healthy network, strong consistency across replicas requires coordination — extra round-trips between nodes — which is latency.\n\nWhy PACELC is better: CAP only describes partition behavior, but most of the time the network is fine. The *cost* of strong consistency in steady state — added latency — is what actually matters day-to-day. PACELC captures that "globally consistent distributed SQL has higher p99 than single-node Postgres" isn\'t a CAP statement, it\'s the ELC trade-off.\n\nIn practice, the modern systems are tunable (DynamoDB strong vs eventual reads per query; Cassandra QUORUM vs ONE; MongoDB read/write concerns). The right framing isn\'t "what letters does this DB have" but "what consistency level do I pick per query, and what does that cost?"',
    },
    {
      level: 'senior',
      question: 'A junior on your team wants to migrate the app from Postgres to MongoDB for "flexibility." How do you respond?',
      answer:
        'Ask two questions first:\n\n1. **Which specific Postgres pain are you solving?** "Schema migrations are annoying" → flexible-shape needs probably fit in a `JSONB` column inside the existing schema. "We hit write throughput limits" → measure first; usually it\'s a missing index, not Postgres being out of headroom.\n\n2. **Which Postgres features will you lose?** Joins, foreign-key constraints, transactional consistency across multiple records, mature query planner, the entire ORM/migration/observability ecosystem. Cross-document transactions exist in modern Mongo but are slower and have caveats. `$lookup` is a join but rarely as fast as the SQL equivalent.\n\nThe usual outcome: the perceived flexibility win is real for a few weeks. The hidden costs (no FK enforcement; schema drift; aggregation pipelines for what used to be GROUP BY; "I need data from two collections" → app-level joining; reporting / admin tools you can\'t cleanly build) show up by month 6.\n\nThe right move 9 times out of 10: keep Postgres, use `JSONB` for the genuinely-variable parts of your schema. You get the flexibility without losing transactions, joins, or 50 years of relational tooling. Reserve MongoDB for cases where you can name a specific workload it serves better — and even then, often it\'s a complement (one MongoDB collection for one specific feature), not a replacement.',
    },
    {
      level: 'senior',
      question: 'You\'re building RAG (retrieval-augmented generation) for a Node app. Which vector database do you reach for and why?',
      answer:
        '**pgvector**, in 90% of cases. Reasons:\n\n- You almost certainly already have Postgres. Adding the `vector` extension is one DDL statement.\n- You can mix vector queries with relational filters trivially: `WHERE category = \'docs\' AND user_id = $1 ORDER BY embedding <=> $2 LIMIT 10`. Pure vector DBs require complex metadata filtering APIs.\n- HNSW indexing makes it fast enough for tens of millions of vectors.\n- One database stack, one backup story, one access-control model.\n\n**When pgvector isn\'t enough:**\n- **Hundreds of millions to billions of vectors** — Qdrant, Milvus, or managed (Pinecone) handle this scale better.\n- **You\'re already running Elasticsearch/OpenSearch and want hybrid search (vector + keyword + facets)** — use the search engine\'s vector capability instead of running two systems.\n- **You want a managed serverless story without operating anything** — Pinecone is the polished managed option.\n- **You need Weaviate-style features** (built-in embedding generation, generative search modules) — Weaviate.\n\nThe trap: reaching for Pinecone/Qdrant/Milvus at MVP because it\'s "the modern way." You add a second database for what pgvector could have done, and now your RAG service has more failure modes than the LLM call itself.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'You\'re recommending the data architecture for a new B2B SaaS product. Walk through the stack and the decisions.',
      answer:
        '**Start with Postgres as the source of truth.** ACID, joins, JSONB for flexible columns, mature tooling, easy hiring. Defend deviations, not the default. Pick managed (RDS, Cloud SQL, Aiven) unless there\'s a reason not to.\n\n**Add Redis** for cache, sessions, rate-limit counters, distributed locks, and lightweight queues (BullMQ if needed). Pairs with Postgres; doesn\'t replace it. Use Redis as best-effort for caches (degrade gracefully if it\'s down) and as a hard dependency only for things you genuinely can\'t run without (e.g., locks for safety-critical operations).\n\n**Add object storage** (S3 / GCS / Azure Blob) for files, images, backups. Never store large blobs in Postgres.\n\n**Add a search store only when you need real text search.** Postgres `tsvector` + GIN handles surprising amounts of search. Upgrade to Meilisearch / Typesense / Elasticsearch when you need faceting, relevance tuning, typo tolerance, or hit ~10M documents. Always treat the search store as a derived index populated from Postgres.\n\n**Add specialized stores only when you can name the workload:**\n- **TimescaleDB** if you have time-series workloads — stays in Postgres, no second stack.\n- **ClickHouse** if you have analytics over billions of events and need sub-second dashboards.\n- **Cassandra / Scylla** if you\'ve measured Postgres can\'t absorb your write rate AND your access pattern is partition-key-shaped. (Rarely needed at SaaS scale.)\n- **Neo4j** if you have 5+ hop traversal queries that are killing SQL recursive CTEs.\n- **pgvector** (in Postgres) for RAG / semantic search.\n\n**Add distributed SQL (Cockroach / Yugabyte / Aurora DSQL) only for multi-region active-active.** For single-region, vertical Postgres + replicas covers more than people think.\n\n**Avoid the anti-patterns:**\n- "We picked MongoDB because we move fast" — the schema settles in 3 months, you regret it.\n- "We sharded Postgres preemptively" — vertical scaling buys years.\n- "We have 7 data stores for a 50-QPS app" — operational debt > feature value.\n\n**The honest 90%-case stack for a new B2B SaaS:** managed Postgres + Redis + S3 + a hosted observability tool. Add specialized stores when (not before) you can name the workload they serve.',
    },
    {
      level: 'staff',
      question: 'A team has been hit by a "lost write" incident in their AP-mode Cassandra setup. Diagnose and propose mitigations.',
      answer:
        '**Establish the failure mode first.** "Lost write" in an AP system typically means one of:\n\n1. **Last-write-wins (LWW) overwrote a concurrent write.** Two clients write the same partition with timestamps that resolve in the wrong order under clock skew. The "winner" overwrites the "loser" silently.\n2. **A write was acknowledged at consistency `ONE` and the node holding it failed before replication completed.** The replica that took the write went down; the other replicas never saw it.\n3. **A delete tombstone propagated faster than a concurrent write.** The new value gets shadowed by the tombstone.\n\n**Diagnosis:** check `system_traces`, look at the timestamps of writes (Cassandra exposes them via `WRITETIME(col)`), inspect node failure timing relative to the lost write. Look at the consistency level the writes were issued at.\n\n**Mitigations, in order:**\n\n1. **Raise the consistency level for important writes** from `ONE` to `LOCAL_QUORUM`. Now a majority of local replicas must acknowledge before success. Reads at `LOCAL_QUORUM` paired with this guarantee strong consistency. Cost: higher latency, lower availability under partition.\n2. **Use lightweight transactions (`IF NOT EXISTS`, `IF col = ...`)** for cases where conditional writes matter. These use Paxos and provide CAS semantics. Expensive — only for critical operations.\n3. **Move the data to a CP system.** If correctness matters more than availability under partition, Cassandra was the wrong choice. Postgres or a distributed-SQL option (CockroachDB, Spanner) gives you ACID without the LWW failure mode.\n4. **NTP / chrony hygiene.** Clock skew across nodes amplifies LWW issues. Tight clock sync isn\'t a fix but is table stakes.\n5. **App-level idempotency + retry.** Even with stronger consistency levels, durability under failure isn\'t free. Idempotency keys + retry-until-success makes individual writes recoverable.\n6. **Move to event sourcing if "lost balance" is the symptom.** Don\'t store mutable balances; store an append-only ledger of credits/debits. Lost writes become "missing entries" you can detect and reconcile, not silent corruption.\n\n**Long-term:** publish a postmortem that names the actual incident (LWW under clock skew, replica failure timing, etc.) and the consistency level chosen. The lesson isn\'t "Cassandra bad" — it\'s "we chose AP without understanding what AP means for our data." Either commit to the AP model with appropriate guards (idempotency, event sourcing, app-level conflict resolution) or move data with strong-consistency requirements to a CP system.',
    },
  ],
};
