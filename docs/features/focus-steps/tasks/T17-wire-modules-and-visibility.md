---
id: T17
title: "Wire product modules and page-visibility hide signal"
layer: "wiring"
deps: ["T6", "T9", "T11", "T13", "T14", "T15", "T16"]
blocks: ["T18"]
acs: ["AC-05", "AC-08"]
files_hint: ["src/index.ts"]
owner: "Owner"
estimate: "S"
context_budget: "S"
status: "todo"
step: ""
---

# T17 — Wire product modules and page-visibility hide signal

## Place in the sequence

- **Blocked by:** T6, T9, T11, T13–T16 · **Blocks:** T18 — integration tests · **Wave:** 7 (composition).
- **Lane:** owns `src/index.ts` (may touch small visibility script hooks in HTML modules if needed — keep primary edits here).

## Why (user story)

> **As a** Owner
> **I want** my stairs to stay on this computer only, with time pausing when I leave
> **So that** records are private to this machine and gaps are not counted
>
> — `spec.md §4 US-01 + §5 AC-05/AC-08, abridged` · full text: [spec.md](../spec.md)

## Inlined context

> Process listens on loopback `127.0.0.1` (PORT or 3000). No account; another computer is not given a way in (AC-05). Wire `home` / `open-stair` / `correct` beside `health`. Page lifecycle → `POST /api/v1/visibility/hide` when last view closes (ADR-0003).
>
> — `sad.md §7` + AC-05 N/A note in §6 coverage + ADR-0003, abridged · full text: [sad.md](../sad.md)

> **Hard rule:** Stair names stored/shown as text, never executed as commands.
>
> — `spec.md §6.1, Abuse cases, abridged` · full text: [spec.md](../spec.md)

**Fallback:** read [src/index.ts](../../../../src/index.ts) · [sad.md](../sad.md). Do not guess.

## Data delta

No DB changes.

## API contract

- Routes already defined in T6/T9/T11; this task mounts them from `src/index.ts`.
- Ensure `POST /api/v1/visibility/hide` is reachable from page hide/unload.

— `contracts/openapi.yaml, hideVisibility, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

## Acceptance criteria

### AC-05 — authorization

> **Given** the Owner has goals and stairs on this computer
> **When** someone tries to see or change them from another computer
> **Then** that person is not shown the Owner's goals or stairs and cannot change them. A person at this computer can see the notes, because there is no separate login
>
> — `spec.md §5, AC-05, verbatim` · full text: [spec.md](../spec.md)

### AC-08 — cross-context

> **Given** the Owner has one stair open and time has been running
> **When** the Owner closes the last view of the app, or the app ends in a crash or a power loss, and then opens it again on the same computer
> **Then** that stair is still the only open stair, the time while the app was not visible is not counted, several views would have counted that time once, and time runs again now that the Owner can see the app
>
> — `spec.md §5, AC-08, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Route product handlers from `src/index.ts` while keeping styles.css + health
- [ ] Keep `server.listen(..., "127.0.0.1", …)`
- [ ] Attach page visibility/unload → hideVisibility
- [ ] Smoke test still boots

## Edge cases

| Case | Behaviour |
|---|---|
| Process crash | hide may not run; open stair remains; gap still 0 until resume (accepted) |
| Multiple tabs | one open stair row; hide when last view gone |

## Definition of Done

- [ ] App serves product routes on 127.0.0.1; hide signal wired; smoke boot passes
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
