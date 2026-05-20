import type { ComponentType } from 'react';

type MdxModule = { default: ComponentType };

const modules = import.meta.glob<MdxModule>('../content/**/*.mdx');

export type ContentEntry = {
  slug: string;
  topic: string;
  name: string;
  title: string;
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
      load,
    } satisfies ContentEntry;
  })
  .filter((e): e is ContentEntry => e !== null)
  .sort((a, b) => a.slug.localeCompare(b.slug));

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
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([topic, list]) => ({ topic, title: titleCase(topic), entries: list }));
})();

export function findBySlug(slug: string): ContentEntry | undefined {
  return entries.find((e) => e.slug === slug);
}
