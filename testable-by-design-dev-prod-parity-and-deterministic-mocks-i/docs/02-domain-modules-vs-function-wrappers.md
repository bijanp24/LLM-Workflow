# Domain Modules vs. Function Wrappers

## Two folders, two responsibilities

Agronomy Studio's backend separates *what it does* from *how it's deployed*:

- `netlify/lib/*` — the domain modules: `cimis`, `fret`, `soil`, `crop`, `cnra`, `waterquality`, `gateway`, `ai-search`. These hold the actual logic.
- `netlify/functions/*` — thin wrappers that adapt an HTTP request to a `lib` call and turn the result back into an HTTP response.

The wrapper's job is plumbing: parse the request, call the module, serialize the answer, set status codes. The module's job is the decision-making: given these inputs, what is the correct output?

```ts
// netlify/lib/soil.ts  — pure-ish domain logic, no HTTP
export function classifySoil(input: SoilInput): SoilResult {
  // validation + computation, returns plain data
}

// netlify/functions/soil.mjs — thin wrapper
import { classifySoil } from "../lib/soil.js";

export default async (req) => {
  const input = await req.json();
  const result = classifySoil(input);
  return Response.json(result);
};
```

## Why this split makes tests fast and honest

HTTP handlers are awkward to test: you must construct `Request` objects, await response bodies, and assert on status codes. Pure functions are trivial: pass input, assert on output.

By keeping the real logic in `lib`, the bulk of your test suite calls plain functions with plain data — no network, no request mocking, no framework. You get many fast, focused unit tests, and you reserve the slower, fiddlier wrapper tests for the small amount of glue code.

```ts
import { classifySoil } from "../netlify/lib/soil.js";

test("clay soil with high moisture is flagged", () => {
  const r = classifySoil({ texture: "clay", moisture: 0.42 });
  expect(r.drainage).toBe("poor");
});
```

That test never touches HTTP. It would run identically whether the code is deployed to Netlify, run locally, or invoked from a different transport entirely.

## Inversion of control, quietly

The wrapper depends on the module, never the reverse. The domain logic has no idea it is being served over HTTP. This is inversion of control in miniature: the stable, valuable part (the logic) knows nothing about the volatile part (the transport). You could swap Netlify Functions for a different host, or call `classifySoil` from a batch job, without changing a line of domain code.

## What to take away

Put the decisions in modules and the plumbing in wrappers. The result is a codebase where most behavior is verifiable with cheap unit tests, and where the deployment mechanism is a detail you can change without rewriting your logic.
