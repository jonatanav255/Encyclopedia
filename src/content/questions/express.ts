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
  ],
};
