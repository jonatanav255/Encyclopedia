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
        '```js\nimport { lookup } from "node:dns/promises";\n\nconst MAX_BYTES = 5 * 1024 * 1024;\nconst ALLOWED = new Set(["images.example.com"]);  // ideally\n\nasync function safeFetch(url) {\n  const u = new URL(url);\n  if (!["http:", "https:"].includes(u.protocol)) throw new Error("protocol");\n\n  if (!ALLOWED.has(u.hostname)) throw new Error("host");\n\n  const { address } = await lookup(u.hostname);\n  if (isPrivate(address)) throw new Error("private ip");\n\n  const res = await fetch(url, {\n    redirect: "manual",\n    signal: AbortSignal.timeout(5000),\n    headers: { },\n  });\n\n  const reader = res.body.getReader();\n  let total = 0;\n  const chunks = [];\n  while (true) {\n    const { done, value } = await reader.read();\n    if (done) break;\n    total += value.length;\n    if (total > MAX_BYTES) throw new Error("too large");\n    chunks.push(value);\n  }\n  return Buffer.concat(chunks);\n}\n```\n\nLayers: protocol restriction, allowlist, DNS-rebinding-safe IP check, no redirects, timeout, no auth forwarding, size cap. Plus IMDSv2 + egress firewall at the infrastructure layer.',
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
  ],
};
