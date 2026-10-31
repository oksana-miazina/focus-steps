---
status: draft
feature_size: "M"
tool: "code"
updated_at: "2026-10-31"
---

# Screens — focus-steps

> The canonical **screen manifest** — every screen in every state — produced by `screens` (between
> `api` and `tasks`) and read by `tasks` (each `ui` task cites SCR ids + states), `implement`
> (builds the screen to the declared states) and `review` (the built screen must match this).
> Downstream stages reference **only this manifest** — never the raw Figma / `.pen` file.

## Source

- **Tool:** code (fallback — `docs/design-system.md` is absent; Figma/Pencil MCP not used)
- **File:** inline wireframes below
- **Degradation:** no design-system canon → `code` mode; recommend `/sdd:design-system` before or after tasks so `NEW:` components can be registered into an inventory

## Screens

### SCR-01 — Home

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | Goal names listed and choosable (AC-16). When a stair is open: name, goal, time so far, mark-done control (AC-15); after close/crash/power-loss resume, gap adds 0 s (AC-08) | NEW: AppShell — no design-system inventory yet; NEW: GoalNameList — goal names as choosable links; NEW: OpenStairPanel — open stair name/goal/elapsed + mark-done; NEW: PrimaryButton — start stair / mark done; NEW: TextLink — choose a goal | wireframe below |
| empty | First visit or `GET /api/v1/home` with no goals and `open_stair: null` | NEW: AppShell; NEW: EmptyHomeHint — plain prompt to start a stair; NEW: PrimaryButton | wireframe below |
| error | Owner tries a second stair while one is open (AC-06 / `open_stair.already_open`) — stay on Home; first stair still shown; plain message to mark it done first | NEW: AppShell; NEW: GoalNameList; NEW: OpenStairPanel; NEW: InlineMessage — plain error from contract `message`; NEW: PrimaryButton | wireframe below |
| loading | N/A: server-rendered HTML; the page arrives complete | — | — |
| success | N/A: finishing the open stair navigates to SCR-03 | — | — |
| validation | N/A: open-stair field validation lives on SCR-02 | — | — |

```text
SCR-01 default (open stair present)
+--------------------------------------------------+
| Focus Steps                                      |
|--------------------------------------------------|
| Open stair                                       |
|   Write the outline                              |
|   Goal: Homework                                 |
|   Time so far: 0:02:05                           |
|   [ Mark done ]                                  |
|--------------------------------------------------|
| Goals                                            |
|   Homework                                       |
|   Exam prep                                      |
|--------------------------------------------------|
| [ Start a stair ]   (hidden or disabled when     |
|                      a stair is already open)    |
+--------------------------------------------------+

SCR-01 empty (no goals, no open stair)
+--------------------------------------------------+
| Focus Steps                                      |
|--------------------------------------------------|
| No goals yet. Start a stair to create one.       |
| [ Start a stair ]                                |
+--------------------------------------------------+

SCR-01 error (second stair refused)
+--------------------------------------------------+
| Focus Steps                                      |
|--------------------------------------------------|
| ! Mark the current stair done first.             |
| Open stair: Write the outline / Homework / time  |
| [ Mark done ]                                    |
| Goals: …                                         |
+--------------------------------------------------+
```

### SCR-02 — Open a stair

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | From SCR-01 when no stair is open — name the stair and the goal in one step (US-01) | NEW: AppShell; NEW: OpenStairForm — stair name + goal name fields + submit; NEW: PrimaryButton; NEW: FieldLabel | wireframe below |
| validation | Empty / whitespace-only stair name (AC-04 / `open_stair.empty_stair_name`) or empty / whitespace-only goal name (AC-10 / `open_stair.empty_goal_name`) — stay on SCR-02; nothing created; plain contract `message` | NEW: AppShell; NEW: OpenStairForm; NEW: InlineMessage; NEW: PrimaryButton; NEW: FieldLabel | wireframe below |
| empty | N/A: this screen is a form, not a list | — | — |
| loading | N/A: server-rendered HTML; the page arrives complete | — | — |
| success | N/A: successful open redirects to SCR-01 with the open stair shown | — | — |
| error | N/A: `open_stair.already_open` (409) is shown on SCR-01 per US-05 / AC-06 | — | — |

```text
SCR-02 default
+--------------------------------------------------+
| Focus Steps · Open a stair                       |
|--------------------------------------------------|
| Stair name                                       |
| [________________________________]               |
| Goal name                                        |
| [________________________________]               |
| [ Open stair ]                                   |
| [ Cancel → Home ]                                |
+--------------------------------------------------+

SCR-02 validation (empty stair name example)
+--------------------------------------------------+
| Focus Steps · Open a stair                       |
|--------------------------------------------------|
| ! The name has to be a completed action.         |
| Stair name                                       |
| [________________________________]               |
| Goal name                                        |
| [Homework________________________]               |
| [ Open stair ]                                   |
| [ Cancel → Home ]                                |
+--------------------------------------------------+
```

