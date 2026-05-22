import { useHighlighted } from '../../lib/highlightCode';

type Segment =
  | { kind: 'code'; lang: string; code: string }
  | { kind: 'text'; text: string };

const FENCE_RE = /```(\w+)?\n([\s\S]*?)```/g;

function parse(answer: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  for (const m of answer.matchAll(FENCE_RE)) {
    const start = m.index ?? 0;
    if (start > lastIndex) {
      segments.push({ kind: 'text', text: answer.slice(lastIndex, start) });
    }
    segments.push({ kind: 'code', lang: m[1] || 'plaintext', code: m[2].replace(/\n$/, '') });
    lastIndex = start + m[0].length;
  }
  if (lastIndex < answer.length) {
    segments.push({ kind: 'text', text: answer.slice(lastIndex) });
  }
  return segments;
}

function renderInline(text: string): React.ReactNode[] {
  // Split on **bold** and `code`, preserving the delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-zinc-800 px-1.5 py-0.5 text-[0.9em] font-mono text-zinc-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function TextBlock({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-zinc-300 leading-relaxed">
          {renderInline(p.trim())}
        </p>
      ))}
    </>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const html = useHighlighted(code, lang);

  if (html) {
    return (
      <div
        className="practice-code rounded-md overflow-hidden text-[0.9em]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <pre className="rounded-md bg-zinc-950 border border-zinc-800 p-3 overflow-x-auto text-[0.9em]">
      <code>{code}</code>
    </pre>
  );
}

export function Answer({ text }: { text: string }) {
  const segments = parse(text);
  return (
    <div className="space-y-3">
      {segments.map((seg, i) =>
        seg.kind === 'code' ? (
          <CodeBlock key={i} lang={seg.lang} code={seg.code} />
        ) : (
          <TextBlock key={i} text={seg.text} />
        ),
      )}
    </div>
  );
}
