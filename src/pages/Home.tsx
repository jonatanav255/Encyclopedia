import { Link } from 'react-router-dom';
import { entries, groups } from '../lib/content';

export function Home() {
  const totalEntries = entries.length;
  const totalTopics = groups.length;

  return (
    <div>
      <div className="not-prose mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="text-sky-400">encyclo</span>
          <span className="text-zinc-100">pedia</span>
        </h1>
        <p className="text-lg text-zinc-400 leading-7 max-w-2xl">
          A personal reference for languages, tools, and concepts. Plain explanations,
          side-by-side comparisons, interactive demos, and interview-style questions —
          all in one place.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <Stat label="topics" value={totalTopics} />
          <Stat label="entries" value={totalEntries} />
          <Stat
            label="search"
            value={
              <kbd className="font-mono px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-200">
                ⌘K
              </kbd>
            }
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold tracking-tight mt-2 mb-4">Browse by topic</h2>
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <Link
            key={group.topic}
            to={`/${group.topic}`}
            className="block rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-sky-500/50 hover:bg-zinc-900 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">{group.title}</h3>
              <span className="text-xs text-zinc-500 font-mono">
                {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {group.entries.slice(0, 4).map((e) => (
                <li key={e.slug} className="text-zinc-400">
                  · {e.title}
                </li>
              ))}
              {group.entries.length > 4 && (
                <li className="text-zinc-500 text-xs">
                  +{group.entries.length - 4} more
                </li>
              )}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-zinc-300">
      <span>{value}</span>
      <span className="text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
