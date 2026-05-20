import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { groups, LEVEL_ORDER, type ContentEntry, type Level } from '../../lib/content';
import { TopicPill } from '../ui/TopicPill';

const LEVEL_LABELS: Record<Level, string> = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
  staff: 'Staff',
};

const COLLAPSED_KEY = 'sidebar.collapsed.v1';

function loadCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter((x): x is string => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function saveCollapsed(set: Set<string>) {
  try {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* noop */
  }
}

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
  const [collapsed, setCollapsed] = useState<Set<string>>(() => loadCollapsed());

  useEffect(() => {
    saveCollapsed(collapsed);
  }, [collapsed]);

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
      <nav className="p-4 text-sm">
        <NavLink
          to="/practice"
          className={({ isActive }) =>
            [
              'block rounded px-2 py-1.5 mb-3 font-semibold transition-colors',
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
          const topicKey = `topic:${group.topic}`;
          const topicCollapsed = collapsed.has(topicKey);
          return (
            <div key={group.topic} className="mb-3">
              <div className="flex items-center justify-between mb-2 px-2 group">
                <Link to={`/${group.topic}`}>
                  <TopicPill topic={group.topic} />
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(topicKey)}
                  aria-label={topicCollapsed ? `Expand ${group.topic}` : `Collapse ${group.topic}`}
                  aria-expanded={!topicCollapsed}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 -mr-1"
                >
                  <Chevron open={!topicCollapsed} />
                </button>
              </div>
              {!topicCollapsed && (
                <div className="space-y-3">
                  {leveled.map(({ level, items }) => {
                    const levelKey = `level:${group.topic}:${level}`;
                    const levelCollapsed = collapsed.has(levelKey);
                    return (
                      <div key={level}>
                        <button
                          type="button"
                          onClick={() => toggle(levelKey)}
                          aria-expanded={!levelCollapsed}
                          className="w-full flex items-center justify-between px-2 mb-1 text-[10px] uppercase tracking-wider font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          <span>{level === 'unleveled' ? 'Other' : LEVEL_LABELS[level]}</span>
                          <Chevron open={!levelCollapsed} small />
                        </button>
                        {!levelCollapsed && (
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function Chevron({ open, small = false }: { open: boolean; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        'inline-block transition-transform duration-150 leading-none',
        small ? 'text-lg' : 'text-xl',
        open ? 'rotate-90' : '',
      ].join(' ')}
    >
      ▸
    </span>
  );
}
