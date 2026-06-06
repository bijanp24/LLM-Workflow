# Determinism at the Edge: Why the AI Search Is a Mock

## Nondeterminism is a testing tax

A test is only useful if the same input reliably produces the same observable output. Anything that breaks that property — random values, wall-clock time, network flakiness, and especially large language models — makes tests either flaky or vacuous.

Agronomy Studio's AI search is, deliberately, a **deterministic mock**. The LLM calls are stubbed. This is not a temporary shortcut waiting for a 'real' integration; it is an architectural stance about *where* nondeterminism is allowed to live.

## Keep AI out of the core compute path

The domain services — soil, crop, evapotranspiration, water quality — are deterministic transformations of inputs. Given the same coordinates and date, they should return the same numbers. That property is what lets an agronomist trust the output and what lets the test suite assert exact values.

If an LLM sat *inside* that path — say, summarizing soil data before returning it — every downstream assertion would become probabilistic. You could no longer write `assert result.ph == 6.8`; you'd be reduced to fuzzy checks like 'the summary mentions pH', which catch far fewer bugs.

```
Good:   inputs -> deterministic domain modules -> exact, testable results
                                              \-> (optional) AI layer for phrasing, at the edge

Risky:  inputs -> LLM in the middle -> nondeterministic results -> weak tests
```

By placing AI at the **edge** — as a separate surface the frontend calls, not a stage in the gateway's fan-out — the core stays reproducible and the AI feature can fail or degrade without corrupting numeric results.

## What a deterministic mock buys you

- **Reproducible tests.** The mock returns the same response for the same query, so assertions are exact.
- **Offline development.** No API keys, no rate limits, no spend while building UI.
- **A stable contract.** The frontend integrates against a fixed response shape now; swapping in a real model later is an implementation change behind the same surface (the same parity principle from Lesson 2).
- **Clear blame.** When a numeric result is wrong, you know the bug is in a deterministic module, not in a model's mood that day.

## When you do add a real model

The edge placement gives you a clean upgrade path. The real LLM, when introduced, lives behind the same AI-search surface. Its outputs should be treated as *suggestions or presentation*, not as inputs that feed back into deterministic calculations. If you ever need the model's output downstream, snapshot and validate it at the boundary so the rest of the system still sees deterministic data.

The principle generalizes: push the parts you cannot make repeatable to the outermost layer, and keep the testable core free of them.
