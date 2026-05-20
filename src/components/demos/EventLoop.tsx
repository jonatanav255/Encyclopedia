import { useEffect, useRef, useState } from 'react';

type Kind = 'sync' | 'timer' | 'micro';

type Op = {
  id: number;
  label: string;
  kind: Kind;
  schedules?: { label: string; kind: 'timer' | 'micro' }[];
};

type Scenario = {
  name: string;
  code: string;
  ops: Op[];
};

const scenarios: Scenario[] = [
  {
    name: 'sync + setTimeout + Promise',
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    ops: [
      { id: 1, label: "console.log('A')", kind: 'sync' },
      {
        id: 2,
        label: "setTimeout(cb, 0)",
        kind: 'sync',
        schedules: [{ label: "console.log('B')", kind: 'timer' }],
      },
      {
        id: 3,
        label: 'Promise.resolve().then(cb)',
        kind: 'sync',
        schedules: [{ label: "console.log('C')", kind: 'micro' }],
      },
      { id: 4, label: "console.log('D')", kind: 'sync' },
    ],
  },
  {
    name: 'two microtasks before one macrotask',
    code: `setTimeout(() => console.log('timer'), 0);
Promise.resolve().then(() => console.log('p1'));
Promise.resolve().then(() => console.log('p2'));`,
    ops: [
      {
        id: 1,
        label: 'setTimeout(cb, 0)',
        kind: 'sync',
        schedules: [{ label: "console.log('timer')", kind: 'timer' }],
      },
      {
        id: 2,
        label: 'Promise.resolve().then(p1)',
        kind: 'sync',
        schedules: [{ label: "console.log('p1')", kind: 'micro' }],
      },
      {
        id: 3,
        label: 'Promise.resolve().then(p2)',
        kind: 'sync',
        schedules: [{ label: "console.log('p2')", kind: 'micro' }],
      },
    ],
  },
  {
    name: 'async / await',
    code: `async function run() {
  console.log('1');
  await null;
  console.log('3');
}
run();
console.log('2');`,
    ops: [
      { id: 1, label: "console.log('1')", kind: 'sync' },
      {
        id: 2,
        label: 'await null (pauses, queues resume)',
        kind: 'sync',
        schedules: [{ label: "console.log('3')", kind: 'micro' }],
      },
      { id: 3, label: "console.log('2')", kind: 'sync' },
    ],
  },
];

type QueueItem = { label: string };

