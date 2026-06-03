# Concepts

This is the long-form version of the three patterns introduced in the README. Read it
once; everything else in the repo is an application of these ideas.

---

## The problem this solves

Every team eventually hits the same three failures when they hand out work:

1. **Tool lock-in.** The process is written around a specific tool or model. The tool
   changes, the vendor disappears, the model is deprecated — and the process dies with it.
2. **Ambiguous done.** "Finish the login page" means different things to the asker and
   the doer. Work comes back not-quite-right and has to be redone.
3. **Broken shared state.** Two doers touch the same file, or one doer leaves the
   project half-changed when they get stuck. Now nothing works and no one is sure why.

A **contract** plus a **unit of work** dissolves all three. The contract removes the
tool dependency and the ambiguity; the unit of work removes the broken-state risk.

---

## Inversion of Control (IoC)

Normally, the entity doing the work also decides what the work is and when it's done.
That couples the *definition of correctness* to the *doer*. If the doer changes, the
definition drifts.

We **invert** it. The contract holds the definition of correctness. The doer is handed
that definition and works to satisfy it. The doer never decides what "done" means —
the contract already did.

- **Without IoC:** "I asked Model X to build it, and whatever Model X produced is the result."
- **With IoC:** "The contract says it's done when these criteria hold. Model X, a human,
  or Model Y all aim at the *same* target."

The benefit: you can change the doer freely and the output is still judged the same way.

---

## Dependency Injection (DI)

DI is how IoC is achieved in practice. The contract has a dependency it does not create
itself — an **executor** — and that dependency is *injected* from the outside by the
orchestrator.

```
Contract  ──needs──▶  [ executor: ??? ]
                          ▲
            injected by   │
            orchestrator  │
        ┌─────────────────┼─────────────────┐
     a human         today's LLM        a future model
```

Because the executor is a slot rather than a hard-coded choice, the contract is written
**once** and run by **any** executor. This is exactly why the same `.md` file can be:

- printed and handed to a person,
- pasted into a chat model,
- fed to an automated runner.

None of those require editing the contract.

---

## Unit of Work (UoW)

A unit of work is a boundary around a change with two exits: **commit** or **rollback**.
Inside the boundary, the executor can make a mess freely, because the mess is private.

- **Begin** — open an isolated workspace (a branch, a worktree, a copy, a sandbox).
- **Commit** — the success criteria are verified true → integrate the change.
- **Roll back** — an abort condition was hit, or verification failed → discard the
  workspace entirely. The project returns to its exact prior state.

The guarantee this buys you: **the shared project is never observed in a half-finished
state.** Either a change is fully done and accepted, or it never happened.

This is what makes parallel execution safe. Ten executors can each be mid-mess inside
ten private units of work; the shared project sees only the clean, committed results.

### Abort criteria are first-class

Most task lists describe *success*. This workflow insists you also write down
**failure** — the explicit conditions under which an executor must **stop and roll back**
rather than push forward. Examples:

- "If the change would require editing a file outside the allowed scope, abort."
- "If a dependency contract hasn't completed, abort — do not stub it."
- "If verification can't be run, abort and report; do not claim done."

Abort criteria are the `ROLLBACK` triggers. Without them, a stuck executor tends to
improvise, and improvisation is how shared state gets corrupted.

---

## Putting it together

| Pattern | Role in this workflow | SQL analogy |
|---------|-----------------------|-------------|
| **IoC** | The contract owns the definition of done. | The schema/constraints own correctness, not the client. |
| **DI**  | The executor is injected per run. | A connection is handed any client. |
| **UoW** | Each contract commits or rolls back atomically. | `BEGIN … COMMIT / ROLLBACK`. |

The orchestrator is the **composition root**: the one place that knows about both
contracts and available executors, wires them together, and integrates the results.
