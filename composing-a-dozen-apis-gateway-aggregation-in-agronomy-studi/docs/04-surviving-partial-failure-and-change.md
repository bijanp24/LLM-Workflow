# Surviving Partial Failure and Change

## Fan-out multiplies failure

The moment your gateway depends on six upstreams, your availability is the *product* of their availabilities. If each domain service is up 99% of the time and you require all six, a naive `Promise.all` succeeds only about `0.99^6 ≈ 94%` of the time. The composer has to be more forgiving than its parts.

## Degrade, don't collapse

`Promise.all` rejects as soon as any single call fails — one flaky service takes down the whole summary. For composition you usually want `Promise.allSettled`, which waits for every call and reports each outcome independently.

```ts
export async function fieldSummary(lat: number, lon: number) {
  const results = await Promise.allSettled([
    getWeather(lat, lon),
    getEt(lat, lon),
    getSoil(lat, lon),
  ]);
  const [weather, et, soil] = results;
  return {
    weather: pick(weather),
    et: pick(et),
    soil: pick(soil),
    // tell the client what is missing instead of failing the whole call
    partial: results.some((r) => r.status === 'rejected'),
  };
}

function pick(r) {
  return r.status === 'fulfilled' ? r.value : null;
}
```

Now a soil outage costs the user the soil panel, not the entire screen. The `partial` flag lets the UI show "soil data temporarily unavailable" instead of an error page. This is **graceful degradation**, and it is a deliberate product decision the gateway is the right place to make.

## Timeouts and the slowest link

Concurrency bounds latency to the slowest call — which is dangerous if one upstream hangs. Wrap each call in a timeout so a stalled service cannot pin the whole response open:

```ts
function withTimeout(p, ms) {
  return Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}
```

A timed-out call simply becomes another `rejected` result feeding the `partial` flag.

## Versioning a composed API

Because the UI depends only on the gateway's shape, you can absorb upstream change behind the gateway. Two tactics:

- **Anti-corruption layer**: each `lib/` module translates its upstream's schema into the gateway's internal vocabulary. When CIMIS renames a field, you fix it in `cimis.ts` and nothing downstream notices.
- **Versioned public path**: if the *gateway's own* response shape must change in a breaking way, expose `/agronomy-api/v2/*` alongside v1 via a second redirect, and retire v1 on a schedule. The UI migrates deliberately rather than breaking on deploy.

## The lesson

A gateway that only handles the happy path is a liability — it concentrates failure without managing it. A gateway that settles all calls, times out slow ones, flags partial results, and shields the client from upstream churn is what makes a dozen-API system actually dependable.
