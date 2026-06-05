# Two Surfaces, Two Environments: Dev/Prod Parity

## The problem this lesson solves

A frontend that calls many services is hard to develop against. If every UI change requires a dozen live backends running, the inner loop slows to a crawl and nobody can work offline. Agronomy Studio sidesteps this with a deliberate constraint: **the Blazor WebAssembly frontend talks to exactly two surfaces** — the gateway (`/agronomy-api/*`) and a mock AI search. Everything else hides behind those two doors.

The reason this matters for *development* is that a small, stable surface is easy to reproduce locally. You don't need the real CIMIS weather API, the real soil service, or a hosted LLM running on your laptop. You need something that answers at the same two URLs with the same shapes.

## The same shape in two places

There are two implementations of the backend surface, and they must agree on the contract:

- **Local dev:** `tools/mock-apis.mjs` stands up the endpoints on your machine.
- **Production:** Netlify redirects proxy `/agronomy-api/*` to `netlify/functions/*.mjs`.

The frontend code does not know or care which one is answering. That is the whole point. The URL path is the contract; the implementation behind it is swappable.

```
Frontend (Blazor WASM)
   |
   |  fetch('/agronomy-api/soil?lat=..&lon=..')
   v
[ same path in both environments ]
   |                         |
   v                         v
tools/mock-apis.mjs    netlify/functions/gateway.mjs
(local dev)            (production)
```

## Why parity is a feature, not an accident

The value of dev/prod parity is that bugs reproduce. If your local mock returns `{ "moisture": 0.31 }` but production returns `{ "soilMoisture": 0.31 }`, the UI works locally and breaks live. Parity means the *shape* of every response is the same in both worlds, even when the *values* differ.

A useful discipline: treat the response schema as the shared artifact. The mock and the function are two producers of that schema. When you change a field, you change it in both, and your tests catch the drift.

## A concrete inner loop

```bash
# Start the local mock surface
node tools/mock-apis.mjs

# In another terminal, run the frontend dev server
# The app now resolves /agronomy-api/* against the mock
```

Because the mock is just a Node script, it starts instantly, runs offline, and never burns API quota or money. You get the full UI behavior without a single real upstream call.

## The trade-off to stay honest about

Parity is never perfect. A mock that always succeeds will not teach you how the UI behaves under a 500 or a timeout. Good mock surfaces therefore expose *failure modes* on purpose — a query parameter or a fixture that makes the soil endpoint return an error — so you can develop the empty states and error banners without waiting for production to fail for you.
