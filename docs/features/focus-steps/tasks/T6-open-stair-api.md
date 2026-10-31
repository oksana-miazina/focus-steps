---
id: T6
title: "Expose openStair as POST /api/v1/stairs"
layer: "ports"
deps: ["T5"]
blocks: ["T14", "T17"]
acs: ["AC-01", "AC-04", "AC-06", "AC-09", "AC-10", "AC-11"]
files_hint: ["src/modules/open-stair/http.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "done"
step: "COMMIT"
---

# T6 — Expose openStair as POST /api/v1/stairs

## Place in the sequence

- **Blocked by:** T5 — openStair service · **Blocks:** T14 — SCR-02 UI; T17 — wiring · **Wave:** 5.
- **Lane:** shares `src/modules/open-stair/http.ts` with T14 — serialized before/with UI HTML.

## Why (user story)

> **As a** Owner
> **I want** to open one stair under a goal
> **So that** time starts and I stay on that action
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

JSON port for `openStair` so HTML forms (T14) and tests can call the same contract.

## Inlined context

> HTTP errors use JSON `{ code, message }`. Model handlers on `src/modules/health/http.ts` `writeError`.
>
> — `sad.md §2` + health precedent, abridged · full text: [sad.md](../sad.md)

> **ADR-0001:** backend-service + web-frontend in one local process; this task owns the JSON half of open-stair.
>
> — `adr/0001-deliver-backend-and-web-frontend-surfaces.md, Decision outcome, abridged` · full text: [ADR-0001](../adr/0001-deliver-backend-and-web-frontend-surfaces.md)

**Fallback:** read [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

No DB changes.

## API contract

- `POST /api/v1/stairs` (`openStair`) → `201` `OpenStair` · errors: `400 open_stair.empty_stair_name`, `400 open_stair.empty_goal_name`, `409 open_stair.already_open`.
- Request fields: `stair_name`, `goal_name`.
- Messages: "The name has to be a completed action." / "The goal needs a name." / "Mark the current stair done first."

— `contracts/openapi.yaml, operationId openStair, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

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

- [x] Add `src/modules/open-stair/http.ts` JSON handler for `POST /api/v1/stairs`
- [x] Map service errors to OpenAPI status/code/message
- [x] Handler/integration test for 201/400/409

## Edge cases

| Case | Behaviour |
|---|---|
| Malformed JSON body | 400 with `{code,message}` (reuse health error shape) |
| Success body | includes `display_elapsed_seconds` and `goal_name` |

## Definition of Done

- [x] Handler returns 201 OpenStair, 400 empty_* codes, 409 already_open with `{code,message}`
- [x] every Hard Rule inlined above still holds
- [x] lint + vet clean
