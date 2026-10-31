---
id: T8
title: "Implement home service (getHome, finish, goal progress, hide)"
layer: "app"
deps: ["T7", "T3"]
blocks: ["T9"]
acs: ["AC-02", "AC-03", "AC-08", "AC-12", "AC-15", "AC-16", "AC-17"]
files_hint: ["src/modules/home/service.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "done"
step: "COMMIT"
---

# T8 — Implement home service (getHome, finish, goal progress, hide)

## Place in the sequence

- **Blocked by:** T7 — home repo; T3 — domain helpers · **Blocks:** T9 — home API · **Wave:** 4 (parallel with T5 after T3).
- **Lane:** own lane (`src/modules/home/service.ts`).

## Why (user story)

> **As a** Owner
> **I want** to mark the open stair done
> **So that** time stops and the stair counts toward its goal
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

Also delivers US-03 progress readout and AC-08 pause/resume behaviour.

## Inlined context

> Goal total = sum of finished stairs' `elapsed_seconds` on read (ADR-0004). getHome resumes visibility segment when an open stair exists (AC-08). hide closes segment into elapsed; gap adds 0 s (ADR-0003). Duplicate finished names stay as separate rows (AC-17).
>
> — `sad.md §6 See a goal's progress` + ADR-0003/0004, abridged · full text: [sad.md](../sad.md)

> **NFR:** Time to show a goal ≤ 1 second; shown finished time within 1 second of counted span.
>
> — `spec.md §6, verbatim targets, abridged` · full text: [spec.md](../spec.md)

**Fallback:** read [sad.md](../sad.md) · [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface. (Ports in T9.)

## Acceptance criteria

### AC-02 — happy path

> **Given** the Owner has an open stair
> **When** the Owner marks that stair done
> **Then** time stops, and the stair appears among that goal's finished stairs with the time it ran
>
> — `spec.md §5, AC-02, verbatim` · full text: [spec.md](../spec.md)

### AC-03 — happy path

> **Given** a goal has finished stairs with time
> **When** the Owner opens that goal
> **Then** the Owner sees each finished stair and the total time on them
>
> — `spec.md §5, AC-03, verbatim` · full text: [spec.md](../spec.md)

### AC-08 — cross-context

> **Given** the Owner has one stair open and time has been running
> **When** the Owner closes the last view of the app, or the app ends in a crash or a power loss, and then opens it again on the same computer
> **Then** that stair is still the only open stair, the time while the app was not visible is not counted, several views would have counted that time once, and time runs again now that the Owner can see the app
>
> — `spec.md §5, AC-08, verbatim` · full text: [spec.md](../spec.md)

### AC-12 — happy path

> **Given** a goal exists and its only stair is still open
> **When** the Owner opens that goal
> **Then** the Owner sees no finished stairs and a total of zero. The open stair is not in the finished list
>
> — `spec.md §5, AC-12, verbatim` · full text: [spec.md](../spec.md)

### AC-15 — happy path

> **Given** the Owner has one stair open
> **When** the Owner looks at the app
> **Then** the Owner sees that stair's name, its goal, and the time counted so far, and can mark it done from there. The stair is not in its goal's finished list. Several views show that same time
>
> — `spec.md §5, AC-15, verbatim` · full text: [spec.md](../spec.md)

### AC-16 — happy path

> **Given** the Owner has one or more goals
> **When** the Owner looks at the app
> **Then** the Owner sees each goal's name and can open a goal by choosing that name
>
> — `spec.md §5, AC-16, verbatim` · full text: [spec.md](../spec.md)

### AC-17 — domain invariant

> **Given** a goal has two finished stairs with the same name and different times
> **When** the Owner opens that goal
> **Then** the Owner sees both stairs, and the total uses both times
>
> — `spec.md §5, AC-17, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [x] Implement getHome, finishOpenStair, getGoalProgress, hideVisibility in `src/modules/home/service.ts`
- [x] Derive `total_elapsed_seconds`; compute `display_elapsed_seconds` via T3 helper
- [x] Tests for listed ACs

## Edge cases

| Case | Behaviour |
|---|---|
| Hide with no open stair | 204 / no-op success at ports; service no-op |
| Two finished same name | both rows; sum both times |
| Only open stair on goal | empty finished; total 0 |

## Definition of Done

- [x] Service tests cover home, finish, derived total, empty finished, duplicate names, hide gap 0 s
- [x] every Hard Rule inlined above still holds
- [x] lint + vet clean
