import type { ReactNode } from 'react';

type Kind = 'paper' | 'postmortem' | 'blog' | 'talk' | 'book';

const kindLabel: Record<Kind, string> = {
  paper: 'Paper',
  postmortem: 'Postmortem',
  blog: 'Engineering blog',
  talk: 'Talk',
  book: 'Book',
};

const kindAccent: Record<Kind, string> = {
  paper: 'border-violet-400/50 bg-violet-50/40 dark:bg-violet-500/5',
  postmortem: 'border-rose-400/50 bg-rose-50/40 dark:bg-rose-500/5',
  blog: 'border-sky-400/50 bg-sky-50/40 dark:bg-sky-500/5',
  talk: 'border-amber-400/50 bg-amber-50/40 dark:bg-amber-500/5',
  book: 'border-emerald-400/50 bg-emerald-50/40 dark:bg-emerald-500/5',
};

const kindBadge: Record<Kind, string> = {
  paper: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/30',
  postmortem: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/30',
  blog: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/30',
  talk: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30',
  book: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
};

export function Reference({
  kind = 'paper',
  title,
  authors,
  year,
  source,
  url,
  archiveUrl,
  children,
}: {
  kind?: Kind;
  title: string;
  authors?: string;
  year?: string | number;
  source?: string;
  url: string;
  archiveUrl?: string;
  children?: ReactNode;
}) {
  const meta = [authors, source, year].filter(Boolean).join(' · ');
  return (
    <figure
      className={`not-prose my-4 rounded-lg border-l-4 ${kindAccent[kind]} px-4 py-3 text-sm`}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ${kindBadge[kind]}`}
        >
          {kindLabel[kind]}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-700 dark:text-zinc-100 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
        >
          {title}
        </a>
        {archiveUrl && (
          <a
            href={archiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-500 underline decoration-dotted hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            archive
          </a>
        )}
      </div>
      {meta && (
        <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{meta}</div>
      )}
      {children && (
        <div className="mt-2 text-zinc-700 dark:text-zinc-300">{children}</div>
      )}
    </figure>
  );
}
