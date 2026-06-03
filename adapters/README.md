# Adapters

An **adapter** describes how one *kind* of executor fulfills a contract. It is the
"injected implementation" in dependency-injection terms.

The important property: **the core workflow does not depend on any adapter.** Contracts,
the lifecycle, and the orchestration procedure are all written without knowing which
adapter will be used. You can add, remove, or replace adapters at any time — including
adapters for models that don't exist yet — without changing a single contract.

```
        contract  (executor-agnostic interface)
            ▲
            │ injected
   ┌────────┼─────────┐
   │        │         │
 human   generic    <future
 (here)   LLM        executor>
          (here)
```

## Adapters in this repo

| Adapter | File | Use it when |
|---------|------|-------------|
| **Human executor** | `human-executor.md` | A person fulfills the contract by hand. The always-available fallback, and the clearest proof the contract is truly executor-agnostic. |
| **Generic LLM** | `llm-executor.md` | Any chat-style model fulfills the contract. Vendor-neutral; works by pasting the contract in. |

## Adapters we intentionally leave out (for now)

This repo stays docs-only and tool-neutral, so it does **not** ship adapters tied to a
specific product (a particular IDE's agent panel, a specific automation runner, etc.).
Those belong in *your* fork, layered on top, because they depend on tooling that will
change. The point of keeping them out is exactly the point of the whole repo: the core
must outlive any one tool.

If you add such an adapter in your own fork, the rule is simple: it may only describe
*how* an executor runs a contract. It may never require changing the contract format.
