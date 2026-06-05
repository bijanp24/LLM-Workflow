# Redirects as Routing

## The public path is not the file path

A visitor calls `/agronomy-api/soil?lat=36.7&lon=-119.8`. There is no file at that path. The mapping from a clean public URL to an actual deployed function is done declaratively in `netlify.toml` using **redirects**.

Think of redirects as a routing table that lives in configuration, not code.

```toml
# netlify.toml

[[redirects]]
  from = "/agronomy-api/*"
  to = "/.netlify/functions/gateway/:splat"
  status = 200   # rewrite, not a browser redirect

[[redirects]]
  from = "/ai-search"
  to = "/.netlify/functions/ai-search"
  status = 200
```

## Status 200 means rewrite, not redirect

This is the detail people miss. A `status = 301` or `302` tells the browser "go somewhere else," changing the URL the client sees. A `status = 200` is a **rewrite (proxy)**: the server quietly serves the target while the browser keeps seeing `/agronomy-api/soil`. The internal path `/.netlify/functions/gateway` is never exposed.

That hidden internal path is exactly the decoupling from Lesson 1, enforced at the routing layer:

- The frontend only ever knows `/agronomy-api/*`.
- The `:splat` captures whatever follows the `*` and passes it through, so `/agronomy-api/soil` arrives at the gateway as a `soil` request.
- You can repoint the `to =` target — to a renamed function, a different region, a new implementation — without the client noticing.

## Routing in config vs. routing in code

Why not route in code with a big `switch` on the URL? You can, but configuration-level routing has properties code does not:

- **No deploy of logic to change a route.** Adjusting a redirect is a config change, reviewed and applied as data.
- **The platform enforces it before your code runs.** Auth, headers, and caching rules can be attached to the matched route declaratively.
- **It is legible.** Anyone can read `netlify.toml` and see the entire public surface in one place.

## Order and specificity

Redirect rules are evaluated top-to-bottom; the **first match wins**. Put specific rules before broad ones, or a wildcard will swallow paths you meant to handle differently.

```toml
# specific first
[[redirects]]
  from = "/agronomy-api/health"
  to = "/.netlify/functions/health"
  status = 200

# broad catch-all after
[[redirects]]
  from = "/agronomy-api/*"
  to = "/.netlify/functions/gateway/:splat"
  status = 200
```

If you reversed these, every `/agronomy-api/health` request would be eaten by the wildcard and never reach the dedicated health function.
