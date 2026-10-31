---
status: Accepted
owner: unassigned
reviewers: []
updated_at: 2026-10-31
---

# 0003 — Store data in a SQLite file with ULID identifiers

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** the idea owner (name not on record), by accepting the foundation bundle

## Context

Paper stairs do not keep elapsed time or per-goal progress (`docs/idea-brief.md` §2). The history has to persist on the owner's computer. The brief left storage and accounts undecided. The foundation bundle the owner accepted picks a single SQLite file and no account. There is no spec and no SAD yet. No tables are designed here. Table shapes belong to a later data-model stage.

## Decision drivers

- One user, one computer, no account (foundation acceptance 2026-10-31).
- The skeleton must apply and revert migrations (`survey` scaffold contract).
- Identifiers should sort by time without a database counter, so new rows order without a central sequence.
- The database holds rows. Product rules stay in the module `service` (ADR-0002).

## Considered options

1. **One SQLite file, dbmate SQL migrations, application-generated ULIDs** — a file on disk, numbered SQL with an up step and a down step, ids created in the app before insert.
2. **PostgreSQL as a separate server** — a full relational database, and a second process to install and run for a single user.
3. **Browser local storage** — no database process, and no SQL migration that applies and reverts.

## Decision outcome

**Chosen:** Option 1. The file is `data/focus-steps.sqlite`. It is gitignored. Migrations live in `migrations/` and run with dbmate (`up` and `down`). The application generates a ULID and inserts it. The database does not generate the id. Module `repo` code runs the SQL. The schema of goals and stairs is not part of this decision.

## Consequences

**Positive**

- No database server to run.
- Migrations have a down step, so the skeleton can prove apply and revert.
- ULIDs sort by creation time across tables without a shared counter.

**Negative**

- The file is on one computer. Copying it by hand is the only move to another machine. There is no sync.
- A ULID library is a dependency. SQLite's own integer key would have been fewer moving parts and would not have matched the time-sortable application id.
- dbmate is an extra binary on the machine, not an npm script.

**Neutral**

- Choosing PostgreSQL later means a new ADR, a new migration tool invocation, and moving the file's rows. The table design has not started, so that move is still cheap.
- This ADR closes the storage question left open in `docs/idea-brief.md` §8 for the foundation. It does not design the tables.

## Links

- Architecture map: `docs/architecture-map.md` (Datastores, Conventions)
- Product intent: `docs/idea-brief.md` §2, §8
- Related ADR: `docs/adr/0001-serve-a-local-typescript-web-app.md`, `docs/adr/0002-lay-modules-out-in-three-layers.md`
- No spec and no SAD exist yet.
