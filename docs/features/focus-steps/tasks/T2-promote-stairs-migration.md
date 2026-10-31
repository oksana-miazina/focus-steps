---
id: T2
title: "Promote staged stairs migration into live migrations/"
layer: "migration"
deps: ["T1"]
blocks: ["T4", "T7", "T10"]
acs: ["AC-01", "AC-06", "AC-08"]
files_hint: ["docs/features/focus-steps/migrations/02_create_stairs.up.sql", "docs/features/focus-steps/migrations/02_create_stairs.down.sql"]
owner: "Owner"
estimate: "S"
context_budget: "S"
status: "todo"
step: ""
---

# T2 — Promote staged stairs migration into live migrations/

## Place in the sequence

- **Blocked by:** T1 — Promote goals migration · **Blocks:** T4 — open-stair repo; T7 — home repo; T10 — correct module · **Wave:** 2 (after goals table).
- **Lane:** migration sequence — serialized after T1.

## Why (user story)

> **As a** Owner
> **I want** to open one stair under a goal
> **So that** time starts and I stay on that action
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

This task lands the `stairs` table and the partial unique index that enforces at most one open stair.

## Inlined context

> `stairs`: `status` CHECK (`open`\|`finished`); `elapsed_seconds` INTEGER NOT NULL CHECK `>= 0`; `visible_started_at` NULL when paused/finished (ADR-0003); partial UNIQUE `stairs_one_open_uk` so only one `status = 'open'` row exists; FK → `goals(id)`.
>
> — `data-model.md §Entities, stairs, abridged` · full text: [data-model.md](../data-model.md)

> **Decision:** Count open-stair time as visibility segments — accumulated seconds plus current visible segment start; gap while not visible adds 0 s.
>
> — `adr/0003-count-open-stair-time-as-visibility-segments.md, Decision outcome, abridged` · full text: [ADR-0003](../adr/0003-count-open-stair-time-as-visibility-segments.md)

**Fallback:** insufficient or contradicted by the code → read [data-model.md](../data-model.md) · [migrations/](../migrations/). Do not guess.

## Data delta

| Column | Type | Constraints | Change |
|---|---|---|---|
| `id` | TEXT | PK | added |
| `goal_id` | TEXT | NOT NULL, FK → goals | added |
| `name` | TEXT | NOT NULL | added |
| `status` | TEXT | NOT NULL, CHECK open\|finished | added |
| `elapsed_seconds` | INTEGER | NOT NULL, CHECK >= 0 | added |
| `visible_started_at` | TEXT | NULL | added |
| `created_at` | TEXT | NOT NULL | added |

Indexes: `stairs_goal_id_idx`, `stairs_one_open_uk` (partial UNIQUE on open).

Staged pair: `docs/features/focus-steps/migrations/02_create_stairs.up.sql` / `02_create_stairs.down.sql`.

— `data-model.md §Entities + §Indexes, stairs, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-01 — happy path

> **Given** the Owner has a goal and no stair is open
> **When** the Owner opens a stair under that goal and names it as a completed action
> **Then** time starts on that stair and it is the only open stair
>
> — `spec.md §5, AC-01, verbatim` · full text: [spec.md](../spec.md)

### AC-06 — domain invariant

> **Given** the Owner already has one stair open
> **When** the Owner tries to open a second stair
> **Then** the second stair is not created, no goal is created, the first stays open, and the Owner is told in plain language to mark the current stair done first
>
> — `spec.md §5, AC-06, verbatim` · full text: [spec.md](../spec.md)

### AC-08 — cross-context

> **Given** the Owner has one stair open and time has been running
> **When** the Owner closes the last view of the app, or the app ends in a crash or a power loss, and then opens it again on the same computer
> **Then** that stair is still the only open stair, the time while the app was not visible is not counted, several views would have counted that time once, and time runs again now that the Owner can see the app
>
> — `spec.md §5, AC-08, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Confirm staged SQL matches data-model (`docs/features/focus-steps/migrations/02_create_stairs.*.sql`)
- [ ] Promote into live `migrations/` after the goals migration
- [ ] `dbmate up` then `down` on throwaway SQLite; verify partial unique index exists after up

## Edge cases

| Case | Behaviour |
|---|---|
| Two rows with `status = 'open'` | DB rejects via `stairs_one_open_uk` |
| Down order | Drop stairs before goals (T1 down after T2 down) |

## Definition of Done

- [ ] Staged pair promoted; up creates stairs + indexes; down reverts cleanly after T1 goals remain until their down
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean (N/A beyond migration tooling)
