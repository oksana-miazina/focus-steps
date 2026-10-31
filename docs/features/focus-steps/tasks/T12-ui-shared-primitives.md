---
id: T12
title: "Add shared SSR UI primitives in styles.css"
layer: "ui"
deps: []
blocks: ["T13", "T14", "T15", "T16"]
acs: ["AC-15", "AC-16"]
files_hint: ["src/ui/styles.css"]
owner: "Owner"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T12 — Add shared SSR UI primitives in styles.css

## Place in the sequence

- **Blocked by:** — · **Blocks:** T13–T16 screen renders · **Wave:** 1 (parallel with migrations/domain).
- **Lane:** owns `src/ui/styles.css` alone — screen tasks reuse classes, do not re-theme.

## Why (user story)

> **As a** Owner
> **I want** to look at the app
> **So that** I see my open stair and goals
>
> — `spec.md §4, US-01/US-03 (home readout), abridged` · full text: [spec.md](../spec.md)

Shared CSS primitives so SCR-01…04 look consistent without a design-system inventory yet.

## Inlined context

> **Reuse rule:** one shared CSS file `src/ui/styles.css`; no React, no Tailwind, no component kit. Closest precedent: none — first product screens. screens.md lists NEW: AppShell, PrimaryButton, TextLink, InlineMessage, FieldLabel (design-system registration pending).
>
> — `architecture-map.md §Frontend` + `screens.md` New components, abridged · full text: [architecture-map.md](../../../architecture-map.md) · [screens.md](../screens.md)

> **ADR-0001:** server-rendered HTML + CSS in one local process.
>
> — `adr/0001-deliver-backend-and-web-frontend-surfaces.md, Decision outcome, abridged` · full text: [ADR-0001](../adr/0001-deliver-backend-and-web-frontend-surfaces.md)

**Fallback:** read [screens.md](../screens.md) · [architecture-map.md](../../../architecture-map.md). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

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

- [x] Extend `src/ui/styles.css` with classes for AppShell, PrimaryButton, TextLink, InlineMessage, FieldLabel (and form field spacing)
- [x] Keep server-rendered CSS only — no new styling system
- [x] Visual smoke: `/styles.css` still served from `src/index.ts`

## Edge cases

| Case | Behaviour |
|---|---|
| No design-system.md | code-mode NEW components stay CSS classes; registration deferred |
| Existing health page | still renders; styles additive |

## Definition of Done

- [x] styles.css defines the shared classes SCR-01…04 will use; no React/Tailwind introduced
- [x] every Hard Rule inlined above still holds
- [x] lint + vet clean
