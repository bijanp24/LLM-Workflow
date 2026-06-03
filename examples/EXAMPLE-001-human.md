<!--
  EXAMPLE — a filled contract, executed by a HUMAN.
  This is illustrative. The "project" is a generic web app; adapt to your own.
  Read alongside adapters/human-executor.md.
-->

# WI-101 — add a "last updated" timestamp to the dashboard footer

## Goal
The dashboard footer shows the date and time the data was last refreshed.

## Context
The dashboard renders from `views/dashboard.html` and is styled by
`styles/dashboard.css`. The refresh time is already available in the page data as the
field `data.lastRefreshed` (an ISO timestamp) — it is simply not displayed yet.

## Allowed scope (may edit)
- `views/dashboard.html`
- `styles/dashboard.css`

## Reference (read-only, for context)
- `data/schema.md`  (documents the `lastRefreshed` field)

## Success criteria
- [ ] The footer displays the value of `data.lastRefreshed`, formatted as a human-readable date and time.
- [ ] When `data.lastRefreshed` is missing, the footer shows "Last updated: unknown" instead of breaking.
- [ ] The footer text is styled consistently with existing footer text (same font size and muted color).

## Abort criteria — stop and roll back if any hold
- [ ] The change would require editing a file outside **Allowed scope**.
- [ ] A contract this one depends on is not yet ACCEPTED.
- [ ] The verification cannot be run or does not pass and is not recoverable within scope.
- [ ] `data.lastRefreshed` turns out not to exist in the page data (the premise is wrong) — abort and report so the orchestrator can re-scope.

## Verification (required evidence)
```
1. Open the dashboard in a browser with sample data that includes lastRefreshed.
2. Confirm the footer shows the formatted date and time.
3. Repeat with sample data where lastRefreshed is removed; confirm "Last updated: unknown".
```
Evidence to report:
- [ ] A note (or screenshot) of the footer in both cases.

## Dependencies
- Depends on: none
- Unblocks: none

## Parallelism
- Safe to run in parallel with: any contract not touching `views/dashboard.html` or `styles/dashboard.css`.

## Required report (on finish)
- **Final state:** ACCEPTED or ABORTED
- **Summary of changes:** ...
- **Files changed:** ...
- **Verification evidence:** ...
- **If ABORTED:** which abort criterion fired, and confirmation the workspace was discarded
- **Risks / follow-ups:** ...

---

<!-- A sample completed report a human might submit -->
## Example completed report
- **Final state:** ACCEPTED
- **Summary of changes:** Added a `<p class="footer-meta">` to the footer showing the
  formatted refresh time, with a fallback string when the value is absent. Added a
  `.footer-meta` rule reusing the existing muted footer color.
- **Files changed:** `views/dashboard.html`, `styles/dashboard.css` (both within scope)
- **Verification evidence:** With sample data → footer read "Last updated: Jun 3, 2026,
  9:14 AM". With the field removed → footer read "Last updated: unknown". Both observed
  in the browser.
- **If ABORTED:** n/a
- **Risks / follow-ups:** Date format is locale-default; if a fixed format is wanted,
  that's a small follow-up contract.
