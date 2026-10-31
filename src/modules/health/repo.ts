import type { DatabaseSync } from "node:sqlite";

export function ping(db: DatabaseSync): number {
  const row = db.prepare("SELECT 1 AS ok").get() as { ok: number };
  return row.ok;
}
