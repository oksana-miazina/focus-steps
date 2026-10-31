---
id: T18
title: "Add integration tests for open, finish, progress, correct, and hide"
layer: "tests"
deps: ["T17"]
blocks: []
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-05", "AC-06", "AC-07", "AC-08", "AC-09", "AC-10", "AC-11", "AC-12", "AC-13", "AC-14", "AC-15", "AC-16", "AC-17"]
files_hint: ["tests/", "smoke.test.ts"]
owner: "Owner"
estimate: "M"
context_budget: "L"   # justified: full §5 AC suite + fixtures across all modules in one integration harness
status: "done"
step: "COMMIT"
---

# T18 — Add integration tests for open, finish, progress, correct, and hide

## Place in the sequence

- **Blocked by:** T17 — wiring · **Blocks:** — · **Wave:** 8 (final verification before review).
- **Lane:** own lane (`tests/`); may extend `smoke.test.ts` lightly.

## Why (user story)

> **As a** Owner
> **I want** the recorded behaviours of stairs and goals to hold under test
> **So that** each acceptance criterion stays true on this computer
>
> — `spec.md §4–§5 (epic verification), abridged` · full text: [spec.md](../spec.md)

## Inlined context

> Vitest; integration tests use a temporary SQLite file (`SQLITE_PATH`). Fixture helpers from data-model: `newGoal`, `newOpenStair`, `newFinishedStair` (PII-safe). Cover OpenAPI outcomes for open/finish/progress/correct/hide. AC-05: assert listen address is loopback (no remote bind) — document in test name/comment.
>
> — `data-model.md §Test fixtures` + `architecture-map.md` Tests convention, abridged · full text: [data-model.md](../data-model.md)

> Prefer asserting the Given/When/Then of each AC rather than re-paraphrasing. Module unit tests from earlier tasks remain; this suite is the cross-module gate.
>
> — `spec.md §5, coverage intent, abridged` · full text: [spec.md](../spec.md)

**Fallback:** read [spec.md](../spec.md) · [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

No DB changes. (Uses migrated schema via temp DB.)

## API contract

Exercise:

- `POST /api/v1/stairs`, `POST …/finish`, `GET /api/v1/home`, `GET /api/v1/goals/{id}`, `PATCH /api/v1/stairs/{id}`, `POST /api/v1/visibility/hide`

— `contracts/openapi.yaml, paths, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

## Acceptance criteria

### AC-01 … AC-17 — suite coverage

Each id in `acs` is asserted by at least one Vitest case using the verbatim outcome from `spec.md` §5 (open happy/error paths, finish, progress including empty + duplicates, correct keep/refuse, hide/resume, loopback AC-05). Full GWT text lives in [spec.md](../spec.md) §5 — do not weaken assertions here.

> — `spec.md §5, AC-01…AC-17, abridged (full suite)` · full text: [spec.md](../spec.md)

## Checklist

- [x] Add temp-DB helpers under `tests/` per data-model fixtures
- [x] Integration tests for open/finish/home/progress/correct/hide covering every AC id
- [x] AC-05 assertion: server bound to `127.0.0.1`
- [x] `npm test` green including existing smoke

## Edge cases

| Case | Behaviour |
|---|---|
| Second open | 409; DB still one open row |
| Hide then getHome | open remains; display elapsed excludes gap |
| Correct negative time | 400; total unchanged |

## Definition of Done

- [x] Vitest integration suite on temp SQLite asserts OpenAPI outcomes for open/finish/progress/correct/hide and documents loopback-only AC-05; `npm test` passes
- [x] every Hard Rule inlined above still holds
- [x] lint + vet clean
