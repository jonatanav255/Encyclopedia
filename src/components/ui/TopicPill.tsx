type Tone = {
  bg: string;
  text: string;
  border: string;
};

const tone: Tone = {
  bg: 'bg-sky-500/15',
  text: 'text-sky-300',
  border: 'border-sky-500/30',
};

export function toneFor(_topic: string): Tone {
  return tone;
}

function TopicIcon({ topic, className }: { topic: string; className?: string }) {
  const cls = className ?? 'w-3 h-3';
  const common = {
    className: cls,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (topic) {
    case 'architecture':
      // layered blocks
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'data':
      // database cylinder
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
        </svg>
      );
    case 'devops':
      // gear
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.4.6 1 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
    case 'express':
      // </> code glyph (Express = minimal Node web framework)
      return (
        <svg {...common}>
          <path d="M8 8l-5 4 5 4" />
          <path d="M16 8l5 4-5 4" />
          <path d="M14 6l-4 12" />
        </svg>
      );
    case 'http':
      // globe
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a13 13 0 0 1 0 18a13 13 0 0 1 0-18z" />
        </svg>
      );
    case 'memory-low-level':
      // RAM chip — labeled rectangle with pins, the iconic "memory module"
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="10" rx="1" />
          <path d="M7 11h2M11 11h2M15 11h2" />
          <path d="M5 17v2M9 17v2M15 17v2M19 17v2" />
          <path d="M5 5v2M9 5v2M15 5v2M19 5v2" />
        </svg>
      );
    case 'javascript':
      // JS mark (shape kept; tinted to match the pill)
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <rect
            x="1"
            y="1"
            width="22"
            height="22"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            fill="currentColor"
            d="M7.2 19.3l1.6-1c.3.55.6.99 1.27.99.66 0 1.07-.26 1.07-1.27V11.2h1.95v6.84c0 2.02-1.18 2.94-2.91 2.94-1.56 0-2.46-.81-2.92-1.78m6.92-.2l1.6-.93c.42.69.97 1.2 1.95 1.2.82 0 1.34-.41 1.34-.98 0-.68-.54-.92-1.45-1.32l-.5-.21c-1.44-.61-2.4-1.38-2.4-3.02 0-1.5 1.15-2.64 2.94-2.64 1.27 0 2.18.44 2.84 1.6l-1.55.99c-.34-.62-.72-.86-1.29-.86-.58 0-.95.37-.95.86 0 .6.37.84 1.23 1.22l.5.21c1.7.73 2.66 1.47 2.66 3.16 0 1.8-1.42 2.78-3.32 2.78-1.86 0-3.06-.88-3.65-2.04"
          />
        </svg>
      );
    case 'node':
      // Node.js hexagon mark (with inner "N")
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            d="M12 2 3 7v10l9 5 9-5V7z"
          />
          <path
            fill="currentColor"
            d="M9 8.5h1.6l3.4 5V8.5H15v7h-1.6l-3.4-5v5H9z"
          />
        </svg>
      );
    case 'react':
      // atom
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1.5" />
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </svg>
      );
    case 'security':
      // shield
      return (
        <svg {...common}>
          <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6z" />
        </svg>
      );
    case 'system-design':
      // connected nodes (network/graph)
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M8 7l3 4M16 7l-3 4M8 17l3-4M16 17l-3-4" />
        </svg>
      );
    case 'typescript':
      // TS-style square
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6" />
          <path d="M12 9v8" />
          <path d="M19 13a2 2 0 0 0-2-2c-1.1 0-2 .7-2 1.6 0 .9.7 1.4 1.8 1.7 1.4.4 2.2 1 2.2 2.1 0 1.1-1 1.9-2.2 1.9-1.3 0-2.3-.7-2.5-1.8" />
        </svg>
      );
    default:
      // bullet
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
  }
}

// Pill labels — by default the slug doubles as the label. Override here
// for topics whose pretty label uses characters (like &) the slug can't.
const PILL_LABELS: Record<string, string> = {
  'memory-low-level': 'memory & low-level',
};

export function TopicPill({
  topic,
  size = 'sm',
}: {
  topic: string;
  size?: 'xs' | 'sm';
}) {
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-0.5 gap-1.5';
  const iconClass = size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const label = PILL_LABELS[topic] ?? topic;
  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold uppercase tracking-wider ${tone.bg} ${tone.text} ${tone.border} ${sizeClass}`}
    >
      <TopicIcon topic={topic} className={iconClass} />
      {label}
    </span>
  );
}
