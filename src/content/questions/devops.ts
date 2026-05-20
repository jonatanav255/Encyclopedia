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
  ],
};
