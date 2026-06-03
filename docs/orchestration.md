# Orchestration

This is the operating procedure: how an **orchestrator** partitions work into contracts,
injects executors, and joins the results — so that parallel work stays safe.

It is deliberately tool-neutral. "Orchestrator" can be a tech lead, a project manager,
or a coordinating model. "Executor" can be a person or any model. Nothing here assumes
a particular vendor.

---

## Two roles

### Orchestrator — the composition root
Owns everything *between* contracts:
- Partitions a goal into independent units of work.
- Writes each contract: scope, success criteria, abort criteria, verification.
- Decides which contracts can run in parallel (disjoint scopes).
- Injects an executor into each contract.
- Joins results: verifies, integrates the ACCEPTED, discards the ABORTED.
- Owns all **shared/central** files. No executor may touch these.

### Executor — the worker
Owns exactly *one* contract at a time:
- Works only inside its declared allowed scope.
- Runs the contract's verification before claiming done.
- Moves to BLOCKED (never improvises) when it needs something outside scope.
- Reports results in the required format.

---

## Golden rules

These are what make parallelism safe. They are not optional.

1. **One unit of work per contract.** A contract is the transaction boundary.
2. **No two parallel contracts may touch the same file.** Disjoint scopes only.
3. **Shared/central files are orchestrator-owned.** Routing, config, shared models,
   dependency manifests — only the orchestrator edits these.
4. **Executors never expand scope.** Out-of-scope need → BLOCKED → orchestrator decides.
5. **Done is proven, not asserted.** The contract names the verification; it must pass.
6. **Abort is always available.** Every contract carries explicit abort conditions, and
   hitting one means rollback, not a workaround.

---

## The procedure

### 1. Partition
From the goal, identify units of work that can be made **independent** — ideally each
touching a disjoint set of files. Where two pieces of work must touch the same file,
either:
- merge them into a single contract, or
- assign the shared file to the orchestrator and have contracts depend on its result.

### 2. Write contracts
For each unit, fill `templates/CONTRACT_TEMPLATE.md`. A contract is not READY until it
has all of: goal, allowed scope, success criteria, **abort criteria**, and verification.

### 3. Map dependencies
Note which contracts must wait for others and which may run together. A simple form:

```
WI-001  (no deps)            ─┐ run in parallel
WI-002  (no deps)            ─┘
WI-003  (depends on WI-001)   ── runs after WI-001 is ACCEPTED
```

### 4. Fork — inject executors
Hand each READY, dependency-satisfied contract to an executor. Independent contracts
go out at the same time. Each executor opens its own unit of work.

### 5. Collect status
Executors report against a small protocol so the orchestrator always knows the machine
state of each contract:

- `STARTING <id>` — moved to IN_PROGRESS.
- `BLOCKED <id>: <reason>` — needs the orchestrator.
- `VERIFYING <id>` — running the contract's checks.
- `DONE <id>` — claims ACCEPTED; includes verification evidence.
- `ABORTED <id>: <reason>` — rolled back.

### 6. Join
For each contract:
- **DONE** → re-check the verification evidence, then integrate (commit).
- **ABORTED** → confirm the workspace was discarded; the project is untouched.
- **BLOCKED** → resolve, re-scope, or abort.

Integrate ACCEPTED contracts in dependency order. Because scopes were disjoint, they
merge without conflict.

### 7. Record
Update whatever handoff docs the project keeps so the next cycle starts from a known
state.

---

## Conflict avoidance, restated

The whole safety model reduces to one sentence:

> **Disjoint scopes + isolated units of work = parallel work that always merges cleanly
> and never leaves the project broken.**

If you can't make two contracts' scopes disjoint, they are not actually parallelizable —
combine them or serialize them.
