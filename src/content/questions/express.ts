import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'express',
  questions: [
    // ============================================================
    // JUNIOR (10)
    // ============================================================
    {
      level: 'junior',
      question: 'What is Express in one sentence?',
      answer:
        "A minimal HTTP framework for Node that's essentially an ordered list of middleware functions Express walks top-to-bottom on every request.",
    },
    {
      level: 'junior',
      question: 'What does the middleware signature `(req, res, next)` mean?',
      answer:
        '`req` is the incoming request (path, headers, params, body). `res` is the response builder (status, headers, body). `next` is a function — call it to pass control to the next middleware in the stack. Forgetting to call `next()` (without sending a response) hangs the request.',
    },
    {
      level: 'junior',
      question: 'How do you read a URL parameter, a query string, and a request body?',
      answer:
        '`req.params.id` for `/users/:id` route params. `req.query.sort` for `?sort=desc`. `req.body` for posted JSON — but only if `app.use(express.json())` is mounted before the route.',
    },
    {
      level: 'junior',
      question: 'How do you send a JSON response with status 201?',
      answer:
        '`res.status(201).json(data)`. `.status()` only stages the status code; the response is not actually sent until `.json()` (or `.send()`, `.end()`, `.redirect()`).',
    },
    {
      level: 'junior',
      question: 'Why is `req.body` undefined and how do you fix it?',
      answer:
        'Express does not parse bodies out of the box. Mount the parser before your routes:\n\n```js\napp.use(express.json());\n```\n\nFor HTML form posts, also mount `express.urlencoded({ extended: false })`. For file uploads (`multipart/form-data`), use `multer` — `express.json` cannot parse it.',
    },
    {
      level: 'junior',
      question: 'What is the difference between 401 and 403?',
      answer:
        '**401 Unauthorized** means "I do not know who you are" — credentials missing, expired, or invalid. **403 Forbidden** means "I know who you are, but you are not allowed to do this" — authenticated, wrong permissions. Re-authenticating fixes 401; it does not help with 403.',
    },
    {
      level: 'junior',
      question: 'How do you serve static files from a folder?',
      answer:
        '`app.use(express.static("public"))` serves anything in `./public` directly. `GET /logo.png` looks for `public/logo.png`. Express auto-sets `Content-Type`, `ETag`, and handles `If-None-Match` for 304 responses. Mount under a prefix with `app.use("/assets", express.static("public"))`.',
    },
    {
      level: 'junior',
      question: 'What is the difference between `req.params` and `req.query`?',
      answer:
        '`req.params` comes from the path itself — `/users/:id` makes `req.params.id` available. `req.query` is parsed from the query string — `?sort=desc` makes `req.query.sort`. Use params for identifying a resource; use query for filtering or modifying a result. Both arrive as **strings** — coerce and validate before use.',
    },
    {
      level: 'junior',
      question: 'How do you do an HTTP redirect, and which status should you use?',
      answer:
        '`res.redirect(url)` defaults to **302** (temporary). Use:\n\n- **301**: permanent move; browsers cache aggressively.\n- **302**: temporary; the default.\n- **303**: redirect after POST → browser follows with GET (post/redirect/get).\n- **307/308**: like 302/301 but preserve the method.\n\nNever redirect to a user-supplied URL without validating it (open-redirect vulnerability).',
    },
    {
      level: 'junior',
      question: 'Why does the order of `app.use(...)` calls matter?',
      answer:
        'Express walks middleware in registration order. A body parser registered **after** a route handler is never seen by that handler. An auth check registered **after** a protected route does not protect it. Mental model: a linear pipeline — anything you want a handler to see must be mounted before that handler.',
    },

    // ============================================================
    // MID (10)
    // ============================================================
    {
      level: 'mid',
      question: 'How does Express tell error-handling middleware apart from regular middleware?',
      answer:
        'By the **arity** of the function. Middleware with four parameters (`(err, req, res, next)`) is treated as error-handling. Express only invokes it when something earlier calls `next(err)` with an argument, and it skips all non-error middleware in between.',
    },
    {
      level: 'mid',
      question: 'Why does an `async` handler in Express 4 silently hang on a rejected promise, and how do you fix it?',
      answer:
        'Express 4 only catches **synchronous** throws. A rejected promise from an `async` handler becomes an unhandled rejection — the request never reaches your error middleware and hangs until the client times out.\n\nFix in Express 4 with a wrapper:\n\n```js\nconst wrap = (fn) => (req, res, next) =>\n  Promise.resolve(fn(req, res, next)).catch(next);\n\napp.get("/users/:id", wrap(async (req, res) => { ... }));\n```\n\nOr use `express-async-errors` for a global monkey-patch. Express 5 forwards rejections automatically — no wrapper needed.',
    },
    {
      level: 'mid',
      question: 'What is CORS, and what response headers actually matter?',
      answer:
        'CORS (Cross-Origin Resource Sharing) is the browser-enforced policy that controls whether JS on origin A can read responses from origin B. The server opts in via headers — `cors` middleware sets them.\n\nThe key headers:\n\n- `Access-Control-Allow-Origin` — which origins may read the response.\n- `Access-Control-Allow-Methods` — which methods are allowed.\n- `Access-Control-Allow-Headers` — which request headers are allowed.\n- `Access-Control-Allow-Credentials` — whether cookies / `Authorization` may be sent. Cannot be combined with `Allow-Origin: *`.\n\nCORS only protects browsers. `curl` and Node ignore it.',
    },
    {
      level: 'mid',
      question: 'What does `app.set("trust proxy", 1)` do, and why does it matter?',
      answer:
        'Tells Express to honor `X-Forwarded-For` / `X-Forwarded-Proto` from one upstream proxy. Without it, behind a reverse proxy:\n\n- `req.ip` is the proxy IP (rate limiting groups all users together)\n- `req.secure` is `false` (HTTPS redirects loop, secure cookies do not set)\n- `req.protocol` is `"http"`\n\nThe value is how many trusted hops are in front (1 for nginx/ALB, 2 if a CDN is also in front). Never use `true` in production — anyone can spoof the headers.',
    },
    {
      level: 'mid',
      question: 'When should you use a session, and what changes if you switch to JWT?',
      answer:
        '**Session**: cookie holds an opaque session ID; data lives in a server-side store (Redis, Postgres). Easy revocation, small cookie, stateful infrastructure. Default for traditional web apps.\n\n**JWT**: signed token containing claims; no server-side store. Stateless and scales horizontally without a session DB, but revoking a single user requires a blocklist — non-trivial. Better fit for stateless APIs or mobile clients that prefer headers over cookies.\n\nFor most internal/SaaS apps: sessions. For multi-service stateless APIs where revocation is rare: JWT.',
    },
    {
      level: 'mid',
      question: 'How do you safely validate `req.body` before using it?',
      answer:
        'Never trust the shape. Validate with a schema library (zod, ajv, joi) at the boundary, then trust the result inside the handler:\n\n```js\nimport { z } from "zod";\n\nconst Schema = z.object({\n  email: z.string().email(),\n  age: z.number().int().min(0).optional(),\n});\n\napp.post("/users", (req, res) => {\n  const parsed = Schema.safeParse(req.body);\n  if (!parsed.success) {\n    return res.status(400).json({ issues: parsed.error.issues });\n  }\n  // safe to use parsed.data\n});\n```\n\nUnknown fields are dropped by default — protects against mass-assignment. Coerce params/query with `z.coerce.number()` since both arrive as strings.',
    },
    {
      level: 'mid',
      question: 'What is the difference between `app.use(fn)` and `app.use(path, fn)`?',
      answer:
        '`app.use(path, fn)` only runs `fn` when the request URL starts with `path`. Inside `fn`, Express **strips the mount path** from `req.url` (the original is preserved on `req.originalUrl`). This is what makes sub-routers composable — a router mounted at `/api` can be written as if it owns the whole URL space.\n\nForgetting this is why people write `/api/users` inside an `/api` router and then get 404s.',
    },
    {
      level: 'mid',
      question: 'What is express-session\'s biggest production gotcha?',
      answer:
        'The default `MemoryStore` is fine for one process. It breaks the moment you scale:\n\n- Multiple workers (cluster, pm2) → each has its own session map.\n- Multiple containers → users get logged out randomly.\n- Server restart → all sessions wiped.\n\nUse a real store (`connect-redis`, `connect-pg-simple`, etc.) from day one. Also override the defaults: `resave: false`, `saveUninitialized: false` — both default to `true` for backward compat and cause unnecessary writes.',
    },
    {
      level: 'mid',
      question: 'How would you test an Express handler without starting a real server?',
      answer:
        'Export `app` separately from `server.js`. The `app` object is itself a request handler — `supertest` drives it in memory:\n\n```js\nimport request from "supertest";\nimport { app } from "./app.js";\n\ntest("POST /users validates input", async () => {\n  const res = await request(app)\n    .post("/users")\n    .send({ email: "bad" });\n  expect(res.status).toBe(400);\n});\n```\n\nNo port, no socket, deterministic. For authenticated flows, use `request.agent(app)` to persist cookies across requests.',
    },
    {
      level: 'mid',
      question: 'What is a CSRF attack and how do you mitigate it in an Express session-based app?',
      answer:
        'A CSRF attack tricks the browser into making an authenticated request from another site. Since cookies are sent automatically with cross-site requests, the attacker rides on the victim\'s session.\n\nMitigations (use both):\n\n1. **`SameSite` cookie attribute**: `sameSite: "lax"` (default in modern browsers) blocks cross-site POSTs. `"strict"` blocks even GET navigations.\n2. **CSRF tokens**: a per-session random value sent in a custom header; the server compares it to the value in the session. Packages: `csrf-csrf` (current), `csurf` (deprecated).\n\nJWT-in-`Authorization`-header is CSRF-immune because the browser does not attach `Authorization` to cross-site requests.',
    },

    // ============================================================
    // SENIOR (10)
    // ============================================================
    {
      level: 'senior',
      question: 'How does Express\'s routing actually work under the hood?',
      answer:
        'Routes are **middleware with a method+path filter**. Express keeps one ordered stack; on each request it walks the stack top-to-bottom, runs everything that matches, and stops when a response is sent.\n\n`app.get("/users", handler)` is functionally `app.use((req, res, next) => { if (method === "GET" && pathMatches) handler(req, res, next); else next(); })`. The "routes vs middleware" distinction is a teaching simplification — there are no separate phases.\n\nUnderstanding this explains why order matters globally, why `app.use("/api", router)` strips the prefix inside the router, and why error middleware can be a plain function with four args.',
    },
    {
      level: 'senior',
      question: 'You see event-loop lag spikes in production. How do you diagnose?',
      answer:
        'Measure first with `monitorEventLoopDelay` (`perf_hooks`). p99 over ~10ms means something synchronous is blocking. Then:\n\n1. **CPU profile** with `clinic.js` or `node --prof` under realistic load.\n2. Look at the flamegraph for sync hot spots: `bcrypt.hashSync`, `JSON.parse` on big bodies, regex backtracking, sync FS APIs, sync crypto.\n3. **Per-route latency histograms** to narrow which endpoint is the source.\n4. **GC pauses** — `--trace-gc` if memory pressure is the issue.\n\nFixes: async versions of sync APIs, cap payload sizes (`express.json({ limit })`), move CPU-bound work to `worker_threads`, cache idempotent expensive results, load-shed (503) when lag spikes.\n\nThe goal is p99 lag under ~10ms; anything higher cascades into every request.',
    },
    {
      level: 'senior',
      question: 'How do you make rate limiting work correctly across multiple processes?',
      answer:
        'The default `express-rate-limit` store is in-memory — useless beyond one process. With N workers, the effective limit is N × max. Use a shared store:\n\n```js\nimport rateLimit from "express-rate-limit";\nimport RedisStore from "rate-limit-redis";\n\nconst limiter = rateLimit({\n  windowMs: 60_000,\n  max: 100,\n  store: new RedisStore({\n    sendCommand: (...args) => redis.sendCommand(args),\n  }),\n  keyGenerator: (req) => req.user?.id ?? req.ip,\n});\n```\n\nAlso requires `app.set("trust proxy", N)` so `req.ip` is the real client. Without it, every request looks like it came from the proxy and one user blocks everyone.',
    },
    {
      level: 'senior',
      question: 'How do you implement graceful shutdown in Express?',
      answer:
        '```js\nconst server = app.listen(port);\n\nasync function shutdown() {\n  healthy = false;                              // fail readiness probe\n  await new Promise(r => setTimeout(r, 5_000)); // let LB stop routing\n  await new Promise(r => server.close(r));      // stop accepting, drain\n  await db.end();                                // close resources\n  await redis.disconnect();\n  process.exit(0);\n}\n\nprocess.on("SIGTERM", shutdown);\nprocess.on("SIGINT", shutdown);\nsetTimeout(() => process.exit(1), 30_000).unref(); // hard cap\n```\n\nKey points: fail readiness first so the load balancer stops sending traffic; `server.close()` waits for in-flight requests but not idle keep-alives (use `closeIdleConnections()` in Node 18.2+); close DB/Redis **after** the server is done; hard timeout so a stuck request does not block the orchestrator forever.',
    },
    {
      level: 'senior',
      question: 'What goes wrong if you compress already-compressed responses?',
      answer:
        'CPU is wasted producing barely-smaller output. JPEGs, PNGs, MP4s, ZIPs, and most images are already DEFLATE-compressed — running them through gzip yields maybe 1% reduction at the cost of significant CPU per request. The default `compression.filter` skips `image/*`, `video/*`, `audio/*` for this reason.\n\nWorse: in some narrow cases compressing per-user responses that contain secrets enables side-channel attacks (BREACH, CRIME) — the compressor leaks information about the secret via response size. For authenticated responses with both user-controlled and secret content, mitigate by separating them, randomizing length, or disabling compression on those endpoints.\n\nBest production setup: let the reverse proxy or CDN compress text payloads; do not compress in Node at all.',
    },
    {
      level: 'senior',
      question: 'Why is "send a response and then call next()" a bug?',
      answer:
        'HTTP responses can only be sent once. After `res.send(...)`, the headers and body are flushed; the response is committed. If the next middleware then tries to set a header or send a body, Node throws `ERR_HTTP_HEADERS_SENT`.\n\nThe subtle version: an early-return path forgets the `return`:\n\n```js\napp.use((req, res, next) => {\n  if (notAllowed) res.status(403).json({ error: "forbidden" });\n  // ← missing return — falls through to the next middleware\n  next();\n});\n```\n\nThe happy-path branch sends and *also* calls `next()`. Fix: `return res.status(403).json(...)` or use an explicit `if/else`.',
    },
    {
      level: 'senior',
      question: 'What is the difference between unhandled rejection and uncaught exception, and how do you handle them in Express?',
      answer:
        '**Unhandled rejection**: a Promise rejected with no `.catch` or `await` to handle it. Express 5 forwards async handler rejections to error middleware automatically; Express 4 needs a wrapper. Fire-and-forget promises (`doWork()` with no `await`/`.catch`) escape both.\n\n**Uncaught exception**: a synchronous throw outside the request lifecycle (e.g. inside `setImmediate`). Express never sees it.\n\nNode 15+ terminates on unhandled rejection by default. Production safety net:\n\n```js\nprocess.on("unhandledRejection", (err) => { logger.fatal({ err }); setTimeout(() => process.exit(1), 100); });\nprocess.on("uncaughtException",  (err) => { logger.fatal({ err }); setTimeout(() => process.exit(1), 100); });\n```\n\nLog and exit; let the orchestrator restart. Don\'t swallow — the process state is unknown.',
    },
    {
      level: 'senior',
      question: 'You need WebSockets in an Express app. How do you wire it in, and what scales badly?',
      answer:
        'Share the HTTP server:\n\n```js\nimport { createServer } from "node:http";\nimport { WebSocketServer } from "ws";\nimport { app } from "./app.js";\n\nconst server = createServer(app);\nconst wss = new WebSocketServer({ server });\n\nwss.on("connection", (ws, req) => { /* ... */ });\nserver.listen(3000);\n```\n\nAuth on the upgrade request (same cookie/token logic as HTTP).\n\nWhat scales badly:\n\n- **Connections are stateful** — each lives on one worker. Broadcasting to all users requires a pub/sub layer (Redis) so workers can fan out across each other.\n- **No sticky routing** breaks reconnects — the client may land on a different worker. Either make connections stateless (re-subscribe on connect) or enable sticky sessions at the LB.\n- **Half-open connections** pile up without heartbeats — implement ping/pong every 30s.',
    },
    {
      level: 'senior',
      question: 'What does observability for an Express service look like in practice?',
      answer:
        'Three layers, all needed:\n\n1. **Metrics** (RED method): rate, errors, duration per route. Prometheus + `prom-client`, scraped at `/metrics`, dashboards in Grafana. p50/p99 latency, request rate, error rate per route.\n2. **Logs**: structured JSON via `pino`, every line tagged with `requestId`. Aggregated to Loki, Datadog, CloudWatch.\n3. **Traces**: OpenTelemetry auto-instrumentation captures spans across Express, the DB driver, HTTP calls to other services. Visualized in Jaeger/Honeycomb/Datadog. Lets you see "this 500ms request was 480ms in the auth service\'s DB call."\n\nPlus: SLO-based burn-rate alerting, not "5xx > 0." `/health` (liveness — process alive?) and `/ready` (readiness — should I get traffic?) endpoints separately.',
    },
    {
      level: 'senior',
      question: 'What are the biggest breaking changes when upgrading from Express 4 to 5?',
      answer:
        '1. **Async error forwarding** — rejected promises now reach error middleware automatically. Delete every `wrap(fn)` and `try/catch + next(err)`. Remove `express-async-errors`.\n2. **`path-to-regexp` v8** — the unnamed wildcard `*` is gone. Use named wildcards: `/files/*splat`. Optional segments use braces: `/users{/:id}`. Audit every `*` and `?` in route patterns.\n3. **`req.query` / `req.params` are null-prototype objects** — prevents prototype pollution. `req.query instanceof Object` is `false`; use `Object.hasOwn(req.query, x)` instead of `.hasOwnProperty`.\n4. **Removed APIs** — `app.del()` (use `app.delete()`), `res.redirect("back")`, singular `req.acceptsCharset`/`Encoding`/`Language`.\n5. **Node 18+ required** — drop support for older runtimes.\n\nThe upgrade is usually an afternoon if your tests are decent. Worth doing for the async fix alone.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Design the middleware stack for a production Express API.',
      answer:
        '**Order matters.** From outermost to innermost:\n\n1. **`app.set("trust proxy", N)`** — first, so every downstream sees correct `req.ip` and `req.protocol`.\n2. **Request ID** (`pino-http` or custom) — assign a UUID if absent, propagate in response header for support correlation.\n3. **Structured logging** (`pino-http`) — one line per request with method, path, status, latency, request ID.\n4. **`helmet`** — secure headers (HSTS, CSP, X-Frame-Options, no-sniff).\n5. **CORS** if you serve browsers — `cors({ origin: ALLOWED, credentials: true })`.\n6. **Compression** (`compression()`) — gzip/brotli responses. Skip if behind a CDN that compresses.\n7. **Rate limit** (`express-rate-limit` + Redis store) — before parsing body; cheaper to reject early.\n8. **Body parsers** with size caps — `express.json({ limit: "100kb" })`, `express.urlencoded({ extended: true, limit: "100kb" })`. Use `express.raw()` only for webhook signature verification routes.\n9. **Auth** — extract user from JWT/session, attach to `req.user`. Don\'t enforce here; that\'s per-route.\n10. **Validation** — per-route Zod schemas validating body/query/params at the boundary.\n11. **Routes** — thin handlers calling service-layer functions.\n12. **404 catch-all** — after all routes.\n13. **Error handler** (4-arg `(err, req, res, next)`) — last. Logs the error, returns sanitized JSON.\n\n**Observability**: counter + histogram on every route, exposed at `/metrics`. Health endpoint at `/healthz` excluded from rate limit / auth.\n\n**Graceful shutdown** wired to `SIGTERM`: fail readiness probe, stop accepting connections, close DB pool. See "graceful shutdown" question.\n\n**Hygiene**: every route declares its own input schema. No middleware secretly modifies `req.body`. Service layer never imports `express` — keeps it portable.',
    },
    {
      level: 'staff',
      question: 'How would you migrate a legacy Express monolith to a modular structure without rewriting it?',
      answer:
        '**Step 1: surface the implicit boundaries.** Map current files to "modules" (auth, billing, users, search, etc.). One module = one cohesive concern. Don\'t reorganize yet — just label.\n\n**Step 2: introduce a routes-only router per module.** `src/modules/users/router.ts` exports an Express Router. The main app mounts each: `app.use("/users", usersRouter)`. Move the relevant route handlers without changing behavior.\n\n**Step 3: extract the service layer.** For each module, route handlers become thin (parse + validate, call service, return). The service is plain TypeScript — no `req`/`res`. Tests at this layer don\'t need Express.\n\n**Step 4: enforce module boundaries.** Each module exports a public API (`index.ts`). Cross-module imports must go through it. ESLint can enforce: `eslint-plugin-import` with custom rules. Reveals hidden coupling.\n\n**Step 5: own data.** Each module owns its tables. Cross-module data access goes through the module\'s service, not raw SQL. This is the hardest step — touches the DB schema and existing queries.\n\n**Step 6 (optional): extract.** Only once boundaries are clean and proven through code review and ESLint, consider extracting a module to its own service. This is the modular-monolith → microservices transition; it should be a deliberate, justified choice (separate scaling needs, separate team ownership), not a default.\n\n**Throughout**: run all existing tests. Add new tests at the service layer as you extract. The migration is incremental — each step ships independently; no big-bang rewrite.\n\n**Common pitfalls**: trying to extract microservices before modular boundaries are clean (you ship the spaghetti to N services). Modularizing without writing tests (no safety net). Doing it during a feature freeze (correlates with team frustration; do incremental refactor alongside features).',
    },

    // --- additions for new topics ---

    // mid
    {
      level: 'mid',
      question: 'Why must `Idempotency-Key` come from the client, not the server?',
      answer:
        'The whole point is for the client to **identify retries of the same logical operation**. If the server generates the key, it\'s different per request → all retries look like new operations → idempotency disabled. The client generates a UUID per logical call and reuses it on retry (typically with exponential backoff). Server stores `{ key → response }` for ~24 hours and replays the same response on key reuse.',
    },
    {
      level: 'mid',
      question: 'What does `res.format` do and when do you need `Vary: Accept`?',
      answer:
        '`res.format({ "application/json": fn, "text/html": fn })` picks a handler based on the request\'s `Accept` header — same URL, different representation. **Critical**: set `res.vary("Accept")` so intermediate caches (CDN, browser) store separate copies per Accept value. Without `Vary`, a CDN can serve cached JSON to a browser expecting HTML.',
    },
    {
      level: 'mid',
      question: 'Why disable compression for SSE routes?',
      answer:
        '`compression()` buffers data before emitting compressed chunks — defeating streaming. SSE clients see events arriving in clumps seconds after the server sent them. Either skip compression for `/stream/*` routes via the middleware\'s `filter` option, or wrap conditionally: `if (req.url.startsWith("/stream")) next(); else compression()(req, res, next);`. Same applies to file downloads where streaming matters.',
    },
    {
      level: 'mid',
      question: 'In Express 5, you can delete `express-async-errors`. Why?',
      answer:
        'Express 5 awaits returned promises from handlers and forwards rejections to error middleware automatically. The `asyncHandler(fn)` wrapper pattern and the `express-async-errors` patch are no longer needed. Just `async (req, res) => { throw new Error(...) }` works. One caveat: if you\'ve already written response bytes (`res.write`), errors can\'t change status — check `res.headersSent` in your error handler.',
    },
    {
      level: 'mid',
      question: 'What\'s the right `Cache-Control` for static assets vs `index.html` in a SPA?',
      answer:
        '**Hashed assets** (`app.abc123.js`): `Cache-Control: public, max-age=31536000, immutable` — cache forever; the hash changes when the file does. Use `express.static("dist", { maxAge: "1y", immutable: true })`.\n\n**`index.html` and SPA fallback**: `Cache-Control: no-cache, no-store, must-revalidate`. If index.html is cached and you deploy a new asset hash, the browser keeps requesting the old hash → 404. Serve index.html via a separate handler with `maxAge: 0`.',
    },

    // senior
    {
      level: 'senior',
      question: 'You\'re receiving Stripe webhooks. Walk through the verification.',
      answer:
        '1. **Use `express.raw({ type: "*/*" })`** on this route, NOT `express.json()` — the signature is over raw bytes; JSON parsing reformats them.\n\n2. **Parse `Stripe-Signature`**: `t=<timestamp>,v1=<hex>`.\n\n3. **Timestamp check**: reject if `|now - t|` > 300 seconds (replay defense).\n\n4. **Recompute HMAC** over `\`${t}.${rawBody}\`` with the webhook secret using SHA-256.\n\n5. **Length-check** the expected vs received buffers before `crypto.timingSafeEqual` — it throws on length mismatch.\n\n6. **`timingSafeEqual`**, not `===`. Constant-time defeats timing attacks.\n\n7. Only after verification, `JSON.parse` the body.\n\n8. **Queue for async processing**; respond 200 within a few seconds. Use idempotency on `event.id` so retries don\'t double-process.',
    },
    {
      level: 'senior',
      question: 'What does `app.set("trust proxy", true)` do, and why is it dangerous?',
      answer:
        '`trust proxy: true` makes Express trust **every entry** in `X-Forwarded-For` / `X-Forwarded-Proto`. Behind a multi-hop chain you don\'t fully control, an attacker can send `X-Forwarded-For: <spoofed-ip>` and `req.ip` reports the spoofed value — bypassing IP-based rate limits, corrupting audit logs.\n\nUse the **narrowest correct value**: `trust proxy: 1` for "behind exactly one proxy I own" (typical ALB), `trust proxy: 2` for "Cloudflare → ALB → Node," or a specific IP/CIDR list. Verify with a debug endpoint that echoes `req.ip` from outside.',
    },
    {
      level: 'senior',
      question: 'When would you choose SSE over WebSockets?',
      answer:
        'When the data flow is **server → client only** (notifications, AI streaming, live feeds, progress bars). SSE is plain HTTP — auto-reconnect via `EventSource`, works through every CDN and proxy, simpler to operate. WebSockets give you bidirectional + binary, at the cost of upgrade negotiation, custom proxy support, manual reconnect. For 2026, SSE is the default for one-way push; WebSockets when the client also frequently sends messages (chat, multiplayer).',
    },
    {
      level: 'senior',
      question: 'Walk through Express 5\'s `path-to-regexp` v8 breakages.',
      answer:
        'Three big changes: (1) Bare `*` wildcards are gone — use **named** wildcards: `/files/*splat` (`req.params.splat`). (2) Optional segments use **braces**: `/users{/:id}` (matches `/users` or `/users/42`), not `/users/:id?`. (3) Reserved chars (`(`, `)`, `[`, `]`, `?`, `+`, `!`, `{`, `}`) need escaping (`\\\\(...)`).\n\nThe silent breakage isn\'t 404s — it\'s routes that **throw at registration time** with cryptic messages like "Missing parameter name." Caught on first test run after upgrade. Playbook: grep route strings for `*`, `?`, and parens; rewrite each.',
    },
    {
      level: 'senior',
      question: 'How do you propagate AbortSignal from an Express request to downstream work?',
      answer:
        'Express doesn\'t attach `req.signal` automatically (that\'s a Fastify/Hono pattern). Add a middleware: `const ac = new AbortController(); req.on("close", () => ac.abort()); req.signal = ac.signal;`. Then handlers pass `req.signal` to `fetch`, DB queries, anything that accepts a signal. When the client disconnects, the signal fires and downstream work aborts — saving CPU and DB load on doomed requests. Compose timeouts: `AbortSignal.any([req.signal, AbortSignal.timeout(10_000)])`.',
    },
    {
      level: 'senior',
      question: 'A mounted sub-router\'s handler reads `req.params.tenantId` and gets undefined. Why?',
      answer:
        '`req.params` is scoped to the router that matched the route. A sub-router created with default `Router()` doesn\'t see params from its parent\'s mount path. Fix: `Router({ mergeParams: true })`. Now `app.use("/tenants/:tenantId", tenantRouter)` propagates `tenantId` into the sub-router\'s `req.params`. Standard pattern for multi-tenant routing.',
    },
    {
      level: 'senior',
      question: 'How do you deploy CSP without breaking the site?',
      answer:
        '**Report-only first.** Set `Content-Security-Policy-Report-Only: <target-policy>` plus `Reporting-Endpoints`. Browsers send violation reports without enforcing. Watch reports for a week; fix legitimate violations: nonce inline scripts (modern CSS-in-JS supports this), move inline event handlers to `addEventListener`, add legitimate third-party origins to `script-src`. Once reports are clean, switch to `Content-Security-Policy` (enforcing). Use `strict-dynamic` + per-request nonces for modern bundlers; avoid `unsafe-inline`/`unsafe-eval`.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design a graceful shutdown for an Express service on Kubernetes with WebSocket connections.',
      answer:
        '**1. Readiness probe flips on SIGTERM** → 503. Wait 5-10s for k8s to remove the pod from the Service\'s endpoints.\n\n**2. Notify WebSocket clients** via a `server_shutdown` event so they reconnect to another pod. Wait ~2s.\n\n**3. Close WebSockets with code 1001 (going away).** Hard `terminate()` after 10s for stragglers.\n\n**4. Stop accepting HTTP**: `server.close()`. **Close idle keep-alive** with `server.closeIdleConnections()` (Node 18.2+).\n\n**5. Drain in-flight HTTP** via a tracked `Set<res>`. Wait up to 25s.\n\n**6. Force-close stragglers**: `server.closeAllConnections()`.\n\n**7. Close downstream**: DB pool, Redis, queues — in that order, server first so handlers can write final responses.\n\n**8. Hard timeout**: `setTimeout(() => process.exit(1), 60_000).unref()` as last resort.\n\nK8s side: `terminationGracePeriodSeconds` matched to drain time + buffer (60s typical). Readiness `periodSeconds: 5, failureThreshold: 1` so the LB notices fast. Customers see zero disruption during normal deploys.',
    },
    {
      level: 'staff',
      question: 'Compare Express, Fastify, and Hono as a tech-lead picking for a new service.',
      answer:
        '**Throughput is rarely the answer.** A typical request spends < 5% of its time in framework code; DB and downstream calls dominate.\n\n**Express**: ubiquitous, every tutorial assumes it, LLMs generate solid code for it. Express 5 fixed the async-error pain. Massive middleware ecosystem. Pick for teams with Node history, fast onboarding, no exotic requirements.\n\n**Fastify**: JSON schema-based validation + serialization — schema is the contract. Faster output serialization (avoids JSON.stringify reflection). Plugin model with encapsulation. Pick for greenfield teams who want validation-as-architecture.\n\n**Hono**: multi-runtime — same code on Node, Bun, Deno, Cloudflare Workers, Vercel Edge. TypeScript-first with template-literal-typed route params. Tiny core. Pick for edge deployments or full TS-derived routing types.\n\n**Honorable mentions**: tRPC layers type-safe RPC on top of any. NestJS for enterprise structure (DI, decorators, modules) — heavier but standardizes large codebases.\n\n**Honest call**: existing Express → upgrade to v5, stay. Greenfield → Fastify is a defensible default. Need edge → Hono. Pick once, optimize the codebase under it.',
    },

    // --- additions for new topics ---

    // junior
    {
      level: 'junior',
      question: 'How would you structure a small Express app to avoid one giant `app.js`?',
      answer:
        'Organize **by feature, not by layer**. `src/modules/users/{router,service,schemas,errors,index}.ts` for each feature; `src/shared/` for `db`, `redis`, `config`, `logger`. The `router` is Express-aware (validate input, call service, format output). The `service` is pure TypeScript (no `req`/`res`) — testable without Express. The top-level `app.ts` mounts each module\'s router. New features touch one folder; PRs don\'t collide across folders.',
    },
    {
      level: 'junior',
      question: 'Why send transactional email via a provider like Postmark or Resend instead of raw SMTP?',
      answer:
        'Modern email servers (Gmail, Yahoo, Outlook) judge sender reputation. Direct-from-your-VM SMTP usually goes to spam, even with SPF/DKIM/DMARC perfectly configured, because your IP has no warmth. Transactional providers have warm, monitored IP pools; webhook events for bounces/deliveries; suppression lists; and per-message tracing. Cost is small; deliverability difference is large.',
    },

    // mid
    {
      level: 'mid',
      question: 'How do you call a third-party API "the right way" from Express?',
      answer:
        '**Wrap the client** in one file (`src/integrations/<vendor>/client.ts`) — never call `fetch` directly in handlers. **Validate every response** with Zod at the boundary. **Set timeouts** on every call (`signal: AbortSignal.timeout(5000)`). **Retry idempotent** calls with exponential backoff + jitter; for POST, only retry with an `Idempotency-Key`. **Circuit-break** with `opossum` so a fully-down upstream fails fast. **Per-origin pool** (undici `Pool`) so one slow upstream doesn\'t starve another. **Trace every call** via OpenTelemetry. **Translate errors** to your own types at the seam.',
    },
    {
      level: 'mid',
      question: 'Where should the email-sending side effect live in a signup flow?',
      answer:
        '**Queue it**, don\'t inline it. `app.post(\'/signup\')` does the DB write, enqueues a `welcome-email` job, and responds 201. A worker (`BullMQ`, `pg-boss`, or SQS consumer) picks up the job and calls the email provider. Reasons: email provider outages don\'t break signup; the signup response stays fast; retries on transient failures don\'t require client awareness. For atomicity with the DB write, use the outbox pattern.',
    },

    // senior
    {
      level: 'senior',
      question: 'What\'s the right nginx config to put in front of an Express service?',
      answer:
        '**`proxy_http_version 1.1`** + `proxy_set_header Connection ""` so upstream keepalive works (default is HTTP/1.0 — no reuse). **`upstream` block with `keepalive 32`** to maintain idle connections to Node. **`X-Forwarded-*`** headers set (pair with `app.set("trust proxy", 1)`). **`client_max_body_size`** matching your largest upload. **`proxy_buffering off`** for SSE / streaming routes. **Match `keepAliveTimeout` on Node > nginx idle timeout** (75s default) to avoid race-condition 502s. TLS terminated at nginx; Node speaks plain HTTP internally.',
    },
    {
      level: 'senior',
      question: 'When does messaging via a broker beat synchronous HTTP between services?',
      answer:
        'When the consumer doesn\'t need to respond in the same request: side effects ("user signed up → send welcome email"), fanout to N independent reactions, work that\'s slow or flaky and benefits from retries with backoff. Broker absorbs producer/consumer speed mismatches. For request/response (read a user, validate something synchronously), HTTP is simpler. Don\'t replace HTTP with messaging just for "decoupling" — async adds eventual consistency, dead-letter handling, and harder debugging.',
    },

    // staff
    {
      level: 'staff',
      question: 'You\'re replacing a monolithic Express app with a modular structure. Walk through the steps.',
      answer:
        '**1. Label modules** by feature without moving files yet — auth, billing, users, orders. Surface implicit boundaries.\n\n**2. Per-module router**: `modules/<feature>/router.ts` exports an Express Router. Move that feature\'s routes; mount via `app.use(\'/feature\', router)`.\n\n**3. Extract service layer**: thin routers call functions in `service.ts`. Service has no `req`/`res` — pure TypeScript, callable from CLI, worker, tests.\n\n**4. Schemas at the seam**: `schemas.ts` with Zod for input/output; types derived via `z.infer`. Routers parse; services trust.\n\n**5. Module public API**: `index.ts` re-exports the router, service functions, and types. Other modules import from there, never internal files. ESLint rule enforces.\n\n**6. Per-module errors**: `errors.ts` defines `UserNotFoundError extends HttpError(404)`. App-level error middleware translates HttpError → response.\n\n**7. Data ownership**: each module owns its tables; cross-module data goes through the public API. The hardest step — schema review touches everyone.\n\n**8. Optional extract**: only after boundaries are enforced and proven, consider lifting a module to its own service. Cost vs payoff — usually not worth it until team/scale demands it.\n\nThroughout: existing tests stay green; new tests at the service layer (no Express); incremental PRs, never a big-bang rewrite. The result is a monolith you can grow without it growing painful.',
    },

    // --- additional questions ---

    // junior
    {
      level: 'junior',
      question: 'What does `app.use(express.json())` do?',
      answer:
        'Middleware that parses incoming requests with `Content-Type: application/json` and exposes the parsed body as `req.body`. Without it, `req.body` is `undefined` for JSON requests. Pair with a size limit (`express.json({ limit: \'100kb\' })`) to prevent OOM from oversized requests. For form-encoded bodies, use `express.urlencoded({ extended: true })`. Place these before your routes; they only run when their content type matches.',
    },

    // mid
    {
      level: 'mid',
      question: 'How do you handle `async` errors in Express?',
      answer:
        '**Express 5+**: async errors are caught automatically — throw inside an async handler and they flow to your error middleware. Just write `async (req, res) => { throw new HttpError(404) }`.\n\n**Express 4**: async errors bypass the framework. Either wrap each handler with `try/catch + next(err)`, install `express-async-errors` (a patch that monkey-patches Express 4 to handle them), or use the `asyncHandler(fn)` wrapper pattern: `app.get(\'/\', asyncHandler(async (req, res) => {...}))`. The wrapper attaches `.catch(next)` to the returned promise.\n\nUpgrade to Express 5 if you can — the boilerplate is gone.',
    },

    // senior
    {
      level: 'senior',
      question: 'A user reports your Express endpoint returns 400 with an unhelpful error message. How do you improve the response shape?',
      answer:
        'Standardize on a **structured error response**: `{ "error": { "code": "VALIDATION_FAILED", "message": "...", "fields": [{ "field": "email", "issue": "invalid format" }] } }`. The `code` is machine-readable (stable across versions); `message` is human-readable (can change); `fields` lists field-level issues for forms.\n\n**Wire it via a custom error class** + 4-arg error middleware: `class HttpError extends Error { constructor(status, code, message, fields?) {} }`. Throwing `new HttpError(400, \'VALIDATION_FAILED\', \'...\', issues)` lets the middleware extract everything.\n\n**Pair with Zod**: in validation, transform Zod issues into the `fields` array. Consumers get a consistent shape regardless of which validator raised the error.\n\n**For 5xx errors**: include a `requestId` so users can quote it when they report bugs and you can find their logs immediately. Don\'t expose stack traces in production — log them server-side, return a generic message.\n\n**Document the shape** in your API docs as part of the contract — clients can write one error handler that works for every endpoint.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design a request-tracing system for an Express service that integrates with downstream services.',
      answer:
        '**Standard**: W3C Trace Context. Every request gets a `traceparent` header — propagated from the client or generated at the edge. Format: `version-traceId-spanId-flags`.\n\n**Per-request setup**: middleware reads incoming `traceparent`; if missing, generates a new trace ID. Creates a span for the request. Stores trace/span IDs in `AsyncLocalStorage` so downstream code can access without prop-drilling.\n\n**Span attributes**: HTTP method, route, status, latency, user ID, tenant ID, error class. Don\'t put PII or full bodies. Span events for significant moments (cache hit/miss, retry attempt).\n\n**Downstream propagation**: every outgoing HTTP call adds `traceparent` automatically (undici interceptor or wrapper). DB queries: most modern ORM tracers attach to the active span automatically. Queue producers inject `traceparent` into message metadata; consumers extract on receive.\n\n**Logs**: pino reads trace/span IDs from ALS and includes them in every log line — one click in your log UI takes you to the trace.\n\n**Implementation**: OpenTelemetry SDK + auto-instrumentation handles 90% of this. Custom spans for business operations (`tracer.startActiveSpan(\'charge.process\', span => {...})`).\n\n**Sampling**: at high volume, 100% trace export is expensive. Tail-sampling at the OTel Collector (keep all errors, slow requests, 5-10% of normal) is the production pattern.\n\n**Backend**: Jaeger / Tempo / Honeycomb / Datadog APM. Choose based on cost and existing infra. All accept OTLP.\n\nDistributed tracing pays off the moment you have > 2 services. The "where did this 800ms come from?" question becomes a 30-second click instead of a 30-minute log-grep session.',
    },
  ],
};
