// Static metadata for every MDX file — raw source text and the `level` export.
// Populated by the `mdx-meta` Vite plugin via a virtual module, so the browser
// never needs to fetch or transform 562 MDX files at startup.
import meta from 'virtual:mdx-meta';

export type MdxMeta = {
  path: string;
  raw: string;
  level: string | null;
};

export const mdxMeta: Record<string, MdxMeta> = meta as Record<string, MdxMeta>;
