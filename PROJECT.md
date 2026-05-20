# Encyclopedia — Project Guide

A personal, frontend-only knowledge base. Languages, tools, and concepts —
explained with prose, side-by-side comparisons, diagrams, and live interactive
demos. Everything lives in MDX files; the browser does all the work.

## What it is

- **Frontend only.** No backend, no database, no server. The whole thing is
  bundled at build time and runs in your browser.
- **Local-first authoring.** Content is `.mdx` files in `src/content/`. Write
  in your editor, the app auto-discovers and renders.
- **Interactive on purpose.** Concepts that benefit from a demo get one — a
  middleware pipeline that animates, a route matcher you can type into, an
  event loop visualizer. The point is that you can play with the idea, not
  just read about it.
- **Dark mode by default**, full stop. No light theme.

## The stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite** | Fast dev server, ESM-native, MDX plugin support |
| UI | **React + TypeScript** | Familiar component model, strict types catch authoring bugs |
| Content | **MDX** (`@mdx-js/rollup`) | Markdown + React components in the same file |
| Styling | **Tailwind CSS** (class-based dark mode) | Consistent design tokens without leaving JSX |
| Routing | **React Router** | Standard SPA routing, file-based content via globs |
| Code highlighting | **rehype-pretty-code** + **Shiki** | Same theme used in code editors |
| Search | **Fuse.js** | Fuzzy client-side search over raw MDX source |
| Package manager | **pnpm** (npm forbidden) | Supply-chain hardening — see top-level README |

There's no test runner, no linter config beyond TS, no CI. Add them when
they pay off.

## How it's structured

```
src/
  content/              # the encyclopedia itself
    express/
      middleware.mdx
      routing.mdx
      ...
    javascript/
      event-loop.mdx
  components/
    demos/              # interactive React components embedded in MDX
      MiddlewarePipeline.tsx
      RouteMatcher.tsx
      EventLoop.tsx
    mdx/                # presentation primitives reusable across topics
      Callout.tsx
      Compare.tsx
      Steps.tsx
      Diagram.tsx
      Cheatsheet.tsx
      Term.tsx
      QA.tsx
    layout/             # header, sidebar, page shell
    search/             # the Cmd+K modal
  pages/                # route components (Home, TopicOverview, TopicPage, NotFound)
  lib/                  # content discovery, search index, copy-button helper
  App.tsx               # router + MDXProvider registration
  index.css             # Tailwind layers + prose styles
```

### How content is wired up

1. Drop a new file at `src/content/<topic>/<name>.mdx`.
2. Vite picks it up via `import.meta.glob('../content/**/*.mdx')`.
3. The sidebar, homepage, search index, and topic overview all rebuild
   automatically — no manual registration anywhere.

The slug is `<topic>/<name>` and the URL is `/<topic>/<name>`. Title is the
filename, title-cased. Folder = topic. That's the whole convention.

### How interactive components are wired up

1. Build a normal React component in `src/components/demos/` (or `mdx/`).
2. Import it in `src/App.tsx` and add it to the `mdxComponents` object.
3. Use it as a JSX tag inside any `.mdx` file — no import statement in the
   MDX, just the tag.

## MDX building blocks you can use

| Component | What it's for |
|---|---|
| `<Callout variant="info\|warn\|tip">` | Highlighted asides |
| `<Compare bad="..." good="..." language="js" />` | Side-by-side "don't / do" code with syntax highlighting |
| `<Steps>` `<Step title="">` | Numbered visual flow with a connecting line |
| `<Diagram>` `<DBox x= y=>` `<DArrow from= to= label= curve=>` | SVG diagrams on a grid |
| `<Cheatsheet columns={[]} rows={[[]]} />` | Quick-reference table |
| `<Term name="...">definition</Term>` | Inline click-to-expand glossary popover |
| `<QA level="junior\|mid\|senior\|staff" question="...">answer</QA>` | Interview-style cards with hidden answers |

Code fences (` ```js `) get syntax highlighting and a hover-revealed Copy
button automatically.

## Adding a new topic

1. Create `src/content/<topic>/<entry>.mdx`. The folder name becomes the
   topic group in the sidebar; the file name becomes the entry title.
2. Write the MDX. Pull in any building blocks above; pull in any custom
   interactive component you've built.
3. Optionally drop a few `<QA>` blocks at the bottom for interview practice.

That's it. No build step, no registration, no config to touch.

## Adding a new demo

1. Build `src/components/demos/Foo.tsx`. Plain React + Tailwind; use
   `setTimeout` for animation, `useState` for state, no external libraries
   needed.
2. Register it in `src/App.tsx`:
   ```ts
   import { Foo } from './components/demos/Foo';
   const mdxComponents = { /* …existing… */, Foo };
   ```
3. Use `<Foo />` in any MDX file.

## Running it

```bash
pnpm install           # one time
pnpm dev               # dev server with HMR
pnpm build             # production bundle
pnpm preview           # serve the production bundle locally
```

## Room left for future implementations

The current scope is intentionally small. Things that are easy to add later
because the foundation is in place:

- **More demos** — debounce/throttle, promise chains, CSS flexbox, SQL JOIN,
  Git branches. Each is a single component file + an MDX import.
- **More topics** — drop folders under `src/content/`. The whole UI rebuilds
  itself.
- **Frontmatter** — currently the title is derived from the filename. Adding
  `parseFrontmatter` to the content lib unlocks per-entry titles, summaries,
  tags, and `updatedAt` for sorting / display.
- **Tag system** — once frontmatter ships, a `/tags/<tag>` page becomes a
  trivial filter.
- **Quiz mode** — the QA component already tracks open/closed state. A page
  that pulls all QAs across topics and steps you through them is a small
  layer on top.
- **Mobile sidebar drawer** — the current sidebar is always-visible
  `w-64`. A small breakpoint check + slide-in animation is enough.
- **Right-rail "On this page" TOC** — derive from the rendered MDX's
  headings on mount.
- **Deep linking to headings** — add `id`s to `h2/h3` (rehype-slug) and a
  `#` hover affordance (rehype-autolink-headings).
- **Static deploy** — `pnpm build` produces a `dist/` folder that any
  static host (Vercel, Netlify, GitHub Pages) can serve as-is. No
  serverless functions needed.
- **localStorage notes layer** — per-page annotations that survive reloads
  but stay local. Honors the "frontend-only" promise.

Anything that would require sync across devices (cloud-backed notes,
multi-user access, content editing in the browser with persistence) would
need a backend and is intentionally out of scope.

## Conventions worth knowing

- **pnpm only.** Never `npm install`. The lockfile is `pnpm-lock.yaml`. See
  the top-level README for the rationale and the command mapping.
- **No comments unless the why is non-obvious.** Identifiers should
  explain themselves.
- **Demos animate on a clock**, not via animation libraries — a chain of
  `setTimeout`s driving state is enough and stays easy to debug. Cleanup
  timers on unmount.
- **Tailwind classes everywhere** — no CSS modules, no styled-components.
  Color tokens are the `zinc`/`sky`/`emerald`/`amber`/`rose` families;
  don't introduce new ones without a reason.
- **Dark only** — drop the `dark:` prefix from new components if you're
  consistent. Existing components keep their `dark:` prefixes for now
  (cleanup is fine but not urgent).
