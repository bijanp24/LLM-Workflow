# Thin Wrappers, Fat Libraries

## Where the logic actually lives

Agronomy Studio's backend is split in two by directory:

- `netlify/lib/*` — the **domain modules**: `cimis`, `fret`, `soil`, `crop`, `cnra`, `waterquality`, `gateway`, `ai-search`. These hold the real logic: parsing, validation, composing data, business rules.
- `netlify/functions/*` — **thin wrappers**: the HTTP entry points Netlify invokes. Each one unpacks the request, calls into a lib module, and packs the result back into an HTTP response.

The rule of thumb: **a wrapper should contain no logic worth testing.** If you find yourself wanting to write a unit test against a function wrapper, the logic probably belongs in `lib/` instead.

## What a wrapper looks like

A wrapper's job is translation between the HTTP world and plain function calls:

```js
// netlify/functions/soil.mjs  (a thin wrapper)
import { getSoilProfile } from '../lib/soil.mjs';

export default async (request) => {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get('lat'));
  const lon = Number(url.searchParams.get('lon'));

  const result = await getSoilProfile({ lat, lon });
  return Response.json(result);
};
```

And the lib module is where the substance lives — and where it is testable without ever starting an HTTP server:

```js
// netlify/lib/soil.mjs  (the domain module)
export async function getSoilProfile({ lat, lon }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new ValidationError('lat and lon must be numbers');
  }
  const raw = await fetchSoilSource(lat, lon);
  return normalizeSoil(raw); // pure, deterministic transform
}
```

## Why the separation pays off

### 1. You can test the logic directly

Because `getSoilProfile` is an ordinary function, the test suite (`npm test`) imports it and calls it. No HTTP listener, no port binding, no Netlify runtime emulation. Tests are fast and they target behavior, not plumbing.

```js
import { getSoilProfile } from '../netlify/lib/soil.mjs';

test('rejects non-numeric coordinates', async () => {
  await expect(getSoilProfile({ lat: 'oops', lon: 0 }))
    .rejects.toThrow(/must be numbers/);
});
```

### 2. Type checking covers the part that matters

`npm run typecheck` validates the lib modules, where the domain types live. The thin wrappers mostly shuffle strings and `Response` objects; the interesting contracts — what a soil profile *is* — are checked where they are defined.

### 3. The gateway can reuse modules in-process

The `gateway` module can import `soil`, `crop`, and the others as plain functions instead of making HTTP round-trips to itself. Logic that lives in a library is callable; logic trapped inside an HTTP handler is only reachable over the network.

## This is inversion of control

Notice the direction of the dependency: the wrapper depends on the lib module, never the reverse. The domain logic does not know it is being served over HTTP, invoked by a test, or composed by the gateway. It just exposes functions. The *caller* decides the context. That is inversion of control applied at the smallest useful scale — and it is exactly what keeps the logic portable and testable.
