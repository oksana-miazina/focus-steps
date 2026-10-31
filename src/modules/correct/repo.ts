import type { DatabaseSync } from "node:sqlite";

export type StairRow = {
  id: string;
  goal_id: string;
  name: string;
  status: "open" | "finished";
  elapsed_seconds: number;
  visible_started_at: string | null;
  created_at: string;
};

type StairSql = {
  id: string;
  goal_id: string;
  name: string;
  status: string;
  elapsed_seconds: number;
  visible_started_at: string | null;
  created_at: string;
};

function mapStair(row: StairSql): StairRow {
  return {
    id: row.id,
    goal_id: row.goal_id,
    name: row.name,
    status: row.status as StairRow["status"],
    elapsed_seconds: row.elapsed_seconds,
    visible_started_at: row.visible_started_at,
    created_at: row.created_at,
  };
}

export function findFinishedStair(db: DatabaseSync, stairId: string): StairRow | undefined {
  const row = db
    .prepare(
      `SELECT id, goal_id, name, status, elapsed_seconds, visible_started_at, created_at
       FROM stairs WHERE id = ? AND status = 'finished' LIMIT 1`,
    )
    .get(stairId) as StairSql | undefined;
  return row === undefined ? undefined : mapStair(row);
}

export function updateFinishedStair(
  db: DatabaseSync,
  stairId: string,
  patch: { name?: string; elapsedSeconds?: number },
): StairRow | undefined {
  const current = findFinishedStair(db, stairId);
  if (current === undefined) {
    return undefined;
  }
  const name = patch.name ?? current.name;
  const elapsedSeconds = patch.elapsedSeconds ?? current.elapsed_seconds;
  db.prepare(`UPDATE stairs SET name = ?, elapsed_seconds = ? WHERE id = ? AND status = 'finished'`).run(
    name,
    elapsedSeconds,
    stairId,
  );
  return findFinishedStair(db, stairId);
}
