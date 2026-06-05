# Automation: deploy → course

This folder holds the **reusable trigger** any applied repo (agronomy-studio,
mvp-finance, only-tacos, …) adds so that deploying it asks the LLM Academy to
draft a new course.

## The full chain

```
merge to master in an applied repo
  → export-course-on-deploy.yml runs export-course.mjs
  → repository_dispatch (generate-course) → this repo (LLM-Workflow)
  → generate-course.yml runs tools/generate-course.mjs (Claude)
  → opens a PR with the drafted course      ← review gate
  → you merge
  → notify-academy.yml → repository_dispatch (content-updated) → Academy
  → bump-content.yml bumps the content submodule → Netlify rebuilds
```

## Adopt it in a repo (3 steps)

1. Copy both files in, preserving paths:
   - `export-course-on-deploy.yml` → `.github/workflows/export-course-on-deploy.yml`
   - `export-course.mjs` → `.github/scripts/export-course.mjs`
2. Add a repo secret **`ACADEMY_DISPATCH_TOKEN`** — a GitHub PAT with `repo`
   scope on `bijanp24/LLM-Workflow` (so the dispatch is authorized).
3. (Optional) Add `docs/lessons/next-course.md` describing the course you want.
   If present, it is used as the seed; if absent, the latest commit + changed
   files are used as a fallback.

## What controls the course topic

Edit `docs/lessons/next-course.md` before you merge. Its first `# Heading`
becomes the suggested title; the whole file is the seed Claude builds from.
No file → the automation falls back to the deploy's diff, so you still get a
course, just derived from what shipped rather than what you wrote.

## Required secrets (across repos)

| Secret | Where | Purpose |
|---|---|---|
| `ACADEMY_DISPATCH_TOKEN` | each applied repo **and** this repo | PAT (`repo` scope) for cross-repo `repository_dispatch` |
| `ANTHROPIC_API_KEY` | this repo (`LLM-Workflow`) | powers `tools/generate-course.mjs` |

Also enable, in this repo's **Settings → Actions → General → Workflow
permissions**: *"Allow GitHub Actions to create and approve pull requests"* — so
`generate-course.yml` can open the review PR.
