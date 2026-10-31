---
status: Accepted
owner: unassigned
reviewers: []
updated_at: 2026-10-31
---

# 0002 — Lay each module out in three layers

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** the idea owner (name not on record), by accepting the foundation bundle

## Context

The stack is a local TypeScript process (ADR-0001). The skeleton needs one repeatable place to put code before any product feature exists. The owner accepted folders under `src/modules/<area>/` with three layers. There is no spec and no SAD yet.

## Decision drivers

- The skeleton must be copyable. One baseline module (`health`) shows the pattern.
- Product rules (what a stair is) should not live in the HTTP handler or in SQL.
- A one-user local app does not need a port-and-adapter boundary before the first feature.
- Modules talk only inside this process. Nothing else calls them (`docs/idea-brief.md` describes a personal tool, not an API product).

## Considered options

1. **Three layers per module** — `http` (request and response), `service` (rules), `repo` (SQLite). `src/index.ts` wires them.
2. **Hexagonal ports and adapters** — domain isolated behind interfaces, with adapters in a separate ring. More folders and indirection than the empty skeleton has behavior to protect.

## Decision outcome

**Chosen:** Option 1. A new area is `src/modules/<area>/` with those three files. `health` is the only module the skeleton creates. Goals and stairs are not created here. Modules call each other by direct function call. There is no message bus.

## Consequences

**Positive**

- A feature has an obvious folder and an obvious file for HTTP, rules, and SQL.
- The skeleton stays small: one baseline module plus `src/index.ts`.

**Negative**

- The layers are a convention, not a compiler boundary. A handler can still call SQLite directly unless review catches it.
- Splitting a module later, or introducing ports, touches every file in that folder.

**Neutral**

- `src/db/` opens the database. `src/ui/styles.css` is shared styling. Neither is a product module.

## Links

- Architecture map: `docs/architecture-map.md` (Module inventory, Conventions)
- Related ADR: `docs/adr/0001-serve-a-local-typescript-web-app.md`, `docs/adr/0003-store-data-in-a-sqlite-file.md`
- No spec and no SAD exist yet.
