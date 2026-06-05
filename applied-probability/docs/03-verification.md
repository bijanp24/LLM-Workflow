# Verification in Practice

This lesson converts the probabilistic intuition from the previous two lessons into concrete habits: spotting false positives, understanding why independence matters, scaling effort to consequence, and using prompts that make LLMs easier to verify.

---

## 8. False positives and false negatives

A **false positive** is when the system says something is true, but it is false.

A **false negative** is when the system says something is false, but it is true.

For LLMs specifically:

- **False positive:** "This case exists," but the case is fake.
- **False negative:** "I found no evidence," but the source exists.
- **False citation:** The cited source exists but does not support the claim.
- **False summary:** The source is real, but the summary distorts it.
- **False confidence:** The model sounds certain while guessing.

This teaches a very important habit:

> A citation is not automatically proof. The citation has to actually support the sentence.

---

## 9. Independent verification

If two checks are truly independent, confidence improves dramatically. But if they are not independent, confidence barely improves.

**Weak verification:**
1. AI says X.
2. Another AI says X.
3. A third AI says X.

That may still be weak, because all three models may be trained on similar data or repeating the same internet myth.

**Better verification:**
1. AI says X.
2. Official documentation confirms X.
3. A local test confirms X.
4. A recent changelog confirms X.

**Best verification:**
- Primary source + reproducible test + human reasoning.

**LLM lesson:** Do not merely ask the model again. Check against a different *kind* of evidence.

---

## 10. Expected value: risk times consequence

Expected value is:

```
probability × consequence
```

A low-probability mistake can still matter if the consequence is severe.

| Task | Consequence |
|---|---|
| Naming a movie | Low |
| Generating a meme caption | Low |
| Writing production code | Medium-high |
| Interpreting tax law | High |
| Medication advice | Very high |

The point is not "never use AI."

The point is: **verification effort should scale with consequence.**

---

## 11. Practical verification ladder

**Level 0 — Vibes only**
Good for brainstorming, jokes, naming, and ideation. No verification needed.

**Level 1 — Internal consistency**
Good for low-stakes explanations. Ask: does this contradict itself?

**Level 2 — Source check**
Good for factual claims. Ask: what source supports this?

**Level 3 — Primary source check**
Good for law, policy, API docs, science, medicine, and finance. Ask: what does the original source say?

**Level 4 — Reproducible test**
Good for code, math, data, and APIs. Run the code. Check the calculation. Query the API. Open the document.

**Level 5 — Expert review**
Good for high-stakes decisions. Consult a doctor, lawyer, accountant, engineer, professor, or other domain expert.

---

## 12. Prompt patterns that reduce hallucinations

**Weak prompt:**
> Tell me everything about this topic.

**Better prompts:**

- Give me the 5 most important claims. For each claim, label it as *common knowledge*, *reasoning*, or *source-dependent*.
- Separate facts from assumptions.
- Tell me what would change your answer.
- What parts of this answer require current sources?
- Give me a verification checklist.

**Best prompt for technical work:**
> State the claim, state the assumptions, give the test, give the expected result, and list failure cases.

---

## 13. Classroom exercises

**Exercise 1 — Probability multiplication**

An AI gives 6 claims. Each claim is 95% likely to be correct.

```
0.95 ^ 6 ≈ 0.735
```

So there is only about a 73.5% chance that all six are correct. High individual accuracy can still produce fragile long answers.

**Exercise 2 — At least one hallucination**

An AI gives 10 claims. Each has a 10% chance of being wrong.

```
0.9 ^ 10 ≈ 0.349   (all correct)
1 - 0.349 = 0.651  (at least one wrong)
```

About 65% chance that at least one claim is wrong. Long unsupported answers are statistically risky.

**Exercise 3 — Verification improves confidence**

Suppose an AI claim has a 70% chance of being correct. A truly independent source also supports it and is 90% reliable. This does not make the claim magically 100% true, but it should increase confidence.

Discussion question: *Are the two sources actually independent?* If both came from the same blog post, not really. If one is the official manual and the other is a local test, much better.

**Exercise 4 — Identify base-rate risk**

Rank these from lowest hallucination risk to highest:

1. Explain what a fraction is.
2. Explain the binomial distribution.
3. Summarize a private PDF the model has not seen.
4. Give today's OpenAI API pricing.
5. Explain how to test an API endpoint in Postman.
6. Give legal advice for a current California employment issue.

A likely order: `1, 2, 5, 4, 3, 6`

The exact ranking can be debated, but the point is that recency, specificity, and consequence raise verification requirements.

---

## 14. Final mental model

LLMs are powerful probabilistic reasoning and language tools. They are not truth machines. The more claims they make, the more opportunities there are for error. The correct response is not paranoia — it is **statistical hygiene**.

> Trust, but verify. And if the answer has 19 steps, bring a calculator, a source, and a fire extinguisher.
