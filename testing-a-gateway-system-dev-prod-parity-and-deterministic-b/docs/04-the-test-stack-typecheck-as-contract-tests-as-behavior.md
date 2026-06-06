# The Test Stack: Typecheck as Contract, Tests as Behavior

## Two complementary commands

Agronomy Studio's functions are checked with two commands that do different jobs:

```bash
npm run typecheck   # does the code honor its contracts?
npm test            # does the code do the right thing?
```

Understanding the division of labor between them is what makes a small test suite go a long way.

## `typecheck`: contracts enforced for free

The domain modules in `netlify/lib/*` expose typed functions; the thin wrappers in `netlify/functions/*` call them. TypeScript's type checker verifies, at no runtime cost, that:

- The gateway passes arguments of the shape each domain module expects.
- Response objects match the shape the wrapper promises to return.
- A change to a module's signature surfaces *everywhere* that module is used, immediately.

This is a form of contract testing you get without writing tests. If you rename a field in the soil module's return type, the typecheck fails at every consumer until they're updated. That's the type checker doing the bookkeeping a human would otherwise forget.

```ts
// netlify/lib/soil.ts
export interface SoilResult { ph: number; texture: string; }
export function getSoil(lat: number, lon: number): Promise<SoilResult> { /* ... */ }

// netlify/functions/gateway.mjs (conceptually)
// If getSoil's signature changes, the gateway's call site fails typecheck.
const soil = await getSoil(lat, lon);
```

## `npm test`: behavior at the boundaries

Types prove the shapes line up; they don't prove the logic is correct. `npm test` covers behavior:

- **Domain module tests.** Given known inputs, does `getSoil` compute the right `ph`? These are pure-ish unit tests, fast and deterministic (thanks to Lesson 3).
- **Gateway routing tests.** Given a path like `/soil`, does the gateway dispatch to the soil module? Given an unknown path, does it return a sensible 404?
- **Partial-failure tests.** If one domain module throws, does the gateway degrade gracefully instead of failing the whole response?

## The thin-wrapper payoff

Because logic lives in `netlify/lib/*` and the `netlify/functions/*` files are thin wrappers, you can test almost everything *without* invoking the Netlify runtime. You call the library function directly in a unit test — no HTTP server, no redirect, no deploy.

```ts
import { getSoil } from '../netlify/lib/soil';

test('soil returns expected pH for known coordinates', async () => {
  const result = await getSoil(38.5, -121.7);
  expect(result.ph).toBe(6.8);
});
```

The wrapper's only remaining job — parsing the request and shaping the HTTP response — is small enough to cover with a handful of integration tests. This separation is exactly what keeps the test suite fast: most assertions never touch the network.

## A practical CI ordering

Run the cheap, broad check first, then the behavioral check:

```bash
npm run typecheck && npm test
```

Typecheck fails fast on contract drift across the whole codebase; tests then verify the logic that types can't express. Together they give you confidence that a change is both *consistent* (shapes align) and *correct* (behavior holds) before it ever reaches a redirect in production.
