import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'javascript',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'Why is JavaScript called single-threaded?',
      answer:
        'Your code runs on one execution thread. Only one function executes at a time; everything else waits in queues. The runtime may use OS threads internally for I/O, but your JS code never runs in parallel with itself.',
    },
    {
      level: 'junior',
      question: 'What is the call stack?',
      answer:
        'A LIFO stack tracking what function is currently executing. When you call a function, a frame is pushed; when it returns, the frame pops. If the stack grows without popping (infinite recursion), you get a "Maximum call stack size exceeded" error.',
    },
    {
      level: 'junior',
      question: 'What\'s a microtask?',
      answer:
        'A callback queued from `Promise.then/catch/finally`, `queueMicrotask`, or `MutationObserver`. The entire microtask queue drains before any macrotask runs — so promise chains feel synchronous within a single tick.',
    },
    {
      level: 'junior',
      question: 'What\'s a macrotask?',
      answer:
        '`setTimeout`, `setInterval`, I/O callbacks, UI events. The event loop runs one macrotask per iteration, then drains all microtasks, then takes the next macrotask.',
    },
    {
      level: 'junior',
      question: 'What does setTimeout(fn, 0) actually do?',
      answer:
        "It schedules `fn` as a macrotask with a minimum 0ms delay. The current synchronous code must finish first, then all microtasks drain, then the loop pulls one macrotask. The 0 is a floor, not a guarantee — browsers clamp nested setTimeout(0) chains to 4ms after 5 levels.",
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'What\'s the output? `console.log("A"); setTimeout(() => console.log("B"), 0); Promise.resolve().then(() => console.log("C")); console.log("D");`',
      answer:
        '**A, D, C, B.** Sync code runs first (A, D). The microtask queue drains before any macrotask, so the promise callback (C) runs before the setTimeout callback (B).',
    },
    {
      level: 'mid',
      question: 'Why does `await` make subsequent code run in a microtask?',
      answer:
        'When the engine hits `await`, it suspends the async function and schedules the continuation as a microtask. The synchronous caller continues. When the awaited value settles, the continuation is queued; it runs after the current sync block plus any microtasks queued before it.',
    },
    {
      level: 'mid',
      question: 'What\'s the output? `async function f() { console.log("1"); await null; console.log("3"); } f(); console.log("2");`',
      answer:
        '**1, 2, 3.** `f` runs synchronously until `await null`, which suspends it and queues the rest as a microtask. The sync `console.log("2")` runs next. Then the microtask queue drains, resuming `f` and logging "3".',
    },
    {
      level: 'mid',
      question: 'Why might `await` inside a loop be drastically slower than expected?',
      answer:
        'Each `await` pauses the function and queues a microtask. With 1000 items, that\'s 1000 hops — and if each iteration makes a network call, the calls run **sequentially**, not in parallel. End-to-end latency = N × per-call latency. Fix: `await Promise.all(items.map(handle))` to fire them in parallel, optionally with bounded concurrency.',
    },
    {
      level: 'mid',
      question: 'Does queueMicrotask(cb) run before or after a pending setTimeout(cb, 0)?',
      answer:
        'Before. `queueMicrotask` queues onto the microtask queue, which drains completely before any macrotask. Even if you scheduled the setTimeout first, the microtask wins.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between Node\'s process.nextTick and a Promise microtask?',
      answer:
        '`process.nextTick` queues onto Node\'s **nextTick queue**, which has higher priority than promise microtasks — it drains before the regular microtask queue. The full order in Node: nextTick → promise microtasks → next event loop phase. Abusing `process.nextTick` can starve I/O because the loop never advances past it.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'A CPU-bound operation in an async function still freezes the UI. Why?',
      answer:
        '`async`/`await` doesn\'t change *where* code runs — it changes *when*. The async function still executes on the main thread between awaits. A tight `for` loop crunching numbers inside an async function blocks the loop just as completely as a synchronous one. To actually offload work, you need a Web Worker (browser) or `worker_threads` (Node).',
    },
    {
      level: 'senior',
      question: 'How would you yield to the event loop in the middle of a long synchronous task?',
      answer:
        'Break the work into chunks and use `await new Promise(r => setTimeout(r, 0))` between chunks (or the newer `scheduler.yield()` where available). Each yield gives the loop a chance to process microtasks, run timers, and repaint. Don\'t use a tight `await Promise.resolve()` loop — that only yields to microtasks, not macrotasks, so the page still won\'t repaint.',
    },
    {
      level: 'senior',
      question: 'Explain what `Promise.all([p1, p2, p3])` does at the event-loop level.',
      answer:
        'It returns a promise that resolves when all input promises resolve (or rejects on the first rejection). The inputs run in their own scheduling — `Promise.all` doesn\'t make anything more parallel; it just composes existing promises. If `p1`, `p2`, `p3` are network requests, all three are already in flight by the time `Promise.all` is called. `await Promise.all(...)` queues a single microtask continuation once all three settle.',
    },
    {
      level: 'senior',
      question: 'What does the Node event loop actually look like beyond the browser model?',
      answer:
        'Node\'s loop has multiple phases run in order each iteration: **timers** (expired setTimeout/setInterval), **pending callbacks** (deferred I/O), **idle/prepare** (internal), **poll** (where I/O callbacks fire and the loop can block waiting for events), **check** (`setImmediate` callbacks), and **close callbacks**. Microtasks and `process.nextTick` callbacks run *between* phases. So in Node, `setImmediate(fn)` after I/O runs before a `setTimeout(fn, 0)` after I/O, because they live in different phases.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Design event-loop lag monitoring for a production Node service.',
      answer:
        '**Measure:** `perf_hooks.monitorEventLoopDelay()` gives a histogram of lag samples. Export p50/p99 to your metrics system. Anything over ~10ms p99 affects user-facing latency.\n\n**Alert:** SLO on p99 lag. When it spikes, capture a CPU profile (`node --prof` or `clinic.js`) to find the blocking stack — usually sync crypto, regex backtracking, or sync JSON.parse on large payloads.\n\n**Mitigate:** replace sync APIs, cap payload sizes (`express.json({ limit: "100kb" })`), move CPU-bound work to `worker_threads`. Add load shedding: when lag exceeds threshold, return 503 for new requests so the loop catches up rather than collapsing.\n\n**Culture:** make event-loop lag a first-class SLO so engineers treat sync APIs as suspect by default.',
    },
    {
      level: 'staff',
      question: 'You see microtask starvation in production logs. What is it and how do you fix it?',
      answer:
        'Microtask starvation: code keeps scheduling microtasks during a microtask drain, so the queue never empties, and the loop can\'t advance to the next macrotask phase. Common cause: recursive `.then()` chains or `process.nextTick` loops.\n\n**Diagnose:** event-loop lag spikes while CPU is busy in promise machinery. A CPU profile shows deep promise resolution stacks.\n\n**Fix:** break the recursion with a `setTimeout(..., 0)` (yields to a macrotask) instead of `.then` or `process.nextTick`. The boundary becomes "this task gives other tasks a chance to run." For Node specifically, `setImmediate` is the idiomatic yield.\n\nThe deeper lesson: microtasks are higher-priority than macrotasks for a reason — they should be short. Long-running work belongs on macrotasks.',
    },
  ],
};
