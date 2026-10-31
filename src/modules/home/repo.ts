import type { DatabaseSync } from "node:sqlite";

export type GoalRow = {
  id: string;
  name: string;
  created_at: string;
};

export type StairRow = {
  id: string;
  goal_id: string;
  name: string;
  status: "open" | "finished";
  elapsed_seconds: number;
  visible_started_at: string | null;
  created_at: string;
};

export type OpenStairWithGoalName = StairRow & { goal_name: string };

type GoalSql = { id: string; name: string; created_at: string };
type StairSql = {
  id: string;
  goal_id: string;
  name: string;
  status: string;
  elapsed_seconds: number;
  visible_started_at: string | null;
  created_at: string;
};
type OpenStairSql = StairSql & { goal_name: string };

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

export function listGoals(db: DatabaseSync): GoalRow[] {
  return db
    .prepare("SELECT id, name, created_at FROM goals ORDER BY created_at ASC, id ASC")
    .all() as GoalSql[];
}

export function findGoalById(db: DatabaseSync, goalId: string): GoalRow | undefined {
  return db
    .prepare("SELECT id, name, created_at FROM goals WHERE id = ? LIMIT 1")
    .get(goalId) as GoalSql | undefined;
}

export function getOpenStairWithGoalName(db: DatabaseSync): OpenStairWithGoalName | undefined {
  const row = db
    .prepare(
      `SELECT s.id, s.goal_id, s.name, s.status, s.elapsed_seconds, s.visible_started_at, s.created_at,
              g.name AS goal_name
       FROM stairs s
       INNER JOIN goals g ON g.id = s.goal_id
       WHERE s.status = 'open'
       LIMIT 1`,
    )
    .get() as OpenStairSql | undefined;
  if (row === undefined) {
    return undefined;
  }
  return { ...mapStair(row), goal_name: row.goal_name };
}

export function listFinishedStairs(db: DatabaseSync, goalId: string): StairRow[] {
  const rows = db
    .prepare(
      `SELECT id, goal_id, name, status, elapsed_seconds, visible_started_at, created_at
       FROM stairs
       WHERE goal_id = ? AND status = 'finished'
       ORDER BY created_at ASC, id ASC`,
    )
    .all(goalId) as StairSql[];
  return rows.map(mapStair);
}

export function finishOpenStair(
  db: DatabaseSync,
  input: { elapsedSeconds: number; nowIso: string },
): StairRow | undefined {
  const open = db
    .prepare(
      `SELECT id, goal_id, name, status, elapsed_seconds, visible_started_at, created_at
       FROM stairs WHERE status = 'open' LIMIT 1`,
    )
    .get() as StairSql | undefined;
  if (open === undefined) {
    return undefined;
  }
  db.prepare(
    `UPDATE stairs
     SET status = 'finished', elapsed_seconds = ?, visible_started_at = NULL
     WHERE id = ?`,
  ).run(input.elapsedSeconds, open.id);
  return mapStair({
    ...open,
    status: "finished",
    elapsed_seconds: input.elapsedSeconds,
    visible_started_at: null,
  });
}

export function pauseVisibility(
  db: DatabaseSync,
  input: { elapsedSeconds: number; nowIso: string },
): StairRow | undefined {
  void input.nowIso;
  const open = db
    .prepare(
      `SELECT id, goal_id, name, status, elapsed_seconds, visible_started_at, created_at
       FROM stairs WHERE status = 'open' LIMIT 1`,
    )
    .get() as StairSql | undefined;
  if (open === undefined) {
    return undefined;
  }
  if (open.visible_started_at === null) {
    return mapStair(open);
  }
  db.prepare(
    `UPDATE stairs SET elapsed_seconds = ?, visible_started_at = NULL WHERE id = ?`,
  ).run(input.elapsedSeconds, open.id);
  return mapStair({
    ...open,
    elapsed_seconds: input.elapsedSeconds,
    visible_started_at: null,
  });
}

export function resumeVisibilitySegment(
  db: DatabaseSync,
  nowIso: string,
): StairRow | undefined {
  const open = db
    .prepare(
      `SELECT id, goal_id, name, status, elapsed_seconds, visible_started_at, created_at
       FROM stairs WHERE status = 'open' LIMIT 1`,
    )
    .get() as StairSql | undefined;
  if (open === undefined) {
    return undefined;
  }
  if (open.visible_started_at !== null) {
    return mapStair(open);
  }
  db.prepare(`UPDATE stairs SET visible_started_at = ? WHERE id = ?`).run(nowIso, open.id);
  return mapStair({ ...open, visible_started_at: nowIso });
}
