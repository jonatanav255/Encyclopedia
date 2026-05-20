import { Suspense, lazy, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { findBySlug } from '../lib/content';
import { NotFound } from './NotFound';

export function TopicPage() {
  const params = useParams();
  const slug = `${params.topic}/${params.name}`;
  const entry = findBySlug(slug);

  const Lazy = useMemo(() => {
    if (!entry) return null;
    return lazy(() => entry.load().then((m) => ({ default: m.default })));
  }, [entry]);

  if (!entry || !Lazy) return <NotFound />;

  return (
    <Suspense fallback={<div className="text-zinc-500">Loading…</div>}>
      <Lazy />
    </Suspense>
  );
}
