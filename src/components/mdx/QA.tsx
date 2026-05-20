import { useState, type ReactNode } from 'react';

type Level = 'junior' | 'mid' | 'senior' | 'staff';

const levelStyles: Record<Level, string> = {
  junior: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  mid: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  senior: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  staff: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
};

export function QA({
  question,
  level,
  children,
}: {
  question: string;
  level?: Level;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="not-prose my-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {level && (
              <span
                className={`shrink-0 inline-block text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${levelStyles[level]}`}
              >
                {level}
              </span>
            )}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{question}</span>
          </div>
          <span
            aria-hidden
            className={`shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${
              open ? 'rotate-90' : ''
            }`}
          >
            ▸
          </span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 prose-doc text-[0.95em]">
          {children}
        </div>
      )}
    </div>
  );
}
