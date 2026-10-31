---
status: Draft
owner: "Backend Lead"
reviewers: []
updated_at: "2026-10-31"
feature_size: "M"
---

# API sync report — focus-steps

Derived from `data-model.md` + `sad.md` §6 + `spec.md` §4/§5. Interface kind: HTTP/OpenAPI
(`sad.md` `target_surfaces: [backend-service, web-frontend]`). No async actors in §6 → no
`events.md`. Size M + route standard (from `.size` / `.route`).

**Inputs:** `data-model.md` found; `sad.md` §6 found; `spec.md` found.

**Defaults overridden:** no `BearerAuth` — `security: []` on every operation (AC-05 / foundation
ADR-0001, no account). Servers are loopback only. JSON `/api/v1/...` locks the backend-service
contract for implement/tests; the web-frontend surface maps form posts and page loads onto the
same fields (feature ADR-0001).

## A — Field origins

| schema_path | origin | confidence |
|---|---|---|
| Goal.id | data-model.md → goals.id (ULID TEXT PK) | high |
| Goal.name | data-model.md → goals.name (NOT NULL, UNIQUE, trimmed on write) | high |
| Goal.created_at | data-model.md → goals.created_at (ISO-8601 UTC) | high |
| Stair.id | data-model.md → stairs.id | high |
| Stair.goal_id | data-model.md → stairs.goal_id (FK → goals) | high |
| Stair.name | data-model.md → stairs.name | high |
| Stair.status | data-model.md → stairs.status CHECK (`open` \| `finished`) | high |
| Stair.elapsed_seconds | data-model.md → stairs.elapsed_seconds CHECK `>= 0` | high |
| Stair.visible_started_at | data-model.md → stairs.visible_started_at (NULL when paused/finished) | high |
| Stair.created_at | data-model.md → stairs.created_at | high |
| OpenStair.goal_name | data-model.md → goals.name via stairs.goal_id (AC-15 readout) | high |
| OpenStair.display_elapsed_seconds | data-model.md note — open-stair display time (not a column); service-computed | medium |
| GoalProgress.total_elapsed_seconds | ADR-0004 / data-model.md — derived sum of finished `elapsed_seconds` | high |
| GoalProgress.finished_stairs | data-model.md → stairs WHERE status=`finished` | high |
| Home.goals | data-model.md → goals (list names on home) | high |
| Home.open_stair | data-model.md → stairs partial unique open row | high |
| OpenStairRequest.stair_name | maps to stairs.name on insert (AC-01 / AC-04) | high |
| OpenStairRequest.goal_name | maps to goals.name find-or-create trimmed (AC-09 / AC-10 / AC-11) | high |
| CorrectStairRequest.name | data-model.md → stairs.name update (AC-07 / AC-14) | high |
| CorrectStairRequest.elapsed_seconds | data-model.md → stairs.elapsed_seconds update (AC-07 / AC-13) | high |
| GoalPage.items / has_next / has_prev / next_cursor | derived (cursor wrapper convention) | high |
| Error.code / message / details? | repo convention `{ code, message }` + template envelope | high |
| Ulid pattern | ADR-0003 / data-model.md PK strategy | high |

## B — Drift checklist

1. **Endpoint ↔ data-model** *(core)* — ✓  
   `getHome` / `listGoals` / `getGoalProgress` read `goals` (+ finished `stairs`); `openStair`
   writes `goals`+`stairs`; `finishOpenStair` / `correctFinishedStair` / `hideVisibility` mutate
   `stairs` (visibility / status / elapsed).

2. **Error code ↔ repo error definition** *(core)* — ✓ (proposal)  
   No central error registry yet (`health` uses bare `not_found`). Contract proposes
   `open_stair.*` / `correct.*` codes; reconcile when modules land.

3. **Validation ↔ constraint** *(core)* — ✓  
   `status` enum `open`\|`finished`; `elapsed_seconds` / `display_elapsed_seconds` /
   `total_elapsed_seconds` `minimum: 0`; names `minLength: 1` (trim emptiness enforced in
   service — AC-04/10/14). No `maxLength` in model → none in contract. Stricter-of-two N/A.

4. **OpenAPI ↔ sequence** *(supporting)* — ✓ with follow-ups  
   Happy + alt branches from §6 map to operations/responses below. AC-05 remains N/A
   (loopback; `security: []`).

| §6 flow / branch | Contract |
|---|---|
| Open one stair (happy) | `POST /api/v1/stairs` → 201 |
| Refuse — empty stair name | 400 `open_stair.empty_stair_name` |
| Refuse — empty goal name | 400 `open_stair.empty_goal_name` |
| Second stair refused | 409 `open_stair.already_open` |
| Pause when not visible | `POST /api/v1/visibility/hide` → 204 |
| Resume on home | `GET /api/v1/home` starts visibility segment (description) |
| Mark done | `POST /api/v1/stairs/open/finish` → 200 GoalProgress |
| List goals / goal progress (AC-03/12/16/17) | `GET /api/v1/goals`, `GET /api/v1/goals/{goalId}` |
| Correct valid | `PATCH /api/v1/stairs/{stairId}` → 200 |
| Correct invalid time / empty name | 400 `correct.invalid_time` / `correct.empty_stair_name` |

### Coverage cross-check (back-feed)

| AC | Mapped to |
|---|---|
| AC-01 | `openStair` 201 |
| AC-02 | `finishOpenStair` 200 |
| AC-03 | `getGoalProgress` 200 (finished branch) |
| AC-04 | `openStair` 400 `open_stair.empty_stair_name` |
| AC-05 | N/A — loopback + `security: []` (no remote path) |
| AC-06 | `openStair` 409 `open_stair.already_open` |
| AC-07 | `correctFinishedStair` 200 |
| AC-08 | `hideVisibility` + `getHome` resume |
| AC-09 | `openStair` find-or-create goal |
| AC-10 | `openStair` 400 `open_stair.empty_goal_name` |
| AC-11 | `openStair` trimmed goal name (description) |
| AC-12 | `getGoalProgress` empty finished / total 0 |
| AC-13 | `correctFinishedStair` 400 `correct.invalid_time` |
| AC-14 | `correctFinishedStair` 400 `correct.empty_stair_name` |
| AC-15 | `getHome` open_stair readout |
| AC-16 | `getHome` / `listGoals` |
| AC-17 | `getGoalProgress` duplicate names allowed |

| Operation | §4 story | ≥1 AC |
|---|---|---|
| getHome | US-01 / US-03 | AC-15, AC-16, AC-08 |
| listGoals | US-03 | AC-16 |
| getGoalProgress | US-03 | AC-03, AC-12, AC-17 |
| openStair | US-01 / US-05 | AC-01, AC-04, AC-06, AC-09–11 |
| finishOpenStair | US-02 | AC-02 |
| correctFinishedStair | US-04 | AC-07, AC-13, AC-14 |
| hideVisibility | US-01 | AC-08 |

### Sequence gaps (not in contract — owner `sequences`, due before contract is treated final)

§6 does not show branches for unknown `goalId` / `stairId`, or finish when no stair is open.
Those responses were **not** added (would be orphan errors). If implement needs them, re-run
`sequences` then `/sdd:api focus-steps --reconcile`.

### Flags

None open. Core 1–3 ✓. Supporting 4 ✓ with the sequence-gap note above (informational, not a
pause). No `events.md` (all §6 flows sync).
