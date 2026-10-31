---
id: T14
title: "Render SCR-02 Open a stair default and validation states"
layer: "ui"
deps: ["T6", "T12"]
blocks: ["T17"]
acs: ["AC-01", "AC-04", "AC-10"]
files_hint: ["src/modules/open-stair/http.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "done"
step: "COMMIT"
---

# T14 — Render SCR-02 Open a stair default and validation states

## Place in the sequence

- **Blocked by:** T6 — openStair API; T12 — UI primitives · **Blocks:** T17 — wiring · **Wave:** 6.
- **Lane:** shares `src/modules/open-stair/http.ts` with T6 — serialized after JSON handler.

## Why (user story)

> **As a** Owner
> **I want** to open one stair under a goal
> **So that** time starts and I stay on that action
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

## Inlined context

> **SCR-02 states:** `default` (stair name + goal name form); `validation` (empty stair AC-04 / empty goal AC-10 — stay on SCR-02 with InlineMessage). `error` N/A here — already_open shown on SCR-01. Success redirects to SCR-01.
>
> Components: AppShell, OpenStairForm, PrimaryButton, FieldLabel, InlineMessage.
>
> — `screens.md §SCR-02, abridged` · full text: [screens.md](../screens.md)

**Fallback:** read [screens.md](../screens.md) · [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

No DB changes.

## API contract

- Form posts `stair_name` + `goal_name` into `openStair` (HTML form → same service as JSON).
- Validation messages: "The name has to be a completed action." / "The goal needs a name."

— `contracts/openapi.yaml, openStair 400 examples, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

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

### AC-10 — error

> **Given** no stair is open
> **When** the Owner tries to open a stair with a goal name that is empty, including a name made only of spaces
> **Then** no goal is created, no stair is created, time does not start, and the Owner is told in plain language that the goal needs a name
>
> — `spec.md §5, AC-10, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [x] SSR Open form + POST handler in `src/modules/open-stair/http.ts`
- [x] Validation re-renders SCR-02 with message; success redirects Home
- [x] Test default + validation HTML paths

## Edge cases

| Case | Behaviour |
|---|---|
| Cancel link | returns to Home without writes |
| already_open from form | redirect/render Home error (SCR-01), not SCR-02 |

## Definition of Done

- [x] SCR-02 default + validation states work; tests assert empty-name messages stay on page
- [x] every Hard Rule inlined above still holds
- [x] lint + vet clean