export function EventLoop() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [stack, setStack] = useState<string | null>(null);
  const [microQ, setMicroQ] = useState<QueueItem[]>([]);
  const [macroQ, setMacroQ] = useState<QueueItem[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);

  const scenario = scenarios[scenarioIdx];

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(false);
    setStack(null);
    setMicroQ([]);
    setMacroQ([]);
    setOutput([]);
    setStep(0);
  };

  const log = (s: string) => setOutput((o) => [...o, s]);

  const run = () => {
    reset();
    setRunning(true);

    const tickDelay = 700;
    let t = 0;
    const at = (cb: () => void) => {
      const id = window.setTimeout(cb, t);
      timers.current.push(id);
      t += tickDelay;
    };

    const localMicro: QueueItem[] = [];
    const localMacro: QueueItem[] = [];

    scenario.ops.forEach((op, i) => {
      at(() => {
        setStep(i + 1);
        setStack(op.label);
        if (op.kind === 'sync' && /console\.log\('(.+)'\)/.test(op.label)) {
          const m = op.label.match(/console\.log\('(.+)'\)/);
          if (m) log(m[1]);
        }
      });
      at(() => {
        setStack(null);
        if (op.schedules) {
          for (const s of op.schedules) {
            if (s.kind === 'micro') {
              localMicro.push({ label: s.label });
              setMicroQ([...localMicro]);
            } else {
              localMacro.push({ label: s.label });
              setMacroQ([...localMacro]);
            }
          }
        }
      });
    });

    at(() => {});

    const drainMicro = () => {
      while (localMicro.length > 0) {
        const item = localMicro.shift()!;
        at(() => {
          setMicroQ([...localMicro]);
          setStack(item.label);
          const m = item.label.match(/console\.log\('(.+)'\)/);
          if (m) log(m[1]);
        });
        at(() => setStack(null));
      }
    };

    const runOneMacro = () => {
      const item = localMacro.shift();
      if (!item) return;
      at(() => {
        setMacroQ([...localMacro]);
        setStack(item.label);
        const m = item.label.match(/console\.log\('(.+)'\)/);
        if (m) log(m[1]);
      });
      at(() => setStack(null));
    };

    drainMicro();
    while (localMacro.length > 0) {
      runOneMacro();
      drainMicro();
    }

    at(() => setRunning(false));
  };

  return (
    <div className="not-prose my-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="text-lg font-medium text-zinc-700 dark:text-zinc-200">
          Event loop visualizer
        </div>
        <div className="flex gap-2">
          <select
            value={scenarioIdx}
            onChange={(e) => {
              setScenarioIdx(Number(e.target.value));
              reset();
            }}
            disabled={running}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm"
          >
            {scenarios.map((s, i) => (
              <option key={s.name} value={i}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={run}
            disabled={running}
            className="px-4 py-2 text-sm rounded-md bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
          >
            Run
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
        <pre className="m-0 p-4 rounded-lg bg-zinc-900 text-zinc-100 text-xs font-mono leading-6 overflow-x-auto">
          {scenario.code.split('\n').map((line, i) => (
            <div key={i} className={i + 1 === step ? 'bg-sky-500/20 -mx-4 px-4' : ''}>
              <span className="text-zinc-600 mr-3">{String(i + 1).padStart(2)}</span>
              {line}
            </div>
          ))}
        </pre>

        <div className="grid gap-3">
          <Box title="Call stack" empty="(empty)" highlight>
            {stack && <Token>{stack}</Token>}
          </Box>
          <Box title="Microtask queue" empty="(empty)">
            {microQ.map((q, i) => (
              <Token key={i} tone="emerald">
                {q.label}
              </Token>
            ))}
          </Box>
          <Box title="Macrotask queue (timers)" empty="(empty)">
            {macroQ.map((q, i) => (
              <Token key={i} tone="amber">
                {q.label}
              </Token>
            ))}
          </Box>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
          console output
        </div>
        <div className="rounded-md bg-zinc-900 text-zinc-100 font-mono text-sm p-3 min-h-[80px] space-y-1">
          {output.length === 0 ? (
            <div className="text-zinc-500">— click "Run" —</div>
          ) : (
            output.map((line, i) => (
              <div key={i}>
                <span className="text-zinc-500">{String(i + 1).padStart(2)}</span>{' '}
                <span>{line}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Box({
  title,
  empty,
  highlight,
  children,
}: {
  title: string;
  empty: string;
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  const hasContent = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div
      className={[
        'rounded-lg border bg-white dark:bg-zinc-900 p-3 min-h-[70px]',
        highlight
          ? 'border-sky-500/40'
          : 'border-zinc-200 dark:border-zinc-800',
      ].join(' ')}
    >
      <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
        {title}
      </div>
      <div className="flex flex-col gap-1.5">
        {hasContent ? (
          children
        ) : (
          <div className="text-xs text-zinc-400 dark:text-zinc-500">{empty}</div>
        )}
      </div>
    </div>
  );
}

function Token({ children, tone = 'sky' }: { children: React.ReactNode; tone?: 'sky' | 'emerald' | 'amber' }) {
  const toneClass =
    tone === 'emerald'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 border-emerald-500/30'
      : tone === 'amber'
      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-200 border-amber-500/30'
      : 'bg-sky-500/15 text-sky-700 dark:text-sky-200 border-sky-500/30';
  return (
    <div className={`rounded-md border px-2.5 py-1 font-mono text-xs ${toneClass}`}>{children}</div>
  );
}
