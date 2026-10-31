---
id: T11
title: "Expose correctFinishedStair as PATCH /api/v1/stairs/{stairId}"
layer: "ports"
deps: ["T10"]
blocks: ["T16", "T17"]
acs: ["AC-07", "AC-13", "AC-14"]
files_hint: ["src/modules/correct/http.ts"]
owner: "Owner"
estimate: "S"
context_budget: "S"
status: "todo"
step: ""
---

# T11 — Expose correctFinishedStair as PATCH /api/v1/stairs/{stairId}

## Place in the sequence

- **Blocked by:** T10 — correct module · **Blocks:** T16 — SCR-04 UI; T17 — wiring · **Wave:** 5.
- **Lane:** shares `src/modules/correct/http.ts` with T16 — serialize before HTML.

## Why (user story)

> **As a** Owner
> **I want** to change the name or the time of a finished stair
> **So that** the goal total shows the correction, not the mistake
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

## Inlined context

> HTTP errors `{ code, message }`. At least one of `name` or `elapsed_seconds` required on the request body.
>
> — `contracts/openapi.yaml, CorrectStairRequest + Error, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

**Fallback:** read [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

No DB changes.

## API contract

- `PATCH /api/v1/stairs/{stairId}` (`correctFinishedStair`) → `200` `GoalProgress` · errors: `400 correct.invalid_time`, `400 correct.empty_stair_name`.
- Request fields: optional `name`, optional `elapsed_seconds` (minProperties 1).
- Messages: "The time has to be the time the stair ran." / "The name has to be a completed action."

— `contracts/openapi.yaml, operationId correctFinishedStair, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

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

- [ ] Add `src/modules/correct/http.ts` PATCH handler
- [ ] Map refusals to 400 codes/messages; success returns GoalProgress
- [ ] Handler test for 200/400

## Edge cases

| Case | Behaviour |
|---|---|
| Empty JSON body | 400 (minProperties) |
| Unknown stairId | return consistent `{code,message}` (define minimal not-found if needed; prefer finished-only update 0-row → error) |

## Definition of Done

- [ ] Handler returns 200 GoalProgress or 400 correct.invalid_time|correct.empty_stair_name
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
