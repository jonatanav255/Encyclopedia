import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fuse, snippet } from '../../lib/search';
import { entries } from '../../lib/content';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return entries.slice(0, 8).map((e) => ({ entry: e, body: '' }));
    }
    return fuse.search(query, { limit: 12 }).map((r) => ({ entry: r.item.entry, body: r.item.body }));
  }, [query]);

  useEffect(() => {
    if (active >= results.length) setActive(0);
  }, [results.length, active]);

  if (!open) return null;

  const choose = (idx: number) => {
    const r = results[idx];
    if (!r) return;
    navigate(`/${r.entry.slug}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((i) => Math.min(results.length - 1, i + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              choose(active);
            }
          }}
          placeholder="Search topics, terms, content…"
          className="w-full px-4 py-3 text-base bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-6 text-sm text-zinc-500 text-center">No results.</div>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.entry.slug}>
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    onMouseEnter={() => setActive(i)}
                    className={[
                      'w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors',
                      i === active
                        ? 'bg-sky-100 dark:bg-sky-500/10'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs uppercase tracking-wider text-zinc-500">
                        {r.entry.topic}
                      </span>
                      <span className="text-zinc-400">/</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {r.entry.title}
                      </span>
                    </div>
                    {query && r.body && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {snippet(r.body, query)}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 bg-zinc-50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>navigate</span>
            <Kbd>↵</Kbd>
            <span>open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Kbd>esc</Kbd>
            <span>close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
      {children}
    </kbd>
  );
}
