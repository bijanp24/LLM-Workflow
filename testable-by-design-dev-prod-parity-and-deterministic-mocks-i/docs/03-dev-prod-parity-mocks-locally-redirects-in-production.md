# Dev/Prod Parity: Mocks Locally, Redirects in Production

## The same surface, two backends

The frontend always calls `/agronomy-api/*`. What answers that path differs by environment:

- **Local development** uses `tools/mock-apis.mjs` to serve the gateway and AI surfaces.
- **Production** uses Netlify redirects in `netlify.toml` to proxy `/agronomy-api/*` to the deployed functions in `netlify/functions/*.mjs`.

```toml
# netlify.toml (sketch)
[[redirects]]
  from = "/agronomy-api/*"
  to   = "/.netlify/functions/gateway/:splat"
  status = 200
```

A `status = 200` rewrite means the browser's URL stays `/agronomy-api/...`; Netlify quietly serves the function. The frontend never learns the function's real path. End to end, a request looks like:

```
browser GET /agronomy-api/soil?lat=..&lon=..
  -> Netlify redirect (rewrite)
  -> /.netlify/functions/gateway/soil?lat=..&lon=..
  -> gateway module fans out to lib/soil
```

## Why parity is the whole point

Dev/prod parity means the thing you test locally behaves like the thing that ships. If local dev hit a totally different code path than production, every "works on my machine" success would be meaningless. Here, parity is achieved by keeping the **client-visible contract identical** — `/agronomy-api/*` in both environments — even though the machinery behind it differs.

The mock server and the production functions are obligated to honor the same URL shapes and response schemas. That shared contract is what lets you develop and test against the mock with confidence that production will respond the same way.

## Where parity can quietly break

The danger is drift: the mock and the real functions diverge over time. Common culprits:

- The mock returns a field the real function forgot to add (or vice versa).
- Status codes differ on errors (mock returns 200 with an error body; production returns 500).
- Query-parameter handling differs (trailing slash, casing, missing param defaults).

Guard against this by treating the contract as a shared artifact — schema definitions or fixtures both the mock and the functions are validated against — rather than two hand-written implementations that happen to look similar today.

## What to take away

The redirect is more than routing; it is the seam that lets local mocks and production functions present the *same front door*. Parity is preserved by holding the client-visible contract constant and validating both backends against it.
