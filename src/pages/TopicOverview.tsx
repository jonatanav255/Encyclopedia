import { Link, useParams } from 'react-router-dom';
import { groups } from '../lib/content';
import { NotFound } from './NotFound';

export function TopicOverview() {
  const { topic } = useParams();
  const group = groups.find((g) => g.topic === topic);

  if (!group) return <NotFound />;

  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-2">Topic</div>
      <h1>{group.title}</h1>
      <p>
        {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'} in this topic.
        Pick one to read.
      </p>
      <div className="not-prose grid gap-3 sm:grid-cols-2 mt-6">
        {group.entries.map((entry) => (
          <Link
            key={entry.slug}
            to={`/${entry.slug}`}
            className="group block rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 no-underline hover:border-sky-500/50 hover:bg-zinc-900 transition-colors"
          >
            <div className="font-semibold text-zinc-100 group-hover:text-sky-400 transition-colors no-underline">
              {entry.title}
            </div>
            <div className="text-xs font-mono text-zinc-500 mt-1 no-underline">
              /{entry.slug}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
