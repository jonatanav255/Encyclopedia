import { Children, isValidElement, type ReactNode } from 'react';

export function Steps({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children).filter(isValidElement);

  return (
    <ol className="not-prose my-6 list-none p-0 space-y-1">
      {steps.map((child, i) => (
        <li key={i} className="relative pl-14">
          <div className="absolute left-0 top-0 flex flex-col items-center h-full">
            <div className="size-9 rounded-full bg-sky-600 text-white font-mono text-sm grid place-items-center font-semibold shadow ring-4 ring-zinc-50 dark:ring-zinc-950">
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-zinc-300 dark:bg-zinc-700 mt-1 mb-1" />
            )}
          </div>
          <div className="pb-6">{child}</div>
        </li>
      ))}
    </ol>
  );
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 leading-9">{title}</div>
      <div className="prose-doc [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </div>
  );
}
