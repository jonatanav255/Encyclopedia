import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'memory-low-level',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'Why is hex (base 16) used so heavily for low-level data instead of decimal?',
      answer:
        'Because one hex digit is exactly **four bits** — so two hex digits is one byte, with no awkward boundary. Decimal hides bit structure (`255` doesn\'t look special; `0xff` screams "all eight bits set"). Hex dumps line up byte-by-byte, you can eyeball patterns (`0d 0a` is CRLF, `7f 45 4c 46` is an ELF magic), and powers of two are recognizable on sight (`0x100` = 256, `0xffff` = 65535).\n\nMemorize a few: `0xff` = 255, `0x100` = 256, `0xffff` = 65535, `0xffffffff` ~= 4.29B. Once those are reflex, half the "scary low-level" debugging stops being scary.',
    },
    {
      level: 'junior',
      question: 'Why does `id INT` in MySQL die at ~2.1 billion rows, and what\'s the fix?',
      answer:
        'A MySQL `INT` is **signed 32-bit two\'s-complement**. The max positive value is `2^31 - 1` = **2,147,483,647** — and the next auto-increment fails because there\'s no room. Reddit, Slack, and YouTube\'s view counter have all hit this (Gangnam Style famously broke YouTube\'s counter in 2014).\n\nFix: declare ID columns as `BIGINT` (signed 64-bit, max ~9.2e18 — heat death of the universe territory). The four extra bytes per row are nothing compared to the cost of migrating a saturated `INT` column later. Same logic applies to Unix timestamps in `int32` — they wrap on January 19, 2038 ("Y2K38").',
    },
    {
      level: 'junior',
      question: 'What\'s actually in a Unix process, beyond "running code"?',
      answer:
        'A process is a sandbox the kernel hands your program. It has:\n\n- A unique **PID** and parent **PPID**.\n- A private **virtual address space** (code, heap, stack, mmap\'d regions).\n- A **file descriptor table** mapping small ints to open files, sockets, pipes.\n- **UID/GID**, working directory, environment variables.\n- **Signal handlers** and resource limits (`ulimit`).\n- At least one **thread** (all threads share the address space and FDs).\n\nProcesses can only affect each other through the kernel — signals, pipes, sockets, shared memory. That isolation is why Unix scales: a crashing process can\'t corrupt anything outside itself, and the kernel cleans up its resources.',
    },
    {
      level: 'junior',
      question: 'Roughly how much slower is main memory than L1 cache, and why does that matter?',
      answer:
        'L1 cache reference is ~1 ns. Main memory reference is ~100 ns. So **a cache miss is ~100x more expensive than a cache hit** — about 300 cycles of stall on a 3 GHz CPU, enough to execute hundreds of instructions if the data had been there.\n\nThis is why "the textbook O(log n) linked-list implementation" is often slower than a "dumb" O(n) scan over a contiguous array: the constant factor from cache behavior swamps the asymptotic difference. Memorize the rough ratios (L1 1ns, L2 ~4ns, RAM ~100ns, NVMe ~20 us, same-region RTT ~500 us, cross-continent ~150 ms). Knowing where data lives in this pyramid is half of performance intuition.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'You see a Node process with `VIRT=8.5G` and `RSS=120M`. Should you panic?',
      answer:
        'No. `VIRT` is the total **virtual address space** reserved — including untouched mmap\'d regions, V8\'s pre-reserved heap range, worker thread stacks, and shared libraries. None of it is necessarily backed by physical RAM. A 64-bit process has 256 TB of address space available; reserving large ranges is free until something writes to a page.\n\n`RSS` (resident set size) is **physical RAM actually mapped right now**, which is what matters. The 120M is your real footprint, give or take double-counting of shared pages with other processes.\n\nFor accurate per-process accounting on Linux, look at `Pss` (proportional set size) in `/proc/PID/smaps` — it divides shared pages by the number of sharers, so you can sum across workers without double-counting libc et al. The number to watch operationally is `MemAvailable` in `/proc/meminfo`, not `MemFree`.',
    },
    {
      level: 'mid',
      question: 'A bug stores 1 MB locally on the C stack and crashes. Why?',
      answer:
        'Stacks are **small and fixed**. Default per-thread stack is ~8 MB on Linux, ~1 MB on Windows, ~512 KB on macOS. A `char buf[1024 * 1024]` local eats 1 MB of that budget for one frame — combined with deeper call chains or threads with smaller stacks, you run off the end and hit the **guard page**, which the kernel turns into `SIGSEGV`.\n\nThe stack is great for small locals because allocation is one instruction (`sub rsp, N`), deallocation is `ret`, and the hot frames stay in L1 cache. But anything large or with a lifetime longer than the current function belongs on the heap. In JS the symptom is `Maximum call stack size exceeded` from runaway recursion — same root cause, different language wrapper.',
    },
    {
      level: 'mid',
      question: 'Why is iterating a 2D array column-by-column often 5-20x slower than row-by-row?',
      answer:
        'For row-major storage (C arrays, JS typed arrays, NumPy default), elements of the same row are contiguous in memory. The CPU fetches data in **64-byte cache lines**, so a row-wise sweep gets ~8 doubles per line for free, plus the hardware prefetcher catches the sequential pattern and starts loading ahead.\n\nColumn-wise iteration strides by `cols * sizeof(element)` bytes per step. Every inner-loop access touches a different cache line. The line that *was* prefetched (containing the next row\'s element at this column) gets evicted before you ever visit it. You pay ~100 ns of DRAM latency on what should have been ~1 ns of L1 access.\n\nSame data, same total work, 5-20x slower. The rule: **iterate in storage order**. Outer loop varies slowest. For column-major languages (Fortran, MATLAB), the rule flips.',
    },
    {
      level: 'mid',
      question: 'What\'s "Struct of Arrays" (SoA) vs "Array of Structs" (AoS), and when does it matter?',
      answer:
        '**AoS**: each logical element is one struct, stored together. `particles[i].x` and `particles[i].color` sit next to each other. Ergonomic; the natural way to model objects.\n\n**SoA**: each field lives in its own contiguous array. `xs[i]`, `ys[i]`, `zs[i]` are separate `Float64Array`s. Updating just positions touches three tight streams the prefetcher loves, with no cache pollution from unused fields like `color` and `mass`.\n\nIt matters when you have **millions of records and a hot loop that touches only some fields**. Game engines (Unity DOTS), numeric libraries (NumPy), and columnar data formats (Apache Arrow, Parquet) are all SoA for exactly this reason. The "10x speedup from rewriting to SoA" reports are real — you stop bringing cold fields into cache lines they don\'t belong in.',
    },
    {
      level: 'mid',
      question: 'Roughly how expensive is a syscall, and what does that imply for throughput?',
      answer:
        'A syscall has **~100-500 ns of pure overhead** on modern x86-64 before any real work — context switch from ring 3 to ring 0, save/restore registers, argument validation, return. For `getpid` (which returns a cached value), that\'s essentially the entire cost.\n\nImplication: **batching matters**. Writing a thousand 1-byte chunks costs ~1000 syscalls; one 1000-byte write costs 1. Same data, 1000x fewer transitions. This is why high-throughput I/O uses vectored ops (`readv`/`writev`), big buffers, and `io_uring` (submit many ops, collect completions, without a syscall per op).\n\nIt\'s also why kernel-bypass stacks (DPDK for network, SPDK for storage) exist: at millions of ops/sec, even 200 ns of overhead per op caps your throughput. For app code, the practical rule is "buffer aggressively before crossing the user/kernel boundary."',
    },
    {
      level: 'mid',
      question: 'How does Linux\'s CFS decide which thread to run next?',
      answer:
        'The **Completely Fair Scheduler** tracks each runnable thread\'s **virtual runtime** (vruntime) — how much CPU it\'s already had, weighted by priority. Threads sit in a **red-black tree** keyed by vruntime; at each scheduling point, CFS picks the **leftmost (lowest vruntime) node**, runs it for a slice (a few ms, sized by total load), updates its vruntime, and reinserts.\n\nResult: under contention, all equal-priority threads converge on equal CPU shares. `nice` adjusts the weight (lower nice = bigger weight = vruntime grows slower = more CPU). An I/O-bound thread\'s vruntime barely advances while sleeping, so it gets scheduled quickly on wake — which is why I/O work feels responsive even on a loaded box, until the cores are saturated with CPU-bound competitors.\n\nAs of 2023+, Linux ships **EEVDF** (Earliest Eligible Virtual Deadline First) as the newer default. Same shape conceptually with explicit latency targets.',
    },
    {
      level: 'mid',
      question: 'Why does the network use big-endian while your CPU is little-endian?',
      answer:
        'Pure history and standards. TCP/IP, defined in the 1970s, picked **big-endian** ("network byte order") — most significant byte first, the way humans write numbers. The DEC PDP-11 and Intel 8080 lineage went **little-endian** for hardware reasons (easy integer widening, easier carry-on-add), and x86 inherited it. ARM and RISC-V also default to little-endian.\n\nSo every network-facing app has a translation step: `htons`/`htonl` in C, `Buffer.writeUInt32BE` in Node, `DataView.setUint32(offset, value, false)` in JS (note the default is big-endian — opposite of typed arrays, which use native byte order). Forget the conversion and your server binds to port `20480` instead of port `80` because the bytes are swapped.\n\nThe rule: **use `DataView` or explicit BE/LE methods at every I/O boundary**. Typed arrays for in-memory math, `DataView` for wire formats and files.',
    },
    {
      level: 'mid',
      question: 'When should you reach for processes vs threads?',
      answer:
        'Threads share everything by default (heap, FDs, address space) and cost less to create. Processes share nothing by default and cost more. Pick based on **what you need isolated**.\n\n**Threads win** when: shared mutable state is central (in-memory cache, DB buffer pool, game scene graph), CPU-bound work needs to operate on the same data structures, memory budget is tight (one heap shared by N threads vs N copies).\n\n**Processes win** when: isolation matters (browser tabs, nginx workers, Postgres backends — a crash in one shouldn\'t kill the rest), different privilege levels are needed, or you\'re in a runtime with a global interpreter lock (Python CPython, Ruby MRI, Node\'s single JS isolate per process).\n\nMost production systems use both: processes for isolation between major components, threads (or goroutines / virtual threads) inside each process for parallelism.',
    },
    {
      level: 'mid',
      question: 'Why does writing to a closed socket sometimes silently kill your process?',
      answer:
        '`SIGPIPE`. When you `write()` to a pipe or socket whose other end has been closed, the kernel sends `SIGPIPE` to your process. The default disposition is **terminate** — no error message, no stack trace, just gone. Classic bug: your server writes to a client that hung up, `SIGPIPE` fires, the whole process dies silently.\n\nThe fix is to **ignore SIGPIPE** and check `write()`\'s return value (`EPIPE`) instead. In C: `signal(SIGPIPE, SIG_IGN)` once at startup, or use `MSG_NOSIGNAL` on each `send()`, or set `SO_NOSIGPIPE` on the socket (macOS/BSD). Node ignores it for you by default.\n\nThis is part of a broader signals lesson: signal handlers must be **tiny** in raw C (only async-signal-safe functions are legal inside them — no `printf`, no `malloc`, no `mutex_lock`). High-level runtimes (Node, Java, Go) trampoline signals onto safe points in the event loop so you can write normal code in the handler — but the "keep it small and just trigger cleanup elsewhere" instinct sticks.',
    },
    {
      level: 'mid',
      question: 'Why does `0.1 + 0.2 !== 0.3`, and what should you actually do about it?',
      answer:
        '`0.1` in decimal has no exact representation in binary — it\'s `0.0001100110011...` repeating, just like `1/3` repeats in decimal. IEEE-754 binary64 stores a close-but-not-exact approximation. Add two rounded approximations, and you get `0.30000000000000004`. Same answer in every language that uses IEEE-754 (Python, Java, C, Go, Ruby, ...).\n\nWhat to do:\n\n- **For money: never use float.** Store as integer minor units (cents, satoshis) or use a decimal library (`decimal.js`, Java `BigDecimal`, .NET `decimal`).\n- **For comparison: use tolerance**, not `===`. `Math.abs(a - b) <= Number.EPSILON * Math.max(1, |a|, |b|)`. The `max(1, ...)` accounts for ULP scaling with magnitude.\n- **For large sums of small floats**, use **Kahan compensated summation** — keeps a running correction for what rounding threw away. Significantly more accurate than naive `reduce`.\n\nAnd `NaN !== NaN` — test with `Number.isNaN(x)`, not `x === NaN`.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Why is `MemFree` near zero on a healthy Linux box, and what should you actually watch?',
      answer:
        'Because **Linux uses all otherwise-idle RAM for the page cache**. Anything you `read()` from a file goes through the page cache; subsequent reads of the same pages hit RAM at ~20 GB/s instead of disk at ~3 GB/s. The kernel\'s philosophy: "unused memory is wasted memory." So with 32 GB of RAM and 8 GB of process memory, you\'ll see ~22 GB of `Cached` and `MemFree` near zero. That\'s the desired state.\n\nThe number that matters is **`MemAvailable`** (in `/proc/meminfo` and `free -h`): free memory plus reclaimable page cache — what new allocations can actually use. Production dashboards that alert on `MemFree` low generate false alarms forever; the K8s "working set" metric gets this right.\n\nAlso watch `Dirty` — pages written but not yet flushed to disk. A growing `Dirty` means a write-storm is coming during the next `fsync` window. And remember: `write()` returning success only means the bytes are in the page cache, not on the platter. Durability requires `fsync` / `fdatasync` / `msync`.',
    },
    {
      level: 'senior',
      question: 'Why do SQLite, LMDB, and Kafka rely heavily on `mmap`, while Postgres deliberately maintains its own buffer pool?',
      answer:
        'Both approaches are correct in their contexts; the disagreement is about who knows the access pattern better.\n\n**mmap-based stores** (SQLite default, LMDB, Kafka log segments) lean on the kernel\'s page cache. Reads are essentially zero-copy — the page cache *is* the read cache, no separate buffer pool data structure to maintain. The OS handles eviction, prefetch, and writeback with decades of tuning. First access to a page is a minor fault (cheap); subsequent accesses are just memory reads. Mapping a 100 GB file takes microseconds because nothing is read until you touch a page.\n\nThe trade-offs: you don\'t control eviction precisely (the kernel may evict your hot pages under memory pressure from another process), TLB churn matters at huge dataset sizes (huge pages help), and `fsync` durability semantics are OS-shaped, not DB-shaped.\n\n**Postgres** maintains its own `shared_buffers` in shared memory and bypasses heavy reliance on the page cache for reads (though writes still flow through it). Its argument: "we know what\'s hot — what indexes matter, what query patterns repeat — better than the kernel does. We can do smarter eviction (clock-sweep with hints), pin pages during operations, and we don\'t want a noisy neighbor on the host evicting our working set."\n\nThe practical implication: tune `shared_buffers` (Postgres) vs sizing your container memory generously and trusting the kernel (LMDB/Kafka). And for both: `MemAvailable`, not `MemFree`, is the number to watch.',
    },
    {
      level: 'senior',
      question: 'Explain how Redis BGSAVE uses `fork()` and copy-on-write to snapshot without blocking writes.',
      answer:
        'Redis is in-memory. To dump a consistent snapshot to disk while still serving writes, it calls `fork()`. The child gets a **CoW view of the entire dataset** — pages are shared between parent and child, marked read-only in both page tables. The child leisurely walks the dataset and writes it to disk; from its point of view the values are frozen in time. The parent keeps serving traffic.\n\nWhen the parent writes to a page, the CPU traps; the kernel allocates a new physical page, copies the original\'s contents, maps the new page (writable) into the parent, and resumes. The child still sees the original page — its snapshot is preserved.\n\nCost: as the parent writes during BGSAVE, more pages CoW-unshare. In a worst-case write-heavy workload, RSS can briefly **double**. In typical workloads only a small fraction copies. This is why Redis docs warn about `vm.overcommit_memory=1` — under restrictive overcommit, the kernel may refuse the fork, worried it can\'t back all potentially-CoW pages, even though most will never be written.\n\nSame pattern is the entire reason Unicorn/Gunicorn/Node `cluster` "preload" tricks work: load slow-to-init state in the master, fork workers, the shared pages stay shared until something writes them. GC compaction in managed runtimes is the silent killer — it rewrites pages and unshares them all.',
    },
    {
      level: 'senior',
      question: 'Two threads each increment their own counter in a shared array. You add a thread and per-thread throughput drops. Why?',
      answer:
        '**False sharing**. The two counters live in the same 64-byte cache line. Even though each thread writes its own variable, **MESI cache coherence** forces the line to ping-pong between cores: thread A writes, line goes to `M` (modified) in A\'s cache; thread B writes, A must invalidate (`I`), B takes `M`; A writes again, B invalidates, etc. Each bounce costs tens to hundreds of nanoseconds of inter-core traffic.\n\nThe atomics are correct, there\'s no logical sharing — only *physical* sharing of the cache line. Adding more threads writing into adjacent slots makes it dramatically worse. This is the canonical "added threads, got slower" mystery; reported as "atomics don\'t scale" in microbenchmarks all the time.\n\nFix: **pad each counter to its own cache line** (64 bytes). In C++, `alignas(std::hardware_destructive_interference_size)` or a struct with `char pad[64]`. In Java, `@Contended`. In Rust, `repr(align(64))`. In JS with `SharedArrayBuffer`, stride your indices: `view[i * 8]` for `BigInt64Array` puts each worker on its own line. Detect it on Linux with `perf c2c` — built exactly for this.',
    },
    {
      level: 'senior',
      question: 'How do you actually prevent deadlock between threads holding multiple locks?',
      answer:
        'Coffman\'s four conditions all have to hold for deadlock: mutual exclusion, hold-and-wait, no-preemption, and **circular wait**. Eliminate any one. In practice you target the circular wait by enforcing a **total order on locks** — always acquire in the same global order.\n\n```js\nconst [first, second] = [lockA, lockB].sort(byId);\nawait first.lock();\nawait second.lock();\n```\n\nWith a consistent acquisition order, no cycle can form in the wait-for graph. Define the order globally (by lock ID, by depth in your domain hierarchy, alphabetical — doesn\'t matter as long as it\'s consistent). Enforce in code review.\n\nWhen a global order isn\'t feasible (per-object locks, any pair might be touched), use `tryLock` with **random jitter backoff** to break livelock. And the deeper structural fix: hold locks for the shortest time possible, never call user-provided callbacks while holding a lock, and where you can, **redesign to avoid shared mutable state** (per-thread copies, message passing, immutable snapshots, lock-free atomics for trivial cases).\n\nFor diagnosis in production: `jstack` (Java has best-in-class deadlock detection), `pstack` or `gdb thread apply all bt` for C, Go\'s runtime panics on full deadlock. Most deadlocks won\'t reproduce without contention — run under stress in CI.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Why does the same code run 2-3x faster on a sorted array than an unsorted one?',
      answer:
        'Branch prediction. Modern CPUs have 15-20 stage pipelines and can\'t wait for a branch to be evaluated before fetching the next instructions — they **predict** and speculatively execute down the guessed path. Correct: pipeline stays full, branch is free. Wrong: the speculative work is squashed and the pipeline reloads from the correct path, costing ~15-20 cycles per misprediction.\n\nIn `if (data[i] >= 128) sum += data[i]` over random bytes, the branch goes ~50/50 — the predictor guesses wrong about half the time. Tens of millions of mispredictions per run on a million-element array. Sort the data first: the first half is always `false`, the second half always `true`. The predictor catches this within a handful of iterations. Near-zero mispredictions for the rest of the run.\n\nThis is the StackOverflow demo — clean evidence that **microarchitectural state has macro-level perf consequences**. The branchless workaround sidesteps the predictor entirely: `sum += (data[i] >= 128) * data[i]` (or a `cmov`-style trick). JITs sometimes do this transformation automatically; not always.\n\nThe deeper architectural takeaway is the same one Spectre/Meltdown exploit: speculation isn\'t free, and its side effects (cache state, predictor history) are observable. For day-to-day code, ignore this. For the hot 5% of your codebase, measuring `perf stat -e branch-misses` is worth it.',
    },
    {
      level: 'staff',
      question: 'Why does code "work on x86 but break on ARM," and what\'s the principled fix?',
      answer:
        'Different **memory models**. x86/x86-64 is **TSO (Total Store Order)** — strong; only store-load reordering is allowed. ARM, ARM64, RISC-V, PowerPC are **weakly ordered** — loads can reorder with loads, stores with stores, loads with stores in either direction. Code that "looks correct" often happens to work on x86 because TSO covers up missing barriers; the same code on ARM64 (Apple Silicon, AWS Graviton) exposes the latent bug.\n\nClassic example: Thread 1 writes `data = 42; ready = true;`. Thread 2 spins on `ready` then prints `data`. On a weak machine, Thread 2 can see `ready=true` *before* `data=42` becomes globally visible — and prints `0`. The compiler is also allowed to reorder, independent of the CPU, which means even on x86 you can hit it.\n\nThe principled fix: **use atomics with acquire/release (or sequentially consistent) semantics for any cross-thread publication**. A release-store on `ready` ensures all prior writes are visible before the flag becomes true; the matching acquire-load on the reader sees everything that was visible before that release. In JS, `Atomics.store` and `Atomics.load` are sequentially consistent by default — use them for any `SharedArrayBuffer` access you care about. In Java, `volatile` gives you acquire/release. In C++, `std::atomic` with `memory_order_seq_cst` (the default) — relax to `acquire`/`release` only with measurement and care.\n\nOperationally: **run CI on multiple architectures**. Apple Silicon Macs have been the best forcing function in a decade for cleaning up latent ordering bugs in widely-used libraries.',
    },

    // --- new pages: questions ---

    // memory-ordering-models
    {
      level: 'mid',
      question: 'What does "release / acquire" mean and why isn\'t plain `volatile` (in C/C++) enough?',
      answer:
        'A **release-store** on a flag publishes everything written before it; a matching **acquire-load** that observes the published value guarantees those prior writes are visible to the reader. It\'s the language-level "publication" pattern.\n\n`volatile` in **C/C++** prevents some compiler reorderings and forces re-reads from memory, but it does *not* establish acquire/release happens-before — neither the CPU nor other compiler optimizations are bound by it. So a `volatile` flag on a weak-memory CPU (ARM, RISC-V) lets the reader see `ready=true` *before* the data the producer thought it published. The correct primitive is `std::atomic<T>` with `memory_order_acquire`/`release` — or just the default `seq_cst`.\n\nJava is different: Java\'s `volatile` happens to mean sequentially consistent. Same keyword, completely different semantics. Don\'t carry C++ intuition across.',
    },

    // cas-and-aba
    {
      level: 'senior',
      question: 'What is the ABA problem in lock-free code, and how do real systems avoid it?',
      answer:
        'CAS says "update if the value is still X." A thread reads `head = A`, gets descheduled. While it sleeps, A gets popped, B gets popped, A is freed, and a new allocation reuses A\'s address and pushes it back as the head. The sleeping thread wakes, its CAS sees `head == A` and succeeds — but the chain past A is now completely different memory. The CAS contract was satisfied; the **semantics** were violated.\n\nThe three production fixes: **tagged pointers** (a `<ptr, counter>` pair compared atomically, so the counter changes even when the pointer reuses an address — needs double-word CAS like `cmpxchg16b`); **hazard pointers** (each thread publishes "I\'m looking at X"; nobody frees X until no hazard pointer references it); **epoch-based reclamation** (memory freed in epoch N isn\'t reclaimed until every thread has left epoch N).\n\nGC\'d languages get safe reclamation for free — the GC won\'t collect A while a thread still holds it, so the address can\'t be reused under your CAS. That\'s why lock-free data structures are easier in Java than in C++.',
    },

    // numa-and-locality
    {
      level: 'senior',
      question: 'You allocate a 4 GB buffer on a NUMA box, then process it from many threads, and one thread runs much slower. Why?',
      answer:
        'Linux\'s default policy is **first-touch**: a physical page is allocated from the RAM of the CPU that *first writes* to it. If a single thread `memset`s the buffer (or it gets touched during initialization on one CPU), the entire allocation sits on one NUMA node. When parallel workers then process it, the ones on the **other node** make every memory access cross the inter-socket interconnect — ~1.5-2x the latency of local DRAM.\n\nFix: **parallel first-touch** — have each worker thread zero/init the slice it will later process, so the pages land on the right node. Alternatively pin the whole process to one node with `numactl --membind=0 --cpunodebind=0`. Diagnose with `numastat` (look for `numa_miss` or `numa_foreign` growth) or `perf` events for remote-DRAM hits.\n\nThe larger lesson: on any multi-socket or large EPYC box, init order is part of performance. `--interleave=all` is a fine "I don\'t know the access pattern" fallback for unknown workloads.',
    },

    // cache-coherence-mesi
    {
      level: 'senior',
      question: 'In MESI, why is reading from a cache line shared across many cores fast, but writing to it expensive?',
      answer:
        'In **S** (Shared) state, any number of caches can hold a clean copy of a line; reads hit locally with no inter-core traffic. To write, the writing core must transition the line to **M** (Modified), which requires sending **invalidate** messages to every other core that has it in S, waiting for acknowledgments, and only then performing the store. That round-trip is tens to hundreds of nanoseconds — on cross-socket boxes, well over 100 ns of pure protocol cost per contended write.\n\nConsequence: read-mostly data structures scale almost linearly with cores (everyone holds it in S, no coherence traffic). Write-heavy shared data does not — every write to a shared line invalidates N-1 caches. **Atomic operations** are coherence operations: a locked `cmpxchg` is "acquire the line in M, perform RMW, release," which is the same protocol cost as a contended write.\n\nWatch for it with `perf c2c` — high HITM (hit-modified) counts on a line mean coherence ping-pong, which is the mechanism behind both legitimate contention and false sharing.',
    },

    // tlb-and-huge-pages
    {
      level: 'senior',
      question: 'What\'s the TLB and why might "enabling huge pages" speed up your database by double-digit percent?',
      answer:
        'The TLB is the CPU\'s cache of virtual-to-physical address translations. Modern cores have only ~1024-2048 L2 TLB entries. With the standard 4 KiB page, that covers at most ~4-8 MiB of working set. Any process whose hot data exceeds that pays TLB-miss penalties — a full page-table walk is ~50-100 ns on top of the data fetch.\n\nA 2 MiB **huge page** is one TLB entry covering 512x as much memory, so the same 1024 entries reach 2 GiB. Database buffer pools, JVM heaps, and any application repeatedly accessing multi-GB regions become TLB-bound at 4 KiB and suddenly fit at 2 MiB. Reported wins for Postgres / MongoDB / large JVM apps run 5-30%.\n\nTwo deployment models: **Transparent Huge Pages** (kernel promotes silently — set to `madvise` mode for latency-sensitive apps to avoid background defrag pauses), or **hugetlbfs** with a reserved pool at boot (deterministic, used by Postgres `huge_pages=on`, KVM, DPDK).\n\nWatch out for **TLB shootdowns** on many-core systems — every `munmap`/`mprotect` IPIs all cores using the old mapping, which gets expensive when mapping changes are frequent.',
    },

    // simd-and-vectorization
    {
      level: 'mid',
      question: 'When does SIMD actually speed up code in practice, and when should you not bother?',
      answer:
        'SIMD pays off when a tight inner loop does the same operation across many contiguous elements with no data-dependent branching. Classic wins: image filters, numeric reductions, dot products, JSON / regex prefilters, compression encoders, BLAS/ML kernels. Speedups of 4-16x on the same core are real.\n\nIt does **not** help: loops with early exits, data-dependent branches, pointer chasing, function calls per iteration, or compute that\'s memory-latency-bound (SIMD widens loads, but memory latency is unchanged). Auto-vectorizers (`-O3 -march=native`) bail on most of those.\n\nIn practice, most of the SIMD you benefit from is in libraries you already use — libc string ops, simdjson, zstd, BLAS — and your application code rarely needs to touch intrinsics directly. When you do, the path is: write a clean loop, check `-fopt-info-vec` to see if it vectorized, only drop to intrinsics or `std::simd` / `highway` if measurement shows a problem. Beware of AVX-512 on older Intel parts: it can trigger frequency throttling that makes short bursts net-negative.',
    },

    // malloc-internals
    {
      level: 'senior',
      question: 'Your service\'s RSS keeps growing under load and dropping a bit after, but never returns to baseline. Is that a leak?',
      answer:
        'Often not — it\'s the allocator caching freed memory in per-thread / per-arena freelists, ready to satisfy the next spike without going back to the kernel. glibc\'s `ptmalloc2` is particularly aggressive about keeping memory once it\'s grown. jemalloc/tcmalloc/mimalloc are more eager to return memory to the OS but still cache substantially.\n\nTo distinguish allocator caching from a real leak: look at the allocator\'s own stats, not RSS. `malloc_info` / `jemalloc.stats` / tcmalloc\'s `MallocExtension::GetStats` show **in-use bytes** separately from **mapped bytes**. If in-use is flat and mapped is high, it\'s caching; if in-use is also growing, it\'s a leak.\n\nTactical fixes: switch to jemalloc or tcmalloc via `LD_PRELOAD` (often the single biggest no-code-change win for memory behavior), tune `MALLOC_ARENA_MAX` / `MALLOC_TRIM_THRESHOLD_`, or call `malloc_trim(0)` periodically to force return. For workloads with batch allocate-then-free phases, an **arena allocator** sidesteps the problem entirely.',
    },

    // gc-tricolor-marking
    {
      level: 'senior',
      question: 'What\'s a write barrier, why does every modern GC have one, and what does it cost your app?',
      answer:
        'During concurrent marking, the GC and your code (the *mutator*) run at the same time. If your code stores a reference from a fully-scanned ("black") object to a not-yet-scanned ("white") object and then removes the original path to that white object, the GC will finish marking *without ever visiting it* and free a still-live object. The **write barrier** is a small piece of code the runtime injects at every pointer store; it intercepts that dangerous shape and fixes it — typically by greying the target (Dijkstra/forward barrier, used by Go) or by remembering the overwritten old value (SATB barrier, used by G1 and Shenandoah).\n\nCost: a few extra cycles on every pointer write in your program. That\'s why "lots of small objects with mutated pointer fields" is the most expensive allocation pattern in managed languages — you\'re paying the barrier on every store, not just on collection. Workloads that allocate lots of value types or immutable references stress the barrier much less.\n\nThis is the entire reason ZGC, Shenandoah, and the Go collector can deliver sub-10 ms pauses on huge heaps — the expensive marking work runs concurrently, with the barrier preserving correctness.',
    },

    // generational-and-region-gc
    {
      level: 'senior',
      question: 'Why does the JVM\'s G1 collector beat the old CMS / parallel GCs on heaps over ~32 GB?',
      answer:
        'CMS and the parallel collectors split the heap into a fixed young + old generation. Full collections must scan the entire old generation, and the **compaction** phase has to run stop-the-world — for a 64 GB heap this is hundreds of milliseconds to seconds of pause.\n\nG1 (Garbage-First) splits the heap into hundreds or thousands of small regions (1-32 MB each). Each region\'s role (Eden, Survivor, Old, Humongous) is assigned per-cycle. The collector picks the regions with the most reclaimable garbage first ("garbage-first"), and compaction copies live objects out of those few regions while the mutator runs — concurrent compaction. **Pause time scales with the size of the per-cycle work set, not the heap.**\n\nZGC and Shenandoah push this further with **load barriers** (every pointer load is intercepted, so the GC can move an object even while threads read references to it). They deliver sub-10 ms pauses on multi-TB heaps. The right collector for a given app is workload-dependent — G1 is the default and works well to ~32 GB; ZGC is the right choice for very large heaps with tight pause targets.',
    },

    // elf-and-dynamic-linking
    {
      level: 'senior',
      question: 'A binary works on your dev box and fails on the prod host with "error while loading shared libraries". What\'s actually happening?',
      answer:
        'The **dynamic linker** (`/lib64/ld-linux-x86-64.so.2`, baked into the binary\'s `PT_INTERP` header) couldn\'t resolve a needed shared library. The library is named in the binary\'s `DT_NEEDED` entries (visible via `readelf -d`). The linker searches: paths baked into the binary (`DT_RPATH`/`DT_RUNPATH`, set at link time), then `LD_LIBRARY_PATH`, then `/etc/ld.so.cache`, then the system default paths.\n\nCommon causes: prod host is on a different distro / glibc version than dev; `LD_LIBRARY_PATH` was set in dev shell and not in prod; the binary was built with `-rpath` pointing to a path that only exists on the build machine; a library was renamed or a soname bumped (`libssl.so.1.1` → `libssl.so.3`). Diagnose with `ldd ./prog` on the broken host — anywhere it says "not found" is your problem.\n\nLong-term fixes: statically link (`musl + Rust` or `CGO_ENABLED=0 Go` produce drop-in binaries), use containers that bundle their own libraries, or build distroless / minimal images where the dependency set is explicit.',
    },

    // calling-conventions-and-abi
    {
      level: 'mid',
      question: 'You write a JS binding that calls a C function, pass it integer arguments, and get garbage back. What\'s likely wrong?',
      answer:
        'You\'ve almost certainly mismatched the **ABI** — argument register order or type widths. On Linux/macOS x86-64, the System V AMD64 convention passes the first 6 integer args in `rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9` and returns in `rax`. Get the order wrong, get the types wrong (`long` is 64-bit on Linux but 32-bit on Windows; `int` is 32-bit everywhere; `size_t` is 64-bit on 64-bit), or skip `extern "C"` on a C++ entry point (so the name is **mangled** and the linker resolves a wrong symbol), and you get silent corruption.\n\nThe standard fixes: use a binding generator (`bindgen`, `napi-rs`, `node-ffi`, SWIG) that reads the C headers and produces correct calls. If you must hand-write, double-check argument count and types, verify the symbol with `nm` / `objdump -T`, and use `c++filt` to demangle if names look mangled. On Windows you also need to know whether the function uses Microsoft x64 (`rcx`, `rdx`, `r8`, `r9`) or the older `stdcall` / `cdecl` conventions — mixing them crashes immediately.',
    },

    // perf-counters-and-pmu
    {
      level: 'senior',
      question: 'Your code is slow but a sampling profiler just shows "60% in this big function." What\'s the next move?',
      answer:
        'Sampling profilers tell you where time is spent. They don\'t tell you **why** the CPU stalled. The next step is `perf stat -d` (or its Apple Silicon / AMD equivalents) for **IPC**, **branch miss rate**, and **LLC miss rate**.\n\n- **IPC** (instructions per cycle) below 1.0 means the CPU is stalled on something. Above 2 means it\'s executing well.\n- **High LLC miss rate** + low IPC → memory-bound. Look at data layout, prefetching, working-set size.\n- **High branch-miss rate** + low IPC → branchy code. Sort data, hint the predictor, or rewrite branchless.\n- **Normal IPC + high CPU time** → genuinely compute-bound. Now the algorithmic / SIMD work matters.\n\nThen drill in: `perf record -e cache-misses -g ./prog` profiles sampled on misses, attributing them to specific lines. `perf c2c` finds cache-line contention. The Intel/Linux **top-down methodology** (`perf stat --topdown`) classifies every cycle as retiring / bad speculation / front-end bound / back-end bound, narrowing the search in seconds.',
    },

    // ebpf-for-tracing
    {
      level: 'senior',
      question: 'When would you reach for eBPF instead of adding logging?',
      answer:
        'When you need to observe behavior on a running production system without modifying or restarting the app, especially at the kernel / syscall boundary. eBPF programs attach to kprobes, uprobes, tracepoints, USDT markers, or LSM hooks; the verifier proves them safe; the kernel JITs them to native code. Net result: arbitrary, *production-safe* tracing of any syscall or kernel function with effectively zero overhead.\n\nConcretely: `execsnoop` and `opensnoop` show every exec / open system-wide; `tcpconnect` traces outbound connections; `runqlat` shows scheduler wait-time histograms; `offcputime` shows where threads spend off-CPU time (the missing half of a flame graph). Continuous profilers (Parca, Pyroscope, Datadog) sample at 50 Hz with negligible cost.\n\nAdd logging when you need *app-level* state — the value of a specific Python variable, a domain-specific event. eBPF excels at "what is happening at the kernel boundary" and "what cross-process behavior is occurring," not at "what was the contents of this object."',
    },

    // bit-hacks
    {
      level: 'mid',
      question: 'How do you check if a number is a power of two in one line, and where does that pattern actually show up?',
      answer:
        '`x != 0 && (x & (x - 1)) == 0`. `x - 1` flips the lowest set bit and every bit below it; ANDing with `x` clears that bit. If the result is zero, there was only one set bit — a power of two. The `x != 0` guard rules out zero (which has zero set bits and would falsely pass).\n\nIt shows up everywhere: hash table capacities are typically forced to powers of two so `hash & (n - 1)` replaces `hash % n` (much faster); buffer-size validation; alignment masks (`ptr & (alignment - 1) == 0` is "is `ptr` aligned to `alignment`"); page-frame management.\n\nC++20 has `std::has_single_bit(x)` and `std::bit_ceil(x)` (next power of two) in the `<bit>` header. Modern compilers also recognize the SWAR popcount and emit `popcnt`, and pattern-match `bswap` and many other common bit ops to single instructions. Reach for the standard-library function or compiler intrinsic; write the hack only when you need to read code that already uses it.',
    },

    // data-alignment-and-padding
    {
      level: 'mid',
      question: 'You profile a hot loop and see lots of cache misses despite a small struct. What\'s likely going on?',
      answer:
        'Most likely either **struct padding** is bloating the actual record size, or you\'re crossing **cache-line boundaries** with each access. Both inflate the bytes pulled into cache per logical record.\n\nField order matters. `{ char a; double b; char c; }` pads to 24 bytes (1 + 7 padding + 8 + 1 + 7 padding); reordered large-to-small to `{ double b; char a; char c; }` it\'s 16 bytes (8 + 1 + 1 + 6 padding). Same fields, 33% fewer cache lines touched. Run `pahole` on your binary to see exact layouts and find waste.\n\nFor large arrays of structs (e.g., a million particles), also consider **Struct-of-Arrays**: keep each field in its own contiguous array so a hot loop touching only some fields doesn\'t bring cold fields into cache. Game engines, columnar databases, and numpy arrays all use SoA for this reason.\n\nThe other common cause is **false sharing**: two cores writing to "their own" variables that happen to share a 64-byte cache line. Detect with `perf c2c`; fix by cache-line-padding (`alignas(64)` in C++, `repr(align(64))` in Rust, `@Contended` in Java).',
    },

    // swapping-and-oom-killer
    {
      level: 'senior',
      question: 'Your Kubernetes pod was killed with status `OOMKilled` (exit 137) but its heap looked fine. What happened?',
      answer:
        'The cgroup hit its memory limit and Linux\'s OOM killer fired *inside the cgroup* — it picked the largest process in the pod and SIGKILL\'d it. "Heap looked fine" usually means you were looking at the runtime\'s heap (V8, JVM), but cgroup memory also counts **anonymous pages, page cache for files the cgroup opened, kernel-side accounting**, and (cgroup v1) sometimes stranger things.\n\nCommon causes: a Node service with the default `--max-old-space-size` of ~1.7 GiB allocated lots of buffers / `Buffer.allocUnsafe` outside the V8 heap; a JVM older than 10 sized its heap from the host\'s RAM rather than the cgroup limit (fix with `-XX:+UseContainerSupport`, default in modern JVMs); heavy file I/O filled the cgroup\'s page cache; Go pre-1.19 had no cgroup awareness for memory (use `GOMEMLIMIT`).\n\nDiagnose: `dmesg` (or `kubectl describe pod`) shows the OOM banner with the victim\'s `anon-rss`, `file-rss`, and `pgtables`. Big `file-rss` means cache; big `anon-rss` means heap or off-heap allocations. Fix the runtime\'s memory-limit awareness first, then re-evaluate the container limit at p99 RSS plus a buffer.',
    },
  ],
};
