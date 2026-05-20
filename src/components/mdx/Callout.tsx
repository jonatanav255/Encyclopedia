import type { ReactNode } from 'react';

type Variant = 'info' | 'warn' | 'tip';

const styles: Record<Variant, string> = {
  info: 'border-sky-400/40 bg-sky-50 dark:bg-sky-500/5 text-sky-900 dark:text-sky-200',
  warn: 'border-amber-400/40 bg-amber-50 dark:bg-amber-500/5 text-amber-900 dark:text-amber-200',
  tip: 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-900 dark:text-emerald-200',
};

export function Callout({ variant = 'info', children }: { variant?: Variant; children: ReactNode }) {
  return (
    <div className={`my-5 rounded-lg border-l-4 px-4 py-3 text-sm ${styles[variant]}`}>{children}</div>
  );
}
