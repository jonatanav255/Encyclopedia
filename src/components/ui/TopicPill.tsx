type Tone = {
  bg: string;
  text: string;
  border: string;
};

const tones: Tone[] = [
  { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30' },
  { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  { bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/30' },
  { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function toneFor(topic: string): Tone {
  return tones[hash(topic) % tones.length];
}

export function TopicPill({
  topic,
  size = 'sm',
}: {
  topic: string;
  size?: 'xs' | 'sm';
}) {
  const t = toneFor(topic);
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span
      className={`inline-block rounded-md border font-semibold uppercase tracking-wider ${t.bg} ${t.text} ${t.border} ${sizeClass}`}
    >
      {topic}
    </span>
  );
}
