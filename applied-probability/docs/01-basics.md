# Probability, Fluency, and the Hallucination Trap

## Core thesis

LLMs do not "know" things the way a database knows things. They generate likely continuations. That means users need a basic statistical intuition for probability, uncertainty, repeated trials, and verification.

The goal is not to turn everyone into a statistician. The goal is to teach people how to think:

> "How likely is this answer to be correct, how many independent checks do I need, and what kind of evidence would actually reduce my uncertainty?"

This lesson covers probability as degree of belief, what happens when you chain multiple claims together, and how to break big claims into smaller, testable ones.

---

## 1. Probability as degree of belief

A probability is a number between 0 and 1.

- `0` means impossible.
- `0.25` means 25%, or one out of four.
- `0.5` means 50%, or a coin flip.
- `0.75` means 75%, or likely.
- `1` means certain.

For LLM users, this matters because an answer can sound confident while still being probabilistic. The model's tone is not the same as truth.

A user should learn to mentally separate "the answer sounds fluent" from "the answer is probably correct."

**Fluency is not evidence. Verification is evidence.**

---

## 2. Multiplying probabilities

This is one of the most important ideas.

When several things all need to be true, probabilities multiply.

Suppose an AI gives a five-step legal, medical, financial, or technical answer. Imagine each step is 90% likely to be correct.

That sounds good. But the whole chain is:

```
0.9 × 0.9 × 0.9 × 0.9 × 0.9 = 0.59049
```

So the full five-step answer is only about **59%** likely to be completely correct.

That is the hallucination trap.

A single claim may be reliable. A long chain of unsupported claims decays quickly.

> Every extra unsupported claim is another chance for the answer to break.

This is why long AI answers need citations, source checking, tests, or decomposition.

---

## 3. Dividing into smaller checks

The anti-hallucination move is to break a big claim into smaller claims.

Instead of asking, "Is this whole answer correct?" ask:

- What are the factual claims?
- Which claims are recent or unstable?
- Which claims are high-stakes?
- Which claims can be verified against a primary source?
- Which claims are just reasoning from known facts?

For example, in code, "This function works" is too broad.

Better questions are:

- Does it compile?
- Does it pass tests?
- Does it handle empty input?
- Does it handle null values?
- Does it handle large input?
- Does it match the API contract?

This converts vague confidence into testable evidence.

---

## Quick example

An AI gives 6 claims. Each claim is 95% likely to be correct.

```
0.95 ^ 6 ≈ 0.735
```

So there is only about a **73.5%** chance that all six are correct — even though each individual claim looks reliable.

**Lesson:** High individual accuracy can still produce fragile long answers.
