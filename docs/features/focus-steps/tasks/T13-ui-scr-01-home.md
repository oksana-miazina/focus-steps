---
id: T13
title: "Render SCR-01 Home default, empty, and error states"
layer: "ui"
deps: ["T9", "T12"]
blocks: ["T17"]
acs: ["AC-06", "AC-08", "AC-15", "AC-16"]
files_hint: ["src/modules/home/http.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T13 — Render SCR-01 Home default, empty, and error states

## Place in the sequence

- **Blocked by:** T9 — home API; T12 — UI primitives · **Blocks:** T17 — wiring · **Wave:** 6.
- **Lane:** shares `src/modules/home/http.ts` with T9 and T15 — serialized after JSON routes; coordinate with T15 on same file.

## Why (user story)

> **As a** Owner
> **I want** to look at the app and see my open stair and goals
> **So that** I can mark done or open a goal
>
> — `spec.md §4, US-01/US-03/US-05, abridged` · full text: [spec.md](../spec.md)

## Inlined context

> **SCR-01 states to build:** `default` (goal list + open stair panel / mark-done; AC-15/16/08), `empty` (no goals, prompt to start), `error` (second stair refused / `open_stair.already_open` InlineMessage; AC-06). `loading`/`success`/`validation` N/A.
>
> Components: AppShell, GoalNameList, OpenStairPanel, PrimaryButton, TextLink, EmptyHomeHint, InlineMessage — NEW, styled via T12.
>
> — `screens.md §SCR-01, abridged` · full text: [screens.md](../screens.md)

**Fallback:** read [screens.md](../screens.md) · [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

No DB changes.

## API contract

- HTML Home maps to `getHome` fields: `goals[]`, `open_stair` (or null) with `display_elapsed_seconds`.
- Mark-done form posts to finish route; Start stair links to SCR-02; goal names link to SCR-03.
- Error flash uses contract `message` for `open_stair.already_open`.

— `contracts/openapi.yaml, getHome + openStair 409, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

## Acceptance criteria

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

### AC-15 — happy path

> **Given** the Owner has one stair open
> **When** the Owner looks at the app
> **Then** the Owner sees that stair's name, its goal, and the time counted so far, and can mark it done from there. The stair is not in its goal's finished list. Several views show that same time
>
> — `spec.md §5, AC-15, verbatim` · full text: [spec.md](../spec.md)

### AC-16 — happy path

> **Given** the Owner has one or more goals
> **When** the Owner looks at the app
> **Then** the Owner sees each goal's name and can open a goal by choosing that name
>
> — `spec.md §5, AC-16, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] SSR HTML Home in `src/modules/home/http.ts` for default/empty/error
- [ ] Mark-done control; goal name links; Start a stair control (hidden/disabled when open)
- [ ] Smoke/HTML assertion test for empty + open-stair panel

## Edge cases

| Case | Behaviour |
|---|---|
| already_open redirect/flash | stay on Home with InlineMessage |
| Open stair after resume | shows time without gap seconds |

## Definition of Done

- [ ] HTML Home shows default/empty/error states per screens.md; tests cover open-stair panel + empty hint
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
