---
id: T10
title: "Implement correct module service and repository"
layer: "app"
deps: ["T1", "T2", "T3"]
blocks: ["T11"]
acs: ["AC-07", "AC-13", "AC-14"]
files_hint: ["src/modules/correct/repo.ts", "src/modules/correct/service.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T10 — Implement correct module service and repository

## Place in the sequence

- **Blocked by:** T1 — goals migration; T2 — stairs migration; T3 — domain helpers · **Blocks:** T11 — correct API · **Wave:** 3 (parallel with T4/T7/T12).
- **Lane:** own lane (`src/modules/correct/{repo,service}.ts`). Repo+service folded together (contract not standalone).

## Why (user story)

> **As a** Owner
> **I want** to change the name or the time of a finished stair
> **So that** the goal total shows the correction, not the mistake
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

## Inlined context

> Module `correct` owns SCR-04: change a finished stair's name or time; goal total follows on next read (ADR-0004) — correct updates the stair only.
>
> — `adr/0002` + `adr/0004`, abridged · full text: [ADR-0002](../adr/0002-split-product-into-home-open-stair-and-correct-modules.md) · [ADR-0004](../adr/0004-derive-goal-total-when-reading-finished-stairs.md)

> Valid: name non-empty after trim; `elapsed_seconds >= 0`. Refuse empty/negative time and blank name with no write. After keep, re-read finished stairs and derive total (may call home progress helper or duplicate sum in correct service — prefer calling home progress read to avoid drift).
>
> — `sad.md §6 Correct a finished stair, abridged` · full text: [sad.md](../sad.md)

**Fallback:** read [sad.md](../sad.md) · [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

| Column | Type | Constraints | Change |
|---|---|---|---|
| `stairs.name` | TEXT | NOT NULL | updated in place |
| `stairs.elapsed_seconds` | INTEGER | >= 0 | updated in place |

— `data-model.md §Entities, stairs corrections, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface. (Ports in T11.)

## Acceptance criteria

### AC-07 — cross-context

> **Given** a finished stair's time is part of its goal's total
> **When** the Owner changes that stair's time or name
> **Then** the stair shows the new time or name, and the goal's total uses the new time
>
> — `spec.md §5, AC-07, verbatim` · full text: [spec.md](../spec.md)

### AC-13 — error

> **Given** a finished stair shows a time, and that time is part of its goal's total
> **When** the Owner tries to change that time to empty or to less than zero
> **Then** the change is not kept, the stair and the goal total stay as they were, and the Owner is told in plain language that the time has to be the time the stair ran
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

### AC-14 — error

> **Given** a finished stair has a name
> **When** the Owner tries to change that name to empty, including a name made only of spaces
> **Then** the change is not kept, the previous name stays, and the Owner is told in plain language that the name has to be a completed action
>
> — `spec.md §5, AC-14, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Add `src/modules/correct/repo.ts` (load finished stair; update name/time)
- [ ] Add `src/modules/correct/service.ts` with validation + derived progress return shape
- [ ] Tests for AC-07/13/14

## Edge cases

| Case | Behaviour |
|---|---|
| Patch open stair | out of scope for SCR-04 — refuse or ignore; only finished |
| Only name provided | update name; keep time |
| Only time provided | update time; keep name |

## Definition of Done

- [ ] Tests keep valid corrections and refuse empty/negative time and empty name without writing
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
