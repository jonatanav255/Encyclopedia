import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'express',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'What is Express in one sentence?',
      answer:
        "A minimal HTTP framework for Node that's essentially an ordered list of middleware functions Express walks top-to-bottom on every request.",
    },
    {
      level: 'junior',
      question: 'What does the middleware signature (req, res, next) actually mean?',
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
        "`res.status(201).json(data)`. `.status()` only stages the status code; the response isn't actually sent until `.json()` (or `.send()`, `.end()`, `.redirect()`).",
    },
    {
      level: 'junior',
      question: 'What\'s the difference between app.use() and app.get()?',
      answer:
        '`app.use([path,] fn)` runs `fn` for any method when the URL matches `path` as a prefix. `app.get(path, fn)` runs `fn` only for GET requests with an exact path match (with parameter capture). `use` is for middleware and mounting; `get`/`post`/etc. are for terminal handlers.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'Why does the order of middleware registration matter?',
      answer:
        "Express walks the middleware stack in registration order. A body parser registered after a route handler doesn't help that handler. An auth check registered after a protected route doesn't protect it. There's no automatic dependency resolution — if you want middleware to affect a handler, mount it before that handler.",
    },
    {
      level: 'mid',
      question: 'How does Express detect that a middleware is an error handler?',
      answer:
        'By function arity — a middleware with exactly four parameters `(err, req, res, next)` is treated as an error handler. Three-parameter functions are regular middleware regardless of intent. Error handlers only run when something earlier calls `next(err)` with an argument, and Express skips ahead, passing over non-error middleware until it finds one.',
    },
    {
      level: 'mid',
      question: 'You added a POST endpoint but req.body is undefined. What\'s wrong?',
      answer:
        "You haven't mounted a body parser. Add `app.use(express.json())` (and `express.urlencoded()` for form posts) **before** your route. Express 4+ doesn't bundle body parsing by default — you opt in. Without it, the request body bytes are still arriving on `req` as a stream, but nothing has parsed them into `req.body`.",
    },
    {
      level: 'mid',
      question: 'Why might /users/me return the wrong user?',
      answer:
        'If `/users/:id` is registered before `/users/me`, Express matches `:id` first (with `id === "me"`) and runs the wrong handler. Fix: register literal routes before parameterized ones, or detect "me" inside the `:id` handler and call `next()` to fall through. Order, not specificity, decides matching.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between req.url, req.originalUrl, and req.baseUrl?',
      answer:
        '`req.originalUrl` is the full URL as received. When inside a mounted router, `req.baseUrl` is the prefix Express stripped (e.g. `/api`) and `req.url` is the trimmed remainder the router sees. The router can be written to operate on relative paths because `req.url` has the mount path removed.',
    },
    {
      level: 'mid',
      question: 'When would you use express.Router() instead of just app.get/post?',
      answer:
        'When the routes share middleware (auth, validation) or a URL prefix, or when they belong to a coherent resource (`/users`, `/posts`). Routers let you mount a group at a path and apply middleware once at the group level instead of per-route. They also enable splitting routes across files without one giant `app.js`.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'How would you write a single wrapper that catches async errors from every route?',
      answer:
        "A higher-order function that wraps a handler and forwards rejections to `next`:\n\n```js\nconst wrap = (fn) => (req, res, next) =>\n  Promise.resolve(fn(req, res, next)).catch(next);\n\napp.get('/users/:id', wrap(async (req, res) => {\n  res.json(await findUser(req.params.id));\n}));\n```\n\nThis is what `express-async-errors` does under the hood. (Express 5 forwards async rejections automatically, but the wrapper pattern is still useful for explicit control or when supporting Express 4 codebases.)",
    },
    {
      level: 'senior',
      question: 'A nested router needs the parent\'s route params. Why doesn\'t it see them by default, and how do you enable it?',
      answer:
        '`express.Router()` defaults to isolated params — `req.params` only includes params matched by the current router\'s own paths. Enable inheritance with `express.Router({ mergeParams: true })`. The opt-in is intentional: merging by default risks surprising name collisions when an inner router defines `:id` and the outer one already has `:id`.',
    },
    {
      level: 'senior',
      question: 'You see ERR_HTTP_HEADERS_SENT in logs. What are the likely causes?',
      answer:
        "Three classic ones: (1) sending a response and then calling `next()`, so the next handler tries to set headers; (2) an `if` branch sends a response but forgets `return`, so execution falls through to a second send call; (3) an error handler calls `res.status(500).send(...)` and then `next(err)`, handing the same error to Express's default handler which tries to send again. Fix: always `return res.send(...)` and never call `next(err)` after responding.",
    },
    {
      level: 'senior',
      question: 'How would you protect part of an API with auth while keeping another part public, using routers?',
      answer:
        "Split into two routers and mount both at the same prefix. The protected router has `auth` middleware applied once at the top; the public one doesn't. New routes inherit the boundary automatically:\n\n```js\nconst publicRouter = express.Router();\nconst protectedRouter = express.Router();\nprotectedRouter.use(auth);\n\npublicRouter.get('/health', ...);\nprotectedRouter.get('/me', ...);\n\napp.use('/api', publicRouter);\napp.use('/api', protectedRouter);\n```\n\nMore defensible than sprinkling `auth` on individual routes because the structural separation makes the security boundary obvious in code review.",
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Design a response layer that gives consistent JSON envelopes, automatic request correlation, and easy versioning.',
      answer:
        "Four pieces:\n\n**1. Response envelope.** Success: `{ data, meta: { requestId, version } }`. Error: `{ error: { code, message }, meta: { requestId } }`. Mutually exclusive at the top level.\n\n**2. Handlers return data, not responses.** Type `Handler<T> = (ctx) => Promise<T>`. A `respond(handler)` wrapper invokes it, wraps in the envelope, sets status, calls `res.json`. Handlers literally cannot call `res.send` because they don't see `res`.\n\n**3. Correlation ID middleware** at the top of the stack attaches `req.id` (from `x-request-id` header or generated). Both success and error wrappers copy it into `meta.requestId`.\n\n**4. Versioning via the envelope.** `meta.version` reflects which router served the request. Deprecate by adding `meta.deprecation: { sunset, successor }` — clients get migration hints in every response.\n\nObservability becomes free; double-sends become structurally impossible; client migrations become soft signals instead of cutover events.",
    },
    {
      level: 'staff',
      question: 'A slow middleware is blocking the event loop under load. How would you diagnose and remediate without rewriting the stack?',
      answer:
        "**Diagnose:** per-route latency histograms (`response-time` + per-step timers), event-loop lag via `perf_hooks.monitorEventLoopDelay`, and CPU profiles under realistic load. Common culprits: sync crypto (`bcrypt.hashSync`), giant `JSON.parse`, regex catastrophic backtracking, sync disk I/O in a logger.\n\n**Remediate in order of cost:**\n1. Replace sync APIs with async (`bcrypt.hash`).\n2. Cap payload size (`express.json({ limit: '100kb' })`).\n3. Stream large bodies instead of buffering.\n4. Move CPU-bound work to a worker thread.\n5. Cache idempotent expensive results.\n6. Add a circuit breaker around slow dependencies.\n\nKeep p99 event-loop lag under ~10ms. The cultural piece: make event-loop lag a first-class SLO so teams treat sync APIs as suspect by default.",
    },
  ],
};
