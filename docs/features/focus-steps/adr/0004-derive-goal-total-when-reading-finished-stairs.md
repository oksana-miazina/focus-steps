---
status: Accepted
owner: unassigned
reviewers: []
updated_at: 2026-10-31
feature_size: M
ticket: focus-steps
---

# 0004 — Derive the goal total when reading finished stairs

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** Owner (during design walk)

## Context

A goal's progress is its finished stairs and the total time on them (`spec.md` AC-03, AC-07, AC-12, AC-17). After a correction, the total must use the new time. Design must choose whether that total is stored on the goal row or computed when the Owner opens the goal.

## Decision drivers

- Correction of a finished stair's time must change what the goal shows (`spec.md` AC-07).
- Time to show a goal ≤ 1 second (`spec.md` §6) on one Owner's local data.
- Product rules stay in `service`; the database stores rows (`docs/adr/0003`).

## Considered options

1. **Derive on read** — sum finished stairs' times when showing a goal; no separate writable total column.
2. **Store a denormalized total on the goal** — update that field whenever a stair is marked done or corrected.

## Decision outcome

**Chosen:** Option 1. `home` (goal view) sums finished stair times in `service` (or equivalent read path). `correct` updates the stair only; the next goal read reflects the new sum.

## Consequences

**Positive**
- AC-07 cannot drift: there is no second number to forget to update.
- Simpler writes on mark-done and correct.

**Negative**
- Every goal open rescans that goal's finished stairs; acceptable while NFR is one local Owner and ≤ 1 second.

**Neutral**
- A stored total can be added later if volume forces it; that would be a new ADR.

## Links

- Spec: [[../spec.md]] AC-03, AC-07
- SAD: [[../sad.md]] §8
- Related: [[0002-split-product-into-home-open-stair-and-correct-modules]]
