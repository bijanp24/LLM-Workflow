# LLM-Workflow

> A portable, executor-agnostic system for breaking work into **contracts** that
> anyone — a human, today's LLM, or whatever model exists in five years — can
> execute in parallel, safely, and without ever leaving a project in a broken state.

This repository is **documentation, not a framework**. There is nothing to install.
You read it, you fork it, and you drop its templates next to your own project so the
people *and* models working on that project share one clear way of working.

---

## The core idea in one sentence

> **A contract describes _what_ must become true. It never assumes _who_ makes it true.**

Software outlives its tools. Languages, vendors, and models come and go — but there
is always *someone doing the work*. If we write the work down as a contract that is
independent of its executor, the work survives every change of tooling. That is the
entire premise.

---

## Three concepts, borrowed from software architecture

This workflow is a direct application of three well-understood engineering patterns.
If you know them from code, you already understand this repo. If you don't, the
analogies below are the fastest way in.

### 1. Inversion of Control (IoC) — *the contract doesn't pick its executor*

In ordinary work, the doer decides what to do. Here it is **inverted**: the *contract*
defines the work, the boundaries, and the definition of done. The executor merely
supplies effort. Control over *what counts as correct* lives in the contract, not in
whoever happens to pick it up.

> **Metaphor — the sealed work order.** A general contractor writes a work order:
> "Frame this wall, here are the dimensions, it's done when it's plumb and passes
> inspection." It does not matter which carpenter takes it. The work order is in
> control, not the carpenter.

### 2. Dependency Injection (DI) — *the executor is supplied, not hard-coded*

A contract has a slot labeled "executor." You inject whatever is available: a person,
Model A, Model B, a future model with no name yet. Swapping executors changes nothing
about the contract.

> **Metaphor — the power tool and the socket.** The wall socket (the contract) exposes
> a standard interface. You plug in a drill, a saw, or a phone charger (the executor).
> The socket doesn't care; it just provides what the job needs.

### 3. Unit of Work (UoW) — *a transaction: commit on success, roll back on abort*

Each contract is executed inside an **isolated boundary** — a copy, a sandbox, a
branch — so the real project is never touched mid-flight. When the **success criteria**
are met, the work is committed. When an **abort condition** is hit, the whole thing is
discarded and the project is exactly as it was before. There is no half-done state.

> **Metaphor — the database transaction.** `BEGIN` opens a private workspace. Either
> everything succeeds and you `COMMIT`, or anything fails and you `ROLLBACK` as if it
> never happened. The shared database is always consistent.

---

## Why this enables safe parallelism

Because each contract (a) declares the exact files/areas it is allowed to touch and
(b) runs inside its own isolated unit of work, **independent contracts can run at the
same time** — like threads that share nothing. The orchestrator guarantees no two
parallel contracts claim the same files, so their results merge cleanly.

```
                 ┌──────────────┐
                 │ ORCHESTRATOR │  partitions work, hands out contracts
                 └──────┬───────┘
          fork          │            (independent, disjoint scopes)
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │Contract │     │Contract │     │Contract │     each runs in its own
   │  A      │     │  B      │     │  C      │     unit of work (isolated)
   └────┬────┘     └────┬────┘     └────┬────┘
        │ commit/abort  │ commit/abort  │ commit/abort
        └───────────────┼───────────────┘
                 join    ▼
                 ┌──────────────┐
                 │ ORCHESTRATOR │  integrates committed work, discards aborts
                 └──────────────┘
```

This is **fork / join**. The orchestrator forks the work into parallel units, each
unit either commits or rolls back, and the orchestrator joins the committed results
back together.

---

## What's in this repo

| Path | What it is |
|------|------------|
| `README.md` | This file — the concepts. |
| `docs/concepts.md` | The IoC / DI / UoW mapping in depth, with more analogies. |
| `docs/lifecycle.md` | The contract **finite-state machine**: every state and transition, including abort/rollback. |
| `docs/orchestration.md` | The operating procedure: orchestrator vs. executor roles, golden rules, conflict avoidance, parallelism. |
| `docs/glossary.md` | Plain-language definitions of every term. |
| `templates/CONTRACT_TEMPLATE.md` | The fillable, executor-agnostic contract. **Start here when writing work.** |
| `templates/SYSTEM_PROMPT_TEMPLATE.md` | An optional shared role/standards prompt an executor can adopt. |
| `adapters/` | How specific executors fulfill a contract (`human`, `generic LLM`). The core never depends on these. |
| `examples/` | Filled-in contracts you can read end to end. |

---

## How to use it

1. **Read** `README.md` → `docs/lifecycle.md` → `docs/orchestration.md`.
2. **Copy** `templates/CONTRACT_TEMPLATE.md` into your own project for each unit of work.
3. **Fill** in the goal, allowed scope, success criteria, and **abort criteria**.
4. **Inject an executor** — hand it to a person, paste it into a model, whatever you have.
5. **Join** — verify the success criteria, then commit; if an abort condition was hit, discard and the project is untouched.

> The whole point: step 4 can be *anyone or anything*, now or in the future, and steps
> 1–3 and 5 never change.
