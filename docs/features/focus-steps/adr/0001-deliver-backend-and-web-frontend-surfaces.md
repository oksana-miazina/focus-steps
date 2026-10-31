---
status: Accepted
owner: unassigned
reviewers: []
updated_at: 2026-10-31
feature_size: M
ticket: focus-steps
---

# 0001 — Deliver Focus Steps as a backend service and a web frontend surface

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** Owner (during design walk)

## Context

`ux-flows.md` inventories SCR-01…04. The foundation already runs one local Node process that serves pages (`docs/adr/0001-serve-a-local-typescript-web-app.md`). Design must declare `target_surfaces` so `api`, `sequences`, `tasks`, and `plan-tests` know which artifacts to produce. The choice is whether that one process is one surface or two.

## Decision drivers

- Screens and UI-driven flows need a `web-frontend` surface (`ux-flows.md`).
- HTTP request handling, domain rules, and SQLite access need a contract and service test tiers (`backend-service`).
- One computer, one process — no second deployable (SAD §2, foundation ADR-0001).

## Considered options

1. **`web-frontend` only** — one C4 container; UI tasks and UI test tiers; no authored backend contract from this feature.
2. **`backend-service` + `web-frontend`** — two surfaces in the same process: an HTTP contract plus UI-driven flows, `ui` tasks, and UI test tiers.
3. **`backend-service` only** — contract and service flows; no UI surface (rejects the screen inventory).

## Decision outcome

**Chosen:** Option 2. Frontmatter `target_surfaces: [backend-service, web-frontend]`. Both run inside the existing local Node process. The §5 C4 view draws one backend container and one web container that share the process boundary; SQLite remains a `ContainerDb`, not a surface.

## Consequences

**Positive**
- Downstream stages get both an OpenAPI-shaped contract and UI-layer tasks / e2e-through-UI paths.
- Matches how the Owner actually uses the product: browser pages backed by local handlers.

**Negative**
- Two surfaces mean more artifacts (contract + UI tasks + UI test tiers) than a UI-only declaration.
- The C4 diagram shows two containers for one OS process — readers must not treat them as separately deployable.

**Neutral**
- UI delivery (SSR vs SPA) is a follow-on decision; foundation ADR-0001 already points at server-rendered HTML.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4
- Related: `docs/adr/0001-serve-a-local-typescript-web-app.md`
