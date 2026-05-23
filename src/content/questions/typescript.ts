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

    // --- exhaustiveness checking ---
    {
      level: 'mid',
      question: 'What\'s `assertNever` for and why does it work?',
      answer:
        'It\'s a helper that makes the compiler fail when you add a new variant to a discriminated union and forget to handle it somewhere: `function assertNever(x: never): never { throw new Error(...) }`. Inside the `default` of a switch on the discriminant, TS narrows the variable to `never` if every case was handled. Adding a new variant means the variable is no longer `never`, so `assertNever(e)` fails to compile — pointing at the exact place you forgot to handle. The cheapest form of insurance TS offers for unions that can grow (event types, error kinds, state machines).',
    },
    {
      level: 'senior',
      question: 'Why does this still compile even after you add a new event variant? `switch (e.type) { case \'click\': ...; case \'scroll\': ...; }`',
      answer:
        'No `default` branch, so the switch silently falls through for unknown variants and the function returns `undefined`. Two protections: (1) **`assertNever` in the default** — narrows `e` to `never`; adding a new variant breaks the build. (2) **`noFallthroughCasesInSwitch` in tsconfig** — catches missing `break`/`return` between cases. Both are nearly free and catch a class of bugs that type checking otherwise misses.',
    },

    // --- any vs unknown ---
    {
      level: 'mid',
      question: 'Why prefer `unknown` over `any` for a `JSON.parse` result?',
      answer:
        '`any` turns the type checker off for that value — anything compiles, including writing the result into a `User`-typed variable without checking. `unknown` says "I have a value but make no claims about its type"; you can\'t access properties or call it until you narrow with a type guard. The verbosity is the point: it forces you to validate at the boundary instead of trusting wire data. Combine with `useUnknownInCatchVariables: true` so `catch (e)` is also `unknown` — the other most-error-prone boundary in the codebase.',
    },
    {
      level: 'senior',
      question: 'When is `any` actually the right choice in a TS codebase?',
      answer:
        'When it\'s **narrow and contained**: a single function body uses `any` internally (e.g., a `deepGet(obj: any, path: string[]): unknown` traversal) but its public signature is typed honestly. Other defensible uses: tactical `any` during JS→TS migration (better than `as` lies), truly polymorphic adapters where no generic can express the shape, and library types where the upstream API is genuinely untyped. The rule: `any` should be *noticed* — grepping for it should produce a small intentional list, not a hopeless flood. Public surfaces and shared types should never leak `any`.',
    },

    // --- satisfies ---
    {
      level: 'mid',
      question: 'When does `satisfies` beat a type annotation on an object literal?',
      answer:
        'When you want the compiler to **check** the value against a type *and* keep the value\'s **inferred narrow type**. `const routes: Routes = { ... }` widens to `Routes` — you lose which keys actually exist and the precise per-key value types. `const routes = { ... } satisfies Routes` checks the conformance but keeps the literal\'s narrow type — typos like `routes.profil` fail, and individual handlers retain their narrow argument types. Use `satisfies` for lookup tables, palettes, discriminated-union handler maps, and config objects with required-plus-extra fields.',
    },
    {
      level: 'senior',
      question: 'What\'s the difference between `as T`, `: T`, and `satisfies T`?',
      answer:
        '`as T` is a **type assertion** — "I know better than you, trust me." No verification, just a relabel. `: T` is an **annotation** — verifies the expression and widens the variable\'s type to `T`. `satisfies T` is **verification without widening** — checks the expression conforms to `T`, but keeps the variable typed as its narrow inferred shape. Default to `satisfies` for literals; reach for `as` only when you genuinely know more than the compiler (typed wrappers around untyped sources, post-validation narrowing).',
    },

    // --- classes in TS ---
    {
      level: 'mid',
      question: 'What\'s the difference between TS `private` and JS `#private` fields?',
      answer:
        '`private` is a **compile-time check only** — TS strips it, so `(obj as any).x` works at runtime. `#x` is **enforced by the JS engine** — accessing it from outside the class is a TypeError. TS understands `#` fully (narrowing, brand checks, etc.). Prefer `#` for new code unless you need (a) `protected` (subclass access — `#` is per-class only), or (b) library types where you want compile-time hiding but subclasses still need access. Otherwise `#` is stronger, runtime-safe, and standard JS.',
    },
    {
      level: 'senior',
      question: 'Why use `this` as a return type on a chainable method?',
      answer:
        'It preserves the **concrete subclass** through fluent chains. `where(...): QueryBuilder` returns the base class — call `.byEmail()` on the result and it\'s not there. `where(...): this` returns whatever the actual receiver was; subclass methods stay accessible: `userQuery.where(...).byEmail(...).limit(...)`. This is how query builders, jQuery-style APIs, and most fluent DSLs preserve type info through chains. Pair with `parameter properties` to keep DTOs tight: `constructor(public id: string, private password: string) {}`.',
    },

    // --- runtime validation ---
    {
      level: 'mid',
      question: 'You annotate `req.body as User` in your Express handler. Why is this dangerous?',
      answer:
        '`req.body` is `any`. The annotation is a *lie that compiles* — TS believes you, the runtime doesn\'t know. If the client sends missing fields, wrong types, extra fields, or hostile shapes (`__proto__`), they all flow into your DB without complaint. Fix: parse with a schema library (Zod/Valibot/ArkType) at the boundary. `const body = UserSchema.parse(req.body)` validates the runtime data and returns it typed. Combine with `type User = z.infer<typeof UserSchema>` so the type derives from the schema — no drift possible.',
    },
    {
      level: 'senior',
      question: 'When would you choose Valibot or ArkType over Zod in 2026?',
      answer:
        '**Valibot** when bundle size matters (frontend, edge runtime) — its pipe-style modular API tree-shakes to ~1–2 KB for typical schemas. **Zod v4** core sits around ~22 KB min / ~8 KB gz; Zod Mini gets down to ~2 KB gz if you really need it. **ArkType** when you do heavy type-level work — its parser-as-types approach gives excellent inference performance and TypeScript-syntax-inspired schemas. **Zod** stays the default for backend Node services: mature, broad ecosystem (Express middleware, OpenAPI generators, tRPC, Drizzle integrations), no real bundle constraint server-side. All three give equivalent type inference and structured errors; the choice is bundle + ergonomics, not capabilities.',
    },

    // --- testing types ---
    {
      level: 'senior',
      question: 'When should you write type-level tests?',
      answer:
        'For **library code, generic helpers, and conditional/mapped types** — anywhere a refactor could silently widen, narrow, or change inference without breaking runtime tests. Tools: `expect-type` (`expectTypeOf(x).toEqualTypeOf<T>()`) for positive assertions, `@ts-expect-error` for "this line should fail to typecheck." For application code that mostly *uses* types instead of producing them, runtime tests dominate and type tests add little. The cost is real (typecheck time), so don\'t test trivial annotations or types fully derived from a schema — test the parts where inference can change without anyone noticing.',
    },

    // --- type design ---
    {
      level: 'senior',
      question: 'What does "make illegal states unrepresentable" mean and how do you apply it?',
      answer:
        'Design types so combinations that can\'t logically coexist are impossible to construct. `{ state: \'loading\' | \'success\' | \'error\'; data?: User; error?: string }` *allows* `{ state: \'success\', error: \'oops\' }` — nonsense. Replace with a discriminated union: `{ state: \'loading\' } | { state: \'success\'; data: User } | { state: \'error\'; error: string }`. Now the fields exist only when the state warrants them; consumers narrow once and get full safety. The principle applies to any "thing has mode + per-mode data" — form state, resource loading, auth flows, command types. Cost: a few extra `|` lines. Benefit: eliminating an entire class of "should never happen" bugs.',
    },
    {
      level: 'senior',
      question: 'What\'s wrong with returning `Partial<User>` from `loadUser`?',
      answer:
        'It violates "liberal in, strict out." Inputs should be *wide* (accept partials, accept any iterable) so calling is easy; outputs should be *narrow* (return concrete fully-populated types) so consumers don\'t have to defensively check every field. `loadUser(): Partial<User>` forces every caller to write `user.email ?? \'\'` everywhere — the missing-field handling spreads through the codebase. Better: `loadUser(): User | null` — the absence lives in the return type itself, not in every field of a present user.',
    },

    // --- error handling ---
    {
      level: 'mid',
      question: 'You have `try { ... } catch (e) { e.message }` and TS complains. Why?',
      answer:
        '`useUnknownInCatchVariables: true` (default in `strict` since TS 4.4) types `e` as `unknown`. JS allows `throw \'string\'`, `throw 42`, `throw null` — anything can land in a catch. Forces you to narrow: `if (e instanceof Error) console.error(e.message); else console.error(String(e))`. Don\'t fix it by turning the flag off — `any` in the catch clause defeats the safety story at the most error-prone boundary in the codebase. Either narrow, or define custom Error subclasses and `instanceof`-check them.',
    },
    {
      level: 'senior',
      question: 'When should you return a `Result<T, E>` instead of throwing?',
      answer:
        '**Throw** for unexpected failures (DB down, OOM, programmer errors) and code paths the caller can\'t reasonably handle. **Return Result** for *expected* failure modes: validation errors, domain operations with known failure kinds (`charge` → `card-declined | insufficient-funds`), code crossing an async/non-throw boundary (workers, queue consumers, serverless handlers returning JSON). The Result type makes the failure modes part of the contract and enables exhaustive handling via discriminated unions. Mixing is fine: return Result for the expected case, throw for "DB on fire." Just be clear about which.',
    },
    {
      level: 'senior',
      question: 'What\'s wrong with `throw new Error(\'something failed\')` inside a catch?',
      answer:
        'It loses the original error\'s stack, fields, and identity — debugging gets much harder. Use `throw new Error(\'something failed\', { cause: e })` (ES2022) to preserve the chain. Stack traces show both layers, `instanceof` still works on the cause, and structured logging can walk `e.cause` to root. If you don\'t need to add context, just `throw e;` — rethrowing is cheaper and clearer than wrapping for no reason.',
    },

    // --- narrowing aliasing ---
    {
      level: 'senior',
      question: 'You narrowed `r.user` to non-null, but inside a callback TS says it could be null again. Why?',
      answer:
        'Narrowing on a **property** holds only as long as TS can prove no reassignment happened — and inside callbacks, after function calls that could see `r`, or across `await`, the narrowing expires. The compiler can\'t prove `r.user` wasn\'t reassigned between the check and the callback. Fix: alias to a **local const** — `const user = r.user; if (user !== null) { ... later(() => user.email) }`. A local `const` is provably immutable for the function\'s lifetime, so narrowing survives closures and async hops. The rule: **narrow the local, not the property**.',
    },

    // --- NoInfer / Prettify ---
    {
      level: 'senior',
      question: 'What does `NoInfer<T>` (TS 5.4+) solve?',
      answer:
        'It blocks a generic parameter from being inferred at one position while still letting it be inferred elsewhere. `pick<K extends string>(options: K[], chosen: K): K` lets `K` widen from both arguments — `pick([\'a\',\'b\'], \'d\')` widens K to `\'a\'|\'b\'|\'d\'` and the typo passes. Change to `chosen: NoInfer<K>` and `K` is inferred only from `options`; `chosen` is checked as a constraint. Common uses: default-value parameters that should match an inferred union, callback signatures that should match an earlier argument, config builders where one arg is the source of truth.',
    },

    // --- typing react props/children ---
    {
      level: 'junior',
      question: 'When typing a component\'s `children` prop, which type should you reach for?',
      answer:
        '`React.ReactNode`, almost always. It accepts strings, numbers, JSX elements, arrays, fragments, `null`, `undefined`, and booleans — everything you can render. The narrower types (`ReactElement`, `JSX.Element`) reject text-only children, multiple-children-as-fragment, and `null`, which usually isn\'t what you want. Reach for `ReactElement` only when you need a single element to `React.cloneElement` or inspect. `React.PropsWithChildren<T>` is the shorthand for "T plus optional children" if you prefer.',
    },
    {
      level: 'mid',
      question: 'How do you build a wrapper component that accepts every prop of `<button>` plus a `variant`?',
      answer:
        '```ts\ntype ButtonProps = {\n  variant?: \'primary\' | \'secondary\';\n} & React.ComponentPropsWithoutRef<\'button\'>;\n```\n\n`ComponentPropsWithoutRef<\'button\'>` includes every HTML attribute, every event handler, every aria/data attribute — correctly typed with `type`, `disabled`, `form`, `onClick`, etc. Beats redeclaring a subset (which loses `data-*`, `aria-*`, the full event types). The `WithoutRef` variant skips the ref prop (use `WithRef` if you\'re handling refs in the type). For non-element components, `React.ComponentProps<typeof OtherComponent>` pulls in another component\'s props the same way.',
    },
    {
      level: 'mid',
      question: 'Why do most React-TS style guides now recommend against `React.FC`?',
      answer:
        'Three reasons. **(1)** `React.FC` used to implicitly add an optional `children` prop, which silently broke when components that shouldn\'t accept children were updated to `@types/react` 18 (which removed the implicit `children`). **(2)** Generics on `React.FC<Props>` are awkward — you can\'t mix `<T>` parameters into the function signature cleanly. **(3)** A plain function with a typed parameter is shorter, infers defaults correctly, and gives nicer hover types: `function Greet({ name }: { name: string })` is more idiomatic than `const Greet: React.FC<{ name: string }> = ({ name }) => ...`. Not wrong, just unnecessary.',
    },

    // --- typing hooks ---
    {
      level: 'mid',
      question: 'When does `useState` need an explicit type annotation?',
      answer:
        'When the initial value is **narrower** than the values the state can ever hold. Two common cases: (1) `useState(null)` — TS infers `null`, then `setUser(realUser)` fails. Annotate `useState<User | null>(null)`. (2) `useState([])` — TS infers `never[]`, then `setItems([x])` fails. Annotate `useState<Item[]>([])`. For "the initial value is what you\'ll always use" (`useState(0)`, `useState(\'\')`), inference is fine and explicit annotation is noise.',
    },
    {
      level: 'mid',
      question: 'How do you make `useContext` not return `undefined` everywhere?',
      answer:
        'Wrap `useContext` in a custom hook that asserts the provider exists, and export only the hook (not the context):\n\n```ts\nconst ThemeContext = createContext<Theme | null>(null);\n\nexport function useTheme(): Theme {\n  const ctx = useContext(ThemeContext);\n  if (!ctx) throw new Error(\'useTheme: missing <ThemeProvider>\');\n  return ctx;\n}\n```\n\nThe context\'s default is `null`, so any code that uses the raw context still has to null-check, but consumers only use `useTheme()` and get a non-null `Theme`. The throw turns "forgot the provider" from a confusing runtime crash into an obvious error message. This is the canonical TS+React context pattern.',
    },
    {
      level: 'senior',
      question: 'Why use a discriminated-union return type from a data-fetching hook instead of `{ data, error, isLoading }`?',
      answer:
        'Because `{ data, error, isLoading }` lets consumers do nonsense like access `data.name` while `isLoading` is true (TS sees `data: T | undefined` and forces optional chaining, but doesn\'t prevent it).\n\n```ts\ntype FetchState<T> =\n  | { status: \'loading\' }\n  | { status: \'success\'; data: T }\n  | { status: \'error\'; error: Error };\n```\n\nNow `if (state.status === \'success\') state.data.name` narrows correctly, and you literally cannot access `data` outside the success branch. The compiler enforces "you may only render data after you\'ve checked you have data." This is the single biggest API-design win from TS in React code.',
    },

    // --- as const satisfies (companion to the satisfies questions above) ---
    {
      level: 'senior',
      question: 'What does `as const satisfies T` give you that either alone doesn\'t?',
      answer:
        '`as const` freezes the value as deeply-readonly literals (`{ readonly mode: \'dark\' }`) but doesn\'t check it against any type. `satisfies T` checks against the type while keeping the inferred (still-widened) value type. Combining them: **frozen, narrow, AND validated**. Canonical use is config/routes/enums-as-objects: `const routes = { home: { path: \'/\' }, profile: { path: \'/profile\' } } as const satisfies Record<string, { path: string }>`. You get `keyof typeof routes` = `\'home\' | \'profile\'` (precise key union), every `path` typed as its literal string, and a compile error if you forget to add `path` to a new route. The four-way matrix: annotation = check + widen, `as` = no check + widen, `satisfies` = check + narrow, `as const satisfies` = check + readonly narrow.',
    },

    // --- using / disposable ---
    {
      level: 'senior',
      question: 'When does `using` beat `try/finally`, and what does it offer that `try/finally` doesn\'t?',
      answer:
        '`using` shines when you have multiple resources, early returns, or shared cleanup logic — anywhere the `finally` block was already getting nested or duplicated. Two things `try/finally` doesn\'t give you: (1) **deterministic reverse-order cleanup** when multiple `using` bindings exist in a scope — they dispose in the opposite order they were declared, matching how they were set up. (2) A clean **error model** via `SuppressedError`: if both the body and the dispose throw, both errors are preserved (`.error` is the most recent, `.suppressed` is the prior one). A `finally` that throws silently swallows the body error. For a single one-shot resource in a small function, plain `try/finally` is still fine — `using` pays off as soon as the cleanup graph gets non-trivial.',
    },
    {
      level: 'senior',
      question: 'A function builds up several `using` resources and wants to return the bundle. What goes wrong, and how do you fix it?',
      answer:
        'The dispose runs at the closing brace of the function, *before* the return value escapes — so the caller gets references to already-cleaned-up resources. The fix is `DisposableStack.move()`: collect the resources on a stack, then call `.move()` to transfer ownership to a new stack that the caller binds with `using`. The original stack is emptied, so its dispose is a no-op; the new stack disposes in the caller\'s scope. Example: `function setup() { using stack = new DisposableStack(); const a = stack.use(openA()); const b = stack.use(openB()); return stack.move(); } { using owned = setup(); /* a and b alive here */ }`. Without `move()`, you\'d leak on every early-return path during setup.',
    },

    // --- Zod v4 sizing (companion to the existing Valibot/Ark question) ---
    {
      level: 'mid',
      question: 'Roughly how big is Zod v4 in a frontend bundle, and when do you reach for Zod Mini or Valibot?',
      answer:
        '**Zod v4 core**: ~22 KB minified / ~8 KB gzipped — bigger than people expect, because v4 absorbed features (errors, async, top-level schemas) Zod 3 left out. **Zod Mini**: ~2 KB gzipped — same API shape, fewer features, designed for size-constrained targets. **Valibot**: tree-shakes to ~1–2 KB for typical schemas thanks to its pipe-style modular API. Backend Node service? Zod, no question — bundle doesn\'t matter, ecosystem is broad. Mobile web bundle where every KB hurts? Valibot, or Zod Mini if you want to stay in the Zod ecosystem. All three give equivalent type inference and structured errors; bundle is the only axis on which they meaningfully differ.',
    },
  ],
};
