---
id: T3
title: "Add name trim/validation and open-stair display-elapsed helpers"
layer: "domain"
deps: []
blocks: ["T4", "T8", "T10"]
acs: ["AC-04", "AC-10", "AC-11", "AC-15"]
files_hint: ["src/modules/shared/", "tests/"]
owner: "Owner"
estimate: "S"
context_budget: "S"
status: "todo"
step: ""
---

# T3 — Add name trim/validation and open-stair display-elapsed helpers

## Place in the sequence

- **Blocked by:** — · **Blocks:** T4 — open-stair repo; T8 — home service; T10 — correct module · **Wave:** 1 (pure domain; parallel with T1).
- **Lane:** own lane (`src/modules/shared/`).

## Why (user story)

> **As a** Owner
> **I want** to open one stair under a goal
> **So that** time starts and I stay on that action
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Shared trim/empty checks and display-elapsed math keep open-stair, home, and correct consistent without duplicating rules.

## Inlined context

> Same name = same characters after end spaces ignored; capital and small letters differ. Empty / only spaces creates neither goal nor stair. Open-stair display time (not a column): `elapsed_seconds` plus seconds since `visible_started_at` when non-NULL — computed in `service`.
>
> — `spec.md §1` + `data-model.md` open-stair display time, abridged · full text: [spec.md](../spec.md) · [data-model.md](../data-model.md)

> Product rules stay in `service`; the database stores rows.
>
> — `sad.md §2 Conventions, verbatim` · full text: [sad.md](../sad.md)

**Fallback:** read [spec.md](../spec.md) · [data-model.md](../data-model.md). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

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

### AC-11 — domain invariant

> **Given** the Owner already has a goal with a name, and no stair is open
> **When** the Owner opens a stair and uses that same goal name: the same characters after spaces at the ends are ignored, and capital letters differ from small letters
> **Then** the stair opens under the existing goal, and a second goal with that name is not created
>
> — `spec.md §5, AC-11, verbatim` · full text: [spec.md](../spec.md)

### AC-15 — happy path

> **Given** the Owner has one stair open
> **When** the Owner looks at the app
> **Then** the Owner sees that stair's name, its goal, and the time counted so far, and can mark it done from there. The stair is not in its goal's finished list. Several views show that same time
>
> — `spec.md §5, AC-15, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Add trim + `isBlankName` helpers — `src/modules/shared/` (or equivalent small module folder)
- [ ] Add `displayElapsedSeconds(elapsed, visibleStartedAt, now)` helper
- [ ] Unit tests for trim/blank and display elapsed — `tests/`

## Edge cases

| Case | Behaviour |
|---|---|
| `"  Homework  "` | trims to `"Homework"` for lookup/store |
| `"Homework"` vs `"homework"` | different names (case-sensitive) |
| `visible_started_at = null` | display equals `elapsed_seconds` only |

## Definition of Done

- [ ] Unit tests for trim/empty name rules and display_elapsed_seconds pass
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
