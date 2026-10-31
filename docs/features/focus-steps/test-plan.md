---
status: Draft
owner: "QA"
reviewers: ["implementing engineer", "Tech Lead"]
updated_at: "2026-10-31"
feature_size: "M"
---

# Test plan — focus-steps

Local Focus Steps: one open stair under a named goal, time only while the Owner can see the app, finished stairs and goal totals, and correction of a finished stair's name or time.

## Levels

| Level | Scope | Strategy (generic — no tool names) |
|---|---|---|
| Unit | Pure logic: a rule, a calculation, a validator — no I/O. | In-memory, no external dependency. |
| Integration | The module against a real dependency it owns (store / cache / queue). | An ephemeral real SQLite file spun up per suite (repo convention), not a mocked store. |
| Contract | A boundary between two participants — an API shape or event schema both sides agree on. | Validate the real shape against the agreed OpenAPI contract; no hand-rolled stubs. |
| E2E | One full flow end to end (one per critical user story). | The flow exercised through its real HTTP entry point against an ephemeral SQLite file. |
| Load | NFR validation — only when an NFR carries a number. | The load tool already in your repo, or e.g. k6 or Locust. |
| Component | A UI component exercised in isolation — props/state → rendered output + interactions. | Render in a component harness; assert output + behaviour, no full app boot. |
| Visual-regression | The rendered UI diffed against an approved baseline image. | Snapshot the render; fail on an unintended visual diff; update the baseline deliberately. |
| E2E-through-UI | A user-story flow driven through the real UI, not just the API. | The flow exercised through the rendered UI against ephemeral dependencies. |

## AC coverage

| AC (spec.md §5) | Test name (intent-based) | Level | Expected outcome |
|---|---|---|---|
| AC-01 Open one stair under a goal | opening a named stair under an existing goal starts time as the only open stair | unit + integration + e2e-through-UI | Stair is open under that goal; time is running; no second open stair |
| AC-02 Mark the open stair done | marking the open stair done freezes time and lists it under the goal | unit + integration + e2e-through-UI | Stair is finished with the time it ran; it appears among that goal's finished stairs |
| AC-03 See a goal's finished stairs and total | opening a goal shows each finished stair and the total time | integration + e2e-through-UI | Every finished stair is visible; total equals the sum of their times |
| AC-04 Empty stair name refused | opening with an empty or whitespace-only stair name creates nothing | unit + component + e2e-through-UI | No stair; time does not start; plain message that the name must be a completed action |
| AC-05 Other computer cannot see or change notes | another computer is not shown the Owner's goals or stairs and cannot change them | integration + contract | No remote access path returns or mutates this computer's notes; local access without login still works |
| AC-06 Second open stair refused | opening a second stair while one is open is refused | unit + integration + e2e-through-UI | No second stair; no new goal; first stays open; plain message to mark the current stair done first |
| AC-07 Correct finished stair name or time | correcting a finished stair's name or time updates the stair and the goal total | unit + integration + e2e-through-UI | Stair shows the new name or time; goal total uses the new time |
| AC-08 Pause when the app is not visible | after last view closed, crash, or power loss, the open stair resumes without counting the gap | unit + integration + e2e | Same open stair remains; gap adds zero; time runs again when visible; several views count once |
| AC-09 New goal created when opening a stair | opening a stair with a new goal name creates that goal and opens the stair | integration + e2e-through-UI | Goal exists; stair is open under it; time starts |
| AC-10 Empty goal name refused | opening with an empty or whitespace-only goal name creates nothing | unit + component + e2e-through-UI | No goal; no stair; time does not start; plain message that the goal needs a name |
| AC-11 Same goal name joins existing goal | trimmed same characters join the existing goal; letter case differs | unit + integration | Stair opens under the existing goal; no second goal with that name |
| AC-12 Goal with only an open stair shows empty finished list | opening a goal whose only stair is still open shows zero finished and total zero | integration + e2e-through-UI | Finished list empty; total zero; open stair not listed as finished |
| AC-13 Invalid corrected time refused | correcting time to empty or less than zero is not kept | unit + component + e2e-through-UI | Stair and goal total unchanged; plain message that time must be the time the stair ran |
| AC-14 Empty corrected stair name refused | correcting name to empty or whitespace-only is not kept | unit + component + e2e-through-UI | Previous name stays; plain message that the name must be a completed action |
| AC-15 Open stair visible on Home | while a stair is open, Home shows name, goal, time so far, and mark-done | component + e2e-through-UI | Open stair details and mark-done are shown; stair not in finished list; several views show the same time |
| AC-16 Goal names listed on Home | Home lists each goal name and opens a goal by that name | component + e2e-through-UI | Each goal name is visible and choosable |
| AC-17 Duplicate finished stair names both count | two finished stairs with the same name both appear and both times are in the total | integration + e2e-through-UI | Both stairs visible; total includes both times |

## Edge cases / error paths

- Empty or whitespace-only stair name on open (AC-04) → expected: nothing created; plain completed-action message; stay on open form
- Empty or whitespace-only goal name on open (AC-10) → expected: nothing created; plain goal-needs-a-name message; stay on open form
- Second stair while one is open (AC-06) → expected: first stays open; plain mark-done-first message; stay on Home
- Corrected time empty or less than zero (AC-13) → expected: previous time and goal total kept; plain time message; stay on correct form
- Corrected stair name empty or whitespace-only (AC-14) → expected: previous name kept; plain completed-action message; stay on correct form
- Other computer / no remote path (AC-05) → expected: Owner's notes are not exposed or mutable off this machine; on this machine there is no separate login
- App no longer visible then visible again (AC-08) → expected: open stair persists; gap adds zero seconds; time resumes once
- Malformed open or correct payload against the HTTP boundary → expected: request refused; store unchanged; caller told the input was not acceptable
- Store file missing or unreadable on boot → expected: fail closed per service behaviour; Owner is not shown stale foreign data

## Test data

- Seed strategy: factories matching `data-model.md` — `newGoal`, `newOpenStair`, `newFinishedStair` with fixed ULIDs, trimmed goal names, and PII-safe sample strings only.
- Integration dependency: ephemeral real SQLite file per suite (`SQLITE_PATH` to a throwaway path), not a mocked store. Migrations applied before the suite.
- Cleanup boundary: per-test — delete or recreate the throwaway file (or truncate owned tables) so each test starts independent; no shared open-stair residue across cases.

## NFR validation (load)

- Time to show a goal ≤ 1 second (spec §6) → scenario: sustain 1 goal-progress read per second for 1 minute against a seeded goal with finished stairs; assert p95 time from request until finished stairs and total are available ≤ 1 second.
- Records survive restart 100% (spec §6) → covered by the AC-08 e2e / integration rows (close or crash with an open stair, reopen, compare list and span); not a throughput load scenario.
- Finished-stair time within 1 second of counted or corrected span (spec §6) → covered by AC-02 / AC-07 / AC-08 unit + integration rows that compare shown elapsed to the visible span or correction; several views count once.

## CI placement

- On every PR: unit, contract, component — the fast suites.
- On schedule / pre-release: integration, e2e, e2e-through-UI, visual-regression, and the goal-read latency load scenario — the heavier suites.
