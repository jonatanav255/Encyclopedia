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
  ],
};
