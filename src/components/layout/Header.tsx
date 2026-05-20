import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Header({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="flex items-center px-6 py-3 gap-4">
        <Link to="/" className="font-semibold tracking-tight text-lg shrink-0">
          <span className="text-sky-400">encyclo</span>pedia
        </Link>
        <div className="flex-1 flex justify-center">
          <button
            onClick={onOpenSearch}
            className="w-full max-w-sm flex items-center gap-2 rounded-md px-3 py-1.5 text-sm border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 transition-colors"
            aria-label="Open search"
          >
            <span className="opacity-70">🔍</span>
            <span className="flex-1 text-left">Search…</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>
        </div>
        <div
          aria-hidden
          className="shrink-0 rounded-md px-3 py-1.5 text-sm border border-zinc-700 text-zinc-300 flex items-center gap-1.5 select-none"
        >
          <span>☾</span>
          <span>dark</span>
        </div>
      </div>
    </header>
  );
}
