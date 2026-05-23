import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'devops',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'Why use multi-stage Docker builds?',
      answer:
        'The build stage has dev dependencies, the TypeScript compiler, source files, etc. The runtime stage copies only the compiled output and production dependencies from the build stage. The final image is dramatically smaller (hundreds of MB) and ships less attack surface.\n\n```dockerfile\nFROM node:22-alpine AS build\n...\nRUN pnpm build\n\nFROM node:22-alpine\nCOPY --from=build /app/dist ./dist\nRUN pnpm install --prod --frozen-lockfile\n```',
    },
    {
      level: 'junior',
      question: 'Why never run a Node container as root?',
      answer:
        'If the container is compromised, root-in-container is more dangerous than a regular user. The node base images include a `node` user; switch to it:\n\n```dockerfile\nUSER node\n```\n\nDefense in depth — combine with read-only filesystems, capability drops in Kubernetes, and image scanning.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'What\'s the difference between Kubernetes liveness and readiness probes?',
      answer:
        '**Liveness**: "is the process alive?" If it fails, the pod is **killed and restarted**. Should NOT check downstream dependencies — if the DB is down, killing your app doesn\'t help. Keep it cheap and simple.\n\n**Readiness**: "should I receive traffic?" If it fails, the pod is **removed from load-balancing** but not killed. CAN check critical dependencies. Should fail during shutdown so the LB stops routing before the process exits.\n\nMixing these up is the most common k8s mistake — DB hiccups triggering pod restart storms.',
    },
    {
      level: 'mid',
      question: 'Why is `--frozen-lockfile` important in CI?',
      answer:
        'Without it, a non-frozen install resolves dependencies fresh and may pick different versions than your lockfile records. CI builds artifacts that differ from local. "Works on my machine" returns. Worse — `package.json` and `pnpm-lock.yaml` drift silently.\n\n`pnpm install --frozen-lockfile` (npm equivalent: `npm ci`) fails if the lockfile is out of sync. This is the right behavior — every install in CI must be exactly the versions that were tested.',
    },
    {
      level: 'mid',
      question: 'What does a good CI pipeline check?',
      answer:
        'For an Express service:\n\n1. **Install** with `--frozen-lockfile`.\n2. **Lint** (`pnpm lint`).\n3. **Type-check** (`tsc --noEmit`).\n4. **Unit tests** (`pnpm test`).\n5. **Integration tests** with a real DB (service container).\n6. **Build the Docker image**.\n7. **Optionally**: security scan (Trivy, Snyk), Docker layer caching.\n\nAny failure blocks the merge. Branch protection enforces this. CI time should be under 10 minutes for the round trip to be useful.',
    },
    {
      level: 'mid',
      question: 'Why are feature flags more valuable than fast rollbacks?',
      answer:
        'Rolling back a deploy reverts **everything** in that deploy — including the other 10 features that shipped together. A feature flag lets you turn off just the broken thing.\n\nMore importantly: feature flags decouple **deploy** from **release**. You can deploy code in the off state, enable it gradually, and watch metrics at each step. A rollback is reactive ("something broke"); a flag is proactive ("we control the release pace").\n\nFast rollbacks still matter as a safety net. Flags reduce how often you need to use them.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'What\'s an SLO, and why is "error rate > 0" a bad alert?',
      answer:
        'An **SLO** (Service Level Objective) is a numeric target for reliability: "99.9% of requests under 500ms over 30 days." The remaining 0.1% is the **error budget**.\n\nAlerting on "5xx > 0" pages on every blip — including expected, budget-acceptable ones. The team learns to ignore the noise.\n\nAlert on **burn rate** instead: how fast you\'re consuming the budget. "Burning 10× normal rate for the last hour" = page someone. "Burning 2× normal for the last 6 hours" = ticket. Now alerts correlate with real reliability impact and you save the on-call from noise.',
    },
    {
      level: 'senior',
      question: 'What goes wrong if Node\'s `--max-old-space-size` is higher than the container memory limit?',
      answer:
        'V8 sizes its heap based on `--max-old-space-size` (defaults to ~2GB). It will happily allocate up to that limit. If the container limit is lower, the kernel OOM-kills your process the moment GC tries to grow past the container ceiling.\n\nWorse: it looks random. The process runs fine for hours, then suddenly disappears mid-request. The OOMKilled event is visible in `kubectl describe pod` but not in your logs.\n\nFix: set them in agreement. Either raise the container limit, or set the heap explicitly:\n\n```\nNODE_OPTIONS=--max-old-space-size=400  # leave headroom for non-heap memory\n```\n\nNon-heap memory (buffers, native modules, the Node binary itself) takes another ~100MB — account for it.',
    },
    {
      level: 'senior',
      question: 'Your deploys fail when traffic is high. The new pods never become ready. Why might that be?',
      answer:
        'Common causes:\n\n1. **Readiness probe is too strict** — checks a downstream that\'s flaky under load. Old pods stay healthy; new ones can\'t pass the check. Fix: simplify the readiness check, or use a longer `initialDelaySeconds`.\n2. **Slow startup under load** — new pods are doing heavy initialization (cache warmup, schema validation) and the readiness probe fires before they\'re ready. Fix: add a `startupProbe` that gives them time before liveness/readiness kicks in.\n3. **Resource starvation** — new pods don\'t get enough CPU/memory because the node is saturated. Fix: tune resource requests; scale the node pool.\n4. **Connection pool exhaustion** — old + new pods together exceed Postgres `max_connections`. Fix: reduce per-pod pool size, raise DB limit, or use PgBouncer.\n5. **Self-DDoS during rollout** — internal health checks from monitoring or other services overwhelm the new pods. Fix: separate health endpoints from app endpoints; rate-limit health checks.\n\nDiagnosis order: `kubectl logs` on the new pods, `kubectl describe pod` for events, then DB metrics if connection-related.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Design an incident response process for a small team running 24/7 services.',
      answer:
        '**On-call rotation**: 1-week shifts, follow-the-sun if multiple regions. Compensate for the disruption — comp time or stipend. Never on-call without an escalation path (secondary, then manager).\n\n**Severity definitions**: Sev 1 (full outage, customer-impacting), Sev 2 (partial degradation), Sev 3 (internal-only). Each has a target response time. Don\'t over-classify — too many Sev 1s burn the team out.\n\n**Runbooks**: every alert should link to one. "If the X queue depth alerts, check these dashboards in this order, run these commands." Reduces cognitive load at 3am. Update after every incident.\n\n**Communication**: incident channel in Slack/Discord, status page for customers, single incident commander (IC) who delegates rather than fixes. IC is *not* the most expert person — they coordinate while experts work.\n\n**Postmortems**: blameless, every Sev 1-2, within a week. Focus on systemic factors ("the runbook was wrong," "monitoring missed this") rather than individuals. Action items have owners and deadlines.\n\n**Drills**: quarterly chaos exercises — kill a random pod, fail over a database. Reveals untested paths and stale runbooks.\n\n**Tooling**: paging (PagerDuty / Opsgenie), centralized logs (with retention), traces, dashboards. The "5 minutes to find the problem" target should be a design constraint, not an aspiration.',
    },
    {
      level: 'staff',
      question: 'How would you set up safe canary deployments for a service running on Kubernetes?',
      answer:
        '**Two deployments**: `app-stable` and `app-canary`, same image except for the canary running the new version. Both behind one service.\n\n**Traffic split**: a service mesh (Istio, Linkerd) or a smart Ingress (Argo Rollouts, Flagger) routes a small percentage (e.g., 1%) to canary. Without a mesh, you can split via two Services + weighted DNS or a feature flag in the client.\n\n**Health metrics**: define **SLIs** for canary success — error rate, p95 latency, saturation. Compare canary vs stable continuously.\n\n**Automated promotion / rollback** (Flagger or Argo Rollouts):\n- Every N minutes, evaluate canary metrics against stable.\n- If within tolerance, bump traffic (1% → 5% → 25% → 100%).\n- If outside, rollback automatically — scale canary to zero, route 100% to stable.\n\n**Bake time**: at each step, wait long enough to see real traffic patterns (typically 10–30 minutes). Don\'t promote a canary that\'s only seen idle traffic.\n\n**Database/migrations**: canaries must work with both old and new schema. Migrate forward in a backward-compatible way (add nullable column, deploy code reading old + new, deploy code writing new, drop old column). Don\'t do destructive migrations during a canary.\n\n**Customer impact**: log which traffic was canary so you can attribute support issues correctly.\n\n**Postmortem**: even auto-rolled-back canaries should generate a discussion — what triggered the rollback, was it real, did the SLI catch it correctly?',
    },

    // --- additions for new topics ---

    // junior
    {
      level: 'junior',
      question: 'When do you need a process manager like PM2 or systemd?',
      answer:
        'When the process must restart on crash, start on boot, log to a known location, and run on a VM that\'s yours. **PM2** is quick: `pm2 start app.js`. **systemd** is the OS-native, production-grade way (resource limits, security hardening, journald logs). **For containers and Kubernetes, you don\'t need either** — the orchestrator is the process manager. Don\'t stack PM2 inside containers.',
    },
    {
      level: 'junior',
      question: 'Why use Prettier and ESLint together?',
      answer:
        'They do different jobs. **Prettier formats** — whitespace, quotes, semicolons, line breaks. No opinions about logic. **ESLint lints** — catches bugs, enforces patterns, auto-fixes some issues. Use `eslint-config-prettier` (last in the config array) to silence ESLint\'s formatting rules so they don\'t fight Prettier. On save: Prettier formats, then ESLint auto-fixes. In CI: both run. Result: code that\'s consistent without anyone debating semicolons.',
    },

    // mid
    {
      level: 'mid',
      question: 'What does ESLint\'s `no-floating-promises` catch?',
      answer:
        'Promises that aren\'t awaited or `.then`-handled — fire-and-forget async work where errors silently disappear. `db.update(x); next()` runs the update without waiting; if it rejects, the error vanishes. With the rule, you must `await db.update(x)` or `.catch(...)`. Catches a real class of bug that\'s nearly invisible in code review. Turn it on for any TypeScript project.',
    },

    // senior
    {
      level: 'senior',
      question: 'How do you set up zero-downtime deploys on a single VM?',
      answer:
        '**Two paths**:\n\n**PM2 reload**: `pm2 reload api` restarts instances one at a time in cluster mode. Each receives SIGINT (or configured signal), drains, exits; PM2 starts a new one before moving on. Set `kill_timeout: 30000` in `ecosystem.config.cjs` — default 1600ms is usually too short for real draining.\n\n**systemd + reverse proxy**: run two systemd units on different ports. Update unit A, restart it, wait for healthy, then update B. nginx upstream block sees both and round-robins. With active health checks (HAProxy or NGINX Plus), the proxy stops sending to a restarting instance automatically.\n\nBoth require your app to handle SIGTERM/SIGINT with proper draining — fail readiness probe, close idle keep-alive connections, await in-flight, close DB pool. The orchestration handles the routing; the app handles the cleanup. See "Graceful shutdown deep" topic.',
    },

    // staff
    {
      level: 'staff',
      question: 'Compare PM2, systemd, and Kubernetes for process supervision.',
      answer:
        'These solve the same problem at different layers.\n\n**PM2**: Node-specific, quick setup, built-in cluster mode + log aggregation. Good for single-VM hobby projects or small production setups. Showing its age in 2026 — most teams have moved to containers.\n\n**systemd**: Linux-native init system. Standard tooling, cgroup-based resource limits, security hardening (`ProtectSystem`, `NoNewPrivileges`), journald log integration, watchdog support. The right choice for "I own this VM and want OS-grade supervision." Used heavily in self-hosted setups.\n\n**Kubernetes (or ECS/Cloud Run/Fly)**: container orchestrator handles process supervision, autoscaling, rolling deploys, health-check-driven eviction, declarative infra. The right choice for any cloud-native deployment. No PM2 or systemd inside the container — duplicate supervision is just confusion.\n\n**Decision rule**:\n- Hobby / single VM → PM2.\n- Production VM(s) → systemd.\n- Cloud / multi-instance / autoscaled → containers + orchestrator.\n- Serverless (Lambda, Workers, Cloud Run jobs) → no process manager; platform is one.\n\nPick **one layer**. Stacking PM2 inside containers inside k8s is "Inception" — operational complexity without payoff.',
    },

    // --- additional questions ---

    // junior
    {
      level: 'junior',
      question: 'What\'s the difference between a Dockerfile `CMD` and `ENTRYPOINT`?',
      answer:
        '**`ENTRYPOINT`** sets the executable that always runs. **`CMD`** sets the default arguments (or default command if there\'s no entrypoint). With both, the container runs `<ENTRYPOINT> <CMD>` — and `docker run image arg1 arg2` overrides the CMD, passing `arg1 arg2` as arguments to the entrypoint. Common pattern: `ENTRYPOINT ["node"]` + `CMD ["dist/index.js"]` lets users override the entry script while keeping `node` as the executable.',
    },

    // mid
    {
      level: 'mid',
      question: 'Why use multi-stage Docker builds?',
      answer:
        'Build dependencies (compilers, dev packages, source code) shouldn\'t end up in the production image. Multi-stage builds let you `FROM node:22 AS builder` with all the tools, `RUN pnpm build`, then `FROM node:22-slim AS runtime` and `COPY --from=builder /app/dist ./dist`. Final image has only what runs in production. Result: smaller image (200MB vs 1GB+), smaller attack surface, faster deploys. Standard practice for Node/Go/Rust services.',
    },

    // senior
    {
      level: 'senior',
      question: 'How do you handle secrets in a Kubernetes deployment?',
      answer:
        '**Don\'t put them in env vars in the Deployment manifest** — those are visible in the manifest, in git, in `kubectl describe`. Three layered options:\n\n1. **Kubernetes Secrets** (base64-encoded, not encrypted by default). Bare minimum — enable encryption at rest in etcd. Mount as files (`volumeMounts`) or env vars.\n2. **External secrets operator** (External Secrets Operator, Sealed Secrets) — fetches from a real secret manager (AWS Secrets Manager, Vault, GCP Secret Manager) and syncs into k8s Secrets. Source of truth lives outside the cluster.\n3. **Workload identity** (IRSA on EKS, Workload Identity on GKE) — pods authenticate to the cloud directly and fetch secrets at startup. No k8s Secret at all.\n\nProduction setup: workload identity + secret manager. Validate secrets at app startup (Zod schema). Rotate periodically with grace periods. Never log them. Audit access.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design a deployment pipeline that supports both fast feedback and safe production releases.',
      answer:
        '**Stage 1 — PR**: lint, typecheck, unit tests, build container. Fast (~5 min). Block merge on failure.\n\n**Stage 2 — staging**: on merge to main, deploy to staging environment automatically. Integration tests + smoke tests run there. If they fail, alert; don\'t auto-rollback (it\'s staging).\n\n**Stage 3 — production canary**: deploy to production for 1–5% of traffic. Argo Rollouts / Flagger watches SLIs (error rate, latency, saturation) for 10–30 min. If within tolerance, promote.\n\n**Stage 4 — gradual rollout**: 5% → 25% → 50% → 100%, with bake time at each step. Auto-rollback if SLIs degrade. Manual promotion gate if the change is risky (new database query, schema change).\n\n**Stage 5 — observability**: every deploy emits a marker in metrics/traces. On-call gets a dashboard showing "what changed at this deploy." Post-deploy, watch error budget burn for 24h.\n\n**Database migrations**: backward-compatible only (add nullable column, deploy code that reads both shapes, deploy code that writes new shape, drop old column — across multiple deploys). Never destructive in the same deploy as code that uses the new shape.\n\n**Feature flags**: separate deploys from releases. Ship code disabled; flip on per cohort. Rollback by flipping the flag, no redeploy needed.\n\n**Tooling**: GitHub Actions / GitLab CI for build, ArgoCD/Flux for GitOps deploys, Argo Rollouts/Flagger for canary, OpenTelemetry for observability, LaunchDarkly/Unleash for flags. Total cycle time from merge to 100%: 2–6 hours depending on bake times.',
    },

    // --- GitOps ---
    {
      level: 'senior',
      question: 'What does GitOps actually buy you over running `kubectl apply` from CI?',
      answer:
        'The headline shift: the cluster becomes **read-only to humans for production changes**; all changes go through PRs against a config repo; an agent (ArgoCD, Flux) inside the cluster pulls and reconciles. Concretely:\n\n- **Auditable.** Every change is a commit; `git log` is the deploy history. "Who changed the replica count at 02:31?" is a `git blame`.\n- **Reversible.** Rollback is `git revert <bad-commit>`. The agent picks it up and reconciles back. No CI re-run, no manual `kubectl rollout undo` that goes stale.\n- **Drift detection.** If someone bypasses GitOps and `kubectl edit`s a Deployment by hand, the agent notices and (with `selfHeal: true`) reverts. The repo is the single source of truth, not a starting point that drifts.\n- **Self-healing.** A Deployment deleted by accident is recreated from the repo on the next sync.\n- **Disaster recovery.** Lost the cluster? Point a new ArgoCD at the repo; the entire cluster is reconstructed.\n\nThe `kubectl apply` from CI approach can do some of this (audit via CI logs, rollback via re-running the previous CI job), but only if every change goes through CI, and CI logs are retained, and nobody ever bypasses CI. GitOps enforces the discipline through the reconciliation loop itself.\n\nThe practical setup: ArgoCD with `automated + prune + selfHeal` reading from a `deploy/` repo, organised into `base/` Kustomize manifests and per-environment `overlays/`. CI builds images and commits new tags to the appropriate overlay (direct commit for staging, PR for production). Pair with Argo Rollouts for canary deployments — the Rollout resource is in the repo, the metrics gates are in the repo, the whole pipeline is reviewable as code.',
    },
  ],
};
