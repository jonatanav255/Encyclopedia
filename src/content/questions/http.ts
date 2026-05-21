import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'http',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'Name the parts of an HTTP request.',
      answer:
        '**Method** (GET, POST, etc.), **path** (`/users/42`), **query string** (`?sort=desc`), **headers** (key/value metadata), and an optional **body** (the payload). The first three together identify the request; headers describe metadata about it; the body carries data for state-changing methods.',
    },
    {
      level: 'junior',
      question: 'Which HTTP methods are idempotent, and what does that mean?',
      answer:
        '**Idempotent**: doing it N times has the same effect as doing it once.\n\n- **GET, HEAD, OPTIONS, PUT, DELETE** are idempotent.\n- **POST, PATCH** are not (PATCH technically can be, but isn\'t by convention).\n\nClients and proxies treat idempotent methods as safe to retry on network failure. That\'s why "create" is POST (`/users`) and "replace" is PUT (`/users/42`) — the second is a known target you can rewrite to repeatedly.',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between HTTPS and TLS?',
      answer:
        '**TLS** (Transport Layer Security) is the encryption protocol. **HTTPS** is HTTP that runs over TLS. They\'re not synonymous: TLS is also under HTTP/2 + 3, IMAP/POP3, gRPC, etc. When you "buy an SSL certificate" you\'re buying a TLS certificate (SSL is the older deprecated name).',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'What does TLS termination at the proxy mean for your Express app?',
      answer:
        'The reverse proxy (nginx, ALB, Cloudflare) holds the cert and decrypts HTTPS. It forwards plain HTTP to Node on the internal network. Implications:\n\n- Node sees `req.protocol === "http"` and `req.secure === false` by default.\n- Set `app.set("trust proxy", 1)` so `X-Forwarded-Proto` is honored.\n- Session cookies with `secure: true` still work — Express checks the forwarded protocol.\n- Don\'t run a custom HTTPS server in Node — let the proxy do TLS.',
    },
    {
      level: 'mid',
      question: 'What does the `Vary` header do?',
      answer:
        'Tells caches "this response depended on these request headers." Without it, a shared cache might serve a JSON response to a browser that requested HTML, or French content to an English-speaking user.\n\n```\nCache-Control: public, max-age=60\nVary: Accept, Accept-Language\n```\n\nThe cache stores a separate copy per combination of varied headers. `Vary: Accept-Encoding` is set automatically by compression middleware.',
    },
    {
      level: 'mid',
      question: 'Why does HTTP/2 fix head-of-line blocking at the HTTP layer but not at TCP?',
      answer:
        'HTTP/1.1 serializes requests over one connection — slow request blocks the ones behind it. HTTP/2 **multiplexes** many requests as interleaved frames over one connection — the HTTP layer no longer has HOL.\n\nBut HTTP/2 runs over TCP, which guarantees ordered delivery. One dropped packet on the TCP connection stalls **every** multiplexed stream until retransmit. The HTTP layer is unblocked; the transport isn\'t.\n\nHTTP/3 fixes this by replacing TCP with QUIC (UDP-based, per-stream ordering).',
    },
    {
      level: 'mid',
      question: 'How does content negotiation work in Express?',
      answer:
        'Client sends `Accept: application/json` (with optional `q=` weights). Server checks what it can produce against what the client wants:\n\n```js\nres.format({\n  "application/json": () => res.json(user),\n  "text/html":        () => res.render("user", { user }),\n  default:            () => res.status(406).send("Not Acceptable"),\n});\n```\n\nSet `Vary: Accept` so caches don\'t serve the wrong format to a different client. For most APIs you only serve JSON, so this is rarely needed — but the pattern matters when you do serve multiple formats.',
    },
    {
      level: 'mid',
      question: 'A client sends `Range: bytes=0-499` — what should the server do?',
      answer:
        'Return **HTTP 206 Partial Content** with the requested bytes:\n\n```\nHTTP/1.1 206 Partial Content\nContent-Range: bytes 0-499/8675309\nContent-Length: 500\nAccept-Ranges: bytes\n```\n\n- `206` not `200`.\n- `Content-Range` shows which slice this is and the total size.\n- `Content-Length` is for *this part*, not the whole.\n\nIf the range is out of bounds, return **416 Range Not Satisfiable** with `Content-Range: bytes */<total>`. `express.static` and `res.sendFile` handle this automatically; custom routes do it themselves. Used by video scrubbing, download resumption, parallel downloads.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'Why doesn\'t HTTP keep-alive solve every connection-pooling problem?',
      answer:
        'HTTP keep-alive (default in /1.1) means one TCP connection serves multiple HTTP request/response pairs **sequentially**. Each new request waits for the previous one to finish — head-of-line blocking at the HTTP layer. Multiplexing (HTTP/2+) fixes that.\n\nBetween Node and an upstream, you also need:\n\n- **Connection-pool sizing** — without it, every new logical operation might open a fresh TCP+TLS connection.\n- **DNS caching** — Node doesn\'t cache by default; uncached resolution adds tens of ms.\n- **A modern dispatcher** — `undici.Agent` with `keepAliveTimeout` for high-traffic callers.\n\nThe `keep-alive` header is necessary but not sufficient.',
    },
    {
      level: 'senior',
      question: 'You upload a 5GB video over HTTP. Walk through what happens with `multipart/form-data`.',
      answer:
        '1. **Client** generates a random boundary, builds a multipart body: `--<boundary>` markers, each part with its own `Content-Disposition` + `Content-Type` headers, then the video bytes.\n2. **Browser** sends `Content-Type: multipart/form-data; boundary=<...>` and streams the body.\n3. **Server** must NOT use `express.json()` — it would fail trying to UTF-8 decode binary. Use `multer` or `busboy`.\n4. **Parser** walks the byte stream, splitting on boundaries; for each file part, either buffers to a temp file (`dest:`) or writes to memory (`memoryStorage`).\n5. **Important**: cap `fileSize` and `files` count — without limits, one client fills your disk or RAM. For 5GB, neither disk nor memory is the right answer in Node — use direct-to-S3 signed URLs and let object storage receive the bytes.',
    },
    {
      level: 'senior',
      question: 'A 200ms latency spike when the first request hits an upstream you haven\'t called recently. Diagnose.',
      answer:
        'Cold first request: DNS resolution + TCP handshake + TLS handshake + first HTTP exchange. Each adds tens to hundreds of ms.\n\nFixes:\n\n- **DNS caching** with `cacheable-lookup` so the resolver only runs once per host.\n- **HTTP keep-alive pool** so the TCP+TLS handshake amortizes across many requests.\n- **TLS 1.3** instead of 1.2 (one round trip instead of two during handshake).\n- **0-RTT resumption** for repeat connections (only for idempotent calls).\n- **DNS prefetch** at app startup — pre-warm the resolver for known upstreams.\n\nA 200ms first-hit latency dropping to 20ms on subsequent ones is the textbook symptom. If you see it on every hit, your pool isn\'t keeping connections open — check `undici.Agent` config.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Design a global CDN caching strategy for an API that serves both public and personalized data.',
      answer:
        '**Split routes by cacheability.** Public, immutable: `/api/articles/:id`. Public, revalidating: `/api/feed`. Personalized: `/api/me/*`.\n\n**Public + immutable**: `Cache-Control: public, max-age=31536000, immutable` plus a hash in the URL or ETag. CDN caches forever; changes invalidate via path purge.\n\n**Public + revalidating**: `Cache-Control: public, max-age=60, stale-while-revalidate=600, stale-if-error=86400`. CDN serves cached, refreshes in background, falls back to stale on origin errors.\n\n**Personalized**: `Cache-Control: private, no-store` *or* `private, max-age=0` + `Vary: Authorization`. Don\'t let intermediaries cache user-specific data.\n\n**Cache key composition**: include `Vary: Accept-Encoding, Accept-Language` (often automatic); avoid `Vary: User-Agent` which fragments the cache massively. For tenanted APIs, encode tenant ID into the URL rather than relying on `Vary`.\n\n**Purge**: tag-based purging (Fastly, Cloudflare). On write, purge the relevant tags (e.g., `article:42`) rather than guessing the URL.\n\n**Observability**: hit ratio, origin RPS, p99 latency at edge vs origin. Below 90% hit ratio on public content means tuning is wrong.\n\n**Failure modes**: when origin is down, `stale-if-error` keeps the cache serving. Document the SLO: "we serve stale up to 24h on origin outage."',
    },
    {
      level: 'staff',
      question: 'You need to call an upstream HTTP API that\'s flaky and slow. Build the wrapper.',
      answer:
        '**Timeout** — every request needs one. `undici` `bodyTimeout`/`headersTimeout`, or `AbortController` with `setTimeout`. Default: 5–10s total. Set lower if it\'s a hot path.\n\n**Retries** — only for idempotent methods (GET/PUT/DELETE) or with idempotency keys (POST). Exponential backoff with jitter: `delay = base * 2^attempt + random(0, base)`. Cap retries at 3–5; cap delay at ~30s. Honor `Retry-After`.\n\n**Circuit breaker** — track recent failure rate; when above threshold, open the circuit and fail fast without calling. Half-open after a cooldown to test recovery. `opossum` is the standard Node library. Prevents cascading failure when the upstream is fully down.\n\n**Bulkhead / concurrency limit** — bound in-flight requests to the upstream so one slow downstream doesn\'t consume all your sockets.\n\n**Connection pooling** — `undici.Pool` or `Agent` with `keepAlive`. Avoid the per-request TCP+TLS handshake.\n\n**Caching** — for read-heavy data, cache responses with `stale-while-revalidate` semantics. The fastest call is the one you don\'t make.\n\n**Observability** — per-request: status, latency, attempt count. Per-window: success rate, p99 latency, circuit state. Alert on success rate dropping below SLO.\n\n**Hygiene**: distinct user-agent identifying your service; client request ID propagated for trace correlation; verbose errors logged with enough context to reproduce.',
    },

    // --- additional questions ---

    // junior
    {
      level: 'junior',
      question: 'What does the `Host` header do, and why does HTTP/1.1 require it?',
      answer:
        '`Host: example.com` tells the server which domain the request is for. Required because **multiple sites can share one IP** (virtual hosting) — the server reads `Host` to decide which site\'s config to use. Without it, the server can\'t know which of N hosted sites should handle the request. HTTP/2 replaces it with the `:authority` pseudo-header but the concept is the same.',
    },

    // mid
    {
      level: 'mid',
      question: 'A client sends `Accept-Encoding: gzip, br`. What should the server do?',
      answer:
        'Pick one encoding (usually brotli if supported, else gzip), compress the response, and set `Content-Encoding: br` (or `gzip`) plus `Vary: Accept-Encoding`. The `Vary` header tells caches to store a separate copy per encoding — without it, a CDN can serve gzipped content to a client that only accepts brotli. Don\'t compress already-compressed content (images, videos, zip files) — wasted CPU, no size win.',
    },

    // senior
    {
      level: 'senior',
      question: 'Walk through what happens during a TLS 1.3 handshake.',
      answer:
        '1. **ClientHello**: client sends supported ciphers, TLS versions, a random nonce, and (TLS 1.3) a key share for ECDHE. Optionally early-data (0-RTT) and SNI to indicate the hostname.\n2. **ServerHello**: server picks the cipher, sends its own key share + nonce. The shared secret is derived immediately via ECDHE — no round-trip needed.\n3. **Server certificate + Finished**: server sends its cert chain (encrypted!), signed proof of possession, and a Finished message (HMAC over the handshake so far).\n4. **Client Finished**: client verifies the cert chain, sends Finished.\n5. **Application data flows** — encrypted with the derived session keys.\n\n**1-RTT total** in 1.3 (vs 2-RTT in 1.2). With **session resumption** (PSK from a previous handshake), can be 0-RTT — application data sent in the first packet. 0-RTT is risky for non-idempotent requests (replayable), so it\'s opt-in.\n\n**Modern improvements**: handshake is encrypted earlier (cert isn\'t visible to passive observers), perfect forward secrecy is mandatory (every session uses ephemeral keys), weak ciphers are removed.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design a global edge architecture for an API with users worldwide.',
      answer:
        '**Anycast routing**: one IP, advertised from many locations. Clients reach the geographically nearest POP. Cloudflare, Fastly, AWS Global Accelerator provide this.\n\n**Edge POPs**: terminate TLS at the edge (lower latency for handshakes). Run JS at the edge for personalization, A/B tests, auth checks (Cloudflare Workers, Vercel Edge, Fastly Compute@Edge).\n\n**Cache layers**: at the edge, cache public responses aggressively with `Cache-Control: public, s-maxage=...` and `Vary` headers for negotiation. CDN handles ~95% of hits; origin sees only the tail.\n\n**Origin in 1–3 regions**, behind cloud LBs. The edge POP routes cache misses to the nearest origin via the cloud\'s private backbone.\n\n**Data layer**: read replicas in each origin region. Writes go to the primary (one region). For low-latency reads anywhere, eventually-consistent replicas suffice. For strict consistency, accept the WAN latency to the primary.\n\n**Real-time**: WebSockets / SSE terminate at the nearest POP; the POP holds the persistent connection, fans out via a global broker (Redis pub/sub with WAN replication, or a managed real-time service).\n\n**Observability**: distributed tracing with W3C `traceparent` propagating from edge → POP → origin. Latency dashboards split by geography. SLO budgets per region.\n\n**Failure modes**: if a POP goes down, anycast routes to the next-nearest. If a region\'s origin goes down, the LB fails over (DNS or BGP). Test with chaos engineering — randomly kill a region in staging.\n\n**Cost**: edge bandwidth dominates. Optimize cache hit rate (95%+ target), compress aggressively, monitor bandwidth per route.',
    },
  ],
};
