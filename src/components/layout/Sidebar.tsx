import { NavLink, Link } from 'react-router-dom';
import { groups } from '../../lib/content';

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
      <nav className="p-4 text-sm">
        {groups.map((group) => (
          <div key={group.topic} className="mb-6">
            <Link
              to={`/${group.topic}`}
              className="block px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              {group.title}
            </Link>
            <ul className="space-y-0.5">
              {group.entries.map((entry) => (
                <li key={entry.slug}>
                  <NavLink
                    to={`/${entry.slug}`}
                    className={({ isActive }) =>
                      [
                        'block rounded px-2 py-1.5 transition-colors',
                        isActive
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900',
                      ].join(' ')
                    }
                  >
                    {entry.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
