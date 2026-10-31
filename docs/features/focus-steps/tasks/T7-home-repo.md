---
id: T7
title: "Add home repository for goals, open stair, finish, and visibility pause"
layer: "infra"
deps: ["T1", "T2"]
blocks: ["T8"]
acs: ["AC-02", "AC-03", "AC-08", "AC-12", "AC-16"]
files_hint: ["src/modules/home/repo.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T7 — Add home repository for goals, open stair, finish, and visibility pause

## Place in the sequence

- **Blocked by:** T1 — goals migration; T2 — stairs migration · **Blocks:** T8 — home service · **Wave:** 3 (parallel with T4/T10/T12).
- **Lane:** own lane (`src/modules/home/repo.ts`).

## Why (user story)

> **As a** Owner
> **I want** to open a goal and see its finished stairs and total time
> **So that** progress is visible
>
> — `spec.md §4, US-03, verbatim` · full text: [spec.md](../spec.md)

Also supports mark-done and visibility pause persistence for US-02 / AC-08.

## Inlined context

> Module `home` owns SCR-01 Home and SCR-03 Goal: goal names, open-stair readout and mark done, finished list and total.
>
> — `adr/0002-split-product-into-home-open-stair-and-correct-modules.md, Decision outcome, abridged` · full text: [ADR-0002](../adr/0002-split-product-into-home-open-stair-and-correct-modules.md)

> Pause: close current visibility segment into `elapsed_seconds`, clear `visible_started_at`; open stair kept. Finish: freeze elapsed, set `status = finished`, `visible_started_at = null`. Finished list: `status = 'finished'` only.
>
> — `sad.md §6` + `data-model.md` stairs access patterns, abridged · full text: [sad.md](../sad.md) · [data-model.md](../data-model.md)

**Fallback:** read [data-model.md](../data-model.md) · [ADR-0003](../adr/0003-count-open-stair-time-as-visibility-segments.md). Do not guess.

## Data delta

| Column | Type | Constraints | Change |
|---|---|---|---|
| `goals` | — | — | read list |
| `stairs.status` / `elapsed_seconds` / `visible_started_at` | — | — | read/update |

— `data-model.md §Entities, stairs access patterns, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface.

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

### AC-16 — happy path

> **Given** the Owner has one or more goals
> **When** the Owner looks at the app
> **Then** the Owner sees each goal's name and can open a goal by choosing that name
>
> — `spec.md §5, AC-16, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Create `src/modules/home/repo.ts`: listGoals, getOpenStair, listFinishedStairs(goalId), finishOpenStair, pauseVisibility, resumeVisibilitySegment
- [ ] Integration tests on temp SQLite

## Edge cases

| Case | Behaviour |
|---|---|
| Pause when already paused | idempotent no-op |
| Finished list query | never returns `status = open` |

## Definition of Done

- [ ] Repo tests list goals, read open stair, list finished, finish open row, close visibility segment without deleting open stair
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
