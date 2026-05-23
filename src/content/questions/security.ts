import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'security',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'Why hash passwords with bcrypt instead of SHA-256?',
      answer:
        'SHA-256 is a fast hash. An attacker who steals your password database can compute billions of SHA-256 hashes per second on a GPU and quickly check them against common passwords. bcrypt is **intentionally slow** (cost factor 12 is ~250ms per hash) and **salted** (the same password produces different hashes per user). The same attacker can compute maybe 30 bcrypt hashes per second per GPU. argon2 is the modern alternative with similar properties.',
    },
    {
      level: 'junior',
      question: 'What is OWASP A01: Broken Access Control?',
      answer:
        'The most common web vulnerability category — users accessing resources they shouldn\'t. Classic example: `GET /orders/42` returns the order without checking it belongs to `req.user`. Anyone logged in can read anyone\'s order (IDOR — Insecure Direct Object Reference). Defenses: ownership checks on every protected resource, UUIDs instead of incrementing IDs (harder to enumerate), and automated tests for authorization.',
    },
    {
      level: 'junior',
      question: 'Why never commit `.env` to git?',
      answer:
        'Once a secret enters git history, it\'s effectively public. Scanners crawl public repos for leaked credentials within minutes. Even `git rm` doesn\'t remove old commits; the secret stays in history. If you accidentally commit one, **rotate it immediately** — don\'t rely on history rewriting.\n\n`.env` should be in `.gitignore` from day one. Commit `.env.example` listing the variable names but no values.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'How do you prevent SQL injection in a column name?',
      answer:
        'Placeholders only work for **values**, not identifiers (table/column names). For identifiers, validate against an allowlist:\n\n```js\nconst SORTABLE = ["name", "created_at", "email"];\nif (!SORTABLE.includes(req.query.sortBy)) return res.sendStatus(400);\ndb.query(`SELECT * FROM users ORDER BY ${req.query.sortBy}`);\n```\n\nNever interpolate raw user input into column or table names. The allowlist is the only safe option — placeholders cannot substitute identifiers.',
    },
    {
      level: 'mid',
      question: 'What is SSRF, and why is it dangerous in cloud environments?',
      answer:
        '**Server-Side Request Forgery**: an attacker convinces your server to fetch a URL they control. The server has network access the attacker doesn\'t — to your internal services and to the cloud metadata endpoint:\n\n```\nGET /preview?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/\n```\n\nIn AWS this returns IAM credentials. The famous Capital One breach in 2019 was exactly this. Defenses: whitelist domains, block private IP ranges (with DNS-rebinding-safe lookup), disable redirects, restrict protocols, and most importantly — egress firewall + AWS IMDSv2 so the metadata endpoint isn\'t reachable from the app.',
    },
    {
      level: 'mid',
      question: 'What is prototype pollution?',
      answer:
        'A JS-specific class of vulnerability where attacker input modifies `Object.prototype`, affecting every object in the process. Classic vector: a deep-merge utility recursively walks user input and sets `__proto__.isAdmin = true`. Now every `user.isAdmin` is true.\n\nDefenses: use null-prototype objects (`Object.create(null)`), freeze `Object.prototype`, validate input shape (zod with `.strict()`), and keep dependencies current — many libraries have patched their merge/set utilities (lodash 4.17.12+).',
    },
    {
      level: 'mid',
      question: 'How does PKCE protect OAuth2 in browsers and mobile apps?',
      answer:
        'Without PKCE: client gets an auth code in the URL on redirect; an attacker who intercepts the URL exchanges it for a token. With PKCE: the client generates a random `code_verifier`, sends its SHA-256 hash (`code_challenge`) in the initial authorization request, then sends the **original verifier** at code exchange. The auth server compares hash(verifier) to the challenge.\n\nAn attacker who only has the code can\'t produce the verifier. PKCE is now mandatory for public clients (SPAs, mobile) — and recommended for confidential clients too.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'You\'re reviewing an endpoint that hashes a file from a user-supplied URL. What security risks should you raise?',
      answer:
        'Multiple layers:\n\n1. **SSRF** — `fetch(req.body.url)` can target the metadata endpoint or internal services. Whitelist domains, block private IPs (with DNS-rebinding-safe lookup), disable redirects.\n2. **Resource exhaustion** — no size limit means a 50GB file fills your RAM/disk. Cap content length; stream to a temp file with a hard byte cap.\n3. **Timeout** — `fetch` has none by default. A slow upstream holds connections forever. Use `AbortSignal.timeout`.\n4. **Protocol restriction** — `file://`, `gopher://` can exfiltrate local files / talk to internal services. Whitelist `https:` (and maybe `http:` for dev).\n5. **Auth-header forwarding** — if your fetch helper attaches auth headers automatically, you might leak them to whoever the user pointed at.\n6. **MIME confusion** — the returned content type is attacker-controlled. Don\'t serve the body back to other users without re-checking.\n\nThe core lesson: any "fetch user URL" endpoint is one of the highest-risk shapes in a web app.',
    },
    {
      level: 'senior',
      question: 'How would you rotate a JWT signing key without invalidating in-flight sessions?',
      answer:
        'Maintain a **keyring** — multiple valid keys at once. Sign new tokens with the current key (`kid` claim identifies it). Verify against any key in the ring.\n\nRotation:\n\n1. Add a new key to the ring (verifiers accept it; nothing signs with it yet).\n2. Switch the signing key to the new one. Old tokens still verify against the old key.\n3. After old tokens have expired (e.g., 24 hours past max token lifetime), remove the old key.\n\nFor JWKS endpoints (`/.well-known/jwks.json`), publish both keys for the rotation window. Most JWT libraries (`jose`, `openid-client`) handle keyring lookup by `kid` for you. The discipline is in operating the rotation, not in the code.',
    },
    {
      level: 'senior',
      question: 'A "fetch user-provided URL" endpoint is required by product. What\'s your minimum safe implementation?',
      answer:
        'The key idea is to **resolve DNS once, validate the IP, then connect to the IP directly** — preserving the hostname only as `Host` header + TLS SNI. That single resolution defeats DNS rebinding because no second lookup is consulted.\n\n```js\nimport { lookup } from "node:dns/promises";\nimport https from "node:https";\n\nconst MAX_BYTES = 5 * 1024 * 1024;\nconst ALLOWED = new Set(["images.example.com"]);\n\nasync function safeFetch(rawUrl) {\n  const u = new URL(rawUrl);\n  if (!["http:", "https:"].includes(u.protocol)) throw new Error("protocol");\n  if (!ALLOWED.has(u.hostname)) throw new Error("host");\n\n  // 1. Resolve once.\n  const { address } = await lookup(u.hostname);\n  if (isPrivate(address)) throw new Error("private ip");\n\n  // 2. Connect to the validated IP; preserve hostname for Host + SNI.\n  return new Promise((resolve, reject) => {\n    const req = https.request({\n      host: address,\n      port: u.port || 443,\n      path: u.pathname + u.search,\n      headers: { Host: u.hostname },\n      servername: u.hostname,             // SNI + cert validation\n      timeout: 5000,\n    }, (res) => {\n      let total = 0;\n      const chunks = [];\n      res.on("data", (c) => {\n        total += c.length;\n        if (total > MAX_BYTES) { req.destroy(); reject(new Error("too large")); return; }\n        chunks.push(c);\n      });\n      res.on("end", () => resolve(Buffer.concat(chunks)));\n    });\n    req.on("timeout", () => req.destroy(new Error("timeout")));\n    req.on("error", reject);\n    req.end();\n  });\n}\n```\n\nLayers: protocol restriction, allowlist, single DNS lookup (no rebinding race), connect by IP with preserved SNI, no redirects (handle Location yourself and re-validate), timeout, no auth forwarding, size cap. Plus IMDSv2 + egress firewall at the infrastructure layer. For production, use `ssrf-req-filter` or undici with a custom `connect` rather than rolling this from scratch.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'A security researcher reports a vulnerability. What\'s your response playbook?',
      answer:
        '**Acknowledge within 24 hours.** A public security email and ack queue is essential — silence makes researchers go public.\n\n**Triage**: assess severity (CVSS or your own framework). Critical exploit-in-the-wild → engage on-call immediately. Lower → schedule.\n\n**Reproduce in a controlled environment.** Don\'t patch what you don\'t understand. Document the attack path.\n\n**Contain** before fixing: WAF rules to block the vector, feature-flag the vulnerable code path off, revoke leaked credentials. Buy time without rushing a fix.\n\n**Patch**: write the fix on a private branch, add regression tests. Have at least two engineers review. Don\'t skip CI.\n\n**Deploy**: roll out carefully. For criticals, prioritize over normal release process — but still gradual rollout to catch regressions.\n\n**Disclosure**: coordinate with the reporter. Typical embargo: 30–90 days, with credit. For supply-chain or industry-wide issues, disclose to peer companies before public.\n\n**Post-fix**:\n- CVE if applicable.\n- Public advisory (or quiet patch with details only to affected customers, depending on severity).\n- Postmortem internally — how did this slip past code review, tests, audits?\n- Pay the bug bounty if you have one. Even a small payout signals seriousness.\n\n**Process improvements**: audit similar code paths for the same class of bug. Add static analysis rules, training, or automated tests. The bug is the symptom; the process gap is the disease.',
    },
    {
      level: 'staff',
      question: 'Design end-to-end secrets management for a multi-environment Node service.',
      answer:
        '**Storage**: managed KMS-backed secret store (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager). Never commit secrets — git history is forever. `.env.example` lists names; the real values live in the manager.\n\n**Access control**: IAM policies per environment (dev/staging/prod) and per service. Production secrets are reachable only by production services\' IAM roles. Engineers get short-lived access via break-glass procedures, logged.\n\n**Retrieval**:\n- **At startup**: app fetches secrets, validates with Zod schema, fails fast if anything\'s missing or malformed. No fallback to defaults for production secrets.\n- **Caching**: in-memory only, never persisted to disk. Refresh on a schedule (5–15 min) so rotation propagates.\n- **No environment variables for sensitive values** if possible — they leak via `/proc`, debug logs, error reports. Inject directly into the app from the manager.\n\n**Rotation**:\n- Database creds: managed rotation that updates the secret + the DB user atomically. App polls for new value and re-establishes connections gracefully.\n- API keys: pair-rotate (issue new, deploy code that uses new, revoke old after grace period). Avoid downtime windows.\n- Cryptographic keys: support a keyring (multiple valid keys). Rotate by adding the new, switching default, removing the old later. See "JWT key rotation."\n\n**Audit**:\n- Every secret access logged with caller identity, timestamp, secret name.\n- Alerts on unusual access patterns (volume spikes, new caller identities).\n\n**Incident response**:\n- Pre-built playbook: revoke compromised secret, identify blast radius (what\'s authenticated by this key?), rotate dependent secrets, force-logout users if a session key was involved.\n- Practice it. Quarterly drills.\n\n**Anti-patterns to ban via lint/review**: `process.env.SECRET` outside of bootstrap, hard-coded literals in test files, secrets in Dockerfile `ENV`, secrets in CI logs (`echo $TOKEN`).',
    },

    // --- additional questions ---

    // junior
    {
      level: 'junior',
      question: 'What\'s the difference between authentication and authorization?',
      answer:
        '**Authentication** is "who are you?" — verifying identity via password, token, certificate, biometric. **Authorization** is "what can you do?" — checking permissions for a specific action. You authenticate once at login; you authorize on every protected action. A common shorthand: "authn = identity, authz = permission." Implementation-wise, authn produces a session/token; authz reads it and checks rules against the requested resource.',
    },

    // mid
    {
      level: 'mid',
      question: 'Why is HTTPS not enough — what does HSTS add?',
      answer:
        '**HTTPS** means *if* the user reaches the HTTPS URL, it\'s encrypted. But the first request is often HTTP (typed bare URL, clicked old link, server redirects to HTTPS). That first HTTP request is interceptable. **HSTS** (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`) tells browsers "for this domain, ALWAYS use HTTPS, even if the user types `http://`." After the first HTTPS visit, the browser remembers; the HTTP downgrade attack vector closes. `preload` submits your domain to a browser-baked-in list so even the first visit is HTTPS-only.',
    },

    // senior
    {
      level: 'senior',
      question: 'You discover a dependency in your `package.json` has been compromised in a recent release. What\'s your response?',
      answer:
        '**Immediate**: pin the lockfile to a known-safe version (or remove the dep). Force a CI rebuild from a clean state. Verify production isn\'t running the compromised version — check deployed image digests.\n\n**Assess blast radius**: what did the package have access to? In Node, any code has full process access by default — assume it could read `process.env`, write to disk, make network calls. If your app handles secrets, rotate every secret the process touched: database passwords, API keys, JWT signing keys, OAuth client secrets.\n\n**Audit logs**: look for anomalous outbound network calls, unexpected file writes, unusual DB queries during the compromised version\'s runtime window. Many supply-chain attacks exfiltrate to attacker-controlled domains.\n\n**Notify users** if user data may have been exposed — most jurisdictions require breach disclosure for PII.\n\n**Prevent recurrence**: enable `--permission` (Node) or container-level filesystem restrictions to limit what compromised deps can do. Use Socket/Snyk for passive supply-chain monitoring. Adopt `pnpm install --ignore-scripts` by default; allowlist specific packages that need postinstall scripts.\n\n**Post-mortem**: how did the compromised version land in your lockfile? Auto-merge of minor versions without review? Lack of dep diff in PRs? Tighten the process — the technical fix is fast; the process change prevents the next one.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design end-to-end authentication for a web app + native mobile + third-party API integrations.',
      answer:
        '**Web app (browser, same domain)**: OAuth/OIDC if you outsource auth, else opaque session tokens in HttpOnly + SameSite=Strict cookies. Cookies handle CSRF via SameSite + double-submit token. JWT in localStorage is the wrong choice — XSS = total compromise.\n\n**Native mobile**: PKCE-protected OAuth flow opening a system browser (not embedded webview). Refresh token stored in OS keychain (iOS Keychain, Android Keystore). Access token short-lived (~15 min); refresh in background.\n\n**Third-party API integrations** (your customers integrating with you): OAuth 2.0 with PKCE if their app acts on behalf of users; client credentials grant for server-to-server. Issue per-app credentials with revocable scopes. Rate limit per app, not per IP.\n\n**Token format**: opaque tokens stored server-side (Redis) for cookie sessions — easy revocation. JWT for stateless API tokens with short TTL + refresh — accept revocation complexity for scaling.\n\n**Key management**: JWT signing keys via a keyring (kid-based), rotated quarterly. Public keys exposed at `/.well-known/jwks.json`.\n\n**Multi-factor**: TOTP (Google Authenticator) standard; WebAuthn (passkeys) for the modern path. SMS as fallback only — SIM swapping risk.\n\n**Session management**: device list per user, revoke individual sessions, force-logout on password change. Session ID rotation on privilege elevation.\n\n**Cross-cutting**: structured audit log of every auth event (login, logout, failed attempt, token revoke, MFA enroll, password change). Anomaly detection — login from new geography, unusual hours, multiple failures.\n\n**For 2026**, increasingly: passkeys (WebAuthn) as primary, passwords optional. Industry direction is "phishing-resistant by default."',
    },

    // --- CSRF and SameSite ---
    {
      level: 'mid',
      question: 'Why is SameSite=Lax not a complete CSRF defense?',
      answer:
        'Lax blocks the classical attack — cross-site form POSTs and image-tag GETs don\'t carry the cookie — but two gaps remain.\n\n**1. State changes on GET.** Lax *does* send the cookie on top-level GET navigations (link clicks). If `/logout` or `/delete?id=42` mutate state on GET, an attacker links the user to it and the cookie attaches. Fix: never mutate state on GET. Period.\n\n**2. Same-site subdomain attacks.** SameSite considers `evil.example.com` and `app.example.com` the same site (eTLD+1). A compromised or attacker-controlled subdomain isn\'t blocked. Fix: distinct sites for security boundaries, `__Host-` prefixed cookies, and a secondary defense (synchronizer token or double-submit) for sensitive endpoints.\n\nAlso worth knowing: CORS is not a CSRF defense. CORS controls what cross-origin JS can *read* — the attacker doesn\'t need to read the response, the server side effect already happened. The relevant browser machinery for CSRF is SameSite + preflight (custom-header requirement forces OPTIONS), not Access-Control-Allow-Origin.',
    },
    {
      level: 'senior',
      question: 'Walk me through a stateless double-submit CSRF defense and where it can go wrong.',
      answer:
        'Server sets a CSRF cookie with a random value (readable by JS — not HttpOnly). On state-changing requests, client reads the cookie and copies the value into a request header (`X-CSRF-Token`). Server compares cookie value to header value; mismatch = reject.\n\nWhy it works: an attacker page can\'t read the victim\'s cookie (same-origin policy), so it can\'t construct a request where header matches cookie.\n\nFailure modes:\n- **Plain random value, no signing.** Attacker who controls a subdomain (`evil.app.example.com`) sets their own cookie on `.example.com`, plants a matching header value — pass. Fix: HMAC-sign the cookie value (`session_id || random || hmac`), reject unsigned-or-foreign values.\n- **No `__Host-` prefix.** Same problem — subdomain cookie injection bypasses. `__Host-` rejects any cookie that wasn\'t set with Secure, no Domain, Path=/.\n- **Accepting form-encoded content types.** If the endpoint accepts `application/x-www-form-urlencoded`, the browser doesn\'t require a CORS preflight, and the attacker can submit a form with the matching field. Lock the JSON endpoint to `application/json` only.\n- **Token in URL.** Logs and referrer headers leak it.\n\nFor most SPAs the better default is: HttpOnly SameSite=Lax session cookie + require `Content-Type: application/json` on state changes. That combo achieves the same protection via preflight, with no double-submit machinery.',
    },

    // --- XSS and CSP ---
    {
      level: 'mid',
      question: 'What does a modern strict CSP look like, and what does each directive buy you?',
      answer:
        '```\nContent-Security-Policy:\n  script-src \'nonce-r4nd0m\' \'strict-dynamic\';\n  object-src \'none\';\n  base-uri \'none\';\n  frame-ancestors \'none\';\n  require-trusted-types-for \'script\';\n```\n\n- **`script-src \'nonce-...\' \'strict-dynamic\'`** — only inline scripts carrying the per-request nonce execute; scripts dynamically loaded *by* a nonced script also execute (strict-dynamic), so you don\'t have to enumerate every CDN. Defeats inline-script injection because the attacker can\'t guess the nonce.\n- **`object-src \'none\'`** — blocks legacy plugin vectors (`<object>`, `<embed>`).\n- **`base-uri \'none\'`** — prevents `<base>` injection that hijacks relative URLs.\n- **`frame-ancestors \'none\'`** — modern clickjacking defense, replaces `X-Frame-Options`.\n- **`require-trusted-types-for \'script\'`** — makes DOM sinks (`innerHTML`, `eval`) refuse string arguments unless they came through a Trusted Types policy. Eliminates most DOM XSS at the language level.\n\nRoll out in Report-Only first, wire `report-to` to a collector, watch for legitimate violations, refactor, then flip to enforcing. The CSP Evaluator (Google) will grade your policy — anything below "A" is leaving easy wins on the table. Most importantly: **no `unsafe-inline`** — it defeats CSP\'s anti-XSS value.',
    },
    {
      level: 'senior',
      question: 'You inherit an app with `dangerouslySetInnerHTML` sprinkled through the codebase. How do you systematically reduce XSS risk?',
      answer:
        'Three parallel tracks.\n\n**1. Inventory and triage.** Grep for every dangerous sink: `dangerouslySetInnerHTML`, `v-html`, `innerHTML =`, `outerHTML =`, `document.write`, `eval`, `new Function`. Classify each: takes a static literal (safe), takes a server-generated trusted value (probably safe but document), takes user-influenced data (must sanitize). Track in a ticket.\n\n**2. Defense in depth via CSP.** Deploy CSP with `script-src \'nonce-...\' \'strict-dynamic\'` in Report-Only first, then enforce. Even if you miss a sink, injected `<script>` tags without the nonce won\'t execute. This catches the long tail of sinks you haven\'t inventoried yet.\n\n**3. Replace sanitisation per sink.** Wherever the input is user-influenced, route it through DOMPurify with a tight tag/attr allowlist:\n\n```js\nimport DOMPurify from \'dompurify\';\nel.innerHTML = DOMPurify.sanitize(userHtml, {\n  ALLOWED_TAGS: [\'b\', \'i\', \'em\', \'a\', \'p\'],\n  ALLOWED_ATTR: [\'href\'],\n});\n```\n\n**4. Trusted Types for the long-term fix.** Once CSP is enforced, layer `require-trusted-types-for \'script\'`. Every `innerHTML` assignment now throws unless it goes through a policy. New code can\'t accidentally introduce sinks; old code surfaces immediately.\n\n**5. Lint rules.** ESLint rules for `react/no-danger`, `vue/no-v-html`, etc. — warn or error on new uses, allow grandfathering via inline disables that require justification.\n\nThe combination — CSP for runtime safety net, DOMPurify for known sinks, Trusted Types for prevention, lint for future regressions — gets you to a state where new XSS is hard to introduce and existing ones are caught.',
    },

    // --- JWT pitfalls ---
    {
      level: 'senior',
      question: 'Explain the RS256 → HS256 algorithm-confusion attack on JWTs.',
      answer:
        'Suppose your service uses RS256 (asymmetric: public key verifies, private key signs). The public key is shipped to clients via JWKS.\n\nAn attacker takes your public key, treats it as a shared secret, and forges a token with header `{ "alg": "HS256" }` signed with HMAC-SHA256 using the public key as the HMAC key. They control all the claims.\n\nIf your verifier looks at the token\'s header, sees `alg=HS256`, and uses the "verification key" (your RSA public key) as the HMAC secret — it verifies. The attacker has just issued themselves any claim they wanted.\n\nThe root cause: the verifier picks the algorithm **from the token** instead of from policy. The fix is to pin algorithms at the verifier:\n\n```js\njwt.verify(token, publicKey, { algorithms: [\'RS256\'] });\n// not: jwt.verify(token, publicKey)\n```\n\nSame fix for `alg=none` (the spec permits unsigned tokens; a permissive verifier accepts them). Modern JWT libraries refuse both by default since around 2018, but homemade implementations and outdated dependencies still ship the bug. Audit any custom verify path. Also: never honour `jku` / `x5u` headers from the token itself — they let the attacker point at attacker-controlled JWKS.',
    },
    {
      level: 'senior',
      question: 'Where should JWTs live on the client side?',
      answer:
        'No storage is XSS-and-CSRF-immune. The realistic choices and their trade-offs:\n\n- **`localStorage`** — readable by any script on the page. Single XSS = permanent token theft. Convenient, terrible. Never put refresh tokens here.\n- **`sessionStorage`** — same XSS exposure; lost on tab close. Marginal improvement.\n- **In-memory variable** — XSS still steals it during the page\'s lifetime, but it dies on reload. Combined with a refresh token in an HttpOnly cookie, XSS exposure is bounded to the access token\'s remaining lifetime.\n- **`HttpOnly; Secure; SameSite=Lax` cookie** — script can\'t read it (XSS doesn\'t exfiltrate it). But auto-attached to cross-site GET navigations, so you must avoid state-changing GETs and add a CSRF defense for sensitive POSTs.\n\nThe pattern that works for most SPAs: **short-lived access token in JS memory + refresh token in HttpOnly cookie**. Access token has a 5–15 minute TTL. Refresh endpoint reads the HttpOnly cookie, issues a fresh access token. XSS can grab the in-memory access token but only for its remaining minutes; the refresh token stays out of JS reach.\n\nFor traditional server-rendered web apps, opaque session IDs in HttpOnly cookies is still the right answer — JWTs in cookies are mostly worse than session IDs (harder to revoke, leak claims). JWTs shine for cross-service auth and stateless APIs, not same-app session management.',
    },

    // --- supply chain ---
    {
      level: 'senior',
      question: 'What does Sigstore solve and how does it actually work in CI?',
      answer:
        'Sigstore is a free, OSS ecosystem for signing software without managing long-lived signing keys. The pieces:\n\n- **Cosign** — the CLI that signs and verifies blobs, container images, attestations.\n- **Fulcio** — short-lived certificate authority. You authenticate via OIDC (GitHub Actions, Google, GitLab); Fulcio issues a certificate bound to your identity, valid for ~10 minutes. You sign the artifact, throw the key away.\n- **Rekor** — append-only transparency log. Every signature is recorded; verifiers check Rekor to confirm signatures aren\'t backdated or forged.\n\nIn CI, the flow is:\n\n```yaml\n- uses: sigstore/cosign-installer@v3\n- run: cosign sign ghcr.io/myorg/api@sha256:abc...\n  env:\n    COSIGN_EXPERIMENTAL: 1\n```\n\nThe action authenticates via GitHub\'s OIDC token. Fulcio issues a cert that says "this signing identity is the `myorg/api` workflow on main." Cosign signs the image digest, uploads the signature + cert + Rekor entry. At deploy time:\n\n```bash\ncosign verify ghcr.io/myorg/api@sha256:abc... \\\n  --certificate-identity-regexp "https://github.com/myorg/.*" \\\n  --certificate-oidc-issuer "https://token.actions.githubusercontent.com"\n```\n\nThis asserts: "this image was signed by a GitHub Action in our org." Anyone in the org can sign (via OIDC); nobody outside can. No HSM, no shared key, no rotation drama. Combined with SBOMs attached as Sigstore attestations, you have artifact-level provenance that\'s verifiable by anyone consuming your software.',
    },
    {
      level: 'staff',
      question: 'Design a minimum-viable supply-chain hardening plan for a 50-person engineering org.',
      answer:
        'Prioritise by attacker effort vs your effort. A reasonable phased plan:\n\n**Quarter 1 — eliminate easy attacks.**\n- Every repo on lockfiles + `--frozen-lockfile` in CI (pnpm/poetry/cargo equivalents).\n- Pin GitHub Actions by SHA, not tag. Audit `pull_request_target` usage (it\'s the most common CI compromise vector).\n- Ephemeral CI runners only.\n- OIDC-based deploy credentials (no long-lived secrets in CI).\n- Internal package registry (Artifactory / Verdaccio) proxying upstream; allowlist enforced there.\n\n**Quarter 2 — provenance.**\n- All container images signed via Sigstore in CI; verification required at deploy time (admission controller or ArgoCD plugin).\n- SBOM generation (`syft`) attached to every release as Sigstore attestation.\n- Vulnerability scanning on SBOMs in CI (`grype`); fail builds on high-severity unpatched CVEs.\n\n**Quarter 3 — dependency review.**\n- Platform team owns the allowlist for new dependencies. Lightweight review criteria: maintainership, recency, postinstall scripts, transitive surface.\n- Renovate / Dependabot for keeping pinned versions current.\n- Audit and remove unused dependencies (`depcheck`, `knip`).\n\n**Quarter 4 — base image discipline.**\n- Pin base images by digest, not tag.\n- Move to distroless / minimal bases where possible.\n- Weekly automated rebuilds even without code changes, so CVE patches in the base image propagate.\n\n**Ongoing.** SLSA L2 minimum for any artifact shipped to customers; L3 for the artifacts that matter most (production services, customer SDKs). Quarterly review of the dependency allowlist; quarterly tabletop exercise for a supply chain incident ("a popular package we depend on was just compromised — what do we do?"). The Shai-Hulud worm and XZ backdoor make these drills realistic, not theoretical.',
    },

    // --- rate limiting ---
    {
      level: 'mid',
      question: 'When would you pick token bucket over a sliding-window counter for rate limiting?',
      answer:
        '**Token bucket** when you want to allow controlled bursts. A bucket of capacity 100 with refill rate 10/sec lets a client fire 100 requests immediately, then 10/sec sustained. Good for APIs where users do legitimate bursts (a UI making a flurry of requests on page load) and you want to be friendly about that.\n\n**Sliding window counter** when you want predictable rate over time without burst allowance. "100 requests per minute, smoothly distributed." Easier to reason about for billing tiers; harsher on bursty-but-legitimate clients.\n\nBoth are cheap in Redis (2 numbers per key, atomic via Lua). Both are good defaults.\n\nWhen NOT to pick either:\n- **Fixed window** when you genuinely want calendar-aligned reset semantics ("100 calls per hour, resets at the top of the hour"). Cheaper, but has the boundary problem — a client can burn 100 in the last second of one hour and 100 in the first second of the next.\n- **Leaky bucket** when the downstream literally can\'t tolerate bursts and you want to *smooth* (queue with backpressure) rather than reject. Adds latency where token bucket adds rejection.\n\nKey selection usually matters more than algorithm choice. The same algorithm tuned on per-IP vs per-user vs per-IP+endpoint produces wildly different protection. For credential stuffing, limit on `username` (not just IP) — attackers rotate IPs cheaply but can\'t rotate usernames.',
    },
    {
      level: 'senior',
      question: 'How do you design rate limiting that survives a Redis outage without failing open or closed catastrophically?',
      answer:
        'A single shared Redis is the obvious implementation but a SPOF. Three patterns to mitigate.\n\n**1. Local fallback bucket.** Each instance keeps a small per-instance token bucket sized to `total_limit / N_instances`. When Redis is reachable, the shared bucket is authoritative. When Redis times out, the local bucket takes over with a configurable timeout (e.g., 100ms Redis timeout, fall back). Properties: in the steady state, exact limiting; during Redis outage, slightly over-permissive (each instance enforces independently), but never zero (not fail-closed) and never unbounded (not fail-open).\n\n**2. Tiered limits.** Edge / WAF does a coarse per-IP limit at the load balancer (often integrated into CDN — Cloudflare, AWS WAF). Service does per-user limits via Redis. Even if Redis is down, the edge still catches the worst floods. Layered defenses degrade rather than collapse.\n\n**3. Redis HA.** Redis Sentinel or Redis Cluster for failover. Doesn\'t help against the Redis service being slow (timeouts still affect you); does help against an instance dying.\n\nFor hard limits where exactness matters (paid quotas, abuse prevention), the right architecture is centralized + local fallback with explicit policy: log every fallback event, alert if fallback exceeds X% of traffic. For soft limits (fairness, smoothing), per-instance with periodic Redis sync is often enough.\n\nTest the failure mode. Pull the Redis network connection in a staging exercise. Watch what happens. Most teams discover their "rate limiter" was actually a "rate suggester" the day Redis hiccupped.',
    },
  ],
};
