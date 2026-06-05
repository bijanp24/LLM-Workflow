# Domain Modules vs. Function Wrappers

## Two kinds of code that are easy to confuse

In Agronomy Studio the backend is split into two layers with very different jobs:

- `netlify/lib/*` — **domain modules** (`cimis`, `fret`, `soil`, `crop`, `cnra`, `waterquality`, `gateway`, `ai-search`). These hold the actual logic: how to compute, transform, validate, and combine data.
- `netlify/functions/*` — **function wrappers**. These are thin adapters that expose a domain module as an HTTP endpoint the platform can invoke.

The separation matters because *the unit of deployment* (a serverless function) and *the unit of meaning* (a domain capability) have different lifecycles and different testing needs.

## What a thin wrapper looks like

A wrapper's job is plumbing: parse the request, call the module, shape the response, map errors. It should contain no business rules.

```typescript
// netlify/functions/soil.ts  — thin wrapper
import type { Handler } from "@netlify/functions";
import { getSoilProfile } from "../lib/soil";

export const handler: Handler = async (event) => {
  const lat = Number(event.queryStringParameters?.lat);
  const lon = Number(event.queryStringParameters?.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return { statusCode: 400, body: JSON.stringify({ error: "lat and lon required" }) };
  }

  try {
    const profile = await getSoilProfile({ lat, lon });
    return { statusCode: 200, body: JSON.stringify(profile) };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "soil lookup failed" }) };
  }
};
```

## Where the real work lives

The module knows nothing about HTTP. It takes plain inputs and returns plain outputs, which makes it trivial to unit test without spinning up a server.

```typescript
// netlify/lib/soil.ts  — domain module
export interface SoilQuery { lat: number; lon: number; }
export interface SoilProfile { texture: string; phMin: number; phMax: number; }

export async function getSoilProfile(q: SoilQuery): Promise<SoilProfile> {
  // validation, source selection, transformation — the actual rules
  if (q.lat < -90 || q.lat > 90) throw new Error("lat out of range");
  // ...fetch and normalize...
  return { texture: "loam", phMin: 6.0, phMax: 7.2 };
}
```

## Why this split pays off

- **Testability.** You can test `getSoilProfile` with a function call and an assertion. No mocking of HTTP events, no deployment.
- **Reuse.** The `gateway` module can import `soil` directly when composing a response, instead of making an internal HTTP hop. Logic is shared at the code level.
- **Portability.** If you move off Netlify Functions tomorrow, you rewrite the wrappers — a few lines each — and keep every domain module untouched.
- **Clear blame lines.** A 400 in a wrapper is a plumbing bug; a wrong pH range is a domain bug. The structure tells you where to look.

## The discipline

The wrapper should be small enough to read in one screen. If you find yourself writing `if` statements about agronomy inside a `netlify/functions/*` file, that logic belongs in `netlify/lib/*`. Keep the boundary sharp: **wrappers translate protocols; modules make decisions.**
