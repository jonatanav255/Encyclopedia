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
  ],
};
