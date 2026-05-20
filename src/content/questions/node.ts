import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'node',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'What does it mean that Node is "single-threaded"?',
      answer:
        'Your JavaScript code runs on one thread. Only one function executes at a time; everything else waits in queues. Underneath, libuv uses a thread pool for file I/O, DNS, and some crypto — but your JS never runs in parallel with itself unless you explicitly spawn `worker_threads` or child processes.',
    },
    {
      level: 'junior',
      question: 'What is the difference between CommonJS and ESM?',
      answer:
        '**CommonJS** uses `require()` and `module.exports`. Synchronous, dynamic, has ambient `__dirname`/`__filename`. **ESM** uses `import`/`export`. Asynchronous loading internally, static analysis, no ambient dirname (use `import.meta.dirname`). New projects should default to ESM; CommonJS is fine for legacy.',
    },
    {
      level: 'junior',
      question: 'Why is `pnpm` preferred over `npm` in this codebase?',
      answer:
        'Content-addressable store (less disk + faster installs), strict module resolution (catches phantom dependencies at install), better defense against supply-chain attacks (isolated `node_modules` limits blast radius). The pnpm-only rule is a deliberate defensive choice — see the global CLAUDE.md.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'What\'s the order? `console.log("A"); setTimeout(() => console.log("B"), 0); Promise.resolve().then(() => console.log("C")); console.log("D");`',
      answer:
        '**A, D, C, B.** Sync code runs first (A, D). The microtask queue drains before any macrotask, so the promise callback (C) runs before the setTimeout (B).',
    },
    {
      level: 'mid',
      question: 'In Node, what is the difference between `setTimeout(fn, 0)` and `setImmediate(fn)`?',
      answer:
        'Different phases of the event loop. From the main module the order is non-deterministic. **From inside an I/O callback** (the poll phase), `setImmediate` runs in the next **check** phase, immediately after. `setTimeout(fn, 0)` waits for the next loop iteration to reach the **timers** phase. Mental model: `setImmediate` = next phase, `setTimeout(0)` = next iteration.',
    },
    {
      level: 'mid',
      question: 'How do you cancel a `fetch` request after 5 seconds?',
      answer:
        'Use an `AbortSignal`:\n\n```js\nawait fetch(url, { signal: AbortSignal.timeout(5000) });\n```\n\nThrows an `AbortError` after 5 seconds. For composability, `AbortSignal.any([sigA, sigB])` (Node 20+) aborts if any input signal does — useful for "abort on timeout OR on client disconnect."',
    },
    {
      level: 'mid',
      question: 'Why is `Buffer.allocUnsafe` dangerous, and when would you actually use it?',
      answer:
        '`allocUnsafe` returns memory that\'s **not zeroed** — it may contain bytes from previous allocations, including secrets. Never use it for buffers you expose to user code or pass between contexts. The legitimate use: you\'re about to fully overwrite the buffer in the very next operation (e.g., reading exactly N bytes from a file into a known-size buffer). For anything else, use `Buffer.alloc`.',
    },
    {
      level: 'mid',
      question: 'Why does `fs.readFileSync` belong only at startup, not in request handlers?',
      answer:
        'It blocks the event loop until the read completes. For a small local file, that\'s a few ms — but you\'re paying that cost on **every** request, while every other request waits. For large files or network FS, it can be hundreds of ms or more. Use `fs.promises.readFile` (or the async callback form) in request handlers. Sync APIs are fine in CLI scripts, app startup (before listening), and crash-time cleanup.',
    },
    {
      level: 'mid',
      question: 'You write `fetch(url)` thousands of times to the same host. Why might that get slow?',
      answer:
        'Two reasons. First, **no DNS caching**: Node\'s `dns.lookup` doesn\'t cache by default, so each call may re-resolve. Second, **no keep-alive pool by default**: undici\'s default dispatcher doesn\'t maintain a global pool, so connections may be re-established. Fixes: install `cacheable-lookup` and set a `undici.Agent` with `keepAliveTimeout` via `setGlobalDispatcher`.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between `pipe()` and `pipeline()`?',
      answer:
        '`pipe()` connects streams but **doesn\'t propagate errors** — an error in any stream leaves the others dangling, leaking file descriptors. `pipeline()` (from `node:stream/promises`) handles error propagation and cleanup automatically and returns a promise. Use `pipeline()` for anything new.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Your Node service is using 1.9GB of RAM and growing. How do you find the leak?',
      answer:
        'Workflow:\n\n1. **Capture a heap snapshot** at a stable baseline. Connect Chrome DevTools via `--inspect`, or call `v8.writeHeapSnapshot()` from a SIGUSR2 handler.\n2. **Apply load** to reproduce growth.\n3. **Capture a second snapshot** at peak.\n4. **Diff them** in DevTools. The top growers point to the leak.\n5. **Look at retainers** — what\'s keeping each object alive?\n\nCommon culprits: unbounded caches (use `lru-cache`), listener pile-up on emitters, `setInterval` holding closures, promises that never settle, and timers without `unref()`. Fix the source, not the symptom (`--max-old-space-size` is a knob, not a cure).',
    },
    {
      level: 'senior',
      question: 'When would you actually reach for worker threads?',
      answer:
        '**CPU-bound JS** that would block the event loop: image processing without a native binding, PDF generation, parsing huge CSVs, compute-heavy ML inference, hashing at high concurrency. Workers have their own V8 isolate — they run in parallel with the main thread, sharing memory via `SharedArrayBuffer` if needed. Costs ~30MB+ per worker and tens of ms to spawn; pool them with `piscina` if you\'ll use them often. Don\'t use them for I/O — the event loop is already idle during I/O waits.',
    },
    {
      level: 'senior',
      question: 'Why is `setImmediate` recursion safe but `process.nextTick` recursion not?',
      answer:
        '`process.nextTick` queues onto Node\'s nextTick queue, which drains **between** event-loop phases — and it drains *completely* each time. Recursively scheduling `nextTick` means the queue never empties; the loop never advances; I/O callbacks never fire; the process effectively freezes.\n\n`setImmediate` queues onto the next **check** phase. The loop still advances to other phases between iterations. `setImmediate(setImmediate(...))` yields to I/O between iterations. The same is true for `setTimeout(fn, 0)`.\n\nRule: if you want to loop without starving the loop, use `setImmediate`, not `process.nextTick`.',
    },
    {
      level: 'senior',
      question: 'A SIGTERM arrives during a deploy. What should your Express service do?',
      answer:
        '1. **Fail the readiness probe** so the load balancer stops routing new traffic. Wait a few seconds for the LB to notice.\n2. **Stop accepting new HTTP connections** — `server.close()`.\n3. **Wait for in-flight requests** to finish. Close idle keep-alive connections proactively (`server.closeIdleConnections()` in Node 18.2+).\n4. **Close downstream resources** — DB pools, Redis, queues — *after* the server is done.\n5. **Hard-cap the total shutdown** with a `setTimeout` that exits with code 1 if anything hangs. Stays inside the orchestrator\'s grace period.\n6. **Don\'t skip steps 1–4 just because step 5 will save you** — it\'s a safety net, not the plan.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Design observability for a Node service handling 5k req/sec.',
      answer:
        '**Three pillars, instrumented from day one:**\n\n**Metrics** (Prometheus + Grafana, or hosted equivalent): RED + USE per route — Rate, Errors, Duration (p50/p95/p99), Saturation, Utilization. Event-loop lag from `perf_hooks.monitorEventLoopDelay` exported on every container. GC pause durations. Per-route latency histograms — not averages.\n\n**Tracing** (OpenTelemetry, exported to Jaeger / Datadog / Honeycomb): every incoming request gets a trace ID propagated downstream via `traceparent`. Spans for each DB query, cache call, outbound HTTP. Sample at 1–10% in prod; force 100% for errors and slow requests (`tail-based sampling`).\n\n**Logs** (structured JSON via pino, shipped to Loki / CloudWatch / Datadog): include request ID, user ID, route, latency, status. **One log line per request at info level** — don\'t spam. Errors get full stack + cause chain. Avoid `console.log` — it\'s sync and slow.\n\n**Alerts** based on SLOs, not raw metrics: error budget burn rate over 1h and 6h. SLO violations page; raw errors don\'t. Reduces alert fatigue.\n\n**Performance regression detection**: continuous load test in CI compared to baseline; alert on p99 latency or RPS regressions.\n\n**Runbooks**: every alert links to one with the dashboard, common causes, and mitigation steps.',
    },
    {
      level: 'staff',
      question: 'Your Node service has gradually rising memory usage in production. RSS reaches 1.8GB after 6 hours; restart fixes it. Diagnose.',
      answer:
        '**Confirm it\'s a leak, not normal growth.** Plot `process.memoryUsage()` — if `heapUsed` rises steadily without leveling off, it\'s a leak. If `rss` rises but `heapUsed` is stable, it might be V8\'s heap fragmentation or off-heap (native modules, Buffer pool) — different problem.\n\n**Capture snapshots.** Add a SIGUSR2 handler that calls `v8.writeHeapSnapshot()`. In production, trigger it once early (baseline) and once when memory is high (loaded). Pull both files locally; load into Chrome DevTools.\n\n**Diff snapshots.** "Comparison" view shows what grew. The top retainers are usually:\n- Unbounded `Map` / `Set` (caches without eviction). Switch to `lru-cache`.\n- EventEmitter listeners. Set `setMaxListeners(...)`, audit `on()` without matching `off()`.\n- Timer or interval holding a closure with large captured state. `unref()` won\'t help; you need to clear them.\n- Promises that never settle (e.g., DB calls hanging). Each holds a closure and any awaiting callbacks.\n- Connection pools with leaked connections — driver-specific.\n\n**Confirm with logs/metrics.** Custom gauge for cache size, listener count, in-flight requests. If the gauge climbs alongside memory, you\'ve found it.\n\n**Reproduce in staging** with load. Heap snapshots in prod are necessary but reproducing helps you verify the fix.\n\n**Fix**: bound the cache, remove the listener, clear the timer, fail the promise. **Don\'t just bump `--max-old-space-size`** — that delays the symptom and risks OOM-kills under load spikes.\n\n**Long-term**: add a memory regression test; alert on rate-of-growth, not just absolute RSS.',
    },

    // --- additions for new topics ---

    // junior
    {
      level: 'junior',
      question: 'What replaces `nodemon` and `dotenv` in modern Node?',
      answer:
        '`node --watch` restarts on file changes; `node --env-file=.env` loads env vars before running. Combined with `--experimental-strip-types` (or just native TS in 23.6+), the modern dev script is `node --watch --env-file=.env src/index.ts`. No `nodemon`, no `dotenv`, no `tsx`/`ts-node`. Caveat: `--env-file` doesn\'t do variable expansion; `dotenv-expand` still has a niche.',
    },
    {
      level: 'junior',
      question: 'How do you run a `.ts` file directly with modern Node?',
      answer:
        '`node --experimental-strip-types src/index.ts` (Node 22.6+) or just `node src/index.ts` (23.6+ default for .ts). Node erases the type annotations and runs the JavaScript. **No type checking at runtime** — that\'s `tsc --noEmit`, which you still run in CI. Stripping doesn\'t handle `enum`, `namespace`, or parameter properties; for those use `--experimental-transform-types` or rewrite to literal-union types.',
    },

    // mid
    {
      level: 'mid',
      question: 'What does `node:test` give you that justifies leaving Jest/Vitest?',
      answer:
        'Built-in, zero deps. Subtests via `t.test`, mocking via `mock.fn` / `mock.method` / `mock.timers`, snapshot testing, coverage via `--experimental-test-coverage`, watch via `--test --watch`, multiple reporters (spec/tap/junit), parallel files. Native ESM and TypeScript. For libraries and backend services where you don\'t need jsdom, it\'s the right default in 2026. Stick with Vitest for frontend (jsdom) or when you need a richer plugin ecosystem.',
    },
    {
      level: 'mid',
      question: 'What changed about `require(esm)` in Node 22+?',
      answer:
        'It works synchronously, unflagged in Node 23+, for ESM modules that don\'t use top-level `await`. Before, you had to use dynamic `import()` from CJS to load ESM. Now `const lib = require(\'./lib.mjs\')` just works — unless the ESM file does TLA, in which case `require` throws and you must use `await import(...)`.',
    },
    {
      level: 'mid',
      question: 'You write `fetch(url)` in a hot loop and DNS lookups are blocking other code. Why?',
      answer:
        'undici (which powers `fetch`) uses `dns.lookup` internally — which runs on the libuv thread pool. Default pool size is 4. A slow DNS server holds a pool thread for the full timeout, starving fs/crypto/zlib that also use the pool. Two fixes: (1) install `cacheable-lookup` and use it via `setGlobalDispatcher(new Agent({ connect: { lookup: cl.lookup } }))` to cache DNS responses. (2) Bump `UV_THREADPOOL_SIZE=16` (or higher) in your launch command. Together they eliminate DNS-induced pool exhaustion.',
    },
    {
      level: 'mid',
      question: 'When would you use Web streams vs Node streams in 2026?',
      answer:
        'Web streams (`ReadableStream`, etc.) at API boundaries — `fetch` response bodies, `CompressionStream`, anywhere you might run in the browser too. Node streams for internal pipelines — `fs.createReadStream`, transforms with the npm ecosystem. Bridge with `Readable.fromWeb` / `Readable.toWeb`. Both support `for await...of`, which is the modern consumer pattern regardless of source.',
    },
    {
      level: 'mid',
      question: 'You see RSS climb steadily while uploading large files. Diagnosis?',
      answer:
        'You\'re ignoring `write()`\'s return value (backpressure). The producer (the incoming request stream) writes faster than the consumer (disk, transform, response) accepts. Node accepts everything and buffers in memory. Fix: use `pipeline(src, dst)` from `node:stream/promises` (it honors backpressure and propagates errors), or honor `write`\'s `false` return by awaiting `\'drain\'`. Async iteration (`for await...of`) also handles backpressure automatically.',
    },
    {
      level: 'mid',
      question: 'What\'s `Promise.withResolvers()` for?',
      answer:
        'Externalizes a promise\'s `resolve` and `reject`: `const { promise, resolve, reject } = Promise.withResolvers()`. Replaces the closure dance `let resolve; const p = new Promise(r => resolve = r);`. Useful for bridging event emitters to promises, building deferred queues, custom async iterators. Stable in Node 22+, all modern browsers.',
    },

    // senior
    {
      level: 'senior',
      question: 'Your service behind ALB gets intermittent 502s with no obvious cause. Where do you look?',
      answer:
        'Almost always Node\'s `keepAliveTimeout` is **less than or equal to** the ALB idle timeout (60s). When the ALB tries to reuse an idle connection at the same instant Node\'s keepAliveTimeout fires, the LB writes into a closing socket → 502. Fix: set `server.keepAliveTimeout = 65_000` and `server.headersTimeout = 66_000` (`headersTimeout` must exceed `keepAliveTimeout`). For other LBs, match to their idle timeout + a few seconds of jitter. This single config eliminates the bulk of "random 502" incidents.',
    },
    {
      level: 'senior',
      question: 'What\'s `AsyncLocalStorage` and what should you use it for?',
      answer:
        'Thread-local-like storage that propagates through async boundaries. Set it once at the entry of a request; read it anywhere in the async tree via `store.getStore()`. Used for request IDs, user IDs, trace contexts, tenant IDs — the "ambient" values you don\'t want to pass through every function signature. Near-zero overhead in modern Node. OpenTelemetry, pino, and most observability libraries use it under the hood.',
    },
    {
      level: 'senior',
      question: 'What\'s `diagnostics_channel` and why does it exist?',
      answer:
        'A passive pub-sub for instrumentation — modules publish at well-defined points ("http request started," "DB query starting"), libraries subscribe. No monkey-patching, no version-breakage. `ch.publish()` is near-free when no subscribers. The official replacement for "wrap `http.request` to intercept calls." OTel, undici, and many DB drivers now publish channels; subscribe to instrument without wrapping.',
    },
    {
      level: 'senior',
      question: 'How would you tune `UV_THREADPOOL_SIZE`?',
      answer:
        'Default is 4 — way too small for crypto-heavy or DNS-lookup-heavy workloads. Bump to `2 × CPU cores` as a starting point (`UV_THREADPOOL_SIZE=16` for an 8-core box). Set via launch flag, not from JS (must be read before libuv initializes). Watch for the symptom: event-loop lag low but request latency high — that\'s pool exhaustion. Common triggers: `bcrypt`/`argon2`, `dns.lookup`, `fs.readFile`, `zlib`. Higher pool sizes are cheap (~8MB stack per thread).',
    },
    {
      level: 'senior',
      question: 'Why use undici directly instead of global `fetch`?',
      answer:
        'You can configure pools per origin (different limits for stable vs flaky upstreams), use `request` instead of `fetch` for lower-overhead high-throughput calls, and use `RetryAgent` for built-in idempotent-method retries. `fetch` itself uses undici under the hood — but the default global dispatcher has no per-origin pool sizing, no DNS cache, no retry. For production HTTP clients at scale, configure a custom `Agent` with `pipelining: 1` and reasonable `connections` per origin via `setGlobalDispatcher`.',
    },
    {
      level: 'senior',
      question: 'What\'s the difference between `worker_threads` and `cluster` in 2026?',
      answer:
        '`worker_threads` = many V8 isolates in one process; share memory via `SharedArrayBuffer`; for CPU-bound JavaScript work that would block the event loop. `cluster` = many Node processes sharing an HTTP listener; for using multiple CPU cores for I/O serving. In 2026, `cluster` is mostly replaced by container replicas — let Kubernetes scale processes. `worker_threads` is still relevant for CPU-bound endpoints; pool them with `piscina` rather than spawning per task.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design a hardened deployment for a Node service handling sensitive data.',
      answer:
        '**Install layer**: pnpm with `--frozen-lockfile --ignore-scripts` in CI; explicit `pnpm approve-builds` for packages needing postinstall. Pin pnpm via `packageManager` in package.json. Renovate or Dependabot with grouped minors auto-merge after CI; humans review majors.\n\n**Runtime layer**: `node --permission --allow-fs-read=./dist --allow-fs-read=./node_modules --allow-net --frozen-intrinsics --disable-proto=delete dist/index.js`. Combined: filesystem locked, no addons, no prototype pollution surface. ~1% overhead.\n\n**Network layer**: TLS 1.3 only, certificate pinning if calling specific services, egress firewall blocking everything but allowed destinations (defense against SSRF + data exfil).\n\n**Process layer**: dedicated IAM role per service with minimum permissions; secrets fetched at startup via Secrets Manager; rotated regularly with backward-compatible rotation windows.\n\n**Observability**: OpenTelemetry with auto-instrumentation; W3C traceparent propagation; pino structured logs with traceId/spanId correlation; metrics on event-loop lag, p99 latency, error budget burn rate.\n\n**Failure mode**: graceful shutdown with readiness probe + closeIdleConnections + bounded in-flight drain + final timeout. K8s `terminationGracePeriodSeconds` matched to drain time + buffer.\n\n**Supply chain monitoring**: Socket or similar passive monitoring of installed deps. Alerts on suspicious behavior (unexpected network calls, obfuscated code).',
    },
    {
      level: 'staff',
      question: 'How would you implement OpenTelemetry for an existing Express app without rewriting it?',
      answer:
        '**Auto-instrument first.** Install `@opentelemetry/sdk-node` and `@opentelemetry/auto-instrumentations-node`; create an `instrumentation.js` that boots the SDK with a service name and an OTLP exporter pointed at your collector. Run with `node --import ./instrumentation.js src/index.js` so instrumentation patches modules **before** they\'re used. You immediately get spans for HTTP server/client, Express routes, DB queries, Redis — no app changes.\n\n**Then propagation.** Auto-instr handles inbound `traceparent` and outbound HTTP. For queues (BullMQ, etc.), explicitly inject/extract via `propagation.inject(context.active(), headers)` at enqueue and `propagation.extract` at consumer.\n\n**Then sampling.** Default 100% in dev. In prod, tail-based sampling at the Collector — keep all errors, all slow requests (> p99), and 10% probabilistic. This needs a separate Collector process; worth running.\n\n**Then logs correlation.** Configure pino to inject `traceId`/`spanId` from the active span. Now every log line joins a trace.\n\n**Then custom spans.** For business operations (process order, charge payment), wrap with `tracer.startActiveSpan(...)`. Use `setAttribute` for IDs and outcomes; `recordException` on error.\n\n**Then dashboards.** Latency by route, error rate, dependency latency, throughput. Wire SLOs to burn-rate alerts.\n\nCost: 1-2 sprints if existing code is reasonable. Payoff: every "where is time going?" question becomes a trace lookup.',
    },
  ],
};
