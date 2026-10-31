---
id: T1
title: "Promote staged goals migration into live migrations/"
layer: "migration"
deps: []
blocks: ["T2", "T4", "T7", "T10"]
acs: ["AC-09", "AC-11", "AC-16"]
files_hint: ["docs/features/focus-steps/migrations/01_create_goals.up.sql", "docs/features/focus-steps/migrations/01_create_goals.down.sql"]
owner: "Owner"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T1 — Promote staged goals migration into live migrations/

## Place in the sequence

- **Blocked by:** — · **Blocks:** T2 — Promote stairs migration; T4 — open-stair repo; T7 — home repo; T10 — correct module · **Wave:** 1 (schema foundation; parallel with T3).
- **Lane:** migration sequence — serialized with T2.

## Why (user story)

> **As a** Owner
> **I want** to open one stair under a goal
> **So that** time starts and I stay on that action
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

This task lands the `goals` table so a goal can exist when named while opening a stair (AC-09/AC-11) and so home can list goal names (AC-16).

## Inlined context

> Goal owns its stairs. Goal total is **not** a column — derived on read (ADR-0004). PK: application-generated ULID as TEXT. `name` TEXT NOT NULL UNIQUE, stored trimmed on write; SQLite TEXT compare is case-sensitive.
>
> — `data-model.md §Entities, goals, abridged` · full text: [data-model.md](../data-model.md)

> **Decision:** Derive the goal total when reading finished stairs — no separate writable total column.
>
> — `adr/0004-derive-goal-total-when-reading-finished-stairs.md, Decision outcome, abridged` · full text: [ADR-0004](../adr/0004-derive-goal-total-when-reading-finished-stairs.md)

> Staged pair already authored: `docs/features/focus-steps/migrations/01_create_goals.up.sql` / `.down.sql`. `implement` promotes into live `migrations/`.
>
> — `data-model.md` + staged migrations, abridged · full text: [migrations/](../migrations/)

**Fallback:** insufficient or contradicted by the code → read the named file in full ([data-model.md](../data-model.md) · [migrations/](../migrations/)) and follow it. Do not guess.

## Data delta

| Column | Type | Constraints | Change |
|---|---|---|---|
| `id` | TEXT | PK | added |
| `name` | TEXT | NOT NULL, UNIQUE (`goals_name_uk`) | added |
| `created_at` | TEXT | NOT NULL | added |

Staged pair: `docs/features/focus-steps/migrations/01_create_goals.up.sql` / `01_create_goals.down.sql`.

— `data-model.md §Entities, table goals, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-09 — happy path

> **Given** the Owner has no goal with the name they are about to use, and no stair is open
> **When** the Owner opens a stair, names it as a completed action, and gives the goal a name
> **Then** that goal exists, the stair is open under it, and time starts
>
> — `spec.md §5, AC-09, verbatim` · full text: [spec.md](../spec.md)

### AC-11 — domain invariant

> **Given** the Owner already has a goal with a name, and no stair is open
> **When** the Owner opens a stair and uses that same goal name: the same characters after spaces at the ends are ignored, and capital letters differ from small letters
> **Then** the stair opens under the existing goal, and a second goal with that name is not created
>
> — `spec.md §5, AC-11, verbatim` · full text: [spec.md](../spec.md)

### AC-16 — happy path

> **Given** the Owner has one or more goals
> **When** the Owner looks at the app
> **Then** the Owner sees each goal's name and can open a goal by choosing that name
>
> — `spec.md §5, AC-16, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [x] Confirm staged up/down match data-model (`docs/features/focus-steps/migrations/01_create_goals.*.sql`)
- [x] Promote into live `migrations/` with dbmate-compatible timestamped name (after baseline)
- [x] Run `dbmate … up` then `down` on a throwaway SQLite URL
- [x] Verify `goals` + `goals_name_uk` exist after up and are gone after down

## Edge cases

| Case | Behaviour |
|---|---|
| Re-run up on existing DB | `IF NOT EXISTS` keeps apply idempotent for create |
| Down after stairs exist | T2 must down first — migration order owns this |

## Definition of Done

- [x] Staged pair promoted to live `migrations/`; up creates `goals` + `goals_name_uk`; down drops them cleanly
- [x] every Hard Rule inlined above still holds
- [x] lint + vet clean (N/A for SQL-only beyond migration tooling)
