# Dev/Prod Parity: Mock APIs vs. Netlify Redirects

## The same logical path in two environments

A gateway system is only trustworthy if the thing you test locally behaves like the thing that ships. Agronomy Studio runs the *same logical request path* in two physical environments:

- **Local development** uses `tools/mock-apis.mjs` to serve the surfaces the frontend expects.
- **Production** proxies requests through Netlify redirects defined in `netlify.toml` to the deployed functions at `netlify/functions/*.mjs`.

The frontend code does not change between these. It still calls `/agronomy-api/*`. What changes is *who answers* that path.

```
Local:        browser -> /agronomy-api/soil -> tools/mock-apis.mjs (local server)
Production:   browser -> /agronomy-api/soil -> netlify redirect -> netlify/functions/gateway.mjs
```

Because the frontend's contract is identical in both, a feature that works against the local mocks is genuinely exercising the production code path's *shape*, even if the data differs.

## Routing by redirect

In production, `netlify.toml` maps the public path to a function:

```toml
[[redirects]]
  from = "/agronomy-api/*"
  to = "/.netlify/functions/gateway/:splat"
  status = 200
```

A `status = 200` redirect is a **rewrite**: the browser's URL stays `/agronomy-api/soil`, but Netlify internally serves the function. The `:splat` carries the remaining path (`soil`) into the function, which uses it to decide which domain module to invoke.

The full end-to-end path for one request looks like:

```
/agronomy-api/soil?lat=38.5&lon=-121.7
  -> redirect rewrite
  -> /.netlify/functions/gateway/soil?lat=38.5&lon=-121.7
  -> gateway.mjs parses "soil" from the path
  -> calls netlify/lib/soil
  -> soil module calls upstream (or upstream mock)
```

## Why parity matters for tests

When local and production diverge, you get the classic failure: green locally, broken in prod. The discipline that prevents it is keeping the *contract* stable across environments and only varying the *implementation behind the surface*.

A few rules that keep parity honest:

- **Mock the surface, not the caller.** `tools/mock-apis.mjs` answers `/agronomy-api/*` the way the gateway does. It does not require special client code.
- **Route on the same path semantics.** If production decides the domain by parsing the path splat, the local mock should too. A mock that keys off a different parameter is lying to you.
- **Keep response shapes identical.** The frontend's parsing code is part of what you're testing; mocks that return a cleaner-than-real shape hide bugs.

## A subtle trap: the mock that's too smart

It is tempting to make a local mock return perfect data with no errors. But production gateways encounter timeouts, partial failures, and malformed upstream responses. A faithful mock can *opt into* those conditions so the frontend's error handling is exercised before it reaches users. Parity is not just about the happy path — it's about reproducing the failure modes you care about.
