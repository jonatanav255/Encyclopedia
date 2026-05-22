# CLAUDE.md

Context for future Claude sessions. Important-only — full setup, stack
rationale, and conventions live in `PROJECT.md`.

## Hard rules

- **pnpm only, never npm.** Top-level `~/.claude/CLAUDE.md` has the rationale
  and command mapping. Lockfile is `pnpm-lock.yaml`.
- **Dark mode only.** No light theme. Don't add light-mode toggles.
  Existing `dark:` Tailwind prefixes are dead-but-harmless — cleanup is
  fine but not urgent.
- **No `pnpm-workspace.yaml`.** pnpm sometimes writes a broken stub for
  it during the "ignored builds" prompt. If you see it, delete it.
- **Do not touch `src/content/system-design/`.** That topic is finished
  and frozen. No edits, no additions, no "fixes" to its MDX files or
  its question bank (`src/content/questions/system-design.ts`) unless
  the user explicitly asks for changes to system-design specifically.
  When adding adjacent topics (e.g., data-structures), it's fine to
  *reference* system-design pages from new content, but don't rewrite
  them.

## How content discovery works (so you don't try to register things)

- **MDX topics**: filesystem-driven. Drop a file at
  `src/content/<topic>/<entry>.mdx` and everything rebuilds via
  `import.meta.glob('../content/**/*.mdx')` in `src/lib/content.ts`.
- **MDX level**: each file declares
  `export const level = 'junior' | 'mid' | 'senior' | 'staff'`. Read
  via a separate eager glob with `{ import: 'level' }`. Missing
  levels fall into "Other" in the sidebar.
- **Question banks**: drop `src/content/questions/<topic>.ts`
  exporting `bank: QuestionBank`. Aggregated by an eager glob.
- **Practice answers** are strings rendered through
  `src/components/practice/Answer.tsx` — fenced ` ```lang ` (Shiki),
  inline backticks, `**bold**`, `\n\n` paragraphs. Don't reach for a
  full markdown lib.
- **MDX components**: anything used as a JSX tag inside `.mdx` must
  be in `mdxComponents` in `src/App.tsx`. Missing components throw at
  render time, not build time.

## Things that have already bitten — don't repeat

- **Don't parse `.mdx` files via `?raw` for metadata, and don't use
  eager `import.meta.glob` over `.mdx` at all.** The MDX plugin has
  `enforce: 'pre'` and claims `.mdx` before Vite's raw loader, so even
  `{ import: 'level', eager: true }` drags every file through the full
  MDX → rehype → Shiki → JSX pipeline at startup. With 562 files this
  blew cold dev start to >20s. The current solution: the `mdxMetaPlugin`
  in `vite.config.ts` walks `src/content` with `fs.readFile`, extracts
  `raw` + `level` per file, and exposes them as the `virtual:mdx-meta`
  module consumed by `src/lib/content-meta.ts`. Read metadata from there;
  keep the page-component glob lazy (no `eager`).
- **Layout must use `h-screen`, not `min-h-screen`.** Otherwise the
  sidebar's `overflow-y-auto` has no fixed parent height to constrain
  it, and the whole page scrolls instead of the sidebar.
- **Sidebar collapse state** lives in `localStorage` under
  `sidebar.collapsed.v1` (keys: `topic:<name>`, `level:<topic>:<level>`).
  Bump the version suffix if the schema changes.
- **The MDX `<button>` rule.** A `<button>` cannot wrap block-level
  elements (paragraphs, lists, code blocks). `<QA>` learned this the
  hard way — the header is a button, the answer is a sibling div.
- **Shiki ships every language grammar by default**, which bloats the
  bundle and slows transforms. `vite.config.ts` now pre-builds one
  highlighter with the 17 langs actually used in MDX
  (`bash, dockerfile, graphql, html, http, ini, js, json, jsx, nginx,
  protobuf, pug, sh, sql, ts, tsx, yaml`) and passes it to
  `rehype-pretty-code` via `getHighlighter`. If you add a new lang in a
  fenced code block, add it to `SHIKI_LANGS` or it falls back to
  `plaintext`. Don't trim this list to the old `['js','ts','tsx',
  'json','bash']` — multiple topics rely on the others.
- **Routes ARE middleware** in Express. They live in the same ordered
  stack with a method+path filter. `src/content/express/routing.mdx`
  teaches this explicitly. Don't redraw diagrams implying middleware
  and routes are separate phases.

## Demo authoring conventions

- Animations are driven by `setTimeout` chains, not animation
  libraries. Store timer ids in a `useRef` and `clearTimeout` them all
  in a cleanup effect.
- Visual state ("which step is active") is plain React state. The
  active step gets a tinted border + bg, not a ring-on-top-of-border
  (that produces a visible double-line — `<MiddlewarePipeline>` had
  this bug).
- Spam-clicking "Run" / "Send request" should be safe. Either disable
  the button while running, or guard each timer callback with a
  `runIdRef` check.

## Where things live (quick map)

- `src/content/<topic>/*.mdx` — topic pages
- `src/content/questions/<topic>.ts` — question banks
- `src/components/demos/` — interactive demos used in MDX
- `src/components/mdx/` — MDX primitives (Compare, Steps, Diagram,
  Cheatsheet, Term, QA, Callout)
- `src/components/practice/` — Practice-route components (Answer)
- `src/components/layout/` — Header, Sidebar, page shell
- `src/components/search/` — Cmd+K modal
- `src/components/ui/` — small shared primitives (TopicPill)
- `src/pages/` — Home, TopicOverview, TopicPage, Practice, NotFound
- `src/lib/` — content discovery, search index, copy-button helper
- `src/App.tsx` — router + `MDXProvider` registration

## Content-addition workflow that works

After any batch of new MDX (>3 files), run **two agents in parallel**
before committing:

1. **Build/structural** — `pnpm build` + check `level` export on
   line 1, single H1, no undeclared MDX components, lowercase code
   fences (Shiki only ships `js, ts, tsx, json, bash`).
2. **Content accuracy** — fact-check version claims ("shipped in
   Node X", "ES202Y"), API shape, and cross-topic consistency with
   existing files. WebSearch is fair game.

This pair has caught real bugs every time it's run. Don't skip the
content agent just because the build passes.

## Gap-mining → page selection

When the user says "mine these books and add what's missing":

- Delegate the gap analysis to a research agent — don't try to hold
  12 book TOCs in head.
- The agent will return more candidates than are worth writing.
  **Pick ~half**, not all. Quality > coverage.
- Reject criteria: overlaps with existing topic, frontend-only when
  audience is backend-leaning, too opinion-y to be authoritative,
  too historical (e.g., MVC/MVP/MVVM in 2026), or only one source
  book treats it well.
- New topics get **questions added to the relevant `<topic>.ts`
  bank** as part of the same commit, not deferred.

## Out of scope

Anything requiring sync across devices, multi-user access, or
in-browser content editing with persistence. The project is
deliberately frontend-only. localStorage is OK; a backend is not.
