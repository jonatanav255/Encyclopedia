import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'running' | 'done' | 'short-circuited' | 'error';

type Step = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  callNext: boolean;
};

const initialSteps: Step[] = [
  { id: 'logger', name: 'logger', description: 'logs the request', enabled: true, callNext: true },
  { id: 'auth', name: 'auth', description: 'checks the user token', enabled: true, callNext: true },
  { id: 'validator', name: 'validator', description: 'validates the body', enabled: true, callNext: true },
  { id: 'handler', name: 'handler', description: 'sends the response', enabled: true, callNext: true },
];

type LogLine = { kind: 'info' | 'warn' | 'error'; text: string };

export function MiddlewarePipeline() {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [active, setActive] = useState<number>(-1);
  const [status, setStatus] = useState<Status>('idle');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const updateStep = (id: string, patch: Partial<Step>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setActive(-1);
    setStatus('idle');
    setLogs([]);
  };

  const send = () => {
    reset();
    setStatus('running');
    setLogs([{ kind: 'info', text: 'GET /api/users — request received' }]);

    const visible = steps.map((s, i) => ({ ...s, index: i })).filter((s) => s.enabled);

    let delay = 400;
    let halted = false;

    for (let i = 0; i < visible.length; i++) {
      const step = visible[i];
      const isLast = i === visible.length - 1;
      const t = window.setTimeout(() => {
        if (halted) return;
        setActive(step.index);
        setLogs((l) => [...l, { kind: 'info', text: `→ ${step.name}: ${step.description}` }]);

        if (!step.callNext && !isLast) {
          halted = true;
          const tEnd = window.setTimeout(() => {
            setLogs((l) => [
              ...l,
              { kind: 'warn', text: `${step.name} did not call next() — pipeline stops here` },
            ]);
            setStatus('short-circuited');
            setActive(-1);
          }, 500);
          timers.current.push(tEnd);
          return;
        }

        if (isLast) {
          const tEnd = window.setTimeout(() => {
            setLogs((l) => [...l, { kind: 'info', text: '← 200 OK response sent' }]);
            setStatus('done');
            setActive(-1);
          }, 500);
          timers.current.push(tEnd);
        }
      }, delay);
      timers.current.push(t);
      delay += 700;
    }
  };

  return (
    <div className="not-prose my-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-medium text-zinc-700 dark:text-zinc-200">
          Middleware pipeline
        </div>
        <div className="flex gap-2">
          <button
            onClick={send}
            disabled={status === 'running'}
            className="px-4 py-2 text-base rounded-md bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
          >
            Send request
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 text-base rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Token />
        {steps.map((step, i) => (
          <PipelineNode
            key={step.id}
            step={step}
            isActive={active === i}
            onToggleEnabled={() => updateStep(step.id, { enabled: !step.enabled })}
            onToggleNext={() => updateStep(step.id, { callNext: !step.callNext })}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>

      <div className="mt-4">
        <div className="text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
          Log
        </div>
        <div className="rounded-md bg-zinc-900 text-zinc-100 font-mono text-sm p-4 min-h-[100px] space-y-1.5">
          {logs.length === 0 ? (
            <div className="text-zinc-500">— click "Send request" —</div>
          ) : (
            logs.map((l, i) => (
              <div
                key={i}
                className={
                  l.kind === 'warn'
                    ? 'text-amber-300'
                    : l.kind === 'error'
                    ? 'text-rose-300'
                    : 'text-zinc-200'
                }
              >
                {l.text}
              </div>
            ))
          )}
        </div>
        {status === 'short-circuited' && (
          <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            Pipeline short-circuited — downstream middleware was never reached.
          </div>
        )}
        {status === 'done' && (
          <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
            Request flowed through every middleware and a response was sent.
          </div>
        )}
      </div>
    </div>
  );
}

function Token() {
  return (
    <div className="shrink-0 flex flex-col items-center">
      <div className="size-12 rounded-full bg-sky-600 text-white text-sm grid place-items-center font-mono shadow">
        req
      </div>
      <div className="text-xs text-zinc-500 mt-1">request</div>
    </div>
  );
}

function PipelineNode({
  step,
  isActive,
  onToggleEnabled,
  onToggleNext,
  isLast,
}: {
  step: Step;
  isActive: boolean;
  onToggleEnabled: () => void;
  onToggleNext: () => void;
  isLast: boolean;
}) {
  return (
    <>
      <Arrow />
      <div
        className={[
          'shrink-0 rounded-lg border px-4 py-3 w-52 transition-colors duration-200',
          !step.enabled
            ? 'border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-900/30 opacity-50'
            : isActive
            ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10'
            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900',
        ].join(' ')}
      >
        <div className="font-mono text-base font-semibold">{step.name}</div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{step.description}</div>
        <div className="flex flex-col gap-1.5 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={step.enabled} onChange={onToggleEnabled} />
            <span>enabled</span>
          </label>
          {!isLast && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={step.callNext} onChange={onToggleNext} />
              <span>
                calls <code className="font-mono">next()</code>
              </span>
            </label>
          )}
        </div>
      </div>
    </>
  );
}

function Arrow() {
  return <div className="shrink-0 text-2xl text-zinc-400 dark:text-zinc-600">→</div>;
}
