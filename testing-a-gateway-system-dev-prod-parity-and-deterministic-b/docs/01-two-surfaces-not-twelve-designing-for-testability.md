# Two Surfaces, Not Twelve: Designing for Testability

## The problem with a dozen front doors

Agronomy Studio's backend is a collection of TypeScript Netlify functions arranged as domain microservices: `cimis` (weather stations), `fret` (evapotranspiration), `soil`, `crop`, `cnra`, `waterquality`, and so on. That's roughly a dozen distinct capabilities.

If the Blazor WebAssembly frontend called each of those directly, every screen would carry knowledge of twelve URLs, twelve response shapes, twelve failure modes, and twelve sets of CORS and auth headers. Worse, *every test* of the frontend would need to know how to fake twelve services.

Instead, the frontend talks to exactly **two surfaces**:

1. The gateway: `/agronomy-api/*`
2. The mock AI search.

That constraint is the foundation of the system's testability. This course is about the testing and environment discipline that the two-surface design makes possible — not the gateway pattern itself, but what it *buys you* when you sit down to write tests and run the thing locally.

## Why two surfaces is a testing decision

Consider what it takes to write a deterministic test for a frontend feature.

With twelve direct dependencies, a test must stand up (or stub) twelve endpoints, and any change to a domain service's URL or shape ripples into the frontend test suite. The blast radius is enormous.

With one gateway, a frontend test fakes **one** HTTP surface. The contract the frontend depends on is the gateway's contract, and that contract changes far less often than the internals behind it.

```
Frontend test needs to mock:
  direct calls  ->  cimis, fret, soil, crop, cnra, waterquality, ... (12)
  gateway       ->  /agronomy-api/*                                  (1)
```

The number of things a test must know about is a good proxy for how brittle that test will be. Fewer surfaces means fewer reasons to break.

## The boundary is where you assert

A testable system has a small number of well-defined boundaries where you can observe inputs and outputs. Agronomy Studio has three obvious ones:

- **Frontend ↔ gateway** — the request path under `/agronomy-api/*`.
- **Gateway ↔ domain modules** — function calls into `netlify/lib/*`.
- **Domain modules ↔ external APIs** — outbound HTTP to real upstreams (or their mocks).

Good tests live *at* these boundaries. You assert that the frontend asks the gateway the right thing; that the gateway fans out to the right domain modules; that the domain modules call the right upstreams. Each layer can be tested without standing up the others.

## What this course covers

- This lesson: why limiting surfaces is a testability decision.
- Lesson 2: keeping local development faithful to production (`tools/mock-apis.mjs` vs. Netlify redirects).
- Lesson 3: pushing nondeterminism — the AI search — to the edge so the core stays reproducible.
- Lesson 4: the practical test stack: `npm run typecheck` as a contract check and `npm test` for behavior.
