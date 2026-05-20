import { NavLink, Link } from 'react-router-dom';
import { groups } from '../../lib/content';
import { TopicPill } from '../ui/TopicPill';

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
      <nav className="p-4 text-sm">
        <NavLink
          to="/practice"
          className={({ isActive }) =>
            [
              'block rounded px-2 py-1.5 mb-6 font-semibold transition-colors',
              isActive
                ? 'bg-sky-500/10 text-sky-300'
                : 'text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900',
            ].join(' ')
          }
        >
          ⚡ Practice
        </NavLink>
        {groups.map((group) => (
          <div key={group.topic} className="mb-6">
            <Link to={`/${group.topic}`} className="inline-block mb-2 px-2">
              <TopicPill topic={group.topic} />
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
