---
id: T5
title: "Implement openStair service rules"
layer: "app"
deps: ["T4"]
blocks: ["T6"]
acs: ["AC-01", "AC-04", "AC-06", "AC-09", "AC-10", "AC-11"]
files_hint: ["src/modules/open-stair/service.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "done"
step: "COMMIT"
---

# T5 — Implement openStair service rules

## Place in the sequence

- **Blocked by:** T4 — open-stair repo · **Blocks:** T6 — openStair API · **Wave:** 4.
- **Lane:** own lane (`src/modules/open-stair/service.ts`).

## Why (user story)

> **As a** Owner
> **I want** a plain explanation when a second stair will not open
> **So that** I know the current stair must be marked done first
>
> — `spec.md §4, US-05, verbatim` · full text: [spec.md](../spec.md)

Also delivers US-01 open path: validate names, find-or-create goal only when the stair actually opens, start a visibility segment.

## Inlined context

> Runtime — Open one stair: read whether a stair is already open → find or create goal by trimmed name → insert open stair, start visibility segment. Refuse empty stair/goal names with no writes. Second stair refused: no goal created, no second stair written.
>
> — `sad.md §6, Open one stair + Refuse open + Second stair refused, abridged` · full text: [sad.md](../sad.md)

> **Hard rule:** Enforce one-open-stair in `open-stair` service; cover AC-06 in tests.
>
> — `sad.md §11, one-open-stair risk, abridged` · full text: [sad.md](../sad.md)

> Error codes (service outcomes mapped later by ports): `open_stair.empty_stair_name`, `open_stair.empty_goal_name`, `open_stair.already_open`.
>
> — `contracts/openapi.yaml, operationId openStair, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

**Fallback:** read [sad.md](../sad.md) · [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

No DB changes. (Uses T1/T2 tables via repo.)

## API contract

Internal — no API surface. (Ports in T6.)

## Acceptance criteria

### AC-01 — happy path

> **Given** the Owner has a goal and no stair is open
> **When** the Owner opens a stair under that goal and names it as a completed action
> **Then** time starts on that stair and it is the only open stair
>
> — `spec.md §5, AC-01, verbatim` · full text: [spec.md](../spec.md)

### AC-04 — error

> **Given** the Owner has a goal and no stair is open
> **When** the Owner tries to open a stair with a name that is empty, including a name made only of spaces
> **Then** no stair is created, time does not start, and the Owner is told in plain language that the name has to be a completed action
>
> — `spec.md §5, AC-04, verbatim` · full text: [spec.md](../spec.md)

### AC-06 — domain invariant

> **Given** the Owner already has one stair open
> **When** the Owner tries to open a second stair
> **Then** the second stair is not created, no goal is created, the first stays open, and the Owner is told in plain language to mark the current stair done first
>
> — `spec.md §5, AC-06, verbatim` · full text: [spec.md](../spec.md)

### AC-09 — happy path

> **Given** the Owner has no goal with the name they are about to use, and no stair is open
> **When** the Owner opens a stair, names it as a completed action, and gives the goal a name
> **Then** that goal exists, the stair is open under it, and time starts
>
> — `spec.md §5, AC-09, verbatim` · full text: [spec.md](../spec.md)

### AC-10 — error

> **Given** no stair is open
> **When** the Owner tries to open a stair with a goal name that is empty, including a name made only of spaces
> **Then** no goal is created, no stair is created, time does not start, and the Owner is told in plain language that the goal needs a name
>
> — `spec.md §5, AC-10, verbatim` · full text: [spec.md](../spec.md)

### AC-11 — domain invariant

> **Given** the Owner already has a goal with a name, and no stair is open
> **When** the Owner opens a stair and uses that same goal name: the same characters after spaces at the ends are ignored, and capital letters differ from small letters
> **Then** the stair opens under the existing goal, and a second goal with that name is not created
>
> — `spec.md §5, AC-11, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [x] Implement `openStair({ stairName, goalName })` in `src/modules/open-stair/service.ts`
- [x] Order: blank checks → already-open check (no writes) → find-or-create goal → insert open stair with segment start
- [x] Tests for AC-01/04/06/09/10/11

## Edge cases

| Case | Behaviour |
|---|---|
| Empty stair name | refuse; no goal/stair write |
| Empty goal name | refuse; no goal/stair write |
| Already open | refuse; no goal/stair write |
| Trimmed match existing goal | reuse goal; no second goal |

## Definition of Done

- [x] Service tests cover happy open, empty refusals, second-open refusal with no writes, find-or-create by trimmed case-sensitive name
- [x] every Hard Rule inlined above still holds
- [x] lint + vet clean
