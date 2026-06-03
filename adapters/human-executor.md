# Adapter: Human executor

A person fulfilling a contract by hand. This is the always-available fallback and the
clearest demonstration that a contract assumes nothing about *who* executes it.

> **Analogy.** A contract is a work order on a clipboard. You — the worker — pick it up,
> read what "done" means, do the work in a space where mistakes won't break anything
> live, get it inspected, and either hand it in or tear it up. The clipboard doesn't
> care that it's you; tomorrow it could be someone else.

## Steps

1. **Read the whole contract first** — including the **Reference** files. Don't start
   until you understand the goal and what "done" means.
2. **Open an isolated workspace** (the unit of work). In a code project this is a
   branch or a separate copy — somewhere you can change things without affecting the
   shared project. *Begin the transaction.*
3. **Work only inside Allowed scope.** If you find yourself needing to change something
   not on that list — **stop**. That's a BLOCKED situation: tell the orchestrator and
   wait. Do not quietly edit the other file.
4. **Check the Abort criteria as you go.** If any becomes true, stop and discard your
   workspace. Reverting is not failure — it's the system working as designed. Report
   which criterion fired.
5. **Verify.** Run the contract's verification steps yourself and look at the real
   result. "I'm pretty sure it works" is not verification.
6. **Hand it in or tear it up.**
   - All success criteria verified → submit the work (commit). State **ACCEPTED**.
   - An abort criterion fired → discard the workspace (rollback). State **ABORTED**.
7. **Write the report** in the contract's Required-report format, including the actual
   verification evidence.

## The one rule people break

When a person gets stuck, the instinct is to "just fix the other thing too." That is
exactly the scope-expansion the workflow forbids, because in parallel work someone else
may own that other thing. Stuck → BLOCKED → ask. Never improvise across the fence.
