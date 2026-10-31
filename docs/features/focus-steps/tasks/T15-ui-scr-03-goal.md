---
id: T15
title: "Render SCR-03 Goal default and empty states"
layer: "ui"
deps: ["T9", "T12"]
blocks: ["T17"]
acs: ["AC-02", "AC-03", "AC-12", "AC-17"]
files_hint: ["src/modules/home/http.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T15 — Render SCR-03 Goal default and empty states

## Place in the sequence

- **Blocked by:** T9 — home API; T12 — UI primitives · **Blocks:** T17 — wiring · **Wave:** 6.
- **Lane:** shares `src/modules/home/http.ts` with T9 and T13 — serialize with that pair.

## Why (user story)

> **As a** Owner
> **I want** to open a goal and see its finished stairs and total time
> **So that** progress is visible
>
> — `spec.md §4, US-03, verbatim` · full text: [spec.md](../spec.md)

## Inlined context

> **SCR-03 states:** `default` (GoalHeader with derived total + FinishedStairList; AC-03/17; entry after mark-done AC-02); `empty` (no finished stairs, total zero, open stair not listed — AC-12). Correct link per finished row → SCR-04.
>
> Components: AppShell, GoalHeader, FinishedStairList, EmptyFinishedHint, TextLink, PrimaryButton.
>
> — `screens.md §SCR-03, abridged` · full text: [screens.md](../screens.md)

> Goal total derived on read (ADR-0004) — display `total_elapsed_seconds` from progress payload; do not store a total field in HTML state.
>
> — `adr/0004-derive-goal-total-when-reading-finished-stairs.md, Decision outcome, abridged` · full text: [ADR-0004](../adr/0004-derive-goal-total-when-reading-finished-stairs.md)

**Fallback:** read [screens.md](../screens.md). Do not guess.

## Data delta

No DB changes.

## API contract

- Page loads via `getGoalProgress` fields: `goal`, `finished_stairs[]`, `total_elapsed_seconds`.
- After finishOpenStair, navigate to this page for that goal.

— `contracts/openapi.yaml, getGoalProgress + finishOpenStair, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

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

### AC-12 — happy path

> **Given** a goal exists and its only stair is still open
> **When** the Owner opens that goal
> **Then** the Owner sees no finished stairs and a total of zero. The open stair is not in the finished list
>
> — `spec.md §5, AC-12, verbatim` · full text: [spec.md](../spec.md)

### AC-17 — domain invariant

> **Given** a goal has two finished stairs with the same name and different times
> **When** the Owner opens that goal
> **Then** the Owner sees both stairs, and the total uses both times
>
> — `spec.md §5, AC-17, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] SSR Goal page in `src/modules/home/http.ts` (default + empty)
- [ ] Per-row Correct link; Home back link
- [ ] Test finished list + empty finished copy

## Edge cases

| Case | Behaviour |
|---|---|
| Duplicate finished names | two rows, both times in total |
| Open stair only | empty hint; total 0:00:00 |

## Definition of Done

- [ ] SCR-03 default + empty states match screens.md; tests cover finished list and empty total zero
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
