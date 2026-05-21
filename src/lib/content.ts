import type { ComponentType } from 'react';
import { mdxMeta } from './content-meta';

type MdxModule = { default: ComponentType };

// Lazy glob — Vite only transforms each MDX file when its loader is invoked
// (i.e. when the user navigates to that page). No eager work at startup.
const modules = import.meta.glob<MdxModule>('../content/**/*.mdx');

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
    const meta = mdxMeta[path];
    return {
      slug: `${topic}/${name}`,
      topic,
      name,
      title: titleCase(name),
      level: asLevel(meta?.level),
      raw: meta?.raw ?? '',
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