### SCR-03 — Goal

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | Goal has one or more finished stairs (AC-03); duplicate finished names shown as separate rows and both times in the total (AC-17); entry from SCR-01 or after mark-done (AC-02) | NEW: AppShell; NEW: GoalHeader — goal name + derived total; NEW: FinishedStairList — finished stairs with name, time, correct link; NEW: TextLink; NEW: PrimaryButton — back to Home | wireframe below |
| empty | Goal's only stair still open / no finished stairs — empty list, total zero; open stair not listed (AC-12) | NEW: AppShell; NEW: GoalHeader; NEW: EmptyFinishedHint — plain empty finished copy; NEW: TextLink — back to Home | wireframe below |
| error | N/A: `getGoalProgress` has no error response in the OpenAPI contract | — | — |
| loading | N/A: server-rendered HTML; the page arrives complete | — | — |
| success | N/A: after a kept correction the page reloads as `default` with updated rows/total | — | — |
| validation | N/A: name/time validation lives on SCR-04 | — | — |

```text
SCR-03 default
+--------------------------------------------------+
| Focus Steps · Homework                           |
| Total time: 0:20:00                              |
|--------------------------------------------------|
| Finished stairs                                  |
|   Write the outline     0:10:00   [ Correct ]    |
|   Write the outline     0:10:00   [ Correct ]    |
|--------------------------------------------------|
| [ ← Home ]                                       |
+--------------------------------------------------+

SCR-03 empty (only open stair / none finished)
+--------------------------------------------------+
| Focus Steps · Homework                           |
| Total time: 0:00:00                              |
|--------------------------------------------------|
| No finished stairs yet.                          |
| (An open stair is not listed here.)              |
| [ ← Home ]                                       |
+--------------------------------------------------+
```

### SCR-04 — Correct a stair

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | From a finished stair on SCR-03 — change name and/or time (US-04); fields prefilled with current values | NEW: AppShell; NEW: CorrectStairForm — name + elapsed_seconds fields + submit; NEW: FieldLabel; NEW: PrimaryButton; NEW: TextLink — cancel back to SCR-03 | wireframe below |
| validation | Time empty or less than zero (AC-13 / `correct.invalid_time`) or name empty / whitespace-only (AC-14 / `correct.empty_stair_name`) — stay on SCR-04; previous values kept; plain contract `message` | NEW: AppShell; NEW: CorrectStairForm; NEW: InlineMessage; NEW: FieldLabel; NEW: PrimaryButton; NEW: TextLink | wireframe below |
| empty | N/A: editing one existing finished stair, not a collection | — | — |
| loading | N/A: server-rendered HTML; the page arrives complete | — | — |
| success | N/A: kept correction redirects to SCR-03 with updated name/time and derived total (AC-07) | — | — |
| error | N/A: no non-validation error response for this screen in the OpenAPI contract | — | — |

```text
SCR-04 default
+--------------------------------------------------+
| Focus Steps · Correct a stair                    |
|--------------------------------------------------|
| Stair name                                       |
| [Write the outline_______________]               |
| Time (seconds)                                   |
| [600_____________________________]               |
| [ Keep correction ]                              |
| [ Cancel → Goal ]                                |
+--------------------------------------------------+

SCR-04 validation (invalid time example)
+--------------------------------------------------+
| Focus Steps · Correct a stair                    |
|--------------------------------------------------|
| ! The time has to be the time the stair ran.     |
| Stair name                                       |
| [Write the outline_______________]               |
| Time (seconds)                                   |
| [-1______________________________]               |
| [ Keep correction ]                              |
| [ Cancel → Goal ]                                |
+--------------------------------------------------+
```

## New components

| Component | Why no existing primitive fits | Registered in design-system |
|---|---|---|
| AppShell | No design-system inventory; shared page chrome for SSR HTML | pending |
| GoalNameList | Choosable goal names (AC-16); not a generic list until design-system exists | pending |
| OpenStairPanel | Open stair name + goal + elapsed + mark-done (AC-15) | pending |
| PrimaryButton | Primary action control; no inventory Button yet | pending |
| TextLink | In-page navigation to a goal (SCR-03) | pending |
| EmptyHomeHint | First-visit empty copy when home has no goals | pending |
| InlineMessage | Plain-language contract `message` on HTML pages | pending |
| OpenStairForm | Paired stair + goal name fields for open; no inventory Form yet | pending |
| FieldLabel | Label for SSR form fields; no inventory Label yet | pending |
| GoalHeader | Goal name + derived total (ADR-0004); no inventory header | pending |
| FinishedStairList | Finished stairs with per-row correct entry (AC-03, AC-17) | pending |
| EmptyFinishedHint | AC-12 empty finished list copy | pending |
| CorrectStairForm | Name + elapsed_seconds correction fields; no inventory Form yet | pending |
