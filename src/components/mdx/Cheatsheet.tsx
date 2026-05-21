import type { ReactNode } from 'react';

type Cell = ReactNode;

export function Cheatsheet({
  columns,
  rows,
  caption,
  children,
}: {
  columns?: string[];
  rows?: Cell[][];
  caption?: string;
  children?: ReactNode;
}) {
  // Body-form: <Cheatsheet>...markdown table...</Cheatsheet>
  // Renders children in the same framed figure as the props form.
  if (children && !columns) {
    return (
      <figure className="not-prose my-6">
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 cheatsheet-body">
          {children}
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="not-prose my-6">
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-100/70 dark:bg-zinc-900">
              {(columns ?? []).map((c, i) => (
                <th
                  key={i}
                  className="text-left font-semibold text-zinc-700 dark:text-zinc-200 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row, r) => (
              <tr
                key={r}
                className={
                  r % 2 === 0
                    ? 'bg-white dark:bg-zinc-950'
                    : 'bg-zinc-50 dark:bg-zinc-900/40'
                }
              >
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={[
                      'px-4 py-2.5 align-top text-zinc-700 dark:text-zinc-300',
                      c === 0
                        ? 'font-mono font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap'
                        : '',
                    ].join(' ')}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
