import { useMemo, useState } from 'react';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

type Route = {
  method: Method;
  path: string;
};

const routes: Route[] = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: '/users' },
  { method: 'GET', path: '/users/:id' },
  { method: 'GET', path: '/users/:id/posts' },
  { method: 'GET', path: '/users/:id/posts/:postId' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/files/*' },
];

type MatchResult = {
  index: number;
  params: Record<string, string>;
  wildcard?: string;
};

function matchRoute(routePath: string, urlPath: string): MatchResult['params'] | { wildcard: string } | null {
  const r = routePath.split('/').filter(Boolean);
  const u = urlPath.split('/').filter(Boolean);

  const params: Record<string, string> = {};
  for (let i = 0; i < r.length; i++) {
    const rs = r[i];
    if (rs === '*') {
      return { wildcard: u.slice(i).join('/') };
    }
    const us = u[i];
    if (us === undefined) return null;
    if (rs.startsWith(':')) {
      params[rs.slice(1)] = us;
    } else if (rs !== us) {
      return null;
    }
  }
  if (u.length !== r.length) return null;
  return params;
}

export function RouteMatcher() {
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('/users/42/posts');

  const match = useMemo<MatchResult | null>(() => {
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      if (route.method !== method) continue;
      const result = matchRoute(route.path, url);
      if (result === null) continue;
      if ('wildcard' in result) {
        return { index: i, params: {}, wildcard: result.wildcard };
      }
      return { index: i, params: result };
    }
    return null;
  }, [method, url]);

  return (
    <div className="not-prose my-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-5">
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-4">
        Route matcher
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          spellCheck={false}
          className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono"
          placeholder="/users/42"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Defined routes
          </div>
          <ul className="space-y-1 font-mono text-xs">
            {routes.map((r, i) => {
              const matched = match?.index === i;
              return (
                <li
                  key={`${r.method}-${r.path}`}
                  className={[
                    'rounded-md px-2.5 py-1.5 border flex items-center gap-2',
                    matched
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                      : 'border-transparent text-zinc-600 dark:text-zinc-400',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'inline-block w-12 text-[10px] text-center rounded font-semibold py-0.5',
                      methodColor(r.method),
                    ].join(' ')}
                  >
                    {r.method}
                  </span>
                  <span>{r.path}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Result
          </div>
          {match ? (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
              <div className="font-mono text-emerald-700 dark:text-emerald-300 mb-2">
                {routes[match.index].method} {routes[match.index].path}
              </div>
              {Object.keys(match.params).length === 0 && !match.wildcard ? (
                <div className="text-xs text-zinc-500">No params extracted.</div>
              ) : (
                <ul className="text-xs space-y-1 font-mono">
                  {Object.entries(match.params).map(([k, v]) => (
                    <li key={k}>
                      <span className="text-pink-600 dark:text-pink-400">req.params.{k}</span>{' '}
                      <span className="text-zinc-500">=</span>{' '}
                      <span className="text-sky-700 dark:text-sky-300">"{v}"</span>
                    </li>
                  ))}
                  {match.wildcard !== undefined && (
                    <li>
                      <span className="text-pink-600 dark:text-pink-400">req.params[0]</span>{' '}
                      <span className="text-zinc-500">=</span>{' '}
                      <span className="text-sky-700 dark:text-sky-300">"{match.wildcard}"</span>
                    </li>
                  )}
                </ul>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/5 p-3 text-sm text-rose-700 dark:text-rose-300">
              No route matches. Express would respond with 404.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function methodColor(m: Method) {
  switch (m) {
    case 'GET':
      return 'bg-sky-500/15 text-sky-700 dark:text-sky-300';
    case 'POST':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    case 'PUT':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300';
    case 'DELETE':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-300';
  }
}
