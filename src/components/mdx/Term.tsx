import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Term({ name, children }: { name: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-sky-700 dark:text-sky-300 underline decoration-dotted decoration-sky-500/60 underline-offset-4 hover:decoration-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm cursor-help"
      >
        {name}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full mt-2 z-20 w-72 max-w-[80vw] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl p-3 text-sm font-normal leading-6 text-zinc-700 dark:text-zinc-100"
        >
          <span className="block font-semibold text-sky-700 dark:text-sky-300 mb-1">{name}</span>
          {children}
        </span>
      )}
    </span>
  );
}
