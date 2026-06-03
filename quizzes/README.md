# Quizzes & Course Format

This folder holds the **assessments** for the course. They live in the content repo (not
the viewer app) on purpose: a fork of this repo is a fork of the whole course — content
*and* its quizzes. Any viewer app is just a renderer.

## The two files

### `course.json` (repo root) — the manifest
Defines the course and the ordered list of lessons. Each lesson maps a **doc** (a markdown
file in this repo) to an optional **quiz**.

```jsonc
{
  "id": "foundations",
  "title": "Foundations of Executor-Agnostic Workflows",
  "description": "…",
  "version": "1.0.0",
  "lessons": [
    {
      "id": "concepts",                 // unique, URL-safe
      "title": "Core Concepts",         // shown in the nav
      "doc": "docs/concepts.md",        // path, relative to repo root
      "quiz": "quizzes/concepts.json"   // path or null (a reading-only lesson)
    }
  ]
}
```

### `quizzes/<id>.json` — one quiz per lesson
```jsonc
{
  "id": "concepts",
  "title": "Core Concepts Quiz",
  "passingScore": 0.7,                  // fraction (0–1) required to pass
  "questions": [ /* … */ ]
}
```

## Question types

Two types are supported. Both carry an `explanation` shown after the learner answers.

### `multiple-choice`
`answer` is the **0-based index** into `options`.
```jsonc
{
  "id": "q1",
  "type": "multiple-choice",
  "prompt": "What does the contract own?",
  "options": [
    "The choice of executor",
    "The definition of done",
    "The deployment pipeline",
    "The git history"
  ],
  "answer": 1,
  "explanation": "Under Inversion of Control, the contract owns the definition of done; the executor is injected."
}
```

### `true-false`
`answer` is a boolean.
```jsonc
{
  "id": "q2",
  "type": "true-false",
  "prompt": "An executor may edit files outside its Allowed scope if it seems helpful.",
  "answer": false,
  "explanation": "Out-of-scope work is an abort condition. The executor stops (BLOCKED) rather than expanding scope."
}
```

## Authoring tips

- Keep `id`s URL-safe (letters, numbers, hyphens) — viewers may use them in routes.
- Write each question so the answer is findable in that lesson's doc.
- Always include an `explanation`; the teaching happens in the explanation as much as the question.
- Set `quiz` to `null` in `course.json` for reading-only lessons (glossary, references).
