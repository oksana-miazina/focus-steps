---
id: T9
title: "Expose home, goal progress, finish, and hide API routes"
layer: "ports"
deps: ["T8"]
blocks: ["T13", "T15", "T17"]
acs: ["AC-02", "AC-03", "AC-08", "AC-12", "AC-15", "AC-16", "AC-17"]
files_hint: ["src/modules/home/http.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T9 — Expose home, goal progress, finish, and hide API routes

## Place in the sequence

- **Blocked by:** T8 — home service · **Blocks:** T13 — SCR-01; T15 — SCR-03; T17 — wiring · **Wave:** 5.
- **Lane:** shares `src/modules/home/http.ts` with T13/T15 — serialize JSON routes before HTML pages.

## Why (user story)

> **As a** Owner
> **I want** to open a goal and see its finished stairs and total time
> **So that** progress is visible
>
> — `spec.md §4, US-03, verbatim` · full text: [spec.md](../spec.md)

JSON ports for home/goal/finish/hide that UI pages and integration tests share.

## Inlined context

> No auth — `security: []`; process is loopback-only (AC-05 handled at listen bind). Errors `{code,message}`.
>
> — `contracts/openapi.yaml` info/security + `sad.md` conventions, abridged · full text: [openapi.yaml](../contracts/openapi.yaml)

**Fallback:** read [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

No DB changes.

## API contract

- `GET /api/v1/home` → `200` `Home` (resumes visibility segment when open stair exists).
- `GET /api/v1/goals` → `200` `GoalPage`.
- `GET /api/v1/goals/{goalId}` → `200` `GoalProgress` (`total_elapsed_seconds` derived).
- `POST /api/v1/stairs/open/finish` → `200` `GoalProgress`.
- `POST /api/v1/visibility/hide` → `204`.

— `contracts/openapi.yaml, getHome|listGoals|getGoalProgress|finishOpenStair|hideVisibility, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

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

- [ ] Implement JSON routes in `src/modules/home/http.ts`
- [ ] Contract/integration tests for status codes and schemas

## Edge cases

| Case | Behaviour |
|---|---|
| Hide twice | second call still 204 |
| Home with no goals | `goals: []`, `open_stair: null` |

## Definition of Done

- [ ] Listed routes match OpenAPI status codes and schemas
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
