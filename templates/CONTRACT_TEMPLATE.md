<!--
  CONTRACT TEMPLATE
  Copy this file for each unit of work. Fill every section.
  A contract is not READY to hand out until Scope, Success Criteria,
  and Abort Criteria are all complete.

  This contract is executor-agnostic: it must read correctly whether a human,
  today's LLM, or a future model picks it up. Do not name a specific tool or model
  anywhere below.
-->

# <ID> — <short title>

## Goal
<One sentence. What must become true when this is done.>

## Context
<Just enough background for any executor to understand the goal. Link to the files or
docs they should read first. Do not assume prior conversation.>

## Allowed scope (may edit)
<The explicit list of files/areas this contract is permitted to change. If it's not
listed here, the executor may not touch it.>
- `path/to/file`
- `path/to/dir/`

## Reference (read-only, for context)
<Files the executor needs to read but must not change.>
- `path/to/file`

## Success criteria
<The conditions that must be verifiably true to be ACCEPTED. Be specific and testable.>
- [ ] <criterion>
- [ ] <criterion>

## Abort criteria — stop and roll back if any hold
<The conditions that force a rollback instead of pushing forward. Always include the
first three; add contract-specific ones below.>
- [ ] The change would require editing a file outside **Allowed scope**.
- [ ] A contract this one depends on is not yet ACCEPTED (do not stub or fake it).
- [ ] The verification below cannot be run or does not pass and is not recoverable
      within scope.
- [ ] <contract-specific abort condition>

## Verification (required evidence)
<The concrete steps that prove the success criteria. The executor must include the
actual result, not just a claim.>
```
<command, check, or manual procedure>
```
Evidence to report:
- [ ] <what output / observation proves success>

## Dependencies
- Depends on: <other contract IDs, or "none">
- Unblocks: <contract IDs that can start once this is ACCEPTED, or "none">

## Parallelism
- Safe to run in parallel with: <contract IDs whose scope is disjoint, or "none">

## Required report (on finish)
- **Final state:** ACCEPTED or ABORTED
- **Summary of changes:** <what was done>
- **Files changed:** <list — must be a subset of Allowed scope>
- **Verification evidence:** <pasted output / observation>
- **If ABORTED:** which abort criterion fired, and confirmation the workspace was discarded
- **Risks / follow-ups:** <anything the orchestrator should know>
