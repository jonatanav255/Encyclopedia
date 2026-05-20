import type { ComponentType } from 'react';

type MdxModule = { default: ComponentType };

const modules = import.meta.glob<MdxModule>('../content/**/*.mdx');
// Eager `?raw` glob for the search index. The MDX rollup plugin claims `.mdx`
// files with `enforce: 'pre'`, so the `?raw` query may not always reach Vite's
// raw loader — we defensively coerce to string at the consumer.
const rawSources = import.meta.glob('../content/**/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, unknown>;
// Eager glob that pulls only the `level` named export from each MDX module.
// This is a tiny payload — just a string per file — so it doesn't break code
// splitting of the actual page components (`modules` above stays lazy).
const levelExports = import.meta.glob('../content/**/*.mdx', {
  import: 'level',
  eager: true,
}) as Record<string, unknown>;

export type Level = 'junior' | 'mid' | 'senior' | 'staff';

export const LEVEL_ORDER: Level[] = ['junior', 'mid', 'senior', 'staff'];

export type ContentEntry = {
  slug: string;
  topic: string;
  name: string;
  title: string;
  level: Level | null;
  raw: string;
  load: () => Promise<MdxModule>;
};

function titleCase(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function asLevel(v: unknown): Level | null {
  return v === 'junior' || v === 'mid' || v === 'senior' || v === 'staff' ? v : null;
}

export const entries: ContentEntry[] = Object.entries(modules)
  .map(([path, load]) => {
    const match = path.match(/\.\.\/content\/(.+)\/(.+)\.mdx$/);
    if (!match) return null;
    const [, topic, name] = match;
    const rawMaybe = rawSources[path];
    const raw = typeof rawMaybe === 'string' ? rawMaybe : '';
    return {
      slug: `${topic}/${name}`,
      topic,
      name,
      title: titleCase(name),
      level: asLevel(levelExports[path]),
      raw,
      load,
    } satisfies ContentEntry;
  })
  .filter((e): e is ContentEntry => e !== null)
  .sort((a, b) => a.title.localeCompare(b.title));

export type TopicGroup = {
  topic: string;
  title: string;
  entries: ContentEntry[];
};

export const groups: TopicGroup[] = (() => {
  const map = new Map<string, ContentEntry[]>();
  for (const e of entries) {
    const list = map.get(e.topic) ?? [];
    list.push(e);
    map.set(e.topic, list);
  }
  return Array.from(map.entries())
    .map(([topic, list]) => ({ topic, title: titleCase(topic), entries: list }))
    .sort((a, b) => a.title.localeCompare(b.title));
})();

export function findBySlug(slug: string): ContentEntry | undefined {
  return entries.find((e) => e.slug === slug);
}
