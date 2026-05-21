declare module 'virtual:mdx-meta' {
  type Entry = { path: string; raw: string; level: string | null };
  const meta: Record<string, Entry>;
  export default meta;
}
