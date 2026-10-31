---
id: T16
title: "Render SCR-04 Correct a stair default and validation states"
layer: "ui"
deps: ["T11", "T12"]
blocks: ["T17"]
acs: ["AC-07", "AC-13", "AC-14"]
files_hint: ["src/modules/correct/http.ts"]
owner: "Owner"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
---

# T16 — Render SCR-04 Correct a stair default and validation states

## Place in the sequence

- **Blocked by:** T11 — correct API; T12 — UI primitives · **Blocks:** T17 — wiring · **Wave:** 6.
- **Lane:** shares `src/modules/correct/http.ts` with T11 — serialized after JSON PATCH.

## Why (user story)

> **As a** Owner
> **I want** to change the name or the time of a finished stair
> **So that** the goal total shows the correction, not the mistake
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

## Inlined context

> **SCR-04 states:** `default` (CorrectStairForm prefilled); `validation` (invalid time AC-13 / empty name AC-14 — stay on SCR-04 with InlineMessage). Success redirects to SCR-03 with updated total.
>
> Components: AppShell, CorrectStairForm, FieldLabel, PrimaryButton, TextLink, InlineMessage.
>
> — `screens.md §SCR-04, abridged` · full text: [screens.md](../screens.md)

**Fallback:** read [screens.md](../screens.md) · [openapi.yaml](../contracts/openapi.yaml). Do not guess.

## Data delta

No DB changes.

## API contract

- Form maps to `correctFinishedStair` body fields `name` and/or `elapsed_seconds`.
- Validation messages: "The time has to be the time the stair ran." / "The name has to be a completed action."

— `contracts/openapi.yaml, correctFinishedStair 400 examples, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

## Acceptance criteria

### AC-07 — cross-context

> **Given** a finished stair's time is part of its goal's total
> **When** the Owner changes that stair's time or name
> **Then** the stair shows the new time or name, and the goal's total uses the new time
>
> — `spec.md §5, AC-07, verbatim` · full text: [spec.md](../spec.md)

### AC-13 — error

> **Given** a finished stair shows a time, and that time is part of its goal's total
> **When** the Owner tries to change that time to empty or to less than zero
> **Then** the change is not kept, the stair and the goal total stay as they were, and the Owner is told in plain language that the time has to be the time the stair ran
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

### AC-14 — error

> **Given** a finished stair has a name
> **When** the Owner tries to change that name to empty, including a name made only of spaces
> **Then** the change is not kept, the previous name stays, and the Owner is told in plain language that the name has to be a completed action
>
> — `spec.md §5, AC-14, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] SSR Correct form + POST/PATCH handler in `src/modules/correct/http.ts`
- [ ] Prefill current values; validation stays on SCR-04; success → Goal page
- [ ] Test default + validation paths

## Edge cases

| Case | Behaviour |
|---|---|
| Cancel → Goal | no write |
| Whitespace-only name | validation message; previous name kept |

## Definition of Done

- [ ] SCR-04 default + validation states work; tests assert invalid time/name messages
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
