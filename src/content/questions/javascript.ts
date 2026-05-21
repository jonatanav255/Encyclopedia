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

    // --- additions for new topics ---

    // junior
    {
      level: 'junior',
      question: 'How do you find an element in the DOM?',
      answer:
        '`document.querySelector(selector)` for the first match, `document.querySelectorAll(selector)` for all matches (returns a static NodeList). Selectors use CSS syntax: `.class`, `#id`, `[data-x="1"]`, `ul > li:first-child`. Older APIs (`getElementById`, `getElementsByClassName`) still work but `querySelector` is the modern default. Note: `getElementsByClassName` returns a *live* collection that updates as the DOM changes; `querySelectorAll` returns a snapshot.',
    },
    {
      level: 'junior',
      question: 'What\'s the safer alternative to `el.innerHTML = userInput`?',
      answer:
        '`el.textContent = userInput`. `innerHTML` parses the string as HTML, so any tags or `<script>` in user input execute — an XSS vulnerability. `textContent` sets the literal string as text only. If you genuinely need to render user HTML, sanitize first with **DOMPurify**: `el.innerHTML = DOMPurify.sanitize(userInput)`.',
    },

    // mid
    {
      level: 'mid',
      question: 'When would you reach for currying or composition in JavaScript?',
      answer:
        'When you have many small, named functions that compose into data pipelines: `pipe(filter(isPaid), map(addTotal), sortBy(date), take(10))`. Currying enables partial application — preconfigure a function once, slot the result into `map`/`filter` calls. Skip currying for single-argument functions (no benefit) or single-use code (just inline). Reach for `Ramda` or `lodash/fp` when you commit to the style across a codebase.',
    },
    {
      level: 'mid',
      question: 'How do you avoid stack overflow with recursive code in V8?',
      answer:
        'V8 doesn\'t implement tail-call optimization (the spec says it should; Safari does, V8/Chrome/Node don\'t). For deep recursion, you must convert to iteration with an explicit stack, or use a **trampoline** (recursive function returns a thunk; an outer loop unwraps thunks until it gets a real value). For tree/graph traversal where depth is bounded (DOM, AST, divide-and-conquer with log-n depth), plain recursion is fine. The danger is linear recursion on unbounded input.',
    },

    // senior
    {
      level: 'senior',
      question: 'How does Proxy / Reflect enable reactivity in libraries like Vue and MobX?',
      answer:
        'A `Proxy` wraps an object and intercepts every property `get`/`set`. In `get`, the library records that the current effect depends on this property (`track()`); in `set`, it notifies all dependent effects (`trigger()`). The Proxy returns a wrapped value via `Reflect.get`/`Reflect.set` so receiver/getter semantics stay correct. Result: plain object operations (`state.count = 1`) automatically re-run dependent code, with zero ceremony. Vue 3 reactivity, MobX, Solid stores, Immer drafts — all use this pattern.',
    },
    {
      level: 'senior',
      question: 'What\'s the difference between `Reflect.get(target, key, receiver)` and `target[key]` in a Proxy trap?',
      answer:
        '`Reflect.get(target, key, receiver)` correctly handles the `receiver` argument when the property is defined via `Object.defineProperty` with a getter, or when the target has a prototype chain. `target[key]` ignores the receiver. For Proxies wrapping objects with prototype-chain getters, `target[key]` returns the wrong `this` inside getters. **Rule**: in any Proxy trap, default to `Reflect.<method>(target, ...args, receiver)` instead of accessing the target directly.',
    },

    // staff
    {
      level: 'staff',
      question: 'Build a custom EventEmitter with Proxy semantics — what\'s the case for and against?',
      answer:
        '**For**: a `Proxy`-based emitter lets consumers write `emitter.userSignedUp.emit(user)` and `emitter.userSignedUp.on(handler)` — the proxy generates each event\'s API lazily. Cleaner API surface, no string-typo bugs, TypeScript can declare the shape of available events. Used by some modern libraries (event-emitter-like APIs in test mocks, RxJS-style typed event streams).\n\n**Against**: the Proxy adds overhead per access; static type generation is more complex; debugging is harder (stack traces show through the proxy); the implicit "generate handler bag on first access" can lead to memory holding stale event keys. For high-volume internal eventing, the built-in `EventEmitter` is simpler and faster.\n\nFor library APIs aimed at developer ergonomics where event volumes are modest (UI events, lifecycle hooks), Proxy-backed event objects are a clean choice. For service-internal pub/sub at scale, the plain emitter wins.',
    },

    // --- additional questions ---

    // junior
    {
      level: 'junior',
      question: 'Why does `typeof null` return `"object"`?',
      answer:
        'A bug from JavaScript\'s earliest days that became part of the spec. Original values were tagged in memory with a type bit; `null` was the all-zeros pointer, which collided with the object type tag. By the time the bug was found, fixing it would break the web. So it stays. Use `value === null` to check for null specifically; use `value == null` to catch both null and undefined.',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between `==` and `===`?',
      answer:
        '`===` checks **strict equality** — same type AND same value. `==` checks **loose equality** — coerces types before comparing. `0 == "0"` is true (string coerced to number); `0 === "0"` is false. Loose equality has surprising rules (`null == undefined` but `null !== 0`; `[] == false` but `[] !== false`). Use `===` always except the one idiom: `x == null` to check for null OR undefined together.',
    },

    // mid
    {
      level: 'mid',
      question: 'How would you deep-clone an object in modern JavaScript?',
      answer:
        '`structuredClone(obj)` — built into the runtime, handles cycles, dates, regexps, typed arrays, sets, maps. The right answer for 2026. Older patterns: `JSON.parse(JSON.stringify(obj))` works for plain JSON-safe data but loses functions, undefined values, Symbols, Dates (becomes string), Maps/Sets, and throws on cycles. `_.cloneDeep` (lodash) is heavier but handles more cases. For React state, prefer **shallow clones with spread** (`{...obj, name: "new"}`) — cheaper and avoids the "deep clone destroys referential equality everywhere" perf trap.',
    },
    {
      level: 'mid',
      question: 'When does `await` inside a loop hurt performance?',
      answer:
        'When the iterations are independent. `for (const id of ids) { await fetch(...) }` runs requests **serially** — N times the latency. If the requests don\'t depend on each other, use `await Promise.all(ids.map(id => fetch(...)))` to fire them in parallel — total time is just the slowest one. Watch for: rate limits (too many parallel may get throttled — use `p-limit` for bounded concurrency); order dependence (if iteration N+1 needs the result of N, you must await sequentially).',
    },

    // senior
    {
      level: 'senior',
      question: 'A function in a tight loop allocates a new object per iteration. What\'s the performance impact?',
      answer:
        'Two effects. (1) **GC pressure**: each allocation grows the young generation; eventually triggers a minor GC pause. Many small allocations = frequent pauses = jitter in latency-sensitive code. (2) **Hidden class transitions**: if objects vary in shape (added properties in different orders), V8 can\'t optimize property access — accesses fall back to slow paths.\n\nFixes: (1) **Object pooling** — reuse a small pool of pre-allocated objects (`const pool = []`). Common in game engines. (2) **Stable shapes** — initialize all properties in the same order, don\'t delete properties. (3) **Avoid object creation in the hot loop** — pass scalars or reuse the same object as a scratch buffer. For most app code, GC is fine; only profile-confirmed hot paths need this attention.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design a request-deduplication layer for a JavaScript SDK that makes thousands of API calls per minute.',
      answer:
        '**Goal**: identical concurrent requests should hit the API once. Subsequent identical requests within a short window (~50-500ms) reuse the in-flight or recently-resolved promise.\n\n**Implementation sketch**:\n\n```js\nconst inflight = new Map();\nconst recent = new LRUCache({ max: 500, ttl: 200 });\n\nasync function fetchDedup(url, options) {\n  const key = `${url}::${JSON.stringify(options)}`;\n  if (recent.has(key)) return recent.get(key);\n  if (inflight.has(key)) return inflight.get(key);\n  const promise = fetch(url, options).then(r => r.json());\n  inflight.set(key, promise);\n  try {\n    const result = await promise;\n    recent.set(key, result);\n    return result;\n  } finally {\n    inflight.delete(key);\n  }\n}\n```\n\n**Key decisions**:\n- **Cache key**: URL + serialized options. Order-stable serialization required (sort object keys).\n- **In-flight Map**: deduplicates concurrent requests during a fetch.\n- **Recent LRU**: deduplicates near-instant repeated calls (debounces "click button twice").\n- **TTL ~200ms**: balances "feels instant when repeated" vs "shows fresh data on user retry."\n\n**For mutations**: dedupe by `Idempotency-Key` header from the caller, not by URL — POST `/charges` should not silently return a cached result.\n\n**Failed requests** shouldn\'t be cached (retry might succeed). Honor `AbortSignal` to cancel both the request and clear the in-flight entry.\n\n**Comparable libraries**: TanStack Query implements this internally; SWR\'s deduper does the same. For a custom SDK, this 20-line version is enough.',
    },

    // --- classes-deep ---
    {
      level: 'junior',
      question: 'What does `class` give you that a plain function constructor does not?',
      answer:
        'Three things. (1) The body runs in strict mode automatically. (2) Methods are non-enumerable (`for...in` skips them), unlike `function.prototype.method = ...`. (3) The class can\'t be called without `new` — `Foo()` throws, `new Foo()` works. Everything else is essentially sugar over prototypes.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between `#private` fields and a `_underscore` convention?',
      answer:
        '`#private` is enforced by the language: `obj.#x` outside the declaring class is a `SyntaxError`, not `undefined`. The field doesn\'t exist as a property name, so `Object.keys`, `Reflect.ownKeys`, and `JSON.stringify` all skip it. Subclasses can\'t access parent private fields either. `_underscore` is purely a hint — anything can read or overwrite it. Use `#` when you actually need invariants protected.',
    },
    {
      level: 'mid',
      question: 'Why does this print `undefined` instead of `\'c\'`? `class P { constructor(){ this.tag() } tag(){} } class C extends P { kind = \'c\'; tag(){ console.log(this.kind) } } new C()`',
      answer:
        'Subclass field declarations run **after** the parent constructor body. The parent\'s `constructor` calls `this.tag()`, which dispatches to the child override, which reads `this.kind` — but `kind` hasn\'t been declared yet because the child\'s field init hasn\'t run. Same trap as calling virtual methods from a constructor in Java/C#. Fix: don\'t call overridable methods from a constructor, or initialize the field in the parent.',
    },
    {
      level: 'senior',
      question: 'What\'s `new.target` and when would you use it?',
      answer:
        'Inside a constructor (or function called with `new`), `new.target` is the constructor that was invoked with `new` — `undefined` if no `new`. Useful for: (1) **abstract classes** — `if (new.target === Base) throw new Error(\'abstract\')` blocks direct instantiation but allows subclasses; (2) **factory detection** — branch on whether a function was called as a constructor; (3) **dispatch** — `new.target.name` gives the runtime class name without `this.constructor.name` round-tripping.',
    },

    // --- symbols ---
    {
      level: 'mid',
      question: 'What\'s the difference between `Symbol(\'x\')` and `Symbol.for(\'x\')`?',
      answer:
        '`Symbol(\'x\')` creates a brand-new symbol that\'s unique to that call — two `Symbol(\'x\')` are not equal. `Symbol.for(\'x\')` looks up (or creates) a symbol in a global registry, keyed by the string — so two `Symbol.for(\'x\')` calls return the same value, including across realms (workers, iframes, vm contexts). Use `Symbol.for` for protocol identifiers that need to mean the same thing everywhere; use plain `Symbol` for "I want a value nobody else can collide with."',
    },
    {
      level: 'senior',
      question: 'How do you make `for...of` work on a custom class?',
      answer:
        'Implement `[Symbol.iterator]()` returning an iterator (an object with a `next()` method that returns `{ value, done }`). The easiest path is to make it a generator method: `*[Symbol.iterator]() { yield 1; yield 2; }`. Once implemented, the class also works with spread (`[...obj]`), destructuring (`const [a, b] = obj`), `Array.from(obj)`, and any built-in that consumes iterables (`Map`, `Set`, `Promise.all`).',
    },
    {
      level: 'senior',
      question: 'Are symbol-keyed properties truly private?',
      answer:
        'No. They\'re hidden from `Object.keys`, `for...in`, and `JSON.stringify`, but `Object.getOwnPropertySymbols(obj)` returns them, and `Reflect.ownKeys(obj)` includes them. They\'re *unenumerable by accident* but visible to deliberate inspection. For real privacy, use `#private` class fields. Use symbols when you want to avoid name collisions and skip serialization, not when you need invariants protected.',
    },

    // --- maps & sets ---
    {
      level: 'junior',
      question: 'When should you use a `Map` instead of a plain object?',
      answer:
        'When keys aren\'t strings (objects, numbers, functions); when keys come from untrusted input (prototype pollution risk with `__proto__` and friends); when you read `.size` often; when you iterate frequently (Maps are optimized for it). Plain objects are still right for fixed structs with known keys (`{ host, port }`) and when you need JSON serialization.',
    },
    {
      level: 'mid',
      question: 'Why does `map[key] = value` not work the way you might expect?',
      answer:
        'It sets a regular property on the Map *object*, not an entry in the map\'s key-value store. The lookup uses `===` against a string property name, so an object key won\'t round-trip. Always use `map.set(key, value)` and `map.get(key)`. Same for Set — use `.add` / `.has`, not bracket access.',
    },
    {
      level: 'mid',
      question: 'How do you group an array by a derived key in modern JavaScript?',
      answer:
        '`Object.groupBy(items, (item) => key(item))` (ES2024) returns a plain object keyed by the result. `Map.groupBy(items, fn)` returns a Map — better when keys aren\'t strings or you need guaranteed iteration order. Both shipped broadly in 2024 across V8, JavaScriptCore, and SpiderMonkey. Pre-2024 code used `reduce`, which still works.',
    },

    // --- typed arrays & binary ---
    {
      level: 'mid',
      question: 'Why use a `Uint8Array` instead of a regular `Array` for byte data?',
      answer:
        'A regular `Array` holds *any* value and uses boxed numbers — each element is a full JS value with overhead. `Uint8Array` is a fixed-size view over an `ArrayBuffer` of raw bytes; each element is exactly one byte. Vastly less memory, JIT-optimized for math, interops with `crypto`, `fetch`, `fs`, WebAssembly, and Buffer (in Node). For anything binary — hashes, image data, protocol frames — typed arrays are the right tool.',
    },
    {
      level: 'senior',
      question: 'What\'s the difference between `Uint8Array.prototype.slice` and `subarray`?',
      answer:
        '`slice(begin, end)` copies the bytes into a new `ArrayBuffer` — independent of the parent. `subarray(begin, end)` creates a new view over the *same* underlying buffer — O(1), no copy, and mutations through one view are visible through the other. Use `subarray` in streaming/parsing pipelines where you want zero-copy windows; use `slice` when you need a buffer the parent can drop independently.',
    },
    {
      level: 'senior',
      question: 'When would you use `SharedArrayBuffer` over a regular `ArrayBuffer`?',
      answer:
        'When threads (Web Workers, Node `worker_threads`) need to read/write the same memory without `postMessage` copies. A regular `ArrayBuffer` is single-owner — sending it copies (or transfers and detaches). `SharedArrayBuffer` is genuinely shared, and concurrent access needs `Atomics` for correctness (atomic ops, `wait`/`notify` for blocking). Browser usage requires COOP/COEP headers (cross-origin isolation, post-Spectre lockdown). Node has no such requirement.',
    },

    // --- json deep ---
    {
      level: 'junior',
      question: 'What happens when `JSON.stringify` encounters `undefined`, a function, or a symbol?',
      answer:
        'In an **object value position**, the key is silently omitted: `JSON.stringify({a: undefined}) === \'{}\'`. In an **array slot**, the value becomes `null` to preserve length: `JSON.stringify([undefined]) === \'[null]\'`. BigInt is the exception — it throws `TypeError`. The drop-vs-null asymmetry is a common source of bugs when round-tripping data.',
    },
    {
      level: 'mid',
      question: 'You serialize an object with `JSON.stringify` and a Date round-trips as a string. Why?',
      answer:
        '`Date.prototype.toJSON()` returns an ISO string, and `JSON.stringify` calls `toJSON()` if present. On the way back, `JSON.parse` has no symmetric hook — it always returns plain primitives, plain objects, plain arrays. To rehydrate Dates, pass a `reviver`: `JSON.parse(s, (k, v) => k === \'createdAt\' ? new Date(v) : v)`. Same pattern for BigInts, Maps, or any custom type — you have to bring revival yourself.',
    },
    {
      level: 'senior',
      question: 'Why is `JSON.stringify(obj)` a bad way to deep-clone?',
      answer:
        'It silently drops `undefined`, functions, and symbol-keyed properties; loses class prototypes (instances become plain objects); throws on cycles; throws on BigInt; turns Dates into strings, Maps/Sets into `{}` and `[]`; and turns `NaN`/`Infinity` into `null`. Use `structuredClone(obj)` instead — built-in, handles cycles, preserves Date/Map/Set/RegExp/TypedArray. The one thing `structuredClone` doesn\'t clone is functions, but neither does JSON.',
    },

    // --- tagged templates ---
    {
      level: 'mid',
      question: 'What\'s the point of tagged template literals?',
      answer:
        'They separate the **static template** (from your source) from the **dynamic interpolations** (potentially untrusted). A tag function receives the strings array and values separately, so it can escape, validate, or transform interpolations while leaving the static template alone. That separation is the basis of every safe-HTML (`lit-html`), safe-SQL (`postgres.js`), GraphQL (`gql`), and CSS-in-JS (`styled`) library. Plain template literals can\'t express this trust boundary.',
    },
    {
      level: 'senior',
      question: 'Why can libraries like `gql` and `styled-components` cache parsed output by the strings array?',
      answer:
        'The strings array passed to a tagged template is **interned** — the same call site always passes the same array (reference-equal). So a library can use `strings === lastStrings` as a cache check: parse the GraphQL query (or CSS) once, look it up by identity afterward. No hashing needed. This is why `styled.div\`...\`` is cheap to evaluate on every render and why `gql\`...\`` parses each query exactly once per module load.',
    },

    // --- rendering patterns / streaming JSON (cross-topic) ---
    {
      level: 'senior',
      question: 'When does SSR beat SSG, and when is it the wrong choice?',
      answer:
        '**SSR wins** when content varies per request (logged-in user data, geo-targeted pricing) — you can\'t pre-build a page that depends on the visitor. **SSG wins** when content is shared across visitors and changes infrequently (docs, marketing, blog) — a CDN serves the file in single-digit ms with zero per-request cost. Default to SSG; reach for SSR only when per-request data is essential. ISR (hybrid) covers the middle: mostly static, occasionally revalidated.',
    },
    {
      level: 'senior',
      question: 'You\'re streaming a 2 GB JSON array from a third-party API. How do you process it without OOMing?',
      answer:
        'Don\'t `await res.json()` — it buffers the whole body before parsing. Stream the response body through a JSON parser like `stream-json`: `Readable.fromWeb(res.body).pipe(parser()).pipe(streamArray())`, then `for await` over the records. Process each record (insert to DB, push to Kafka, write to file) inside the loop — don\'t accumulate into an array, or you\'ve recreated the memory problem. Memory stays flat at one record. If you control the producer, push them toward NDJSON instead — line-delimited JSON is streamable with `readline` and no parser library.',
    },

    // --- algebraic data types ---
    {
      level: 'mid',
      question: 'What does a `Result<T, E>` type give you that `try/catch` doesn\'t?',
      answer:
        'It moves the error channel into the **return value** so the caller can\'t miss it. `try/catch` hides errors in a side channel — the function signature says it returns `T`, but it might throw, and you only learn that by reading the body or hitting it at runtime. `Result` makes the error part of the type: `{ok: true, value} | {ok: false, error}`. In TypeScript, `Result<T, ParseError | ValidationError>` enforces handling at compile time; `throws` doesn\'t. Use it for *expected* errors (validation, parse, not-found) — keep exceptions for genuinely unexpected state.',
    },
    {
      level: 'senior',
      question: 'Why would you use `Task` instead of `Promise`?',
      answer:
        '`Promise` runs **eagerly** the moment you construct it — `new Promise((res) => fetch(...))` fires the fetch immediately. `Task` (a `Promise`-returning thunk) defers execution until you call `.run()`. That laziness matters for: **retries** (re-running a Task re-runs the effect; re-awaiting a Promise returns the cached resolution), **composition** (build a pipeline without executing it, then decide whether to run), and **cancellation** (a Task you haven\'t run is trivially cancelled). For typical app code, eager Promises are fine. Tasks earn their keep in libraries that need referential transparency or composable retries.',
    },

    // --- transducers ---
    {
      level: 'senior',
      question: 'What problem do transducers solve over chained `.map().filter().reduce()`?',
      answer:
        '`.map().filter()` allocates an intermediate array at each step and walks the data multiple times. For a 10M-row pipeline that\'s 3 passes and 2 large allocations. A transducer is a *reducer transformer* — `mapping(f)(reducer)` returns a new reducer that maps before reducing. Composed transducers (`compose(mapping(f), filtering(p))`) collapse the pipeline into **one pass with no intermediates**, while keeping the readable shape. They also work over any reducible — arrays, iterables, async iterators, custom collections — so the same pipeline can run over a stream you couldn\'t `.map()` at all. For small N (< 1k), plain `.map().filter()` is fine.',
    },

    // --- scope-chain cost ---
    {
      level: 'mid',
      question: 'Why is `with` banned in strict mode?',
      answer:
        '`with (obj) { console.log(x) }` introduces dynamic name resolution — `x` could be `obj.x` or an outer-scope `x`, and the engine can\'t know until runtime. That defeats every scope-analysis optimization V8 wants to do. Strict mode bans it because it broke performance in every engine and gave up nothing important in exchange. `eval` in non-strict (direct) form has the same problem — it can introduce bindings into the enclosing scope, so the optimizer has to treat the whole function as dynamic. Use indirect eval (`(0, eval)(s)`) if you must eval at all; it runs in global scope without tainting the caller.',
    },
    {
      level: 'mid',
      question: 'When does replacing an `if`/`else if` chain with an object lookup actually win?',
      answer:
        'Around **5+ cases**, and especially when you\'re mapping discrete keys (enum/status strings) to fixed values or handlers. The chain walks branches linearly; the lookup is O(1) hash. Beyond perf, the table version is shorter, makes the cases first-class data (mergeable, generateable), and eliminates the "did I forget a return?" risk. For ~3 cases, the `if` chain reads more clearly. Use `Map` instead of `{}` when keys aren\'t strings or come from untrusted input. For "dispatch to a function," same shape: `(HANDLERS[type] ?? handleUnknown)(payload)`.',
    },
    {
      level: 'senior',
      question: 'You see a hot function allocating a regex on every call. Why does it matter and what\'s the fix?',
      answer:
        '`const RE = /.../` inside a function body **allocates a new `RegExp` object every invocation**. In a tight loop or a per-request handler, that\'s GC pressure plus the regex\'s internal state setup (compiled bytecode is cached by V8 for literals, but the wrapper object isn\'t). Fix: hoist the literal to module scope so it\'s allocated once at load time. Same applies to lookup tables, option objects, and any non-primitive literal in a hot path. Doesn\'t matter for primitives — those are typically constant-folded by the optimizer.',
    },

    // --- memoization (extension to currying-and-composition) ---
    {
      level: 'mid',
      question: 'What\'s wrong with this memoizer? `function memo(fn) { const cache = new Map(); return (x) => cache.has(x) ? cache.get(x) : cache.set(x, fn(x)).get(x); }`',
      answer:
        'Three problems. (1) **Single primitive key only** — fails for multi-arg functions and produces wrong cache hits for object args (object keys would use reference identity, which rarely matches across calls). (2) **Unbounded growth** — the `Map` lives forever; one-shot inputs leak memory in a long-running process. Use an LRU cache (`lru-cache`) with a `max` cap. (3) **Assumes the function is pure** — if `fn` reads env vars, `Date.now()`, mutates input, or depends on external state, the cache returns wrong values. Memoize only genuinely pure functions, or accept staleness with an explicit TTL.',
    },
    {
      level: 'senior',
      question: 'When should you use a `WeakMap` for a memoization cache instead of a `Map`?',
      answer:
        'When the cache key **is** an object that the caller owns. A `Map` keyed by an object holds a strong reference forever — the object can never be GC\'d as long as it\'s a key. `WeakMap` ties the cache entry\'s lifetime to the key: when the caller drops the object, the GC reclaims both and the entry vanishes. Pattern: `const cache = new WeakMap(); function f(obj) { if (cache.has(obj)) return cache.get(obj); const r = compute(obj); cache.set(obj, r); return r; }`. Works only for single-object-arg functions (WeakMap keys must be objects, no iteration, no size). For multi-arg or scalar-keyed memoization, fall back to LRU.',
    },

    // --- async iterator cleanup ---
    {
      level: 'senior',
      question: 'Your custom async iterator wraps a database cursor. A caller `break`s out of the `for await` loop early. What goes wrong?',
      answer:
        'The cursor never closes. The async iterator protocol has three methods: `next()`, `return()`, and `throw()`. When a consumer breaks early or throws inside the loop, the runtime calls `iterator.return()` to signal "I\'m done, clean up." If you didn\'t implement `return()`, the cursor leaks — connection stays open, lock stays held. Fix: either implement `async return() { await cursor.close(); return { done: true }; }` on the object, or use an `async function*` generator with `try/finally` — the runtime calls `return()` for you, which translates to running the `finally` block. The generator form is almost always cleaner.',
    },
  ],
};
