# Glossary

Plain-language definitions of every term used in this repo.

| Term | Definition |
|------|------------|
| **Contract** | A self-contained document describing one unit of work: its goal, the exact scope it may touch, the criteria that define success, the conditions that force an abort, and how completion is verified. It never names who executes it. |
| **Executor** | Whoever or whatever fulfills a contract — a human, a current LLM, or a future model. Injected into the contract by the orchestrator; interchangeable. |
| **Orchestrator** | The coordinator that partitions a goal into contracts, injects executors, and joins the results. The one place that knows about both contracts and available executors (the *composition root*). |
| **Unit of Work** | The isolated boundary in which a contract is executed. Has exactly two exits: **commit** (success) or **rollback** (abort). |
| **Allowed scope** | The explicit list of files/areas a contract is permitted to change. Touching anything outside it is an abort condition. |
| **Success criteria** | The conditions that must be verifiably true for the contract to be ACCEPTED. "Done" is defined here, by the contract — not by the executor. |
| **Abort criteria** | The explicit conditions under which the executor must stop and roll back rather than push forward. The `ROLLBACK` triggers. |
| **Verification** | The concrete steps (a command, a check, a manual procedure) that prove the success criteria hold. Evidence of it is required before ACCEPTED. |
| **Fork** | Handing independent contracts to executors at the same time so they run in parallel, like threads. |
| **Join** | Collecting the executors' results, verifying them, integrating the ACCEPTED contracts, and discarding the ABORTED ones. |
| **Commit** | Integrating a contract's verified work into the shared project. |
| **Rollback** | Discarding a contract's isolated workspace so the shared project returns to its exact prior state. |
| **Adapter** | A description of how one *kind* of executor (a human, a generic LLM) fulfills a contract. The core workflow never depends on any adapter. |
| **IoC (Inversion of Control)** | The principle that the contract — not the executor — owns the definition of correctness. |
| **DI (Dependency Injection)** | The mechanism: the executor is supplied to the contract from outside, rather than chosen by it. |
| **Composition root** | The single place where contracts and executors are wired together — here, the orchestrator. |
