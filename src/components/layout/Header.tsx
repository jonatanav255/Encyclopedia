import { Link } from 'react-router-dom';
import { useTheme } from '../../lib/theme';

export function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          <span className="text-sky-600 dark:text-sky-400">encyclo</span>pedia
        </Link>
        <button
          onClick={toggle}
          className="rounded-md px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☾ dark' : '☀ light'}
        </button>
      </div>
    </header>
  );
}
