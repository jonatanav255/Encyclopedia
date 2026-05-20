import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'javascript',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'What are the falsy values in JavaScript?',
      answer:
        '`false`, `0`, `-0`, `0n`, `\'\'` (empty string), `null`, `undefined`, and `NaN`. Everything else is truthy — including `\'0\'`, `\'false\'`, `[]`, and `{}`. The classic bugs come from `if (count)` excluding 0 when 0 was a valid value.',
    },
    {
      level: 'junior',
      question: 'Why use `===` instead of `==`?',
      answer:
        '`==` coerces both sides until they have the same type, then compares — leading to surprises like `1 == \'1\'`, `[] == false`, and `\'\' == 0`. `===` requires same type and value, no coercion. The one useful loose-equality idiom is `x == null` (matches both `null` and `undefined`).',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between primitives and objects?',
      answer:
        'Primitives (string, number, boolean, bigint, symbol, null, undefined) are immutable and copied by value. Objects (including arrays, functions, dates) are mutable and copied by reference — both variables point to the same object. Function arguments follow the same rule.',
    },
    {
      level: 'junior',
      question: 'When should you use `const` vs `let` vs `var`?',
      answer:
        '`const` by default — even for objects whose contents you\'ll mutate (the binding can\'t be reassigned). `let` when you genuinely need to reassign. Never `var` in modern code — it\'s function-scoped, hoisted, and redeclarable, which is the worst of all worlds.',
    },
    {
      level: 'junior',
      question: 'What is hoisting?',
      answer:
        'Before any code in a scope runs, the engine scans for declarations and creates the bindings. Function declarations are hoisted with their bodies — you can call them before they appear. `var` is hoisted as `undefined`. `let`/`const`/`class` are hoisted but unreadable until the declaration line (the "temporal dead zone").',
    },
    {
      level: 'junior',
      question: 'What\'s the output? `\'5\' + 1` vs `\'5\' - 1`?',
      answer:
        '`\'5\' + 1` is `\'51\'` — the `+` operator concatenates when either side is a string. `\'5\' - 1` is `4` — `-` has no string meaning, so both sides coerce to numbers. This asymmetry trips up beginners constantly.',
    },
    {
      level: 'junior',
      question: 'How do you check if a variable is an array?',
      answer:
        '`Array.isArray(value)`. Don\'t use `typeof` — it returns `\'object\'` for arrays. Don\'t use `instanceof Array` either — it fails across realms (iframes, vm contexts).',
    },
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

    // --- mid ---
    {
      level: 'mid',
      question: 'What\'s a closure?',
      answer:
        'A function bundled with the variables from the scope where it was defined. Those variables remain accessible even after the enclosing function returns. Used for private state, memoization, currying, and event handler binding. The classic loop bug — `for (var i...)` and `setTimeout` all logging the same `i` — is closures capturing one shared binding instead of fresh ones.',
    },
    {
      level: 'mid',
      question: 'What does `this` refer to in a function?',
      answer:
        'It depends on how the function is called: (1) `obj.fn()` — `this` is `obj`. (2) `fn()` — `this` is undefined in strict mode (or global in sloppy). (3) `new Fn()` — `this` is a new object. (4) `fn.call(x)`/`bind(x)` — `this` is `x`. Arrow functions have no `this` of their own — they inherit it lexically.',
    },
    {
      level: 'mid',
      question: 'Why might a method passed as a callback lose its `this`?',
      answer:
        '`obj.fn` is just a function reference. When called without the `obj.` prefix (e.g., `setTimeout(obj.fn, 100)` or `arr.forEach(obj.fn)`), the method-call form is gone — `this` becomes undefined (strict) or global (sloppy). Fix with `.bind(obj)`, wrap in an arrow (`() => obj.fn()`), or use an arrow class field.',
    },
    {
      level: 'mid',
      question: 'What\'s the output? `console.log("A"); setTimeout(() => console.log("B"), 0); Promise.resolve().then(() => console.log("C")); console.log("D");`',
      answer:
        '**A, D, C, B.** Sync code runs first (A, D). The microtask queue drains before any macrotask, so the promise callback (C) runs before the setTimeout callback (B).',
    },
    {
      level: 'mid',
      question: 'How do promises differ from callbacks?',
      answer:
        'Promises represent a value-that-will-arrive (or an error). They\'re one-shot — fulfilled or rejected exactly once. They compose with `.then`/`.catch`/`Promise.all`, work with `async`/`await`, and propagate errors through chains rather than nested handlers. Callbacks invert this — caller passes a function, callee invokes it — and don\'t compose without conventions like "error-first."',
    },
    {
      level: 'mid',
      question: 'Why is `await` in a loop often slower than expected?',
      answer:
        'Each `await` pauses the function. With 1000 items and a network call inside the loop, the calls run **sequentially** — total time is N × per-call latency. Fix with `await Promise.all(items.map(fn))` for parallel, or `p-limit` for bounded concurrency. The microtask hops also add overhead, but the sequential I/O is the main cost.',
    },
    {
      level: 'mid',
      question: 'How does the prototype chain work?',
      answer:
        'Every object has an internal link to a prototype object. When you read a property, the engine looks on the object itself, then walks up the prototype chain. `arr.map` is found on `Array.prototype`; `arr.toString` walks one more level to `Object.prototype`. The chain ends at `null`. Classes are syntactic sugar over the same mechanism.',
    },
    {
      level: 'mid',
      question: 'When should you use `Map` vs a plain object?',
      answer:
        'Use `Map` when keys are not strings, when you add/remove frequently (Map is optimized for that), when you need guaranteed iteration order, or when you want no inherited prototype methods (`hasOwnProperty` etc.). Use plain objects for static structures, JSON-like data, and config — they\'re more concise and JSON-serializable.',
    },
    {
      level: 'mid',
      question: 'How do you deep-clone an object in modern JS?',
      answer:
        '`structuredClone(obj)` — built-in, handles Date, Map, Set, RegExp, typed arrays, and cycles. Faster than `JSON.parse(JSON.stringify(obj))` and handles more types. Caveats: functions, prototypes (class methods), and DOM nodes don\'t clone. For those, use `lodash.cloneDeep` or write a manual clone.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between `Promise.all` and `Promise.allSettled`?',
      answer:
        '`Promise.all` rejects on the first rejection and discards the rest — "all-or-nothing." `Promise.allSettled` waits for every promise to settle and returns an array of `{ status: \'fulfilled\', value }` or `{ status: \'rejected\', reason }` objects. Use `all` when one failure means abort; use `allSettled` for "tell me which succeeded."',
    },
    {
      level: 'mid',
      question: 'What does `0.1 + 0.2 === 0.3` return, and why?',
      answer:
        '`false`. JavaScript numbers are IEEE 754 doubles; `0.1` and `0.2` can\'t be represented exactly, so the sum is `0.30000000000000004`. This is true in every language using doubles (Python, Java, Ruby). For currency, store integer minor units (cents). For tolerant equality, `Math.abs(a - b) < Number.EPSILON`.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'A CPU-bound operation in an async function still freezes the UI. Why?',
      answer:
        '`async`/`await` doesn\'t change *where* code runs — it changes *when*. The async function executes on the main thread between awaits. A tight `for` loop crunching numbers inside an async function blocks the loop just as completely as a synchronous one. To actually offload work, use a Web Worker (browser) or `worker_threads` (Node).',
    },
    {
      level: 'senior',
      question: 'How would you yield to the event loop in the middle of a long task?',
      answer:
        'Break the work into chunks and `await new Promise(r => setTimeout(r, 0))` between chunks. Each yield gives the loop a chance to process microtasks, run timers, and repaint. Don\'t use `await Promise.resolve()` — that yields only to microtasks, not macrotasks, so the page still won\'t repaint. Modern `scheduler.yield()` is the cleanest API where available.',
    },
    {
      level: 'senior',
      question: 'When would you reach for `WeakMap`?',
      answer:
        'When you want to associate data with objects you don\'t own — caching by object identity, metadata on DOM nodes, private state for classes. The keys are held weakly, so when nothing else points to the key object, the entry disappears and the value can be GC\'d. Lets you "attach" data without preventing the host object from being collected. Restrictions: keys must be objects, no iteration, no size.',
    },
    {
      level: 'senior',
      question: 'What\'s the difference between `structuredClone` and `JSON.parse(JSON.stringify(x))`?',
      answer:
        '`structuredClone` handles Map, Set, Date, RegExp, typed arrays, cycles, and Blobs — JSON loses all of those. `JSON.parse(JSON.stringify(x))` also drops `undefined` values, converts Date to ISO string, skips functions and symbols, and crashes on cycles. `structuredClone` is faster and more correct in modern engines. Both downgrade class instances to plain objects.',
    },
    {
      level: 'senior',
      question: 'How do you handle async iteration and backpressure?',
      answer:
        'Async iteration (`for await...of`) pulls values on demand — the consumer asks for `next()`, the producer awaits. This naturally backpressures: a slow consumer pauses the producer. Used for streaming responses (`response.body`), Node streams, paginated APIs (async generators), and SSE. Push-based event emitters can overwhelm slow consumers; async iteration can\'t.',
    },
    {
      level: 'senior',
      question: 'How do generators differ from async generators?',
      answer:
        'A generator (`function*`) emits values on each `yield`; consumers pull with `.next()`. An async generator (`async function*`) does the same, but each `yield` can `await` first, so values arrive over time. Both pause between yields, are iterable, and can be terminated via `return()` (running `finally` blocks). Async generators power streaming APIs, paginated iterators, and event-source consumers.',
    },
    {
      level: 'senior',
      question: 'How would you handle cancellation in an async operation?',
      answer:
        'Promises can\'t be cancelled — the underlying work needs to be. Use `AbortController`/`AbortSignal`. Pass `signal` to APIs that accept it (`fetch`, async iterators, library calls); they abort the operation and the promise rejects with `AbortError`. Honor the signal in your own async code by checking `signal.aborted` at suspension points.',
    },
    {
      level: 'senior',
      question: 'How do you detect a memory leak in a Node service?',
      answer:
        'Take heap snapshots at different points in time (`v8.writeHeapSnapshot()` or via the inspector) and compare. The "Comparison" view in Chrome DevTools shows what was added. Look for: detached DOM nodes (browser), unbounded caches (Map/Set growing), unremoved event listeners on long-lived objects, timers (`setInterval`) holding closures with large captured state. `--trace-gc` shows GC activity.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'Design event-loop lag monitoring for a production Node service.',
      answer:
        '**Measure:** `perf_hooks.monitorEventLoopDelay()` gives a histogram. Export p50/p99 to metrics. Anything over ~10ms p99 affects user-facing latency.\n\n**Alert:** SLO on p99 lag. When spikes happen, capture a CPU profile (`node --prof` or clinic.js) to find the blocking stack — usually sync crypto, regex backtracking, or sync JSON.parse.\n\n**Mitigate:** replace sync APIs, cap payload sizes (`express.json({ limit: "100kb" })`), move CPU-bound work to `worker_threads`. Add load shedding: when lag exceeds threshold, return 503 so the loop catches up rather than collapsing.\n\n**Culture:** make lag a first-class SLO; engineers treat sync APIs as suspect by default.',
    },
    {
      level: 'staff',
      question: 'What is microtask starvation and how do you fix it?',
      answer:
        'Code keeps scheduling microtasks during a microtask drain, so the queue never empties and the loop can\'t advance to the next macrotask phase. Common cause: recursive `.then()` chains or `process.nextTick` loops. Diagnose: event-loop lag spikes while CPU is busy in promise machinery; a CPU profile shows deep promise resolution stacks. Fix: break the recursion with a `setTimeout(..., 0)` (yields to a macrotask) or `setImmediate` in Node, instead of `.then` or `process.nextTick`.',
    },
    {
      level: 'staff',
      question: 'How would you optimize a hot path that processes millions of objects?',
      answer:
        '**Profile first** with `--prof` or DevTools to confirm where time goes. **Then:** keep object shapes consistent (initialize all fields in constructor, never delete properties) so V8 keeps a single hidden class — monomorphic property access is dramatically faster than megamorphic. **Pack arrays** (no holes, consistent element type — SMI vs double matters). **Pool objects** if you allocate per iteration. **Avoid try/catch in hot loops** in old V8s. **Inline small functions** by letting TurboFan inline them; that means keeping them small and called with consistent types. **`--trace-deopt`** to find what\'s bailing out of optimization.',
    },
  ],
};
