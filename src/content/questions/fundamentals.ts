import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'fundamentals',
  questions: [
    // --- junior ---
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
      question: 'Why is `fs.readFileSync` in a request handler such a disaster?',
      answer:
        'Node\'s event loop is one thread. While `readFileSync` runs, the kernel puts that thread to sleep until the read completes — and the whole loop with it. No other request gets processed, no websocket heartbeat fires, no health check responds. Every concurrent connection stalls for the duration.\n\nEven a "fast" local file is a few ms, which compounds horribly under load: 100 concurrent requests each waiting 5 ms of head-of-line blocking is 500 ms of tail latency for nothing.\n\nAsync equivalent: `await fs.promises.readFile(...)`. Underneath, libuv puts the work on its thread pool (default 4 threads), and the event loop is free to handle other requests in the meantime. Sync I/O is fine in startup code, CLI scripts, and crash-time cleanup — never in a request path.',
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

    // --- senior ---
    {
      level: 'senior',
      question: 'A container with `--cpus=2` on a 64-core host spawns 64 worker processes. What went wrong?',
      answer:
        'The app called something like `os.cpus().length` (Node) or `runtime.NumCPU()` (Go), which read from `/proc/cpuinfo` or `sched_getaffinity`. **Neither is namespaced** — they show the host\'s CPU count, not your cgroup\'s `cpu.max` limit. Namespaces hide *what you can see*; cgroups limit *what you can use*. The CPU count is in the gap: visible to your process, but not actually usable.\n\nResult: 64 workers fighting for 2 cores of bandwidth (`cpu.max = "200000 100000"` = 200ms CPU per 100ms wall clock). Massive context-switch overhead, throttling, latency spikes.\n\nFixes are runtime-specific:\n\n- **Node**: don\'t use `os.cpus().length` blindly; read `/sys/fs/cgroup/cpu.max` (v2) or the v1 equivalent and divide.\n- **Java**: enable `-XX:+UseContainerSupport` (default in Java 10+) — the JVM reads cgroup limits itself.\n- **Go**: use `automaxprocs` to set `GOMAXPROCS` from cgroup limits.\n\nKubernetes\' Downward API can expose `requests.cpu` as an env var; reading that is the cleanest option in modern orchestrators.',
    },
    {
      level: 'senior',
      question: 'Explain the layered runtime stack when you type `docker run nginx`. What does each layer actually do?',
      answer:
        'Roughly:\n\n```\ndocker CLI -> docker daemon -> containerd -> runc -> kernel\n```\n\n- **CLI / API** (`docker`, `crictl`, `podman`): user-facing commands.\n- **High-level runtime** (`containerd`, `CRI-O`): image pulling, lifecycle, networking via CNI plugins, storage via overlayfs.\n- **Low-level runtime** (`runc`, `crun`, `youki`): the thin OCI shim. Reads `config.json`, calls `clone()` with all the namespace flags, sets up rootfs via `pivot_root`, configures cgroups, drops capabilities, applies seccomp, then `execve`s the entrypoint.\n- **Kernel**: namespaces, cgroups, seccomp, overlayfs, capabilities — the actual isolation primitives.\n\nKubernetes goes `kubelet -> CRI (containerd or CRI-O) -> runc -> kernel`. **There is no "container" kernel object** — just a process tree with constraints applied. `ps aux` on the host sees container processes as regular processes with weird namespace memberships. You can run runc directly with a hand-written `config.json` and skip Docker entirely; it\'s educational and proves there\'s no magic.',
    },
  ],
};
