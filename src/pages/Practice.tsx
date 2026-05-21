import { useMemo, useState } from 'react';
import { allQuestions, levels, topics, type Level } from '../content/questions';
import { TopicPill } from '../components/ui/TopicPill';
import { Answer } from '../components/practice/Answer';

type TopicFilter = string | 'all';
type LevelFilter = Level | 'all';

const levelStyles: Record<Level, string> = {
  junior: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  mid: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  senior: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  staff: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export function Practice() {
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return allQuestions.filter((q) => {
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false;
      if (levelFilter !== 'all' && q.level !== levelFilter) return false;
      return true;
    });
  }, [topicFilter, levelFilter]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenIds(new Set(filtered.map((_, i) => String(i))));
  const collapseAll = () => setOpenIds(new Set());

  const counts = useMemo(() => {
    const byLevel = { junior: 0, mid: 0, senior: 0, staff: 0 } as Record<Level, number>;
    for (const q of allQuestions) byLevel[q.level]++;
    return byLevel;
  }, []);

  return (
    <div>
      <div className="not-prose mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Practice</h1>
        <p className="text-zinc-400 max-w-2xl">
          A question bank for interview prep and self-quizzing. Filter by topic and level, click
          any question to reveal the answer.
        </p>
      </div>

      <div className="not-prose space-y-4 mb-6">
        <Row label="Topic">
          <FilterPill
            active={topicFilter === 'all'}
            onClick={() => setTopicFilter('all')}
            label="All"
          />
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopicFilter(t)}
              className={`rounded-md transition-opacity ${
                topicFilter === t ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <TopicPill topic={t} size="sm" />
            </button>
          ))}
        </Row>

        <Row label="Level">
          <FilterPill
            active={levelFilter === 'all'}
            onClick={() => setLevelFilter('all')}
            label="All"
          />
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={[
                'inline-block rounded-md border text-xs font-semibold uppercase tracking-wider px-2 py-0.5 transition-opacity',
                levelStyles[l],
                levelFilter === l ? 'opacity-100' : 'opacity-50 hover:opacity-100',
              ].join(' ')}
            >
              {l}{' '}
              <span className="opacity-70 font-mono ml-1">{counts[l]}</span>
            </button>
          ))}
        </Row>
      </div>

      <div className="not-prose flex items-center justify-between mb-4">
        <div className="text-sm text-zinc-400">
          <span className="font-semibold text-zinc-100">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'question' : 'questions'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="text-xs px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="not-prose space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-500">
            No questions match these filters.
          </div>
        ) : (
          filtered.map((q, i) => {
            const id = String(i);
            const open = openIds.has(id);
            return (
              <div
                key={id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-expanded={open}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TopicPill topic={q.topic} size="xs" />
                      <span
                        className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${levelStyles[q.level]}`}
                      >
                        {q.level}
                      </span>
                      <span className="font-medium text-zinc-100">{q.question}</span>
                    </div>
                    <span
                      aria-hidden
                      className={`shrink-0 text-zinc-500 transition-transform duration-200 ${
                        open ? 'rotate-90' : ''
                      }`}
                    >
                      ▸
                    </span>
                  </div>
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-3 border-t border-zinc-800 text-[0.95em]">
                    <Answer text={q.answer} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold w-14 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-block rounded-md border text-xs font-semibold uppercase tracking-wider px-2 py-0.5 transition-colors',
        active
          ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
          : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

