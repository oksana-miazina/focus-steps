---
id: T4
title: "Add open-stair repository for goals and open stairs"
layer: "infra"
deps: ["T1", "T2", "T3"]
blocks: ["T5"]
acs: ["AC-01", "AC-09", "AC-11"]
files_hint: ["src/modules/open-stair/repo.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T4 — Add open-stair repository for goals and open stairs

## Place in the sequence

- **Blocked by:** T1 — goals migration; T2 — stairs migration; T3 — domain helpers · **Blocks:** T5 — openStair service · **Wave:** 3 (first persistence for open path; parallel with T7/T10/T12).
- **Lane:** own lane (`src/modules/open-stair/repo.ts`).

## Why (user story)

> **As a** Owner
> **I want** to open one stair under a goal
> **So that** time starts and I stay on that action
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Repo SQL for find-or-create goal and insert/read open stair — no product refusal messages here.

## Inlined context

> Module `open-stair` owns SCR-02: name stair + goal, create open stair, refuse empty names and a second open stair. Layering: `repo` runs SQL; product rules stay in `service`.
>
> — `sad.md §5` + `adr/0002`, abridged · full text: [sad.md](../sad.md) · [ADR-0002](../adr/0002-split-product-into-home-open-stair-and-correct-modules.md)

> Access: find-or-create by trimmed name → `goals_name_uk`; read whether a stair is open → `stairs_one_open_uk`; insert open stair with `visible_started_at` set (ADR-0003). IDs: app-generated ULID before insert.
>
> — `data-model.md §Entities/Indexes` + foundation ID rule, abridged · full text: [data-model.md](../data-model.md)

**Fallback:** read [sad.md](../sad.md) · [data-model.md](../data-model.md). Do not guess.

## Data delta

| Column | Type | Constraints | Change |
|---|---|---|---|
| `goals.*` | — | — | read/insert |
| `stairs.*` (open row) | — | partial unique open | read/insert |

— `data-model.md §Entities, goals+stairs, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-01 — happy path

> **Given** the Owner has a goal and no stair is open
> **When** the Owner opens a stair under that goal and names it as a completed action
> **Then** time starts on that stair and it is the only open stair
>
> — `spec.md §5, AC-01, verbatim` · full text: [spec.md](../spec.md)

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

## Checklist

- [ ] Create `src/modules/open-stair/repo.ts` modelled on `src/modules/health/repo.ts`
- [ ] Implement find goal by trimmed name, insert goal, find open stair, insert open stair (ULID + `created_at`)
- [ ] Integration tests with temp `SQLITE_PATH`

## Edge cases

| Case | Behaviour |
|---|---|
| Duplicate goal name insert | UNIQUE on `goals.name` fails — service must find first |
| Second open insert | partial unique index rejects — service checks first |

## Definition of Done

- [ ] Repo integration tests insert/find goal and open stair; detect existing open row
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
