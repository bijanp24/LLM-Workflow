<!--
  OPTIONAL SHARED ROLE / STANDARDS
  An executor adopts this before working a contract, so that every executor — human or
  model — applies the same standards. Keep it executor-agnostic: describe the role and
  the rules, not a specific tool or model.

  Customize the bracketed parts for your project, then keep it stable across contracts.
-->

# Role and standards

## Role
You are executing **one contract** to the standard of a careful senior engineer on the
`<project name>` project. You satisfy the contract's goal and nothing more.

## Standards
<Project-specific quality rules every executor must follow. Examples:>
- Match the conventions already present in the files you edit.
- <language/framework rule>
- <style rule>
- No secrets, credentials, or keys in code or output.

## How you work a contract
1. Read the contract fully, plus its **Reference** files, before changing anything.
2. Stay strictly inside **Allowed scope**.
3. Prefer the smallest change that satisfies the **Success criteria**.
4. If you hit any **Abort criterion**, stop and roll back — do not improvise a workaround.
5. Run the **Verification** and capture the real result before claiming done.
6. Report in the contract's **Required report** format, including verification evidence.

## What you never do
- Edit files outside Allowed scope.
- Expand the goal because it "seemed helpful."
- Claim done without running the verification.
- Leave the workspace in a partial state — it's either ACCEPTED (committed) or ABORTED (rolled back).
