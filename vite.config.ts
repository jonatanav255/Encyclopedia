import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import rehypePrettyCode from 'rehype-pretty-code';
import { createHighlighter } from 'shiki';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, 'src/content');

async function walkMdx(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkMdx(full)));
    else if (entry.isFile() && entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

function extractLevel(src: string): string | null {
  const m = src.match(/^\s*export\s+const\s+level\s*=\s*['"]([^'"]+)['"]/m);
  return m ? m[1] : null;
}

function mdxMetaPlugin(): Plugin {
  const virtualId = 'virtual:mdx-meta';
  const resolvedId = '\0' + virtualId;
  return {
    name: 'mdx-meta',
    resolveId(id) {
      if (id === virtualId) return resolvedId;
    },
    async load(id) {
      if (id !== resolvedId) return;
      const files = await walkMdx(CONTENT_DIR);
      const entries = await Promise.all(
        files.map(async (file) => {
          const raw = await fs.readFile(file, 'utf8');
          // Vite glob keys are paths relative to the importing file
          // (src/lib/content-meta.ts), so use '../content/<topic>/<name>.mdx'
          // to match what `import.meta.glob('../content/**/*.mdx')` produces.
          const rel = '../content/' + path.relative(CONTENT_DIR, file).split(path.sep).join('/');
          return [rel, { path: rel, raw, level: extractLevel(raw) }] as const;
        }),
      );
      const map = Object.fromEntries(entries);
      return `export default ${JSON.stringify(map)};`;
    },
    configureServer(server) {
      // Invalidate the virtual module when any MDX file changes so HMR sees edits.
      server.watcher.on('change', (file) => {
        if (file.endsWith('.mdx') && file.startsWith(CONTENT_DIR)) {
          const mod = server.moduleGraph.getModuleById(resolvedId);
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
      });
    },
  };
}

const SHIKI_LANGS = [
  'asm',
  'bash',
  'c',
  'cpp',
  'dockerfile',
  'graphql',
  'html',
  'http',
  'ini',
  'js',
  'json',
  'jsx',
  'nginx',
  'protobuf',
  'pug',
  'sh',
  'sql',
  'ts',
  'tsx',
  'yaml',
] as const;

const highlighterPromise = createHighlighter({
  themes: ['github-dark-dimmed'],
  langs: [...SHIKI_LANGS],
});

export default defineConfig({
  plugins: [
    mdxMetaPlugin(),
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: 'github-dark-dimmed',
              keepBackground: true,
              defaultLang: 'plaintext',
              getHighlighter: () => highlighterPromise,
            },
          ],
        ],
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mdx-js/react', 'fuse.js'],
  },
});
