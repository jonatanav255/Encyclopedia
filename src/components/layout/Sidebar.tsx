import { NavLink, Link } from 'react-router-dom';
import { groups, LEVEL_ORDER, type ContentEntry, type Level } from '../../lib/content';
import { TopicPill } from '../ui/TopicPill';

const LEVEL_LABELS: Record<Level, string> = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
  staff: 'Staff',
};

function groupByLevel(entries: ContentEntry[]): Array<{ level: Level | 'unleveled'; items: ContentEntry[] }> {
  const buckets = new Map<Level | 'unleveled', ContentEntry[]>();
  for (const e of entries) {
    const key: Level | 'unleveled' = e.level ?? 'unleveled';
    const list = buckets.get(key) ?? [];
    list.push(e);
    buckets.set(key, list);
  }
  const ordered: Array<{ level: Level | 'unleveled'; items: ContentEntry[] }> = [];
  for (const l of LEVEL_ORDER) {
    const items = buckets.get(l);
    if (items && items.length) ordered.push({ level: l, items });
  }
  const rest = buckets.get('unleveled');
  if (rest && rest.length) ordered.push({ level: 'unleveled', items: rest });
  return ordered;
}

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
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-200 hover:bg-zinc-900',
            ].join(' ')
          }
        >
          ⚡ Practice
        </NavLink>
        {groups.map((group) => {
          const leveled = groupByLevel(group.entries);
          return (
            <div key={group.topic} className="mb-6">
              <Link to={`/${group.topic}`} className="inline-block mb-2 px-2">
                <TopicPill topic={group.topic} />
              </Link>
              <div className="space-y-3">
                {leveled.map(({ level, items }) => (
                  <div key={level}>
                    <div className="px-2 mb-1 text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                      {level === 'unleveled' ? 'Other' : LEVEL_LABELS[level]}
                    </div>
                    <ul className="space-y-0.5">
                      {items.map((entry) => (
                        <li key={entry.slug}>
                          <NavLink
                            to={`/${entry.slug}`}
                            className={({ isActive }) =>
                              [
                                'block rounded px-2 py-1.5 transition-colors',
                                isActive
                                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                                  : 'text-zinc-300 hover:bg-zinc-900',
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
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
