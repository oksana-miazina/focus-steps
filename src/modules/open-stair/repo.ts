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

export function findGoalByName(db: DatabaseSync, name: string): GoalRow | undefined {
  const row = db
    .prepare("SELECT id, name, created_at FROM goals WHERE name = ? LIMIT 1")
    .get(name) as GoalSql | undefined;
  return row;
}

export function insertGoal(
  db: DatabaseSync,
  goal: { id: string; name: string; created_at: string },
): GoalRow {
  db.prepare("INSERT INTO goals (id, name, created_at) VALUES (?, ?, ?)").run(
    goal.id,
    goal.name,
    goal.created_at,
  );
  return { id: goal.id, name: goal.name, created_at: goal.created_at };
}

export function findOpenStair(db: DatabaseSync): StairRow | undefined {
  const row = db
    .prepare(
      `SELECT id, goal_id, name, status, elapsed_seconds, visible_started_at, created_at
       FROM stairs WHERE status = 'open' LIMIT 1`,
    )
    .get() as StairSql | undefined;
  return row === undefined ? undefined : mapStair(row);
}

export function insertOpenStair(
  db: DatabaseSync,
  stair: {
    id: string;
    goal_id: string;
    name: string;
    elapsed_seconds: number;
    visible_started_at: string;
    created_at: string;
  },
): StairRow {
  db.prepare(
    `INSERT INTO stairs (id, goal_id, name, status, elapsed_seconds, visible_started_at, created_at)
     VALUES (?, ?, ?, 'open', ?, ?, ?)`,
  ).run(
    stair.id,
    stair.goal_id,
    stair.name,
    stair.elapsed_seconds,
    stair.visible_started_at,
    stair.created_at,
  );
  return {
    id: stair.id,
    goal_id: stair.goal_id,
    name: stair.name,
    status: "open",
    elapsed_seconds: stair.elapsed_seconds,
    visible_started_at: stair.visible_started_at,
    created_at: stair.created_at,
  };
}
