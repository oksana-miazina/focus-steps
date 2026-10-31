# Tracker — focus-steps

> Status of every task in the epic. `implement` updates **Status** and **Step** after every
> subagent it runs (and commits them with the task), so this table shows where the run is right now.
> Status: `todo` · `in_progress` · `blocked` · `review` · `done`.
> Step: `SELECT` · `RED` · `GREEN` · `REFACTOR` · `GATE` · `REVIEW` · `COMMIT` (`—` before the task starts).
> A `blocked` row carries its reason in Step, e.g. `GATE — lint red after 3 retries`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status | Step |
|---|---|---|---|---|---|---|---|
| T1 | Promote staged goals migration | migration | Owner | S | — | done | COMMIT |
| T2 | Promote staged stairs migration | migration | Owner | S | T1 | done | COMMIT |
| T3 | Name trim/validation + display-elapsed helpers | domain | Owner | S | — | done | COMMIT |
| T4 | open-stair repository | infra | Owner | M | T1, T2, T3 | done | COMMIT |
| T5 | openStair service rules | app | Owner | M | T4 | done | COMMIT |
| T6 | POST /api/v1/stairs | ports | Owner | M | T5 | done | COMMIT |
| T7 | home repository | infra | Owner | M | T1, T2 | done | COMMIT |
| T8 | home service | app | Owner | M | T7, T3 | done | COMMIT |
| T9 | home/goal/finish/hide API routes | ports | Owner | M | T8 | done | COMMIT |
| T10 | correct module service + repo | app | Owner | M | T1, T2, T3 | todo | — |
| T11 | PATCH /api/v1/stairs/{stairId} | ports | Owner | S | T10 | todo | — |
| T12 | Shared SSR UI primitives | ui | Owner | S | — | done | COMMIT |
| T13 | Render SCR-01 Home | ui | Owner | M | T9, T12 | todo | — |
| T14 | Render SCR-02 Open a stair | ui | Owner | M | T6, T12 | todo | — |
| T15 | Render SCR-03 Goal | ui | Owner | M | T9, T12 | todo | — |
| T16 | Render SCR-04 Correct a stair | ui | Owner | M | T11, T12 | todo | — |
| T17 | Wire modules + visibility hide | wiring | Owner | S | T6, T9, T11, T13, T14, T15, T16 | todo | — |
| T18 | Integration tests for core flows | tests | Owner | M | T17 | todo | — |

**Total:** 18 tasks, ~10 person-days.
