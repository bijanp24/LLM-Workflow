# Distributions, Thresholds, and Base Rates

This lesson builds on probability multiplication to introduce four tools that make your intuition more precise: the binomial distribution, the geometric distribution, cumulative distribution functions (CDFs), and base rates.

---

## 4. Binomial distribution: repeated yes/no checks

The binomial distribution models repeated trials where each trial has two outcomes:

- success / failure
- correct / incorrect
- verified / not verified

This is useful for LLM verification because many checks are binary.

**Example:** You ask an LLM 10 factual questions. Each answer has an 80% chance of being correct. How many correct answers should you expect?

The expected number is:

```
n × p = 10 × 0.8 = 8
```

So you expect about 8 correct answers. But that does not mean every set of 10 will have exactly 8 correct. Sometimes you get 7. Sometimes 9. Sometimes worse.

**LLM lesson:** A model can be pretty accurate and still produce wrong answers regularly.

If a model is right 80% of the time, that also means it is wrong 20% of the time.

For casual brainstorming, that may be fine. For taxes, medication, legal filings, production code, or disability paperwork, that is not fine without verification.

---

## 5. Geometric distribution: how long until failure?

The geometric distribution asks: how many attempts until the first success?

Flipped for hallucinations, it asks: **how many unsupported claims until the first mistake?**

Suppose each claim has a 5% chance of being wrong. That sounds small. But the chance that the first 20 claims are all correct is:

```
0.95 ^ 20 ≈ 0.358
```

Only about **36%**.

So there is about a **64%** chance that at least one claim is wrong somewhere in those 20 claims.

**LLM lesson:** Even low error rates become dangerous over long outputs.

That is why "write me a 30-point analysis with no sources" is risky.

**Better prompting:**

> Give me the top 5 claims. For each one, say how confident you are, what source would verify it, and whether it depends on current information.

---

## 6. CDFs: how much probability has accumulated?

A cumulative distribution function (CDF) answers:

> What is the probability that the value is less than or equal to this point?

In notation: `F(x) = P(X ≤ x)`

In plain English: by the time I reach this number, how much probability have I accumulated?

For LLM users, the CDF is useful as an intuition for **thresholds**.

**Example:** How many independent checks do I need before I feel comfortable?

- One source gives you ~70% confidence.
- Two independent sources get you to ~90%.
- A primary source plus a test gets you to ~98%.

The CDF mindset teaches people to think in thresholds:

| Use case | Required confidence |
|---|---|
| Brainstorming | Low |
| Social media posts | Medium |
| School explanations | Medium-high |
| Production code | High |
| Legal / medical / financial | Very high |
| Irreversible decisions | Extremely high |

The more severe the consequence, the farther into the confidence curve you need to go.

---

## 7. Base rates: some questions are more hallucination-prone

A base rate is the background probability of something before you look at the specific case.

**Lower hallucination risk:**
- Explain the Pythagorean theorem.
- What is a binomial distribution?
- Give me a metaphor for recursion.

**Higher hallucination risk:**
- What is the current API syntax for this library?
- What changed in California law this year?
- What did this company announce yesterday?
- What dose should I take?
- Summarize this PDF you have not actually read.

The base rate of error is higher when information is:

- Recent or frequently-updated
- Niche or highly specific
- Legal, medical, or financial
- Source-specific or dependent on exact wording
- From a private or unpublished document

**LLM lesson:** Not all questions have the same hallucination risk.

The user should ask: *Is this the kind of thing an LLM is likely to know, or the kind of thing it needs to verify?*

---

## Quick example

An AI gives 10 claims. Each has a 10% chance of being wrong.

```
Chance all are correct:  0.9 ^ 10 ≈ 0.349
Chance at least one is wrong:  1 - 0.349 = 0.651
```

There is about a **65%** chance that at least one claim is wrong.

**Lesson:** Long unsupported answers are statistically risky.
