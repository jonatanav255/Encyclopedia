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

## How content discovery works (so you don't try to register things)

- **MDX topics**: filesystem-driven. Drop a file at
  `src/content/<topic>/<entry>.mdx` and the sidebar, homepage, search
  index, and topic overview rebuild automatically via
  `import.meta.glob('../content/**/*.mdx')` in `src/lib/content.ts`.
  No manual registration.
- **Question banks**: typed data files, not MDX. Drop
  `src/content/questions/<topic>.ts` exporting `bank: QuestionBank`.
  The `/practice` route's index loader aggregates them via
  `import.meta.glob('./*.ts', { eager: true })`.
- **Demos and MDX building blocks**: React components. Anything used
  as a JSX tag inside an `.mdx` file **must** be added to the
  `mdxComponents` map in `src/App.tsx`. Forgetting this fails at
  render time, not build time — the file compiles fine, then throws
  "Expected component `Foo` to be defined" when the page is viewed.

## Things that have already bitten — don't repeat

- **`as: 'raw'` is deprecated** in newer Vite. We use it in
  `src/lib/content.ts` for the search index. When upgrading Vite,
  switch to `{ query: '?raw', import: 'default', eager: true }`.
- **The MDX `<button>` rule.** A `<button>` cannot wrap block-level
  elements (paragraphs, lists, code blocks). `<QA>` learned this the
  hard way — the header is a button, the answer is a sibling div.
- **Shiki ships every language grammar by default**, which bloats the
  bundle. If we ever want to deploy, restrict languages in
  `vite.config.ts` to `['js', 'ts', 'tsx', 'json', 'bash']`.
- **The middleware/route distinction is a teaching simplification.**
  In Express, routes *are* middleware with a path filter — they live in
  the same ordered stack. The encyclopedia teaches this explicitly in
  `src/content/express/routing.mdx`. Don't redraw diagrams that imply
  middleware and routes are separate phases.

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
- `src/components/mdx/` — presentation primitives (Compare, Steps,
  Diagram, Cheatsheet, Term, QA, Callout)
- `src/components/layout/` — Header, Sidebar, page shell
- `src/components/search/` — Cmd+K modal
- `src/components/ui/` — small shared primitives (TopicPill)
- `src/pages/` — Home, TopicOverview, TopicPage, Practice, NotFound
- `src/lib/` — content discovery, search index, copy-button helper
- `src/App.tsx` — router + `MDXProvider` registration

## Out of scope

Anything requiring sync across devices, multi-user access, or
in-browser content editing with persistence. The project is
deliberately frontend-only. localStorage is OK; a backend is not.
