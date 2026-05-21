import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'data-structures',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'Big-O says inserting into a linked list is O(1) and into an array is O(n). Why do arrays still beat linked lists in practice?',
      answer:
        '**Cache locality.** An array is a contiguous block of memory, so reading `arr[0]` typically pulls `arr[0..7]` into L1 cache for free. A linked list scatters nodes across the heap; every `next` pointer is a potential cache miss — 100-300 cycles waiting on RAM. Arrays exploit the memory hierarchy; linked lists fight it.\n\nThe "O(1) insert" claim also assumes **you already hold the node**. Usually you don\'t — you walked to find it, which is O(n). And the array\'s O(n) shift is `memmove`, one of the most optimized operations on the planet. Big-O is a ceiling; constants and locality decide.\n\nDefault to arrays. Reach for a linked list only when you have a specific reason — intrusive splicing, LRU-style move-to-front, persistent structures.',
    },
    {
      level: 'junior',
      question: 'Why is `arr.shift()` a trap for implementing a FIFO queue in JavaScript?',
      answer:
        '`shift()` removes the first element and **shifts every remaining element down one index**. That\'s O(n) per dequeue. A million-item queue draining via `shift` is O(n²) — billions of operations.\n\nFor a real FIFO queue, use the two-stacks trick, a circular buffer, or a deque library. `push` + `pop` (work at the end) are both amortized O(1) — fine for a LIFO stack. The asymmetry exists because growing/shrinking at the front means re-indexing everything; the end is free.',
    },
    {
      level: 'junior',
      question: 'A hash table is "average O(1)" but "worst case O(n)". What flips it from one to the other in production?',
      answer:
        'Three failure modes flip O(1) into O(n):\n\n1. **Bad hash function** — keys cluster into the same bucket. Every lookup walks a long chain.\n2. **HashDoS** — an attacker sends crafted keys that all hash to the same bucket. Pre-2012 this took down web frameworks. Modern engines (V8 included) mitigate with **randomized hash seeds** and SipHash.\n3. **Composite key bugs** — you build a key like `JSON.stringify({a, b})` but field order varies between callers, so logically-equivalent keys hash differently. Your "cache hit rate" silently drops to 30% and you only notice from a metrics dashboard.\n\nThe discipline: canonicalize composite keys (sort fields, pick one separator), use the right key type (don\'t stringify numbers), and never use object identity as a key when you mean value equality — `m.set({id: 1}, ...); m.get({id: 1})` returns `undefined`.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'Explain chaining vs. open addressing for hash table collision resolution. Which wins on modern hardware?',
      answer:
        '**Chaining** stores each bucket as a small list of `(key, value)` entries. Simple, tolerates load factor > 1, easy delete. But each chain node is a separate allocation — pointer chase, cache miss per entry.\n\n**Open addressing** stores entries directly in the bucket array. On collision, probe to the next slot (linear, quadratic, or double hashing). Everything in one contiguous array — cache-friendly, no per-entry allocation. Downsides: needs lower max load factor (~0.7), and delete requires tombstones that accumulate and force rehashing.\n\nOn modern hardware, open addressing with linear probing usually wins on raw speed because cache behavior dominates pointer-chasing. **Robin Hood hashing** and Google\'s **SwissTable** (Rust\'s `hashbrown`, Abseil) push this further — SwissTable uses SIMD to scan 16 slots in one instruction. Managed languages like JS expose chaining-style maps (V8\'s `Map` is an ordered chained hash table), which is fine for application code; the SIMD wins matter for systems-level inner loops.',
    },
    {
      level: 'mid',
      question: 'A `Map` insert is "amortized O(1)". What does the worst case look like and how do you avoid it?',
      answer:
        'When the load factor crosses the threshold (~0.75), the table **doubles in size and rehashes every entry** — `hash(key) % oldSize !== hash(key) % newSize`. That one insert is O(n). Across many inserts it averages to O(1), but the spike is real: resizing a 4M-entry map to 8M can pause for tens of milliseconds.\n\nMitigations:\n\n- **Pre-size** if you know the count: `new Map(arrayOfEntries)` sizes once instead of doubling repeatedly.\n- **Incremental resize** (Go\'s map): rehash a few entries per operation. V8 does *not* do this for `Map`.\n- For latency-sensitive hot paths over millions of entries, profile — don\'t assume the amortized cost.\n\nV8\'s ordered `Map` also rebuilds when too many deletion holes accumulate, so churn-heavy workloads see the same kind of pause.',
    },
    {
      level: 'mid',
      question: 'You need to find the top 100 largest numbers in a stream of 10 million. What data structure and why?',
      answer:
        'A **min-heap of size K (=100)**. Push the first 100. For each subsequent item: if it\'s larger than the heap\'s min (the root), pop the min and push the new value. At the end the heap holds the K largest.\n\nComplexity: O(N log K) ≈ 10M × 7 ≈ 70M ops. Sorting the whole thing would be O(N log N) ≈ 230M, and requires holding all 10M in memory. The heap-of-K only ever holds 100.\n\nThis is also how streaming top-K works on an unbounded stream — you can\'t sort infinity, but a size-K min-heap runs forever in constant memory. Same pattern shows up in Dijkstra (priority queue keyed by tentative distance), event simulation, and the merge step of external sort.\n\n```js\nfor (const x of stream) {\n  if (heap.size() < k) heap.push(x);\n  else if (x > heap.peek()) { heap.pop(); heap.push(x); }\n}\n```',
    },
    {
      level: 'mid',
      question: 'Why does a heap store as a flat array instead of as a tree of node objects?',
      answer:
        'The **shape invariant** of a binary heap is "complete tree" — all levels full except possibly the last, which fills left to right. That shape lets you map tree positions to array indices: node `i` has parent `(i-1)/2` and children `2i+1` and `2i+2`. No pointers needed.\n\nBenefits: no per-node allocation, no pointer overhead, perfect cache locality (sift-up and sift-down walk parent/child indices that are close in memory for the first few levels). One array, two integers per swap, done.\n\nThe price: you can\'t efficiently `decrease-key` a specific element by reference (it would require an O(n) search to find its index). For Dijkstra, the workaround is the **stale-entry trick** — push a new better entry, ignore the old one when it surfaces. Fibonacci heaps support decrease-key in O(1) amortized but their constants are so bad they\'re almost never worth it in practice.',
    },
    {
      level: 'mid',
      question: 'When do you reach for a binary search tree instead of a hash table?',
      answer:
        'When you need **ordering**. A hash table gives O(1) point lookup but can\'t answer:\n\n- "Give me all keys between `lo` and `hi`" — range query, O(log n + k) in a BST.\n- "What\'s the next key after this one?" — predecessor/successor, O(log n).\n- "Iterate keys in sorted order" — in-order traversal, O(n) with no extra sort step.\n- "What\'s the min/max?" — O(log n) in a BST, O(n) in a hash table.\n\nIn practice you almost never implement a BST yourself — you use a self-balancing variant your language ships (`std::map` in C++ is a red-black tree, Rust\'s `BTreeMap` is an in-memory B-tree). JS has *no* built-in ordered map, which is a real gap; you either use a library, simulate with a sorted array (O(n) insert, fine for small n), or push the sorting to read time.\n\nAnd the trap: **a plain BST built from sorted input degenerates into a linked list** — every operation becomes O(n). Real-world data (event logs by time, auto-incrementing IDs) is often partially sorted, so naive BSTs hit this constantly. Always assume self-balancing in production.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Sketch union-find with the two standard optimizations. Why is the amortized cost "effectively O(1)"?',
      answer:
        'Two operations: `find(x)` returns the root of x\'s set; `union(x, y)` merges their sets. Naive parent-pointer implementation degrades to O(n) per op when trees become spindly.\n\n**Union by rank**: when merging, attach the shorter tree under the taller one. Keeps trees shallow.\n\n**Path compression**: during `find`, repoint visited nodes directly at the root. The classic one-liner is path halving:\n\n```js\nfind(x) {\n  while (this.parent[x] !== x) {\n    this.parent[x] = this.parent[this.parent[x]];\n    x = this.parent[x];\n  }\n  return x;\n}\n```\n\nWith both optimizations, the amortized cost per operation is O(α(n)) — the **inverse Ackermann function**, which is ≤ 4 for any n that fits in the observable universe. So effectively O(1), not literally. Without one of them you\'re at O(log n); without either, O(n).\n\nFifteen lines of code total, used in Kruskal\'s MST, incremental cycle detection on undirected graphs, image segmentation, incident grouping, and connected-component queries. One of the highest-leverage structures in the toolbox. The catch: no delete, no split, no member iteration — once united, always united.',
    },
    {
      level: 'senior',
      question: 'Why are database indexes B+ trees instead of binary search trees or hash tables?',
      answer:
        'Three reasons converge on B+ trees.\n\n**Page-sized nodes.** Disks and SSDs do I/O in pages (4-16KB). Reading 1 byte costs the same as reading 8KB. A binary search tree with one key per node wastes that read. A B-tree node holds hundreds of keys per page — branching factor of 200 instead of 2. For a billion entries, log₂(1e9) ≈ 30 page reads vs. log₂₀₀(1e9) ≈ 4. With the top levels in shared buffers, real lookups hit 1-2 disk pages.\n\n**Range scans are free.** B+ trees store all data in leaves and **link the leaves into a list**. `WHERE created_at BETWEEN x AND y ORDER BY created_at` walks down to the first matching leaf, then follows `next` pointers until the end of the range. No tree traversal per row, results already sorted, no extra sort step. A hash index can\'t do range queries at all.\n\n**Always balanced.** B-trees rebalance through splits (insert) and merges or borrows (delete), so all leaves stay at the same depth. No degenerate-on-sorted-input failure mode that plagues naive BSTs.\n\nWhen you say "B-tree index" you almost always mean B+ tree — Postgres, MySQL/InnoDB, Oracle, SQL Server, MongoDB, SQLite all use them. The same shape wins in memory too: Rust\'s `BTreeMap` is an in-memory B-tree, beating red-black trees on cache locality because of its higher fanout.',
    },
    {
      level: 'senior',
      question: 'Implement an LRU cache with O(1) get and put. What\'s the trick, and what does it teach about doubly-linked lists?',
      answer:
        'Two structures sharing the same nodes: a **hash table** from key → node, and a **doubly-linked list** ordered by recency (head = most recent, tail = least recent). The hash gives O(1) lookup; the doubly-linked list gives O(1) "move this node to the front" and "remove the tail."\n\n```js\nget(key) {\n  const node = this.map.get(key);\n  if (!node) return undefined;\n  this._remove(node);\n  this._addToFront(node);\n  return node.value;\n}\n```\n\nThe **sentinel head/tail nodes** are the implementation trick — placeholder nodes that aren\'t real entries. Without them every splice needs null checks for "is this the first node? the last one?" With them, every real node has real `prev` and `next` and the splicing code is branch-free.\n\nThis is also the one place a linked list genuinely beats an array. You\'re not traversing — you already hold the node reference from the hash lookup — so splicing is two pointer assignments, O(1). All the cache-locality arguments against linked lists don\'t apply when you never walk.\n\nThere\'s also a `Map`-insertion-order trick (delete + re-insert on each touch) that\'s ~12 lines and uses the spec-guaranteed ordering. Slower in practice — each touch is a delete + insert in V8\'s ordered hash, more work than splicing two pointers — but fine for prototypes. In an interview, lead with the doubly-linked-list version; mention the Map trick second.',
    },
    {
      level: 'senior',
      question: 'When does true LRU stop being worth the cost, and what do real production caches do instead?',
      answer:
        'True LRU updates the recency list on **every read**. At small scale that\'s a couple of pointer writes per access — trivial. At Redis or CDN scale, the per-access bookkeeping becomes the bottleneck, plus you need a lock around the list for concurrent access (contention nightmare).\n\nReal production caches use approximations:\n\n- **Sampled LRU** (Redis): on eviction, pick N random entries (default 5) and evict the worst by access time. As N grows, behavior approaches true LRU. `maxmemory-samples` is the knob.\n- **CLOCK**: one bit per entry plus a circular pointer. OS page caches use this. No list manipulation per access.\n- **W-TinyLFU** (Caffeine, modern Java caches): admission control via Count-Min frequency sketch. Often the best general-purpose hit rate as of the late 2010s.\n- **2Q, ARC, LRU-K**: hybrids that distinguish one-hit-wonders from genuinely hot keys.\n- **Sharded LRU** (Caffeine, Guava): separate LRU per shard keyed by hash. Avoids one global lock; each shard has its own.\n\nThe production-cache lesson: **the data structure is the easy part**. The system around it — concurrency, TTLs alongside capacity, memory accounting (bytes vs. entry count), stampede protection on hot key expiration, negative caching — is the actual job. Eviction policy choice depends on workload: LRU baseline, LFU for stable popularity (CDN), W-TinyLFU for the best general-purpose hit rate.',
    },
  ],
};
