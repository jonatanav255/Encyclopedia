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
        'Different phases of the event loop. **At the top level on Node 11+, the order is deterministic**: `setTimeout(fn, 0)` fires first, then `setImmediate(fn)` — the timers phase runs before the check phase on the first iteration. (Pre-Node 11 it was genuinely racey; that\'s a footgun you can stop worrying about.) **From inside an I/O callback** (the poll phase), `setImmediate` runs in the next **check** phase, immediately after. `setTimeout(fn, 0)` waits for the next loop iteration to reach the **timers** phase. Mental model: `setImmediate` = next phase, `setTimeout(0)` = next iteration.',
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

    // --- additions for new topics ---

    // junior
    {
      level: 'junior',
      question: 'How do you start a Node debugging session for a script?',
      answer:
        '`node --inspect-brk src/index.js` starts the inspector and pauses before any user code runs. Open `chrome://inspect` in Chrome, click "Open dedicated DevTools for Node," and you get breakpoints, stepping, watch expressions, and a console attached to the live process. VS Code and JetBrains IDEs use the same Inspector Protocol via launch configs. For tests: `node --inspect-brk --test src/foo.test.js`.',
    },
    {
      level: 'junior',
      question: 'What is `EventEmitter` used for in Node?',
      answer:
        'The pub-sub primitive baked into Node — `emitter.on(event, handler)` to subscribe, `emitter.emit(event, data)` to fire. Synchronous, in-process. Used by HTTP servers (`server.on(\'request\')`), streams (`\'data\'`, `\'end\'`, `\'error\'`), and `process` (`SIGTERM`, `uncaughtException`). For app code, useful for decoupling cross-cutting concerns (analytics, logging). For cross-process pub/sub, use a broker, not EventEmitter.',
    },

    // mid
    {
      level: 'mid',
      question: 'Why does Node\'s `console.log` block in some contexts?',
      answer:
        'On a TTY (terminal), `console.log` is **synchronous** on Linux/macOS — the write completes before the next line of JS runs. On a pipe, it\'s async. In production behind a process manager (PM2, systemd, container logs), it\'s effectively async, but heavy logging still pressures the event loop. Use a structured logger (`pino`) that writes async with batching for production. Treat `console.log` as a dev/debug tool.',
    },
    {
      level: 'mid',
      question: 'How do you grab a heap snapshot from a running Node process?',
      answer:
        'Either: (1) `v8.writeHeapSnapshot(\'/tmp/heap.heapsnapshot\')` from inside the process — wire to a `SIGUSR2` handler so you can trigger from outside with `kill -USR2 <pid>`. (2) Attach Chrome DevTools via `--inspect` and use Memory tab → "Take heap snapshot." Load the file into DevTools, compare two snapshots ("Comparison" view) to find what grew between them. The top retainers reveal the leak.',
    },
    {
      level: 'mid',
      question: 'When would you reach for a CLI library vs `util.parseArgs`?',
      answer:
        '`util.parseArgs` (stable in Node 20+) covers flags, short options, and positionals — enough for simple tools. For subcommands, automatic `--help`, type inference, or interactive prompts, use **commander** or **citty**. Combined with `@clack/prompts` for interactive UI and `picocolors` for color, you get a modern CLI in ~50 lines.',
    },
    {
      level: 'mid',
      question: 'What\'s the right way to parse messages off a TCP socket in Node?',
      answer:
        'TCP is a **byte stream**, not a message stream. Two `socket.write(\'hello\')` calls can arrive as `\'hellohello\'` or `\'hel\' + \'lohello\'`. Every binary TCP protocol needs framing: length-prefix (`[4-byte length][payload]`), delimiter (`\\n` or `\\0`), or self-describing (protobuf with varint length). Buffer incoming chunks; emit messages only when a full frame is available.',
    },

    // senior
    {
      level: 'senior',
      question: 'When would you choose Connect-RPC over gRPC?',
      answer:
        'When you need browser support. Connect (by Buf) is an HTTP-based protocol compatible with gRPC servers but speaks plain HTTP/1.1 + Protobuf, so it works natively in browsers without the gRPC-Web translation layer. Same generated code can serve gRPC and Connect clients simultaneously. For 2026 RPC stacks that include browsers + services, Connect is the modern path; gRPC remains good for pure backend-to-backend hops.',
    },
    {
      level: 'senior',
      question: 'How do you avoid the N+1 query problem in GraphQL?',
      answer:
        '**DataLoader.** For every cross-entity field (`Post.author`, `User.posts`), create a per-request loader: `new DataLoader(async ids => db.users.findByIds(ids))`. The loader batches `.load(id)` calls within a tick into one fetch. Without it, a query like `{ posts { author { name } } }` for 100 posts triggers 101 queries. With it, 2. Mandatory for any non-trivial GraphQL schema. The loader is per-request to scope the cache correctly.',
    },
    {
      level: 'senior',
      question: 'How do `Promise.withResolvers` and EventEmitter compare for "wait for event"?',
      answer:
        'For a **single-fire signal**, `events.once(emitter, \'name\')` returns a promise — same as `Promise.withResolvers` + wiring resolve into a listener. For a stream of events, use async iteration: `for await (const [data] of events.on(emitter, \'name\'))`. `Promise.withResolvers` shines when there\'s no event source yet — building a queue, a deferred init, or bridging callback-style APIs to promises. Pick the tool that matches the cardinality (one-shot vs stream).',
    },

    // staff
    {
      level: 'staff',
      question: 'You inherit an event-driven monolith built on EventEmitter and need to break it into services. What\'s the migration plan?',
      answer:
        '**1. Catalogue the events.** Each `emitter.emit(\'name\', payload)` becomes a candidate contract. Document who emits and who listens — the implicit interfaces between modules.\n\n**2. Add explicit schemas.** Migrate each event payload to a Zod/Protobuf schema. Now changes are visible; consumers stop silently breaking on producer changes.\n\n**3. Move emitter to abstraction.** Replace direct `events.emit` / `.on` with a thin `bus.publish` / `bus.subscribe` interface. Implementation is still in-process EventEmitter.\n\n**4. Swap to a broker per event.** Identify candidates: events with multiple listeners, async listeners, or owners in different modules. Move those to a broker (Redis Streams, NATS, Kafka). In-process emitter stays for fast in-module pub/sub.\n\n**5. Add idempotency.** Network = at-least-once delivery. Every consumer dedups by event ID.\n\n**6. Carve services out.** Now that an event is broker-backed and schema\'d, the consumer can be extracted to its own service. Producer doesn\'t care.\n\n**Throughout**: traces propagated via OpenTelemetry; dead-letter queues monitored; broker dashboards. The migration is incremental — you ship working code at every step, you never freeze features.',
    },

    // --- additional questions ---

    // junior
    {
      level: 'junior',
      question: 'What does `node --watch` do?',
      answer:
        'Built-in file watcher (Node 20+) — restarts the process when the entry file or any of its imports change. Replaces `nodemon` for most use cases. Combine with `--env-file=.env` (Node 20.6+) to load environment variables and you have a no-deps dev loop: `node --watch --env-file=.env src/index.js`. For TypeScript directly: `node --watch --experimental-strip-types src/index.ts`.',
    },

    // mid
    {
      level: 'mid',
      question: 'You see "EMFILE: too many open files" in a Node service. What\'s happening?',
      answer:
        'The process hit the OS limit for open file descriptors (default ~1024 on Linux). Either a real leak — files/sockets opened without close — or a legitimate workload exceeding the limit. **Diagnose**: `lsof -p <pid>` (or `ls /proc/<pid>/fd | wc -l`) to see what\'s open. Look for accumulating sockets, log files, or DB connections.\n\n**Fixes**: (1) Close what you open — `try/finally` for files, proper connection pooling. (2) Raise the limit (`ulimit -n 65536` or systemd `LimitNOFILE=65536`). (3) For HTTP clients, use undici with a connection pool — don\'t open per-request connections. (4) Use stream pipelines (`stream.pipeline`) so streams clean up on error instead of leaking file descriptors.',
    },

    // senior
    {
      level: 'senior',
      question: 'When would you use `child_process.fork` vs `spawn` vs `worker_threads`?',
      answer:
        '**`spawn`** — generic process launch. Use for shelling out to external binaries (`ffmpeg`, `git`, `curl`). Streams stdio. No JS-specific features.\n\n**`fork`** — spawn another Node script with a built-in `process.send`/`message` IPC channel. Use for "Node helper process" (worker farm without thread sharing, or sandboxing to avoid one Node\'s crash bringing down the parent). Each fork has its own memory.\n\n**`worker_threads`** — V8 isolates in the same process. Use for CPU-bound JS work that would block the event loop (image processing, parsing huge JSON, cryptography). Shared memory possible via `SharedArrayBuffer`; transfer ownership of Buffers without copying. Lower overhead than `fork` (no separate OS process).\n\n**Decision tree**: external program → `spawn`. CPU-bound JS → `worker_threads`. Need OS-level isolation or want to run a different JS file as a separate Node process → `fork`.',
    },

    // --- node:crypto ---
    {
      level: 'senior',
      question: 'You\'re verifying a webhook signature. Why is `if (signature === expected)` a bug, and what should you use instead?',
      answer:
        '`===` on strings compares byte-by-byte and short-circuits on the first difference. The time taken correlates with how many leading bytes match — so an attacker who can issue many requests can measure response times and recover the secret signature one byte at a time. Use `crypto.timingSafeEqual(a, b)`, which compares Buffers in constant time relative to length. Two things to remember: (1) the buffers must be the same length, so length-check first (`a.length === b.length`) — the length itself is already public, so leaking it is fine. (2) `Buffer.compare` is *not* constant-time either; the only safe primitive is `timingSafeEqual`. Same rule applies to comparing API keys, password reset tokens, and JWTs.',
    },
    {
      level: 'mid',
      question: 'What three values do you need to persist per AES-GCM-encrypted message, and what goes wrong if you mix them up?',
      answer:
        '**Iv, ciphertext, auth tag.** The IV (12 bytes for GCM) must be unique per (key, message) pair — re-using one under the same key lets an attacker XOR the ciphertexts and recover plaintext. The ciphertext is the actual encrypted payload. The auth tag (16 bytes) is what GCM uses to detect tampering — without `decipher.setAuthTag(tag)` before `decipher.final()`, decryption either silently returns garbage or throws "unable to authenticate data." Persist all three; the key stays in your KMS / env / vault, never in the row. A common layout is a single Buffer: `iv (12) || ciphertext (n) || tag (16)`, split on the way back out.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design observability for a Node service from scratch.',
      answer:
        '**Three pillars: logs, metrics, traces.**\n\n**Logs**: structured JSON via Pino. One line per significant event with correlated request ID, trace ID, span ID, user ID. Log levels: ERROR (page someone), WARN (investigate), INFO (audit trail), DEBUG (off by default). Ship to centralized aggregator (Loki, Datadog, CloudWatch). Don\'t log secrets; don\'t log every request body.\n\n**Metrics**: Prometheus-format histogram + counter + gauge. Per route: request rate, error rate, latency p50/p95/p99, in-flight count. Per dependency: external call latency, error rate, retry count. Per resource: event-loop lag (`perf_hooks.monitorEventLoopDelay`), heap used, GC pause duration, open connections. Export at `/metrics`; scrape every 15s.\n\n**Traces**: OpenTelemetry SDK with auto-instrumentation for HTTP, Express, undici, DB drivers. Custom spans for business operations. W3C `traceparent` propagation across services. Tail-based sampling at the OTel Collector — keep all errors, 100% of slow requests, 10% of normal traffic.\n\n**SLOs**: define a few user-visible objectives (e.g., "p99 home-page latency < 500ms over 28 days at 99.5% achievement"). Compute error budget from SLO. Alert on **multi-window burn rate**: paging if you\'ll exhaust the budget in 1 hour at current rate; ticketing if in 6 hours. No raw threshold alerts ("p99 > X" pages constantly during normal noise).\n\n**Runbooks**: every page links to a runbook with dashboard + first investigation steps + escalation contacts.\n\n**Cost**: log volume dominates. Sampling, retention tiers, structured-only (no free-text dumps) keep it manageable. Trace cost via tail-sampling is bounded by collector capacity, not service volume.\n\n**Tooling stack** (2026 default): OpenTelemetry SDK → Collector → Prometheus + Loki + Tempo (self-hosted) or Datadog/Honeycomb/New Relic (hosted). Grafana for dashboards. PagerDuty for paging.\n\n**Discipline**: observability is a build-time concern, not a "we\'ll add it later." Wire from day one; tune over time.',
    },
  ],
};
