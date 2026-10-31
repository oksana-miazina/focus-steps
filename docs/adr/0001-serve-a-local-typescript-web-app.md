---
status: Accepted
owner: unassigned
reviewers: []
updated_at: 2026-10-31
---

# 0001 — Serve Focus Steps as a local TypeScript web app

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** the idea owner (name not on record), by accepting the foundation bundle

## Context

The repository has no application source. The accepted product is one person recording a stair, its elapsed time, and the goal it belongs to, then seeing that progress. The owner accepted a local program that serves pages to the browser, with no account. There is no spec and no SAD yet. This ADR records the stack chosen in survey so later features do not reopen it.

## Decision drivers

- The owner is the only user, and the foundation bundle they accepted has no account (`docs/idea-brief.md` §3, foundation acceptance 2026-10-31).
- Progress is visual. Pages in a browser carry that. A line-only interface does not.
- The skeleton must build, boot, run tests, and lint with one toolchain (`survey` scaffold contract).
- Google Calendar stays outside the app (`docs/idea-brief.md` §5).

## Considered options

1. **Local TypeScript (Node.js) server and server-rendered HTML** — one language for pages and the process, no account, no UI framework.
2. **Browser-only storage in the page** — no install of a server, and no SQL migration the skeleton can apply and revert.
3. **A hosted app with an account** — reachable from more than one computer, and a login the brief did not ask for.

## Decision outcome

**Chosen:** Option 1. The owner accepted this bundle. One Node process serves HTML. Errors use a single payload `{ code, message }`. An HTML page shows `message`. Tests run under Vitest, including a boot smoke test and an integration test against a temporary SQLite file. ESLint is the lint. GitHub Actions runs `npm run build`, `npm test`, and `npm run lint`.

## Consequences

**Positive**

- The same language covers the page and the process.
- No account service to run for a single user.
- Build, test, and lint are one npm toolchain the CI workflow can call.

**Negative**

- The app is only on the computer where the process runs. Another device sees nothing.
- Server-rendered HTML is a poor fit if a later screen needs a rich client animation. That would be a new decision, not a silent add of React.
- Tool versions are not pinned. Scaffold uses whatever the machine resolves for TypeScript, Vitest, ESLint, and Node.js.

**Neutral**

- React or Tailwind can be proposed later with a new ADR. This decision does not forbid them forever. It forbids adding them inside the skeleton.

## Links

- Architecture map: `docs/architecture-map.md` (Stack, Conventions, Frontend / UI foundation)
- Product intent: `docs/idea-brief.md` §3, §5, §7
- No spec and no SAD exist yet.
- Related ADR: `docs/adr/0002-lay-modules-out-in-three-layers.md`, `docs/adr/0003-store-data-in-a-sqlite-file.md`
