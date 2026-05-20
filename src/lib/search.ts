import Fuse from 'fuse.js';
import { entries, type ContentEntry } from './content';

export type SearchDoc = {
  entry: ContentEntry;
  body: string;
};

function stripMdx(src: unknown): string {
  if (typeof src !== 'string') return '';
  return src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_\-\[\]\(\)!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const docs: SearchDoc[] = entries.map((entry) => ({
  entry,
  body: stripMdx(entry.raw),
}));

export const fuse = new Fuse(docs, {
  includeMatches: true,
  threshold: 0.35,
  ignoreLocation: true,
  keys: [
    { name: 'entry.title', weight: 0.5 },
    { name: 'entry.topic', weight: 0.2 },
    { name: 'body', weight: 0.3 },
  ],
});

export function snippet(body: string, query: string, radius = 60): string {
  if (!query) return body.slice(0, radius * 2);
  const idx = body.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return body.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(body.length, idx + query.length + radius);
  return (start > 0 ? '…' : '') + body.slice(start, end) + (end < body.length ? '…' : '');
}
