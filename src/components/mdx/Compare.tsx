import { useHighlighted } from '../../lib/highlightCode';

type Props = {
  bad: string;
  good: string;
  badTitle?: string;
  goodTitle?: string;
  language?: string;
  caption?: string;
};

export function Compare({
  bad,
  good,
  badTitle = "Don't",
  goodTitle = 'Do',
  language = 'js',
  caption,
}: Props) {
  const badHtml = useHighlighted(bad, language);
  const goodHtml = useHighlighted(good, language);

  return (
    <div className="not-prose my-6">
      <div className="grid md:grid-cols-2 gap-3">
        <Panel kind="bad" title={badTitle} html={badHtml} raw={bad} />
        <Panel kind="good" title={goodTitle} html={goodHtml} raw={good} />
      </div>
      {caption && (
        <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">{caption}</div>
      )}
    </div>
  );
}

function Panel({
  kind,
  title,
  html,
  raw,
}: {
  kind: 'bad' | 'good';
  title: string;
  html: string | null;
  raw: string;
}) {
  const isBad = kind === 'bad';
  const borderClass = isBad
    ? 'border-rose-500/40'
    : 'border-emerald-500/40';
  const headerClass = isBad
    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  const icon = isBad ? '✗' : '✓';

  return (
    <div className={`rounded-lg border overflow-hidden ${borderClass}`}>
      <div className={`px-3 py-1.5 text-sm font-medium border-b ${headerClass}`}>
        <span className="font-mono mr-1.5">{icon}</span>
        {title}
      </div>
      <div className="text-sm">
        {html ? (
          <div
            className="[&>pre]:m-0 [&>pre]:rounded-none [&>pre]:border-0 [&>pre]:text-sm [&>pre]:leading-6 [&>pre]:p-4 [&>pre]:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="m-0 p-4 text-sm leading-6 font-mono overflow-x-auto bg-zinc-900 text-zinc-100">
            {raw}
          </pre>
        )}
      </div>
    </div>
  );
}

