import { Link, useLocation } from 'react-router-dom';
import { entries } from '../lib/content';

export function NotFound() {
  const location = useLocation();
  const suggestions = entries.slice(0, 6);

  return (
    <div>
      <div className="font-mono text-sm text-zinc-500 dark:text-zinc-500 mb-2">404</div>
      <h1>Page not found</h1>
      <p>
        Nothing here at <code>{location.pathname}</code>. Try one of these:
      </p>
      <ul>
        {suggestions.map((e) => (
          <li key={e.slug}>
            <Link to={`/${e.slug}`}>
              {e.topic} / {e.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        Or press <kbd className="font-mono text-xs px-2 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-200">⌘K</kbd> to search.
      </p>
    </div>
  );
}
