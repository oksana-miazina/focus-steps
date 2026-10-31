# Audit — data-model focus-steps (2026-10-31)

## Staged migrations (not in live `migrations/`)

| Pair | Paths |
|---|---|
| 01 goals | `docs/features/focus-steps/migrations/01_create_goals.up.sql` + `.down.sql` |
| 02 stairs | `docs/features/focus-steps/migrations/02_create_stairs.up.sql` + `.down.sql` |

**Promote-time convention hint:** live tree uses **dbmate timestamp** files (`YYYYMMDDHHMMSS_name.sql`) with `-- migrate:up` / `-- migrate:down` in one file. Current live head: `migrations/20260101000000_baseline.sql` (empty DDL). `implement` assigns real timestamps (and merges each `.up`+`.down` pair into one dbmate file) at promotion — e.g. next ≈ `20261031HHMMSS_create_goals` then `…_create_stairs`, depending on clock and other features promoting first.

**State plainly:** migrations are **staged** under `docs/features/focus-steps/migrations/` — **not** yet in the live `migrations/` tree; `implement` promotes them.

## Conventions followed

| Topic | Source | Applied |
|---|---|---|
| Engine | architecture-map + ADR-0003 | SQLite |
| Migration tool | architecture-map | dbmate (promote merges markers) |
| PK | ADR-0003 | App-generated ULID as `TEXT` |
| Goal total | feature ADR-0004 | Not a column; derive on read |
| Open time | feature ADR-0003 | `elapsed_seconds` + `visible_started_at` on `stairs` |
| Naming | greenfield confirm | `snake_case` plural tables `goals` / `stairs` |
| Audit | greenfield confirm (option 1) | `created_at` TEXT ISO-8601 only |
| Delete | greenfield confirm + spec non-goal | No soft-delete; no remove in v1 |
| CHECK | greenfield confirm (option 1) | `status` enum + `elapsed_seconds >= 0` |

## Convention deviations

None silent. CHECK constraints are an explicit Owner choice on a greenfield repo with no prior DDL style.

## Drift detection

Domain layer under `src/` has **no** goals/stairs types yet (health skeleton only). Drift map: **N/A — no structs to compare**. No `_drift/` fix migrations.

## Breaking-change decompositions

None — greenfield creates only (`IF NOT EXISTS`).

## `<!-- TBD -->`

None remaining in `data-model.md`.

## Self-check (4 mandatory)

| Check | Result |
|---|---|
| Naming matches repo / confirmed greenfield | PASS |
| Down reversibility (CREATE↔DROP, indexes) | PASS |
| FK indexes (`stairs.goal_id` → `stairs_goal_id_idx`) | PASS |
| Convention adherence (ULID TEXT, staged pairs, no live write) | PASS |

## Next stage

`/sdd:api focus-steps` — new HTTP/HTML contract for home / open-stair / correct (not N/A).
