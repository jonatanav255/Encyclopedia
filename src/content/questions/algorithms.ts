import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'algorithms',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'What does O(n log n) actually buy you over O(n^2)?',
      answer:
        'It\'s the difference between "scales" and "doesn\'t scale." For `n = 1,000,000`, O(n log n) is ~20 million steps — milliseconds. O(n^2) is a trillion steps — hours. Same machine, same hot loop.\n\nBig-O drops constants and lower-order terms on purpose: it tells you the **shape** of growth, not wall-clock time. So an O(n) algorithm with a giant constant factor can lose to O(n log n) for small inputs. The slope wins eventually; the y-intercept wins early. For anything that processes user-controlled `n`, aim for O(n log n) or better and profile only when it matters.',
    },
    {
      level: 'junior',
      question: 'You see `for (const x of arr) if (arr.includes(x * 2)) ...`. What\'s the complexity, and how do you fix it?',
      answer:
        'It\'s O(n^2). `arr.includes` is O(n) and you\'re calling it inside an O(n) loop. The trap is that `includes` *looks* like one operation — like an array index — but it scans linearly.\n\nFix with a `Set`:\n\n```js\nconst set = new Set(arr);            // O(n)\nfor (const x of arr) {               // O(n)\n  if (set.has(x * 2)) console.log(x); // O(1)\n}\n```\n\nNow O(n). The general pattern: any time you see a linear scan inside a loop, ask whether a hash lookup replaces it. Same for `indexOf` and `find`. The built-ins are not free.',
    },
    {
      level: 'junior',
      question: 'Why is binary search "famously easy to get wrong"?',
      answer:
        'Three classic foot-guns. (1) `(lo + hi) / 2` overflows in fixed-int languages — Joshua Bloch found this in JDK\'s `Arrays.binarySearch` after 20 years. Write `lo + Math.floor((hi - lo) / 2)`. (2) The loop condition (`lo <= hi` vs `lo < hi`) and the update (`hi = mid - 1` vs `hi = mid`) must agree. Mix them and you get either an infinite loop or a missed element at the boundary. (3) Forgetting `mid + 1` on the side you\'re *keeping* — without it, when `lo + 1 === hi`, `mid === lo` and you spin forever.\n\nPractical advice: pick the half-open `[lo, hi)` form and stick with it everywhere. And reach for `lowerBound` (first index `>= target`) as your default — it composes into range queries and "where would this insert?" while plain "find or -1" doesn\'t.',
    },
    {
      level: 'junior',
      question: 'Why does `[10, 2, 1, 20].sort()` return `[1, 10, 2, 20]`?',
      answer:
        '`Array.prototype.sort` defaults to a **lexicographic** (string) comparator — it coerces every element to a string and compares Unicode code points. `"10"` sorts before `"2"` because `"1" < "2"`. For numbers you must pass a comparator: `arr.sort((a, b) => a - b)`.\n\nA few related facts worth knowing: V8 uses Timsort under the hood, and `sort` has been **guaranteed stable since ES2019** — equal elements keep their order, so multi-key sorts compose correctly. `sort` mutates in place and returns the same array; for a sorted copy use `arr.toSorted()` (ES2023) or `[...arr].sort()`. And the comparator must return a **number**, not a boolean — `(a, b) => a > b` is a bug that can silently misorder elements.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'When do you use BFS and when do you use DFS?',
      answer:
        'They\'re the same algorithm with one parameter — the container holding the frontier. **Queue = BFS** (layers out from the source). **Stack (or recursion) = DFS** (go deep before going wide). That single choice changes which problems each solves naturally.\n\nReach for **BFS** for shortest path in *unweighted* graphs, level-order traversal, and "everything within K steps" queries. Reach for **DFS** for cycle detection in directed graphs, topological sort, connected components, and backtracking (sudoku, N-queens). DFS also gives you discovery/finish timestamps for free — that\'s what enables topo sort and Tarjan\'s SCC.\n\nTwo traps. BFS shortest-path **only works on unweighted graphs** — if edges have weights, you need Dijkstra. And recursive DFS blows the stack around ~10K frames in V8 (no TCO); convert to iterative DFS with an explicit stack for deep graphs.',
    },
    {
      level: 'mid',
      question: 'You run BFS on a 1M-node graph and it\'s slow. What\'s the likely culprit?',
      answer:
        '`Array.prototype.shift`. JS arrays are contiguous, so `shift` reindexes every remaining element — O(n) per call. Inside the BFS loop, that turns a linear traversal into O(n^2).\n\nFix it with a head pointer (poor-man\'s deque):\n\n```js\nconst queue = [start];\nlet head = 0;\nwhile (head < queue.length) {\n  const node = queue[head++];\n  for (const next of graph[node]) {\n    if (!visited.has(next)) {\n      visited.add(next);\n      queue.push(next);\n    }\n  }\n}\n```\n\nNow each dequeue is O(1). For interview-sized graphs (~thousands of nodes), `shift` is fine — but on 1M nodes it dominates. If you genuinely need a deque with pop-from-both-ends, ship a small ring buffer or pull one in. The other suspects worth checking: are you using an object as a visited set (slow string keys vs a `Set`), and is your adjacency list literally a `Map` of arrays rather than something with hash overhead per neighbor?',
    },
    {
      level: 'mid',
      question: 'When should you reach for dynamic programming, and how do you start?',
      answer:
        'Two conditions: **overlapping subproblems** (the naive recursion solves the same thing many times) and **optimal substructure** (the best answer combines best answers to subproblems). If both hold, caching turns exponential recursion into polynomial.\n\nThe giveaway is "**optimize over choices**" — find the best/longest/shortest/cheapest, where each step has a choice. Knapsack, edit distance, LIS, coin change, word break, LCS — all fit the shape.\n\nStarter recipe: (1) write the naive recursion first; (2) identify the **state** (the minimum set of parameters that uniquely identifies a subproblem); (3) identify the **transition** (how a state combines from smaller states); (4) add memoization; (5) if you need to optimize space, convert top-down to bottom-up (tabulation) — most 2D DPs can drop to a single row.\n\nThe hard part isn\'t the code, it\'s spotting the state. "How many parameters do I need to fully describe where I am?" If the answer is 4 dimensions each over `n`, you have O(n^4) cells — usually a sign you should hunt for a smaller equivalent state.',
    },
    {
      level: 'mid',
      question: 'Walk through the state and transition for the edit-distance DP.',
      answer:
        '**State**: `dp[i][j]` = the minimum number of single-character edits (insert / delete / substitute) to turn `a[0..i)` into `b[0..j)`. That\'s the smallest description that captures "how far through each string am I."\n\n**Base case**: `dp[i][0] = i` (delete every char of `a`) and `dp[0][j] = j` (insert every char of `b`).\n\n**Transition**:\n\n```js\nif (a[i - 1] === b[j - 1]) {\n  dp[i][j] = dp[i - 1][j - 1];          // free — no edit\n} else {\n  dp[i][j] = 1 + Math.min(\n    dp[i - 1][j],     // delete a[i-1]\n    dp[i][j - 1],     // insert b[j-1]\n    dp[i - 1][j - 1], // substitute\n  );\n}\n```\n\nO(m * n) time and space, but space drops to O(min(m, n)) because each row only needs the previous one. To recover the actual edit script (not just the count), walk backward from `dp[m][n]` to `dp[0][0]` reading off which choice produced each cell — the **traceback**. This is the algorithm behind diff tools (related to Myers\'), spell-checker suggestion ranking, and DNA sequence alignment (Needleman-Wunsch).',
    },
    {
      level: 'mid',
      question: 'Kahn\'s algorithm vs DFS for topological sort — when do you pick which?',
      answer:
        'Both are O(V + E). The choice is about what you need *besides* the order.\n\n**Kahn\'s** (BFS-based, in-degree counting) is the right call when you want **cycle detection for free** — if the queue empties before you\'ve processed every node, the remainder forms a cycle. It\'s also naturally **streamable** (emit nodes as soon as their dependencies are met) and easy to make **deterministic** by swapping the FIFO queue for a min-heap, which gives you lexicographically smallest order — handy for reproducible build outputs.\n\n**DFS** (post-order, then reverse) is shorter to write, gives you the actual **cycle path** if you track parents through GRAY nodes (great for error messages — "circular dependency: A -> B -> C -> A"), and fits naturally if you already need DFS for other reasons (SCCs, dominators).\n\nWatchout: DFS can blow the recursion stack on deep DAGs (V8 caps around 10K frames, no TCO). For very deep graphs, prefer Kahn\'s or convert DFS to an explicit-stack form.\n\nA modified Kahn\'s also yields **layers** — each layer\'s nodes can run in parallel because none depend on each other. That\'s how `make -j`, Airflow, and GitHub Actions decide what to run concurrently.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Why does Dijkstra fail on negative edge weights? What do you use instead?',
      answer:
        'Dijkstra\'s correctness rests on the invariant **"once a node is finalized, no shorter path to it can exist."** That\'s true when every edge adds non-negative cost — extending a path can only make it longer. A negative edge breaks the invariant: a longer-looking path can suddenly become shorter via a negative edge later, but Dijkstra has already finalized the node and won\'t revisit it. Silent wrong answers, no error.\n\nUse **Bellman-Ford** when negatives are possible. It relaxes every edge `V - 1` times, which is O(V * E) — much slower — but it correctly handles negative weights and (uniquely) **detects negative cycles** on a final pass. That\'s the killer feature: arbitrage detection (edge weight = `-log(rate)`, negative cycle = risk-free profit), constraint propagation, infeasibility detection.\n\nPractical defaults: Dijkstra with a binary heap (O((V+E) log V)) for weighted shortest path. **A\\*** with an admissible heuristic (Manhattan, Euclidean, great-circle) when you have a sense of "which direction is the goal" — game pathfinding and GPS routing. Bellman-Ford only when you genuinely have negatives or need the cycle detection.',
    },
    {
      level: 'senior',
      question: 'You have a 100-node memcached cluster and add one node. With naive sharding, what happens? Why does consistent hashing fix it?',
      answer:
        'Naive `hash(key) % N` is catastrophic on resize. Almost every key satisfies `hash(k) % 100 != hash(k) % 101` — roughly **(N-1)/N of all keys remap**, so ~99% of your cache effectively invalidates the instant you add one node. Origin gets hammered, latency spikes, cache stampede.\n\n**Consistent hashing** (Karger et al., 1997) puts both nodes and keys on a circular hash space and assigns each key to the next node clockwise. Adding a node only steals the arc between it and its clockwise neighbor — in expectation **K/N keys move**, not (N-1)*K/N. The other 99% stay hot.\n\nTwo refinements matter in practice. **Virtual nodes** (vnodes): each physical node owns ~100-500 points on the ring so load distributes evenly even with few physical nodes — Cassandra defaults to 256. **Weighted vnodes** let a beefier machine claim proportionally more keys. Watch out for re-hashing pitfalls: changing the vnode count for an existing cluster re-keys everything and loses the rebalance benefit.\n\nThe algorithm shows up everywhere — DynamoDB and Cassandra partitioning, the `ketama` memcached client, CDN edge selection, Redis Cluster\'s 16,384 hash slots (a fixed-slot variant). Alternatives worth knowing: **Jump Hash** (Google, 2014) is simpler and faster but only handles monotone bucket addition; **rendezvous hashing (HRW)** is O(N) per lookup but needs no data structure and is easier to weight.',
    },
    {
      level: 'senior',
      question: 'How does A* differ from Dijkstra, and what makes a heuristic "admissible"?',
      answer:
        'Dijkstra picks the unvisited node with the smallest known distance from the source — it expands outward equally in all directions. **A\\*** picks the smallest `f(n) = g(n) + h(n)` where `g(n)` is the known distance from the source and `h(n)` is a **heuristic estimate** of the remaining distance to the goal. That bias funnels the search toward the goal instead of spreading uniformly.\n\nA heuristic is **admissible** if it **never overestimates** the true remaining distance. Under admissibility, A* is guaranteed optimal. Common admissible heuristics: Manhattan distance for grid pathfinding without diagonals, Euclidean for any-angle movement, great-circle distance for geographic routing. Setting `h(n) = 0` is trivially admissible and degenerates A* into Dijkstra. Setting `h(n)` exactly equal to the true distance makes A* expand only nodes on the optimal path.\n\nIf the heuristic *overestimates*, A* finds a path quickly but it may not be the shortest — that\'s "greedy best-first search," fine when speed beats optimality (real-time game AI sometimes accepts this).\n\nProduction GPS routing doesn\'t run plain A* either: it combines A* with **contraction hierarchies** (preprocessed shortcut edges) and hierarchical routing (motorways for long distances, local roads near endpoints). The core "shortest weighted path" shape is still Dijkstra/A*-shaped underneath.',
    },
    {
      level: 'mid',
      question: 'When does greedy give the optimal answer, and when does it silently fail?',
      answer:
        'A greedy algorithm is correct when the problem has the **greedy-choice property** (a globally optimal solution can be built from locally optimal choices) **plus** **optimal substructure**. Activity selection (max non-overlapping intervals, sorted by end time), Huffman coding, Kruskal/Prim MST, and Dijkstra on non-negative edges all qualify — there\'s a clean exchange argument that swapping in the greedy first pick never loses optimality.\n\nIt silently fails when the locally best choice paints you into a corner. The classic example is **coin change**: greedy "take the biggest coin that fits" works for `[1, 5, 10, 25]` but for denominations `[1, 3, 4]` and target 6 it picks `4+1+1` (three coins) while the optimum is `3+3` (two). For coin change with arbitrary denominations you need DP (`O(N × k)`).\n\nThe practical heuristic: if the decision at each step depends only on a sortable key on the remaining items, greedy is plausible. If the decision depends on which future combinations are reachable, you almost certainly need DP or branch-and-bound. Always sanity-check a greedy with hand-built counterexamples before shipping it.',
    },
    {
      level: 'senior',
      question: 'What\'s the difference between backtracking and branch-and-bound, and when do you reach for each?',
      answer:
        'Both are exponential-worst-case **DFS over the space of partial solutions** with the ability to abandon a branch early. The difference is what makes them abandon.\n\n**Backtracking** prunes on **feasibility**: at each partial state, check whether the constraints can still be satisfied. N-queens, Sudoku, permutation generation, and constraint-satisfaction problems are backtracking — the question is "is there a solution?" or "enumerate all solutions."\n\n**Branch-and-bound** prunes on **optimality**: at each partial state, compute a cheap **bound** on the best achievable cost from here. If the bound is no better than the best-so-far, prune. The bound must be **admissible** (never overestimates the remaining benefit / underestimates the remaining cost) or you risk pruning the optimum. Used for optimization problems: small-instance TSP, integer programming, scheduling.\n\nPractical guidance: if the state space is polynomial, prefer **DP** — it\'s predictable and easier to reason about. Reach for backtracking when you need *any* / *all* solutions to a constraint problem; reach for branch-and-bound when you need the *best* solution to an NP-hard optimization. Most production systems use a library (OR-tools, Gurobi, CP-SAT) rather than rolling their own — the engineering is in the modeling, not the search.',
    },
    {
      level: 'senior',
      question: 'How does Aho-Corasick beat repeated string search, and when is the win worth it?',
      answer:
        'For searching a **single pattern** in text, KMP, Z-algorithm, and naive `indexOf` are all reasonable (KMP and Z give worst-case O(n + m); naive is fine in practice for short patterns). For searching **many patterns** at once, doing N separate scans is O(N · n) — wasteful, since you re-read the text N times.\n\n**Aho-Corasick** builds a trie of all patterns, then adds **failure links** (a generalized KMP failure function across the trie). A single scan of the text traverses the trie via "goto" edges; on a mismatch it follows the failure link instead of restarting. Every position is visited a constant amortized number of times. Total cost: O(N + M + Z) where N = text length, M = total pattern length, Z = number of matches.\n\nProduction users: `fgrep -f patterns.txt`, Snort/Suricata IDS, YARA malware scanners, spam filters, and tokenizers that need to recognize multi-word phrases. Anywhere you have hundreds-to-millions of patterns and a long text stream.\n\nThe win shows up at maybe 5–10 patterns; below that, a few `indexOf` calls beat building the automaton. The build is also O(M) which matters if patterns change frequently — for static dictionaries, build once, reuse forever.',
    },
  ],
};
