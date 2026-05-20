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
  ],
};
