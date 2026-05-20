import type { ComponentType } from 'react';

type MdxModule = { default: ComponentType };

const modules = import.meta.glob<MdxModule>('../content/**/*.mdx');
// `as: 'raw'` is the Vite-documented way to get file contents as strings,
// and it bypasses the MDX plugin's transform.
const rawSources = import.meta.glob('../content/**/*.mdx', {
  as: 'raw',
  eager: true,
}) as Record<string, string>;

export type ContentEntry = {
  slug: string;
  topic: string;
  name: string;
  title: string;
  raw: string;
  load: () => Promise<MdxModule>;
};

function titleCase(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const entries: ContentEntry[] = Object.entries(modules)
  .map(([path, load]) => {
    const match = path.match(/\.\.\/content\/(.+)\/(.+)\.mdx$/);
    if (!match) return null;
    const [, topic, name] = match;
    return {
      slug: `${topic}/${name}`,
      topic,
      name,
      title: titleCase(name),
      raw: rawSources[path] ?? '',
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
