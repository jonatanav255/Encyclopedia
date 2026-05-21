import type { QuestionBank } from './types';

export const bank: QuestionBank = {
  topic: 'typescript',
  questions: [
    // --- junior ---
    {
      level: 'junior',
      question: 'What does TypeScript add to JavaScript?',
      answer:
        'A type system that runs at compile time. You annotate values; the compiler checks consistency and editor tooling uses the types for autocomplete, jump-to-definition, and rename. At runtime, types are erased — only plain JavaScript executes. TypeScript catches bugs like passing the wrong type, missing nullable handling, and typo\'d property names before you run the code.',
    },
    {
      level: 'junior',
      question: 'What does `strict: true` enable?',
      answer:
        'A bundle of strictness flags: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict`, `useUnknownInCatchVariables`. The most impactful is `strictNullChecks` — it makes `null` and `undefined` distinct types you must handle explicitly. Turn `strict` on from day one; migrating later is painful.',
    },
    {
      level: 'junior',
      question: 'When should you use `unknown` instead of `any`?',
      answer:
        'Always, when you mean "I don\'t know the type yet." `any` opts out of type checking entirely — anything goes in, anything goes out, errors disappear. `unknown` is type-safe: the compiler forces you to narrow (with `typeof`, `instanceof`, a guard, or `as`) before using the value. Use `unknown` for `JSON.parse`, `fetch().json()`, `catch (err)`, and any other "data from outside."',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between `type` and `interface` for object shapes?',
      answer:
        'For object shapes, they\'re almost interchangeable. `interface` supports declaration merging (multiple declarations combine) and is conventional for "open" contracts that others might extend. `type` is more general — it can describe unions, intersections, tuples, mapped types, and conditional types, none of which `interface` can do. Most codebases use `interface` for entity/prop shapes and `type` for everything else.',
    },
    {
      level: 'junior',
      question: 'What is a literal type?',
      answer:
        'A type that\'s a specific value, not just a category. `\'admin\'` is both a value and a type — the type with exactly one inhabitant. `type Role = \'admin\' | \'user\' | \'guest\'` is a union of literals. Far safer than `string` because the compiler enforces that you use only those exact values. Use literal unions for status codes, modes, action types — anything with a closed set.',
    },
    {
      level: 'junior',
      question: 'What does `as const` do?',
      answer:
        'It narrows a value to its deepest literal type and makes it `readonly`. `const x = \'hi\'` is typed `string`; `const x = \'hi\' as const` is typed `\'hi\'`. For arrays: `[1, 2] as const` becomes `readonly [1, 2]` (a tuple). The classic use: derive a union type from a config object — `const ROLES = { admin: 1, user: 2 } as const; type Role = keyof typeof ROLES`.',
    },
    {
      level: 'junior',
      question: 'How do you check if a value is one of several types in TypeScript?',
      answer:
        'For primitives, `typeof x === \'string\'`. For classes, `x instanceof Foo`. For property existence, `\'name\' in obj`. For tagged unions, check the discriminant: `if (result.kind === \'success\')`. For arbitrary shapes, write a user-defined type guard: `function isUser(x: unknown): x is User { ... }`. The compiler narrows the type inside each branch automatically.',
    },

    // --- mid ---
    {
      level: 'mid',
      question: 'What\'s the difference between `keyof` and `typeof`?',
      answer:
        '`keyof T` gives you the union of T\'s keys (`keyof { id: number; name: string }` is `\'id\' | \'name\'`). `typeof value` (in a type position) gives you the type of a value. The combo `keyof typeof ROLES` is the standard "derive a union from a const object" pattern — single source of truth in the object, types follow automatically.',
    },
    {
      level: 'mid',
      question: 'How do `Partial<T>`, `Required<T>`, and `Readonly<T>` differ?',
      answer:
        '`Partial<T>` makes every field optional (`?:`). `Required<T>` makes every field required (`-?:`). `Readonly<T>` makes every field `readonly`. All three are mapped types: `{ [K in keyof T]?: T[K] }` and so on. Useful for PATCH payloads (Partial), post-default configs (Required), and immutable interfaces (Readonly). All are shallow — for deep variants, write a recursive utility.',
    },
    {
      level: 'mid',
      question: 'What does a discriminated union look like and why is it useful?',
      answer:
        'A union where each variant has a literal field identifying it: `{ kind: \'success\'; data: User } | { kind: \'error\'; message: string }`. The compiler narrows based on the discriminant: `if (r.kind === \'success\') r.data...`. Use for state machines, API responses, Redux actions, parser ASTs. Pair with a `default: { const _: never = x; }` for exhaustiveness — adding a case to the union forces every consumer to handle it.',
    },
    {
      level: 'mid',
      question: 'When would you write a generic function?',
      answer:
        'When the input and output types are related. `function first<T>(arr: T[]): T | undefined` preserves the relationship; without generics you\'d return `unknown` and lose the type. Don\'t generify when T appears only once and the body doesn\'t use the type — `function log<T>(x: T): void` adds nothing; just take `unknown`.',
    },
    {
      level: 'mid',
      question: 'What does `ReturnType<typeof fn>` do?',
      answer:
        'Extracts the return type of a function. The `typeof fn` gets the function\'s type from the value `fn`; `ReturnType<...>` is a conditional+infer type that pulls out the return. Pair with `Parameters<typeof fn>` to wrap functions while preserving signatures. Common in higher-order utilities like `withLogging(fn)`.',
    },
    {
      level: 'mid',
      question: 'Why won\'t this code compile? `const x: User = JSON.parse(input);`',
      answer:
        'It will compile — and that\'s the problem. `JSON.parse` returns `any`. The compiler trusts your annotation. If `input` is `{"id": "1"}` instead of `{"id": 1}`, the type lies and you crash later. The fix is to type as `unknown` and validate with a guard or a schema library like Zod: `const x = UserSchema.parse(JSON.parse(input))` gives you both runtime safety and the right type.',
    },
    {
      level: 'mid',
      question: 'How does declaration merging help with Express\'s `req.user`?',
      answer:
        'You declare an interface augmentation: `declare global { namespace Express { interface Request { user?: { id: number } } } }`. Because `interface` supports declaration merging, your fields are added to Express\'s `Request` type everywhere. The runtime middleware sets `req.user`; the type system now knows about it. This is the standard pattern for any library exposing extension points via interfaces.',
    },
    {
      level: 'mid',
      question: 'When would you use the `as` cast?',
      answer:
        'When the compiler can\'t see what you know. After validation (`const u = data as User` when Zod already verified shape; better: let Zod return typed data). For widening intent (`[1, 2] as const`). For interop with untyped libraries. Never to silence errors you don\'t understand — `as` bypasses type checking, which is the whole point of using TypeScript.',
    },
    {
      level: 'mid',
      question: 'What\'s the right way to type `process.env`?',
      answer:
        'Declare it globally: `declare global { namespace NodeJS { interface ProcessEnv { DATABASE_URL: string; PORT?: string; } } }`. But this lies — the compiler trusts your declaration; the runtime can be different. Pair with runtime validation at boot: `const env = z.object({...}).parse(process.env)` so missing or malformed env vars fail fast at startup, not later at the first read.',
    },

    // --- senior ---
    {
      level: 'senior',
      question: 'What\'s a branded type and when would you use one?',
      answer:
        'A type with a phantom property that distinguishes structurally identical types: `type UserId = string & { __brand: \'UserId\' }`. `UserId` and `PostId` are now incompatible even though both are strings. Used for IDs of different entities, validated strings (`Email`, `URL`), numeric units (cents vs dollars), and "trusted" values (`SafeHtml`). Pair with a constructor function that validates: the only way to create one is to go through the function.',
    },
    {
      level: 'senior',
      question: 'What\'s the difference between covariant and contravariant positions?',
      answer:
        'Function returns are covariant — a `() => Dog` is assignable to `() => Animal` (narrower returns are safer). Function parameters are contravariant — a `(a: Animal) => void` is assignable to `(a: Dog) => void` (wider params are safer; the function will accept any input the caller has). Read-only fields are covariant; mutable fields are invariant. `strictFunctionTypes` enforces contravariance; without it, params used to be bivariant (unsafe for backwards compat).',
    },
    {
      level: 'senior',
      question: 'How do template literal types power typed routers?',
      answer:
        'Template literal types let you parse strings at the type level. `type Params<R> = R extends \`${string}:${infer P}/${infer Rest}\` ? { [K in P]: string } & Params<\`/${Rest}\`> : ...` walks the route string and extracts `:param` placeholders into a typed object. Calling `go(\'/users/:id\', { id: \'1\' })` is type-checked: omit `id` or pass extra keys and you get a compile error. Real routers (TanStack Router, Hono RPC) use elaborated versions of this.',
    },
    {
      level: 'senior',
      question: 'How would you derive a TypeScript type from a Zod schema?',
      answer:
        '`type User = z.infer<typeof UserSchema>`. Zod\'s `infer` is a conditional type that walks the runtime schema definition and produces the matching TS type. Single source of truth: the schema validates at runtime; the type follows. Same applies to Valibot, Yup, ArkType, and OpenAPI generators. Keeping the runtime check and the compile-time type linked eliminates a common drift bug.',
    },
    {
      level: 'senior',
      question: 'Why might `Omit<T, K>` not warn about non-existent keys?',
      answer:
        'By design — `Omit` is `Pick<T, Exclude<keyof T, K>>`, and `Exclude` is non-erroring (`Exclude<\'a\' | \'b\', \'c\'>` is `\'a\' | \'b\'`, not an error). So `Omit<User, \'banana\'>` is just `User`. This permits patterns like "omit if present." If you want enforcement, `Pick<T, K>` does validate K against `keyof T`. Recent TS versions added `Omit` constraints to certain higher-level utilities but the base type stays permissive.',
    },
    {
      level: 'senior',
      question: 'When would you use project references?',
      answer:
        'In monorepos with multiple packages — each gets its own `tsconfig.json` with `composite: true`, and a root `tsconfig.json` lists them in `references`. `tsc --build` builds them in dependency order, with incremental rebuilds via `.tsbuildinfo`. Speeds up large codebases by typechecking only what changed. Not worth it for single-package projects — pure overhead.',
    },

    // --- staff ---
    {
      level: 'staff',
      question: 'A library\'s types take 8 seconds to typecheck per consumer. How would you investigate?',
      answer:
        '**Profile:** `tsc --extendedDiagnostics --generateTrace ./trace`, then open the trace in `chrome://tracing`. Look for the expensive types — usually deep mapped types over large unions, recursive conditional types blowing up depth, or distributive conditionals over huge string-literal unions.\n\n**Cache:** introduce intermediate named aliases — TS memoizes them and avoids recomputation at each call site.\n\n**Simplify:** if a clever conditional type is the culprit, sometimes a `Record<string, unknown>` and runtime validation is the right call.\n\n**Move compile-time work to build-time:** code generation (Zod → types, OpenAPI → types) sidesteps the issue.\n\n**Ship pre-built `.d.ts`:** consumers don\'t recompute your library\'s types.',
    },
    {
      level: 'staff',
      question: 'How would you enforce "all external data must be validated, not just typed" at the team level?',
      answer:
        'Code: Zod (or Valibot) schemas at every boundary — HTTP handlers parse the body via a schema, fetch wrappers parse the response, `process.env` is parsed at boot. Types come from `z.infer<typeof Schema>`, so the schema is the source of truth and the type follows.\n\nLinting: ban raw `JSON.parse`, `as`, and `any` outside of designated boundary files via custom ESLint rules or `@typescript-eslint/no-explicit-any`, `no-unsafe-assignment`, etc.\n\nReview: a checklist for "where does data enter? what validates it?" in every PR touching new endpoints or integrations.\n\nObservability: log schema validation failures with enough context to fix the upstream contract.\n\nDocumentation: make the pattern explicit in CONTRIBUTING and a couple of example PRs. New engineers see the convention immediately.',
    },

    // --- additions for new topics ---

    // junior
    {
      level: 'junior',
      question: 'What does "types are sets" mean?',
      answer:
        'A type is the set of all possible values it can hold. `string` is the set of all strings. `\'admin\'` is the set with one element. `\'admin\' | \'user\'` is the set with two. Assignability is subset checking: you can assign narrower (smaller set) to wider (larger set), not the reverse. This frame explains most TS behavior — including why `A & B` for object types means "has fields of both" (intersection is more restrictive), why `never` is the bottom (empty set), and why narrowing makes types smaller.',
    },
    {
      level: 'junior',
      question: 'What\'s the first step when migrating a JavaScript codebase to TypeScript?',
      answer:
        'Install TypeScript, run `tsc --init`, set `allowJs: true` and `checkJs: false` in tsconfig, and `noEmit: true`. Now TS runs against your project without breaking anything — all JS still works. Write **new files in `.ts`** from this point. Convert leaf files (no complex imports) gradually. Start with loose strictness; tighten flags one at a time (`noImplicitAny`, then `strictNullChecks`, then full `strict`). Avoid big-bang rewrites.',
    },

    // mid
    {
      level: 'mid',
      question: 'What does `infer` do, and where can it appear?',
      answer:
        '`infer` is pattern matching for types. Inside a conditional type (`T extends Pattern ? ... : ...`), `infer X` binds a name to part of the pattern. Examples: `T extends (...args: any[]) => infer R ? R : never` (extract return type), `T extends Promise<infer U> ? U : T` (unwrap promise), `T extends [infer H, ...any[]] ? H : never` (head of tuple), `T extends \\`${string}@${infer D}\\` ? D : never` (parse a template literal). Powers `ReturnType`, `Parameters`, `Awaited`, and most other "extract part of a type" utilities.',
    },
    {
      level: 'mid',
      question: 'When would you use Stage 3 decorators vs the legacy ones?',
      answer:
        '**Legacy** (`experimentalDecorators: true` + `emitDecoratorMetadata`) for NestJS, TypeORM, MobX, class-validator — frameworks that mandate them and use `reflect-metadata` for runtime type info (DI, validation, ORM mapping). **Stage 3** for new code without a legacy-decorator framework: they\'re the standardized future, work in V8 and TypeScript 5+ without flags. Don\'t mix flavors in one project. If you\'re building a service in NestJS, legacy is forced. For anything else, Stage 3.',
    },

    // senior
    {
      level: 'senior',
      question: 'You\'re typing a utility function that takes a function and returns a function with a Promise-wrapped return. How?',
      answer:
        '```ts\nfunction asyncify<T extends (...args: any[]) => any>(\n  fn: T,\n): (...args: Parameters<T>) => Promise<ReturnType<T>> {\n  return (...args) => Promise.resolve(fn(...args));\n}\n```\n\nGeneric `T` constrained to "any function." `Parameters<T>` extracts the args tuple via `infer`. `ReturnType<T>` extracts the return via `infer`. The result has the same arg signature but the return is wrapped in `Promise`. Compose this kind of utility from the built-in helpers — they\'re all `infer`-based.',
    },
    {
      level: 'senior',
      question: 'How do you incrementally migrate a 50k-line JavaScript codebase to TypeScript?',
      answer:
        '**Set up** TS with `allowJs: true`, `checkJs: false`, `noEmit: true`, `strict: false`. No code breaks. **Write all new code in `.ts`** — that stops the bleeding.\n\n**Convert per feature**, not per layer: take one feature end-to-end, rename `.js` → `.ts`, fix the errors, ship. Repeat. Each PR is small; reviewers focus.\n\n**Tighten strictness** one flag at a time: `noImplicitAny` first, then `strictNullChecks`, then full `strict`. Each flag generates a wave of errors — tackle in focused PRs.\n\n**Use `// @ts-expect-error`** (not `@ts-ignore`) for unavoidable suppressions — it errors if the underlying issue gets fixed, prompting cleanup.\n\n**For files staying JS**, add `// @ts-check` + JSDoc types. You get most of the safety without renaming.\n\n**CI** must run `tsc --noEmit`. Track `any` count and `@ts-expect-error` count over time — drive them down.\n\nExpect weeks to months spread across normal feature work. The team that "spent a month on TS" went too fast or too slow.',
    },

    // staff
    {
      level: 'staff',
      question: 'A library author wants to expose strongly-typed event names so consumers get autocomplete. How?',
      answer:
        'Two main techniques. **Generic interface + keyof**:\n\n```ts\ninterface EventMap {\n  click: { x: number; y: number };\n  hover: { target: string };\n}\n\nclass Emitter<M> {\n  on<K extends keyof M>(name: K, handler: (data: M[K]) => void) { ... }\n  emit<K extends keyof M>(name: K, data: M[K]) { ... }\n}\n\nconst e = new Emitter<EventMap>();\ne.on(\'click\', (data) => data.x);   // data is typed { x: number; y: number }\n```\n\nThe map maps event names to payload types. `keyof M` enumerates event names; `M[K]` looks up the payload. Consumers get autocomplete on `name` and typed `data` in the handler.\n\nFor union-shaped payloads where the payload type varies based on the discriminant:\n\n```ts\ntype Event =\n  | { type: \'click\'; x: number; y: number }\n  | { type: \'hover\'; target: string };\n\nfunction handle<E extends Event>(e: E) { /* discriminated narrowing inside */ }\n```\n\nFor consumer ergonomics, the `Map` approach is cleaner. For library internals that switch on type, the discriminated union is better. Many libraries (Node\'s `EventEmitter`, TypedEmitter, mitt) use generic-map approaches. Pair with template literal types for typed name patterns (`on\\`user.${string}\\``).',
    },

    // --- additional questions ---

    // junior
    {
      level: 'junior',
      question: 'What does the `?` after a property name in an interface mean?',
      answer:
        '`name?: string` means the property is **optional** — it might be present or absent. The compiler treats it as `name: string | undefined`. You must narrow before using: `if (user.name) { user.name.toUpperCase() }`. Different from `name: string | undefined` only in that an optional property can be **omitted entirely** when constructing the object; the explicit union form requires you to pass `undefined`.',
    },
    {
      level: 'junior',
      question: 'What\'s the difference between `interface` and `type`?',
      answer:
        'For object shapes, mostly interchangeable. **`interface`** supports declaration merging (`interface User {}` declared twice combines), uses `extends`, traditionally preferred for object contracts. **`type`** supports unions (`type X = A | B`), intersections, tuples, mapped types, conditional types — things `interface` can\'t do. Convention: `interface` for object shapes you\'ll extend, `type` for unions and computed types. Modern codebases often use `type` for everything for consistency.',
    },

    // mid
    {
      level: 'mid',
      question: 'Why does `as` sometimes silently break your code?',
      answer:
        '`as` is a **type assertion** — you\'re telling the compiler "trust me, this is type X" without runtime validation. If you\'re wrong, you\'ll see runtime errors that the type system promised you wouldn\'t happen. Example: `const user = data as User` after `JSON.parse(input)` — if the JSON doesn\'t actually match `User`, your typed code crashes when accessing `user.name.toUpperCase()`. Use `as` rarely; prefer runtime validation (Zod) that returns a typed value after verification.',
    },
    {
      level: 'mid',
      question: 'What does `satisfies` do that `as` doesn\'t?',
      answer:
        '`satisfies` **checks** that a value matches a type without changing its inferred type. `as` casts (potentially lying). Example: `const config = { port: 3000, host: "localhost" } satisfies Config` — TypeScript verifies the literal matches `Config`, but `config.port` stays typed as the literal `3000` (not widened to `number`). With `as Config`, you\'d lose the literal types and the compiler wouldn\'t catch missing fields. `satisfies` (TS 4.9+) is the "validation without widening" tool you wanted before.',
    },

    // senior
    {
      level: 'senior',
      question: 'A generic function loses information about which specific overload was called. How do you fix it?',
      answer:
        'Use **conditional return types** that depend on the input. Instead of overloads (which lose info), encode the relationship: `function find<T extends string | number>(query: T): T extends string ? User : User[]`. The return type is computed from the input. Caller sees: `find("jon")` returns `User`, `find(42)` returns `User[]`. The compiler picks the right branch based on the actual argument type. Cleaner than overloads, with no implementation-signature mismatch. Trade-off: harder to read; reach for it when overloads pile up.',
    },

    // staff
    {
      level: 'staff',
      question: 'Your codebase\'s `tsc` typecheck takes 3 minutes. How do you cut it?',
      answer:
        '**Profile first**: `tsc --extendedDiagnostics` shows time per phase. `tsc --generateTrace ./trace` writes a Chrome-tracing-compatible profile — load in `chrome://tracing` to see expensive types.\n\n**Common wins**:\n\n1. **`skipLibCheck: true`** — skips type-checking of `.d.ts` files in `node_modules`. Usually safe; recovers 30-60s on large projects.\n2. **`incremental: true`** + `.tsbuildinfo` — second runs only re-check changed files. Cuts iteration to seconds.\n3. **`isolatedModules: true`** + bundler emit (esbuild/swc) — TypeScript only does type-checking, not transpilation. Splits the work.\n4. **Project references** for monorepos — independent compilation per package, parallel.\n5. **Remove deeply recursive types** — `infer`-heavy types with unbounded recursion blow up. Cache intermediate types via `type Alias = ComplexThing<T>` (TS memoizes named aliases).\n6. **`noEmit: true` in CI** — separate type-check job from build (which uses esbuild). Run in parallel.\n7. **Check `paths`** in tsconfig — overly broad mappings make every import resolve through huge candidate lists.\n\n**For library deps**: a single big-types package (`@types/lodash` historically) can dominate. `skipLibCheck` masks; pinning to specific submodule imports (`lodash/get`) helps tree-shaking but not type-check time.\n\n**Target**: type-check + build in CI under 1 minute for a 50k-line codebase is achievable. If you\'re past 5 minutes, project references usually win.',
    },
  ],
};
