import { Suspense, lazy, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findBySlug } from '../lib/content';

export function TopicPage() {
  const params = useParams();
  const slug = `${params.topic}/${params.name}`;
  const entry = findBySlug(slug);

  const Lazy = useMemo(() => {
    if (!entry) return null;
    return lazy(() => entry.load().then((m) => ({ default: m.default })));
  }, [entry]);

  if (!entry || !Lazy) {
    return (
      <div>
        <h1>Not found</h1>
        <p>
          No entry for <code>{slug}</code>. <Link to="/">Back to home</Link>.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="text-zinc-500">Loading…</div>}>
      <Lazy />
    </Suspense>
  );
}
