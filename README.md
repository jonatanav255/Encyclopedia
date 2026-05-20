# Encyclopedia

A personal, frontend-only knowledge base for languages, tools, and concepts —
written in MDX with interactive React demos embedded inline.

## Package manager

**Use `pnpm` only. Do not use `npm`.**

This project is managed with pnpm. The lockfile is `pnpm-lock.yaml`.

| Don't run | Run instead |
|---|---|
| `npm install` | `pnpm install` |
| `npm install <pkg>` | `pnpm add <pkg>` |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| `npm run <script>` | `pnpm <script>` |
| `npx <bin>` | `pnpm dlx <bin>` (or `pnpm exec <bin>` if already a dep) |

## Scripts

```bash
pnpm install      # install dependencies
pnpm dev          # start the dev server
pnpm build        # production build
pnpm preview      # preview the production build
```

## Stack

- Vite + React + TypeScript
- MDX (`@mdx-js/rollup`) for content with embedded React components
- React Router for topic pages
- Tailwind CSS with class-based dark mode

## Structure

```
src/
  content/          # .mdx files — one per topic
  components/
    demos/          # interactive React components used inside MDX
    layout/         # sidebar, header, layout shell
    mdx/            # shared MDX building blocks (callouts, code blocks)
  pages/            # route components
  lib/              # content discovery, theme hook
```
