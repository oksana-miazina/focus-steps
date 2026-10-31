---
status: Accepted
owner: unassigned
reviewers: []
updated_at: 2026-10-31
feature_size: M
ticket: focus-steps
---

# 0002 — Split the product into home, open-stair, and correct modules

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** Owner (during design walk)

## Context

Product behaviour for goals and stairs is not in the skeleton yet (`src/modules/` has only `health`). ADR-0002 at repo level requires each area under `src/modules/<area>/{http,service,repo}`. Design must choose how many product areas to create for SCR-01…04 and the one-open-stair invariant.

## Decision drivers

- Screen inventory groups work into Home, Open a stair, Goal, and Correct (`ux-flows.md`).
- One open stair at a time must be enforced wherever a stair is created (`spec.md` AC-06).
- Three-layer module folders stay the wiring unit (`docs/adr/0002-lay-modules-out-in-three-layers.md`).

## Considered options

1. **One module** (`focus` or `stairs`) — all goals and stairs behaviour in one area.
2. **Two modules** (`goals` + `stairs`) — goals read/write separate from stair lifecycle.
3. **Three modules** (`home`, `open-stair`, `correct`) — split by primary screens: list/progress, open a stair, correct a finished stair.

## Decision outcome

**Chosen:** Option 3.

| Module | Path | Owns |
|---|---|---|
| `home` | `src/modules/home/` | SCR-01 Home and SCR-03 Goal: goal names, open-stair readout and mark done, finished list and total |
| `open-stair` | `src/modules/open-stair/` | SCR-02: name stair + goal, create open stair, refuse empty names and a second open stair |
| `correct` | `src/modules/correct/` | SCR-04: change a finished stair's name or time; goal total follows the new time |

`health` stays the baseline boot module. Modules call each other by direct function call. The one-open-stair rule is checked in `open-stair` service and must see the same open-stair state `home` reads.

## Consequences

**Positive**
- Each screen cluster has a clear folder to wire from `src/index.ts`.
- Correction stays isolated from opening a stair.

**Negative**
- Goal rows and stair rows are touched by more than one module; shared SQLite tables need a clear owner for migrations (see data-model).
- The one-open-stair invariant spans `home` and `open-stair` — a missed check in either path is a real bug class.

**Neutral**
- Folder names follow screens, not glossary nouns alone; domain terms still come from `CONTEXT.md`.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4 / §5
- Related: `docs/adr/0002-lay-modules-out-in-three-layers.md`, [[0001-deliver-backend-and-web-frontend-surfaces]]
