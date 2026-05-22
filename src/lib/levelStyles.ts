export type Level = 'junior' | 'mid' | 'senior' | 'staff';

export const levelStyles: Record<Level, string> = {
  junior: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  mid: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
  senior: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  staff: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
};
