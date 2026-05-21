import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'react',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'What is JSX?',
      answer:
        'A syntax extension that looks like HTML inside JavaScript. At build time it compiles to function calls — `<h1>Hello</h1>` becomes `jsx(\'h1\', { children: \'Hello\' })`. Curly braces re-enter JavaScript: `{name}` interpolates a value. Capitalized tags (`<Button />`) are React components; lowercase (`<button />`) are HTML elements.',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between props and state?',
      answer:
        '**Props** are read-only data passed into a component from its parent. **State** is data the component owns and can change over time via setters. State changes trigger re-renders. Components are pure functions of their props and state — given the same inputs, they always produce the same output.',
    },
    {
      level: 'junior',
      question: 'Why does my React app re-render when I `arr.push(item)` on a state array?',
      answer:
        'It doesn\'t — that\'s the bug. State updates require **new references**. Mutating the existing array doesn\'t change its identity, so React\'s diff sees no change and skips the re-render. Use `setItems([...items, newItem])` or `setItems(items.filter(...))` to create new arrays.',
    },
    {
      level: 'junior',
      question: 'What happens when you call setState with the same value?',
      answer:
        'React compares the new value to the current with `Object.is`. If equal, React **bails out** — no re-render. For primitives this is exact-value comparison; for objects/arrays it\'s reference comparison. That\'s why mutating an object and calling `setState(sameObj)` doesn\'t re-render.',
    },
    {
      level: 'junior',
      question: 'Why do you need `key` on list items?',
      answer:
        'React uses keys to match new list items to previous ones across renders. With stable keys, it knows "this item moved from index 0 to 5" and moves the DOM node, preserving state, focus, animations. Without (or with index keys on a reorderable list), React matches by position and bugs appear: inputs lose focus, animations restart, state corrupts.',
    },
    {
      level: 'junior',
      question: 'When does an event handler reference a stale state value?',
      answer:
        'When the handler is captured at an earlier render and the state has since changed. Classic example: `setInterval` inside `useEffect(() => {...}, [])` captures `count` at mount and never sees updates. Fix with the functional setter: `setCount(c => c + 1)` always receives the latest value.',
    },
    {
      level: 'junior',
      question: 'Why doesn\'t this fire? `<button onClick={handleClick()}>...`',
      answer:
        'You\'re *calling* `handleClick` during render, passing its return value (usually `undefined`) as the click handler. The button effectively has no handler. Use `onClick={handleClick}` (reference) or `onClick={() => handleClick()}` (arrow that calls it on click).',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'When should you reach for `useEffect`?',
      answer:
        'When you need to synchronize React state with something *outside* React — DOM, subscriptions, timers, third-party libraries, global event listeners. NOT for: data fetching (use a query library), derived data (just compute it), reacting to user actions (handle in the event), or resetting state when a prop changes (use `key` to remount).',
    },
    {
      level: 'mid',
      question: 'Why does `useEffect` run twice in development?',
      answer:
        'React 18+ Strict Mode deliberately double-invokes effects to surface uncleanable setup. The intent: any effect should work correctly when remounted. If your effect adds a subscription without cleanup, the second mount adds a duplicate. The fix is to return a cleanup function, not to disable strict mode. In production, effects run once per mount.',
    },
    {
      level: 'mid',
      question: 'When would you use `useReducer` instead of `useState`?',
      answer:
        'When state has multiple fields that update together, when updates depend on previous state, or when you want all transitions in one testable pure function. Each `dispatch({ type, payload })` is explicit about intent. Pair with discriminated-union TypeScript types for exhaustive checks. For more than a handful of related setters, `useReducer` scales better.',
    },
    {
      level: 'mid',
      question: 'What problem does `useContext` solve, and what new problem does it create?',
      answer:
        'It solves prop drilling — distributing a value to deeply nested descendants without manual prop passing. The new problem: every consumer re-renders when the context value changes, even if they\'d only care about one piece. Mitigate by splitting state and dispatch into separate contexts, memoizing the value object, or using a state library with selectors when fine-grained subscriptions matter.',
    },
    {
      level: 'mid',
      question: 'What\'s the difference between controlled and uncontrolled inputs?',
      answer:
        '**Controlled**: React state drives the input (`value={x} onChange={setX}`). Every keystroke updates state. You can validate, transform, or restrict live. **Uncontrolled**: the DOM owns the value (`defaultValue=`, read via ref or `FormData`). Faster for large forms (no re-render per keystroke). File inputs are always uncontrolled. Libraries like `react-hook-form` are uncontrolled under the hood for performance.',
    },
    {
      level: 'mid',
      question: 'When is using the array index as a key okay?',
      answer:
        'When the list never reorders, filters, or inserts at the start/middle (only appends at the end), AND items have no local state/inputs/animations. If any of those change, index keys cause React to misalign items — text gets moved to the wrong row, inputs lose focus. Use a real ID from your data when in doubt.',
    },
    {
      level: 'mid',
      question: 'What does `useRef` give you that `useState` doesn\'t?',
      answer:
        'A mutable value that persists across renders but **doesn\'t trigger re-renders** when changed. Use cases: DOM node access (`ref={ref}`), storing timer IDs, tracking previous values, caching non-rendered data. Mutating `ref.current` is fine and immediate (unlike setState, which is async and replaces).',
    },
    {
      level: 'mid',
      question: 'How do you reset a component\'s state when a prop changes?',
      answer:
        'Use `key` to force a remount: `<Form key={selectedUser.id} user={selectedUser} />`. When `id` changes, React unmounts the old form (state, inputs, scroll position all reset) and mounts a fresh one. Cleaner than manual reset logic inside an effect. The official React docs explicitly recommend this over "syncing in useEffect."',
    },
    {
      level: 'mid',
      question: 'What\'s a custom hook and when should you extract one?',
      answer:
        'A function whose name starts with `use` that calls other hooks. Extract when the same hook combination appears in 3+ components, when complex logic deserves a name, or when wrapping a third-party imperative API. Don\'t extract for one-off use or pure logic that doesn\'t need state/effects/refs — a plain function is enough.',
    },
    {
      level: 'mid',
      question: 'Why do you sometimes need `useCallback` on a handler?',
      answer:
        'When the handler is passed to a memoized child (`React.memo`) or used as a dependency of another hook. Without `useCallback`, the function is a new reference each render — defeating `React.memo` and re-triggering `useEffect`. For regular DOM elements, `useCallback` adds overhead without benefit; skip it.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'When does `React.memo` actually help, and when does it hurt?',
      answer:
        '**Helps** when: the component has expensive rendering, props are mostly stable, and it\'s rendered often (long lists). **Hurts** when: rendering is trivial — the memo check costs more than the render. Also useless if parents pass new object/function references every render (defeats the shallow comparison). Profile first with React DevTools to find the actual bottlenecks.',
    },
    {
      level: 'senior',
      question: 'What problem do `useTransition` and `useDeferredValue` solve?',
      answer:
        'They mark certain state updates as **lower priority** so React can interrupt them when more urgent work arrives. Classic case: a search input where typing must stay snappy while filtering thousands of items can lag. `useTransition` wraps the lower-priority setter calls; `useDeferredValue` defers a value\'s update at the consumer side. Both rely on React 18+ concurrent rendering.',
    },
    {
      level: 'senior',
      question: 'How does Suspense change how you write loading UI?',
      answer:
        'Components don\'t return loading states — they "suspend" by throwing a promise via `use(promise)` or a Suspense-aware data library. The nearest `<Suspense fallback={...}>` ancestor renders the fallback. Pair with an error boundary for the failure case. Result: declarative loading without manual `loading={true}` flags, plus streaming SSR support out of the box.',
    },
    {
      level: 'senior',
      question: 'Why do you need an error boundary in a real app?',
      answer:
        'An uncaught error during render unmounts the entire React tree — blank page. An error boundary catches the throw and shows a fallback while the rest of the app keeps working. Place at multiple levels (root for fatal errors, per-feature for graceful degradation). Pair with `react-error-boundary` for a hook-style API plus reset support. Doesn\'t catch event handlers, async code, or SSR errors — handle those with try/catch.',
    },
    {
      level: 'senior',
      question: 'What\'s the right way to handle a list of 10,000 items in React?',
      answer:
        '**Virtualize.** Only render the visible items plus a small buffer. Libraries: `react-window`, `@tanstack/react-virtual`, `react-virtualized`. With virtualization, the DOM has ~30 nodes regardless of list size; React only renders/diffs those. Without it, every state change re-renders all 10,000 — guaranteed jank. Bonus: memoize the row component with `React.memo` + stable handler refs.',
    },
    {
      level: 'senior',
      question: 'What changes with React Server Components?',
      answer:
        'Components are **server-by-default**. Server components run on the server, can `await` data directly (database, files), have their JS stripped from the client bundle. Client components are marked with `\'use client\'` and run in the browser — they handle state, effects, events. The boundary is one-way: server can render client, not vice versa. Result: smaller bundles, simpler data flow, no client/server API layer for internal needs.',
    },
    {
      level: 'senior',
      question: 'How does React\'s reconciliation algorithm decide what to update?',
      answer:
        'Two heuristics: (1) Elements of **different types** unmount and remount fully (`<div>` → `<section>` destroys the div). (2) Elements of the **same type** update props on the existing DOM node, recursively. For lists, children are matched by `key`; without keys, by position. Component identity is what preserves state across renders — keep the same component type at the same position to keep its state.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'How would you structure state for a complex app (5+ devs, growing UI complexity)?',
      answer:
        'Three orthogonal stores, separated by lifetime: (1) **Server data** — TanStack Query / SWR. They cache, dedupe, refetch on focus, handle stale-while-revalidate. Don\'t manually `useState` API responses. (2) **URL state** — query params, route params. The router is the source of truth for "what page am I on." (3) **Local UI state** — Zustand or Jotai for app-wide UI (modals, theme), `useState` for component-local. Avoid putting server data in Redux/Zustand — you\'ll reinvent half of TanStack Query badly. Per page, lift `useState` to a single owner; everything else flows down via props or queries.',
    },
    {
      level: 'staff',
      question: 'Your React app has 200ms input lag in a search box. How do you diagnose and fix?',
      answer:
        '**Profile**: React DevTools Profiler → record a session of typing → see which components re-render and how long. Usually one or two heavy renders dominate.\n\n**Fix candidates, in order:**\n1. Don\'t store derived data in state — compute it on the fly. If you have `useEffect(() => setFiltered(filter(items)), [items, query])`, replace with a direct `const filtered = useMemo(() => filter(items), [items, query])`.\n2. `useTransition` on the filter update so the input stays snappy.\n3. `React.memo` + `useCallback` on heavy list rows.\n4. Virtualize the list (`react-virtual`).\n5. Move computation off the main thread (Web Worker).\n\nMost real-world cases resolve at step 1 or 2 — wrong state shape, not actual computation cost.',
    },
    {
      level: 'staff',
      question: 'How would you handle authentication and protected routes in a modern React app?',
      answer:
        '**Auth state** in a `useAuth` hook that wraps a context (user, role, login, logout). On boot, validate the session/token with the server; surface `loading` while validating.\n\n**Protected routes** as a wrapper component (or router loader/guard): if not authenticated, redirect to `/login`. If authenticated but not authorized for the route, show 403.\n\n**Tokens**: prefer HttpOnly cookies for session — JS can\'t read them, mitigating XSS. If using JWT in localStorage, accept the XSS risk and never put refresh tokens there.\n\n**SSR/server components**: validate the session server-side (cookie passed in the request); pass user info down to client components via props or a server-injected context.\n\n**Refresh**: refresh tokens on a background interval or transparently on 401 in your fetch wrapper. Avoid auth state lag in the UI.\n\n**Testing**: MSW handlers for `/auth/me`, `/login`, `/logout`. Component tests render protected routes with a mocked authenticated context.',
    },

    // --- additions for new topics ---

    // junior
    {
      level: 'junior',
      question: 'Why does React use a virtual DOM instead of updating the real DOM directly?',
      answer:
        'Directly updating the DOM on every change is expensive — each touch can trigger layout, paint, and synchronous reflow. React builds a lightweight tree of objects (the virtual DOM / fiber tree) in memory, computes the diff between the new tree and the previous one, and applies only the **minimum set of mutations** to the real DOM. The win isn\'t that virtual DOM is "faster than the DOM" — it\'s that batching changes and minimizing mutations is faster than naïve "update everything on every event."',
    },
    {
      level: 'junior',
      question: 'You added `useEffect(() => { fetch(url).then(setData); }, [id])` and the data sometimes shows the wrong user. Why?',
      answer:
        'Race condition. If `id` changes from 1 to 2 while the request for 1 is still in flight, both fetches resolve and the slower one (potentially for the older id) wins, overwriting state. Fix with a cleanup flag: `let cancelled = false; ... if (!cancelled) setData(...);` plus `return () => { cancelled = true; }`. Or use `AbortController`. Or use a data library (TanStack Query, SWR) that handles this for you.',
    },

    // mid
    {
      level: 'mid',
      question: 'What is React Fiber and why does it matter?',
      answer:
        'Fiber is React\'s reconciler architecture (since React 16). Replaces the old recursive renderer with a work-loop approach: each piece of work is a "fiber" (a JS object); React processes them one at a time and can **pause between fibers** to let the browser handle animation or input, then resume. Enables time-slicing, concurrent rendering, and `useTransition`. Two trees (current + work-in-progress) let React build the new tree atomically and commit it all at once — users never see half-rendered state.',
    },
    {
      level: 'mid',
      question: 'When would you reach for TanStack Query over plain `useEffect`-based fetching?',
      answer:
        'Any app that fetches data more than trivially. TanStack Query handles caching by `queryKey`, race-condition protection, cancellation, background refetch on focus/reconnect/mount, stale-while-revalidate, mutations with optimistic updates, DevTools — all things you\'d eventually reinvent badly. For 2026 React, `useEffect + fetch` is for tutorials; real apps use a data layer.',
    },

    // senior
    {
      level: 'senior',
      question: 'Why does React run effects twice in development?',
      answer:
        'Strict Mode double-invokes effects to surface uncleanable setup. The intent: any effect should work correctly when mounted, unmounted, and re-mounted. If your effect adds a subscription without cleanup, the second mount adds a duplicate; you notice immediately. The fix is **always return a cleanup function** from the effect, not to disable Strict Mode. In production, effects run once per mount. The double-invocation in dev is rehearsing a scenario (component remount via key change, hot reload, future React behavior) that can happen in production.',
    },
    {
      level: 'senior',
      question: 'When you add `React.memo` to a component, why does it sometimes not prevent re-renders?',
      answer:
        '`React.memo` does a **shallow comparison of props**. If the parent passes a new object or function reference each render — `<Memoed config={{ url }} />` or `<Memoed onClick={() => ...} />` — the prop "changes" by reference every time, defeating memo. Two fixes: (1) `useMemo`/`useCallback` in the parent to stabilize references. (2) `React.compiler` (when adopted) auto-memoizes. Memo also doesn\'t help when context changes — `React.memo` checks props only; context updates re-render consumers regardless.',
    },

    // staff
    {
      level: 'staff',
      question: 'Design a data-fetching strategy for a modern Next.js App Router (or React Router v7 / TanStack Start) application.',
      answer:
        '**Server components fetch directly.** No `useEffect`, no client cache for initial data: `export default async function Page() { const user = await db.users.findById(id); return <UserView user={user} />; }`. The server fetches; the result streams to the client; first paint shows real data.\n\n**Suspense for streaming.** Wrap each independent section in `<Suspense fallback={<Skeleton />}>` so fast sections render first, slow ones replace skeletons as data arrives. Avoid a single root spinner.\n\n**Client-side TanStack Query** for interactive data (real-time updates, polling, optimistic mutations, infinite scroll). Initial state hydrated from server fetch via `HydrationBoundary`; client-side from then on.\n\n**Server actions for mutations.** `\'use server\'` functions called from `<form action={...}>` or via the typed RPC pattern. Skip the JSON-API layer for internal use.\n\n**`revalidatePath` / `revalidateTag`** after mutations to invalidate server-rendered pages; TanStack Query\'s invalidate for client-side caches. Two cache layers; both need explicit invalidation.\n\n**Edge cases**: stale-while-revalidate for slow but tolerable data; aggressive caching on truly static (CDN-friendly) routes; long-running streaming responses (LLM token streams) via SSE outside of the RSC layer.\n\nThe result: SEO-friendly server rendering + interactive client behavior, with one data layer per concern and no rendering waterfalls.',
    },

    // --- additional questions ---

    // junior
    {
      level: 'junior',
      question: 'Why does React require a `key` prop on list items?',
      answer:
        'React reconciles lists by matching items between renders via `key`. With stable keys, React knows "this item moved from position 3 to position 7" and just moves the DOM node — state and focus stay with the item. Without `key` (or with `key={index}` on a reorderable list), React matches by position — reordering looks like "every item changed," which destroys input state, focus, animations. Always use a stable ID from the data (`item.id`), never the array index for reorderable lists.',
    },

    // mid
    {
      level: 'mid',
      question: 'Why doesn\'t `useState` update the state immediately when called?',
      answer:
        'React schedules the update; the current render finishes with the *old* state, then React re-renders with the new state. This is by design — multiple `setState` calls in the same handler batch into one re-render. If you need the new value inside the same function, either use the value you passed (`setCount(prev + 1); console.log(prev + 1)`) or pass an updater function (`setCount(p => p + 1)`) which receives the latest queued state. Reading state through the variable from the previous render gives the old value.',
    },

    // senior
    {
      level: 'senior',
      question: 'What problem does React Context solve, and where does it fall apart?',
      answer:
        'Context **avoids prop drilling** — you can put a value at the top of the tree and any descendant reads it without passing through every level. Great for theme, current user, locale.\n\n**Where it falls apart**: every consumer of the context re-renders when the context value changes, even if they only care about one field. Stuffing a big state object into context = unnecessary re-renders everywhere on every update. For app-wide state with many fields, reach for a state library (Zustand, Jotai) that supports selectors — components subscribe to specific slices and only re-render when *their* slice changes.\n\nRule of thumb: context for static-ish app config (theme, current user, locale), state libraries for frequently-changing app state.',
    },

    // staff
    {
      level: 'staff',
      question: 'Diagnose a React app where every interaction feels laggy. Walk through.',
      answer:
        '**1. Open the React DevTools Profiler.** Record an interaction. Look at the flamegraph for slow components (long render bars) and components rendering when they shouldn\'t (highlight "rendered" without prop change). The "Ranked" view shows worst offenders.\n\n**2. Common culprits**:\n- **Unnecessary re-renders**: inline objects/functions passed as props defeating `React.memo`. Stabilize with `useMemo`/`useCallback` or hoist outside the component.\n- **Large list re-rendering**: every item re-renders on any state change. Memoize each row (`React.memo(Row)`) with stable item refs.\n- **Context overuse**: a context value at the root causes every consumer to re-render on any change. Split into smaller contexts or use a selector-based state library.\n- **Heavy synchronous work in render**: filter/sort of huge arrays on every render. Move to `useMemo` with stable deps.\n- **Effects firing on every render**: missing `useEffect` dep array or unstable deps.\n\n**3. Concurrent features for "unavoidable" slowness**:\n- `useTransition` for state updates that trigger expensive renders.\n- `useDeferredValue` to lag a value (search input → list filter).\n- `Suspense` boundaries for code-splitting heavy components.\n\n**4. Long lists**: virtualize with `@tanstack/react-virtual` or `react-window`. Only render visible rows.\n\n**5. Network**: if lag is "click → 500ms wait for data," that\'s a data-fetching problem. TanStack Query with optimistic mutations makes interactions feel instant.\n\n**6. Profiler in production builds**: dev mode is slower; always profile a production build for real numbers.\n\nThe most common root cause: prop instability defeating memoization. The fastest fix: profile, find one hot component, stabilize its inputs.',
    },

    // --- composition patterns ---
    {
      level: 'mid',
      question: 'What\'s a compound component, and why use one instead of a configuration prop?',
      answer:
        'A **compound component** is a family of components that share state through context — `<Tabs>` with `<Tabs.List>`, `<Tabs.Tab>`, `<Tabs.Panel>`. The parent owns "which tab is active"; the children read it through a context. Compared to a config-prop API (`<Tabs items={[{ id, label, content }]} />`), compound components let the consumer interleave arbitrary markup between tabs and panels (a search input, a divider, an icon) without the parent component needing to know about every variation. The wiring is hidden, the layout is open. Radix, Headless UI, and React Aria all use this pattern for composite widgets.',
    },
    {
      level: 'senior',
      question: 'Render props vs custom hooks — when does the render-prop pattern still win?',
      answer:
        'When the behavior is **tied to a DOM node**. A `<Measure>` component that uses `ResizeObserver` on a wrapper element naturally takes the form `<Measure>{({ width }) => ...}</Measure>` — the consumer\'s content needs to live inside the measured wrapper. A hook (`const { ref, width } = useMeasure()`) requires the consumer to wire the `ref` to the right element. For pure behavior (`useToggle`, `useDebounce`, `useLocalStorage`), hooks are cleaner. Render props also win for headless libraries where the boundary between "behavior" and "markup" needs to be explicit at the JSX level for type clarity.',
    },

    // --- state management libraries ---
    {
      level: 'mid',
      question: 'You\'re building a SaaS app. Where does your fetched API data belong?',
      answer:
        'In a **server-cache library** — TanStack Query, SWR, RTK Query — not in Redux/Zustand/context. Server data has its own lifecycle: stale-while-revalidate, refetch on focus, deduplication, cache invalidation on mutation. Building those features yourself in client-state stores reinvents the wheel poorly. The split is: server cache for remote data, client state library for UI state (modals, drafts, cross-component flags), URL for shareable state (filters, pagination, current tab). The first library to add to a new project is almost always TanStack Query, not Redux.',
    },
    {
      level: 'senior',
      question: 'Context is causing too many re-renders. What are your options, in order?',
      answer:
        '**1. Split the context.** One per concern (user, cart, theme). Consumers of `theme` no longer re-render when `cart` changes.\n\n**2. Split state and dispatch.** Two contexts in one provider: the value (changes often) and the setter (stable forever). Components that only call `dispatch` never re-render.\n\n**3. Memoize the value object.** `<Ctx.Provider value={useMemo(() => ({ user, setUser }), [user])}>`. Prevents a new object every render.\n\n**4. Move to a store with selectors.** Zustand, Jotai, Redux. Components subscribe to specific slices via selectors and only re-render when *their* slice changes. This is the right answer once you have many consumers reading different fields from one large value — context fundamentally can\'t do fine-grained subscriptions.',
    },

    // --- useSyncExternalStore ---
    {
      level: 'staff',
      question: 'What is "tearing" in React 18+, and what API fixes it?',
      answer:
        '**Tearing** is when different parts of the UI render with different values for the same external state, because concurrent rendering can pause and resume. A component rendered before the store changed sees the old value; one rendered after sees the new value. The result is visually inconsistent.\n\n`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` fixes it. React guarantees the whole tree sees the same snapshot for a given render pass, even under concurrent rendering. If the store changes mid-render, React restarts the render with the new snapshot. This is why Redux v8+ and Zustand moved to `useSyncExternalStore` internally — the old "subscribe in useEffect, setState on change" pattern is unsafe under concurrent rendering. (Jotai is the notable holdout — it sticks with `useReducer`/`useEffect` because `useSyncExternalStore` deopts out of `useTransition` time-slicing.)\n\nMost app code uses libraries that wrap it. You\'d write it directly only when bridging a browser API (`matchMedia`, online/offline, `localStorage` with `storage` events) or non-React data source.',
    },

    // --- useOptimistic / useFormStatus ---
    {
      level: 'mid',
      question: 'How does `useOptimistic` differ from manually managing a "pending" state?',
      answer:
        '`useOptimistic` is **automatic rollback**. You provide a reducer `(current, action) => next`; React renders the optimistic state during the action and reverts to the real state when the action finishes. If the action succeeds and the parent updates real state to match, the transition is seamless. If it fails, the optimistic value disappears and the original state is visible again — no manual try/catch rollback. The mental model: `useOptimistic` only persists for the duration of the action. Outside that window, you always see the truth.',
    },
    {
      level: 'mid',
      question: 'Why does `useFormStatus()` return `pending: false` inside the form component itself?',
      answer:
        '`useFormStatus` reads the **parent** form\'s state, not the form it\'s called from. If you call it in the same component that renders `<form>`, there\'s no parent form above and it returns `pending: false` forever. The fix is to move the hook into a child component (`<SubmitButton>`) that renders inside the `<form>`. This is intentional — it means children can read form status without prop drilling, but it bites everyone the first time they use it.',
    },

    // --- forwarding refs / useImperativeHandle ---
    {
      level: 'mid',
      question: 'A consumer passes a ref to your wrapper component and it\'s always null. What\'s wrong?',
      answer:
        '**Refs don\'t pass through automatically.** A function component receives a `ref` either as a regular prop (React 19) or via `forwardRef` (React 18). If your component doesn\'t explicitly forward the ref to the underlying DOM element, the ref is silently dropped (React 18) or rejected by TypeScript (React 19). Fix: in React 19, accept `ref` as a prop and pass it to the element; in React 18, wrap the component in `forwardRef`. Either way, the underlying `<input>` (or whatever) needs `ref={ref}` for the consumer\'s ref to point at something real.',
    },
    {
      level: 'senior',
      question: 'When would you use `useImperativeHandle` over just forwarding a DOM ref?',
      answer:
        'When the parent shouldn\'t have full DOM access. `useImperativeHandle` exposes a **chosen API** instead of the raw element — `{ play, pause, seek }` for a video player, `{ scrollToBottom, focus }` for a chat panel. The wins: (1) the component owns its DOM and can swap implementations (HLS player → custom) without changing the parent, (2) the parent can\'t do things you didn\'t intend (`.style.display = "none"`), (3) the API contract is explicit and typed.\n\nDon\'t use it for "just need to focus" — pass the DOM ref through. Use it when you have multiple coordinated DOM elements and want to expose intentional verbs over them.',
    },

    // --- polymorphic components ---
    {
      level: 'staff',
      question: 'Why is the `as` prop hard to type, and what\'s the alternative?',
      answer:
        'The `as` prop ("render this component as a `<button>` or an `<a>`") requires the props type to depend on the value of `as`. That needs a generic, `React.ComponentPropsWithoutRef<T>` to merge in the element\'s native props, `Omit` to prevent collisions with the component\'s own props, and (in React 18) a `forwardRef` cast incantation because `forwardRef` doesn\'t preserve generics by default. It works but it\'s gnarly.\n\nThe alternative is **slots / `asChild`** (Radix-style): instead of changing what your component renders, the consumer passes the element they want as a child and your component clones it, merging props. `<Button asChild><a href="...">x</a></Button>` becomes an `<a>` with button styles. No generics, no `forwardRef` cast, composes with `next/link` and `react-router`\'s `Link` out of the box. The trade-off: you can\'t statically guarantee "this asChild Button must be an anchor." Most 2026 design systems pick slots over polymorphic.',
    },
  ],
};
