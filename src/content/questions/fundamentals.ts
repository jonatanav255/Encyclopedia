import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'fundamentals',
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
    {
      level: 'junior',
      question: 'You see `EMFILE: Too many open files` in production. What does that actually mean?',
      answer:
        'You hit your **per-process file descriptor limit**. Every open file, socket, pipe, epoll instance, and timer holds an FD; the kernel caps how many one process can have at once. Default on Linux interactive shells is often **1024** — laughably low for a server.\n\nUsually it\'s an **FD leak**, not real demand: DB clients constructed per request and never `.end()`ed, HTTP responses left open on error paths, file streams without cleanup. Diagnose with `lsof -p $(pidof node) | wc -l` and watch the trend. Group by type: `lsof -p PID | awk \'{print $5}\' | sort | uniq -c | sort -rn` — a pile of `IPv4` rows is socket leaks.\n\nFix the source (pair every "open" with a guaranteed "close" via `try/finally`, `using`, or stream lifecycle events). Then raise `ulimit -n` to something sensible like 65536.',
    },
    {
      level: 'junior',
      question: 'Why "default to UTF-8 everywhere" and what does that actually mean in practice?',
      answer:
        'Because UTF-8 is the only sane lingua franca. It\'s ASCII-compatible for the first 128 code points, compact for Western text, can encode every Unicode code point, and is self-synchronizing (lose your place mid-stream, you can resync on the next valid start byte).\n\nIn practice: declare `<meta charset="utf-8">` in HTML, `Content-Type: text/plain; charset=utf-8` in HTTP, `utf8mb4` (never plain `utf8`, which is 3-byte and excludes emoji) for MySQL columns, and never use the `ascii` encoding as a "compatible" fallback for unknown data — it silently destroys anything outside `0x00-0x7f`. `TextEncoder` in browsers and Node only emits UTF-8 for this reason.\n\nNote the gotcha: `\'😀\'.length === 2` in JS because `.length` counts UTF-16 code units, not characters. Use `[...str].length` or `Intl.Segmenter` for "user-visible characters."',
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
      question: 'Why is `fs.readFileSync` in a request handler such a disaster?',
      answer:
        'Node\'s event loop is one thread. While `readFileSync` runs, the kernel puts that thread to sleep until the read completes — and the whole loop with it. No other request gets processed, no websocket heartbeat fires, no health check responds. Every concurrent connection stalls for the duration.\n\nEven a "fast" local file is a few ms, which compounds horribly under load: 100 concurrent requests each waiting 5 ms of head-of-line blocking is 500 ms of tail latency for nothing.\n\nAsync equivalent: `await fs.promises.readFile(...)`. Underneath, libuv puts the work on its thread pool (default 4 threads), and the event loop is free to handle other requests in the meantime. Sync I/O is fine in startup code, CLI scripts, and crash-time cleanup — never in a request path.',
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
      question: 'My Docker container ignores `SIGTERM` and gets killed after 10 seconds. What\'s wrong?',
      answer:
        'Almost always one of two things.\n\n**(1) Shell-form CMD swallows the signal.** `CMD ["sh", "-c", "node server.js"]` makes the shell PID 1; the shell doesn\'t forward `SIGTERM` to its child by default, so Node never sees it. Fix with **exec form**: `CMD ["node", "server.js"]` — Node becomes PID 1 and gets the signal directly.\n\n**(2) PID 1 has special rules.** Most signals are ignored by PID 1 unless explicitly handled. If your app doesn\'t install a `SIGTERM` handler (`process.on(\'SIGTERM\', ...)`), the default disposition is also wrong here. Combine that with no zombie reaping and you get hung shutdowns plus `<defunct>` processes piling up.\n\nDefensive default: `docker run --init` (or `tini` in the Dockerfile) gives you a tiny PID 1 that forwards signals and reaps zombies, so your app can just be your app. K8s `terminationGracePeriodSeconds` (default 30) is the SIGTERM-to-SIGKILL window — use it.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between readiness-based (`epoll`) and completion-based (`io_uring`) I/O, and why does each exist?',
      answer:
        '**Readiness** (`epoll`, `kqueue`, `select`/`poll`): the kernel tells you "this FD has data — come do the read yourself." You\'re still on the hook for a `read()` syscall per ready FD. This is what every event-loop server (nginx, Node, Redis, Envoy) is built on — one thread sitting in `epoll_wait`, woken whenever any of thousands of FDs becomes ready.\n\n**Completion** (`io_uring`, Windows `IOCP`): you say "do this I/O for me"; the kernel does it and tells you when the buffer is filled. No post-readiness syscall. Submissions and completions go through ring buffers — you can batch many ops without a syscall per op.\n\nWhy both exist: `epoll` doesn\'t help with **regular files** (they\'re always "ready" — the actual `read()` still blocks on disk). That\'s why Node\'s libuv uses a thread pool to fake async disk I/O. `io_uring` actually solves async disk I/O on Linux, plus reduces syscall overhead in the network hot path. At millions of ops/sec, dropping the per-op syscall is the difference between scaling and not.',
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
      question: 'A container with `--cpus=2` on a 64-core host spawns 64 worker processes. What went wrong?',
      answer:
        'The app called something like `os.cpus().length` (Node) or `runtime.NumCPU()` (Go), which read from `/proc/cpuinfo` or `sched_getaffinity`. **Neither is namespaced** — they show the host\'s CPU count, not your cgroup\'s `cpu.max` limit. Namespaces hide *what you can see*; cgroups limit *what you can use*. The CPU count is in the gap: visible to your process, but not actually usable.\n\nResult: 64 workers fighting for 2 cores of bandwidth (`cpu.max = "200000 100000"` = 200ms CPU per 100ms wall clock). Massive context-switch overhead, throttling, latency spikes.\n\nFixes are runtime-specific:\n\n- **Node**: don\'t use `os.cpus().length` blindly; read `/sys/fs/cgroup/cpu.max` (v2) or the v1 equivalent and divide.\n- **Java**: enable `-XX:+UseContainerSupport` (default in Java 10+) — the JVM reads cgroup limits itself.\n- **Go**: use `automaxprocs` to set `GOMAXPROCS` from cgroup limits.\n\nKubernetes\' Downward API can expose `requests.cpu` as an env var; reading that is the cleanest option in modern orchestrators.',
    },
    {
      level: 'senior',
      question: 'Two threads each increment their own counter in a shared array. You add a thread and per-thread throughput drops. Why?',
      answer:
        '**False sharing**. The two counters live in the same 64-byte cache line. Even though each thread writes its own variable, **MESI cache coherence** forces the line to ping-pong between cores: thread A writes, line goes to `M` (modified) in A\'s cache; thread B writes, A must invalidate (`I`), B takes `M`; A writes again, B invalidates, etc. Each bounce costs tens to hundreds of nanoseconds of inter-core traffic.\n\nThe atomics are correct, there\'s no logical sharing — only *physical* sharing of the cache line. Adding more threads writing into adjacent slots makes it dramatically worse. This is the canonical "added threads, got slower" mystery; reported as "atomics don\'t scale" in microbenchmarks all the time.\n\nFix: **pad each counter to its own cache line** (64 bytes). In C++, `alignas(std::hardware_destructive_interference_size)` or a struct with `char pad[64]`. In Java, `@Contended`. In Rust, `repr(align(64))`. In JS with `SharedArrayBuffer`, stride your indices: `view[i * 8]` for `BigInt64Array` puts each worker on its own line. Detect it on Linux with `perf c2c` — built exactly for this.',
    },
    {
      level: 'senior',
      question: 'Explain the layered runtime stack when you type `docker run nginx`. What does each layer actually do?',
      answer:
        'Roughly:\n\n```\ndocker CLI -> docker daemon -> containerd -> runc -> kernel\n```\n\n- **CLI / API** (`docker`, `crictl`, `podman`): user-facing commands.\n- **High-level runtime** (`containerd`, `CRI-O`): image pulling, lifecycle, networking via CNI plugins, storage via overlayfs.\n- **Low-level runtime** (`runc`, `crun`, `youki`): the thin OCI shim. Reads `config.json`, calls `clone()` with all the namespace flags, sets up rootfs via `pivot_root`, configures cgroups, drops capabilities, applies seccomp, then `execve`s the entrypoint.\n- **Kernel**: namespaces, cgroups, seccomp, overlayfs, capabilities — the actual isolation primitives.\n\nKubernetes goes `kubelet -> CRI (containerd or CRI-O) -> runc -> kernel`. **There is no "container" kernel object** — just a process tree with constraints applied. `ps aux` on the host sees container processes as regular processes with weird namespace memberships. You can run runc directly with a hand-written `config.json` and skip Docker entirely; it\'s educational and proves there\'s no magic.',
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
  ],
};
