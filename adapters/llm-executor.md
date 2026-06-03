# Adapter: Generic LLM executor

Any chat-style language model fulfilling a contract. Vendor-neutral — it works by
giving the model the role, then the contract, and requiring a structured report back.
No specific product, panel, or API is assumed.

## How to run it

1. **(Optional) Set the role.** Paste `templates/SYSTEM_PROMPT_TEMPLATE.md` (filled in
   for your project) as the model's instructions, so it adopts the shared standards.
2. **Inject the contract.** Paste the filled `CONTRACT_TEMPLATE.md` for this unit of work.
3. **Isolate the unit of work.** Have the model produce its changes against an isolated
   workspace (a branch/copy), or as a self-contained diff you apply in isolation — so
   nothing shared is touched until you accept it.
4. **Require the report.** The model must finish with the contract's Required-report
   format, including real verification evidence — not a claim of success.
5. **Join.** You (or the orchestrator) check the evidence and either commit (ACCEPTED)
   or discard (ABORTED).

## A ready-to-paste wrapper

> You are executing a single work contract. Follow it exactly.
>
> Rules:
> - Change only files listed under **Allowed scope**. If the task would require editing
>   anything else, **stop** and report `BLOCKED` with the reason — do not edit it.
> - If any **Abort criterion** holds, **stop**, discard your changes, and report
>   `ABORTED` with which criterion fired.
> - Do not expand the goal. Do the smallest change that meets the **Success criteria**.
> - Run the **Verification** and include the actual result. Do not claim done without it.
> - End with the contract's **Required report**, stating final state ACCEPTED or ABORTED.
>
> The contract follows:
>
> ```
> <paste the filled contract here>
> ```

## Why this stays generic

Notice nothing above names a vendor, model, or product. The contract is the interface;
this adapter is just "pipe the interface into a chat model and demand a structured
result." Any model that can read and write text satisfies it — which is the point.
