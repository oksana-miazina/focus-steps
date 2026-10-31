# Focus Steps conventions

The skeleton follows `docs/architecture-map.md`. Product features are not in this tree yet.

## Layout

- `src/index.ts` starts the HTTP server and wires modules.
- `src/modules/<area>/` has three files: `http` (request and response), `service` (rules), `repo` (SQL). The baseline module is `health`.
- `src/db/sqlite.ts` opens the SQLite file. Default path: `data/focus-steps.sqlite`. Tests set `SQLITE_PATH`.
- `src/ui/styles.css` is the only stylesheet. Pages are HTML rendered by the server. No React and no Tailwind.
- `migrations/` holds dbmate SQL files with `-- migrate:up` and `-- migrate:down`.

## Rules

- Modules call each other by direct function call. There is no message bus.
- HTTP errors use JSON `{ "code", "message" }`.
- The application generates a ULID before insert. This skeleton has no inserts yet.
- The database stores rows. Product rules stay in `service`.
- One person, one computer, no account. Do not add achievements, work or break interval settings, a goal finish line, or Google Calendar access in the skeleton.

## Commands

- `npm run build` — compile TypeScript.
- `npm test` — Vitest. The smoke test boots the process.
- `npm run lint` — ESLint.
- `dbmate --migrations-dir migrations --no-dump-schema up` and `down` — apply and revert migrations. Set `DATABASE_URL` to a SQLite URL.

Node.js must provide `node:sqlite` (this skeleton was brought up on Node 24).
