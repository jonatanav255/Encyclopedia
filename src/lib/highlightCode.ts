import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

export function useHighlighted(code: string, lang: string): string | null {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, { lang, theme: 'github-dark-dimmed' })
      .then((out) => {
        if (!cancelled) setHtml(out);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);
  return html;
}
