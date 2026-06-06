# Fat Modules, Thin Wrappers: Structuring Code You Can Actually Test

## The problem with testing serverless functions

A Netlify function is, at heart, a request handler. It receives an HTTP-ish event, does some work, and returns a response. If you put your *domain logic* directly inside that handler, every test has to construct a fake HTTP event, mock the runtime, and parse a serialized response just to check whether your soil-classification math is right. The interesting logic gets buried under transport plumbing.

Agronomy Studio avoids this with a deliberate split:

- `netlify/lib/*` — the **domain modules**: `cimis`, `fret`, `soil`, `crop`, `cnra`, `waterquality`, `gateway`, `ai-search`. These are plain TypeScript modules that take and return ordinary values.
- `netlify/functions/*` — **thin wrappers**: each one parses the request, calls into a `lib` module, and serializes the result.

The rule of thumb: a wrapper should have almost nothing in it worth a unit test, and a module should have almost nothing in it that requires an HTTP runtime to exercise.

## What the split looks like

A domain module exposes a pure-ish function:

```ts
// netlify/lib/soil.ts
export interface SoilQuery { lat: number; lon: number; }
export interface SoilResult { series: string; drainage: "poor" | "moderate" | "well"; }

export function classifySoil(q: SoilQuery, source: SoilSource): SoilResult {
  const sample = source.sample(q.lat, q.lon);
  return {
    series: sample.series,
    drainage: sample.permeability > 5 ? "well" : sample.permeability > 2 ? "moderate" : "poor",
  };
}
```

The wrapper is dull on purpose:

```ts
// netlify/functions/soil.mjs
import { classifySoil } from "../lib/soil.js";
import { liveSoilSource } from "../lib/soil-source.js";

export default async (req) => {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const result = classifySoil({ lat, lon }, liveSoilSource);
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
};
```

Notice the `source` parameter on `classifySoil`. That is dependency injection in miniature: the wrapper passes the *live* source, but a test can pass a fake one. No network, no mocking the global `fetch`.

## Why this pays off

```ts
import { classifySoil } from "../netlify/lib/soil.js";

test("poorly draining soil is flagged", () => {
  const fake = { sample: () => ({ series: "Clay-12", permeability: 1 }) };
  expect(classifySoil({ lat: 36.7, lon: -119.8 }, fake).drainage).toBe("poor");
});
```

That test runs in milliseconds, has no flakiness, and reads like a specification of the rule. The HTTP wrapper — parsing query params, setting headers — is exercised by a handful of higher-level tests, not by every business-rule test.

The deeper principle is **separation of concerns**: transport and serialization are one concern; the agronomy domain is another. Each domain module knows nothing about Netlify, and could be lifted into a different runtime unchanged. The wrappers carry all the runtime-specific knowledge, and there are few enough of them that a mistake in one is easy to spot.
