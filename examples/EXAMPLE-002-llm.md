<!--
  EXAMPLE — the SAME contract format, executed by a GENERIC LLM, and showing an ABORT.
  Read alongside adapters/llm-executor.md.
  Note: nothing about the contract changed because the executor changed. That is the point.
-->

# WI-102 — add input validation to the contact form handler

## Goal
The contact form handler rejects submissions with a missing or malformed email address.

## Context
The handler lives in `api/contact_handler.js` and currently saves any submission. Email
format checking is the only validation in scope here.

## Allowed scope (may edit)
- `api/contact_handler.js`
- `api/__tests__/contact_handler.test.js`

## Reference (read-only, for context)
- `api/validation_utils.js`  (may already contain a reusable email check)

## Success criteria
- [ ] A submission with no email is rejected with a clear error.
- [ ] A submission with a malformed email is rejected with a clear error.
- [ ] A submission with a valid email is accepted as before (no regression).
- [ ] Tests cover all three cases and pass.

## Abort criteria — stop and roll back if any hold
- [ ] The change would require editing a file outside **Allowed scope**.
- [ ] A contract this one depends on is not yet ACCEPTED.
- [ ] The verification cannot be run or does not pass and is not recoverable within scope.
- [ ] Adding validation requires changing the shared `api/validation_utils.js` (an
      orchestrator-owned file) — abort rather than edit it.

## Verification (required evidence)
```
npm test -- contact_handler
```
Evidence to report:
- [ ] Pasted test output showing the three cases passing.

## Dependencies
- Depends on: none
- Unblocks: none

## Parallelism
- Safe to run in parallel with: any contract not touching `api/contact_handler.js`.

## Required report (on finish)
- **Final state:** ACCEPTED or ABORTED
- **Summary of changes:** ...
- **Files changed:** ...
- **Verification evidence:** ...
- **If ABORTED:** which abort criterion fired, and confirmation the workspace was discarded
- **Risks / follow-ups:** ...

---

<!-- A sample report where the LLM correctly ABORTED instead of breaking shared state -->
## Example completed report (an abort done right)
- **Final state:** ABORTED
- **Summary of changes:** None integrated. While implementing, I found there is no
  email-checking function in `api/contact_handler.js`, and the only correct place for
  one is the shared `api/validation_utils.js`, which is outside my Allowed scope and is
  orchestrator-owned. Per the 4th abort criterion, I stopped.
- **Files changed:** none (workspace discarded)
- **Verification evidence:** Not run — work was aborted before completion.
- **If ABORTED:** Abort criterion #4 fired (change would require editing the shared
  `validation_utils.js`). Isolated workspace discarded; project unchanged.
- **Risks / follow-ups:** Recommend the orchestrator either (a) add the email helper to
  `validation_utils.js` itself and then re-issue this contract, or (b) widen this
  contract's scope to include that file. Either keeps the shared file under single
  ownership.

> **Why this is a success, not a failure.** The executor hit a real boundary and rolled
> back cleanly instead of editing a shared file behind the orchestrator's back. The
> project is exactly as it was. That is the unit-of-work guarantee working as intended.
