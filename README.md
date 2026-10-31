# Focus Steps

Local tool for one person on one computer: open **one stair** at a time (a smallest completed action), attach it to a named **goal**, record elapsed time while the app is visible, then see that goal’s finished stairs and total time.

No account, no sync, no Pomodoro interval settings, no achievements, no goal finish line. Live lectures stay in the calendar you already use.

Product intent and scope: [`docs/idea-brief.md`](docs/idea-brief.md), [`docs/features/focus-steps/spec.md`](docs/features/focus-steps/spec.md).

## Stack

- TypeScript on Node.js (`node:sqlite` — brought up on Node 24)
- Small Node HTTP server; server-rendered HTML + one CSS file (no React, no Tailwind)
- SQLite file on disk; schema changes via [dbmate](https://github.com/amacneil/dbmate)
- Vitest, ESLint, `tsc`

Layout and conventions: [`docs/architecture-map.md`](docs/architecture-map.md), [`CLAUDE.md`](CLAUDE.md).

## Prerequisites

- Node.js with `node:sqlite` (Node 24+)
- npm
- `dbmate` on `PATH`

## Setup

```bash
npm install
```

Apply migrations (SQLite URL; adjust the path if needed):

```bash
# Windows PowerShell
$env:DATABASE_URL = "sqlite:$((Resolve-Path .).Path)/data/focus-steps.sqlite"
dbmate --migrations-dir migrations --no-dump-schema up
```

```bash
# Unix-like
export DATABASE_URL="sqlite:$(pwd)/data/focus-steps.sqlite"
dbmate --migrations-dir migrations --no-dump-schema up
```

The database file defaults to `data/focus-steps.sqlite` (gitignored). Override with `SQLITE_PATH`.

## Run

```bash
npm run build
npm start
```

Listens on `127.0.0.1` — port `3000`, or `PORT` if set. Open http://127.0.0.1:3000/

## Commands

| Command | Purpose |
|---|---|
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run the compiled server |
| `npm test` | Vitest |
| `npm run lint` | ESLint |
| `dbmate … up` / `down` | Apply or revert migrations |

## Repository map

| Path | Role |
|---|---|
| `src/index.ts` | HTTP server entry; wires modules |
| `src/modules/<area>/` | `http` · `service` · `repo` |
| `src/db/sqlite.ts` | Opens the SQLite file |
| `src/ui/styles.css` | Shared stylesheet |
| `migrations/` | dbmate up/down SQL |
| `docs/` | Architecture, ADRs, roadmap, idea brief |
| `docs/features/focus-steps/` | Feature spec, SAD, data model, OpenAPI, tasks, test plan |

## Docs pipeline (SDD)

Feature work for `focus-steps` is specified under `docs/features/focus-steps/` (spec → design → data model → API → screens → tasks → test plan). Implementation follows that package; this README does not replace those artifacts.
