import type { DatabaseSync } from "node:sqlite";
import { ulid } from "ulid";

export type GoalFixture = {
  id: string;
  name: string;
  created_at: string;
};

export type StairFixture = {
  id: string;
  goal_id: string;
  name: string;
  status: "open" | "finished";
  elapsed_seconds: number;
  visible_started_at: string | null;
  created_at: string;
};

export function newGoal(
  db: DatabaseSync,
  opts: { id?: string; name: string; createdAt?: string },
): GoalFixture {
  const row: GoalFixture = {
    id: opts.id ?? ulid(),
    name: opts.name,
    created_at: opts.createdAt ?? new Date().toISOString(),
  };
  db.prepare("INSERT INTO goals (id, name, created_at) VALUES (?, ?, ?)").run(
    row.id,
    row.name,
    row.created_at,
  );
  return row;
}

export function newOpenStair(
  db: DatabaseSync,
  opts: {
    id?: string;
    goalId: string;
    name: string;
    elapsedSeconds?: number;
    visibleStartedAt?: string | null;
    createdAt?: string;
  },
): StairFixture {
  const row: StairFixture = {
    id: opts.id ?? ulid(),
    goal_id: opts.goalId,
    name: opts.name,
    status: "open",
    elapsed_seconds: opts.elapsedSeconds ?? 0,
    visible_started_at:
      opts.visibleStartedAt === undefined
        ? new Date().toISOString()
        : opts.visibleStartedAt,
    created_at: opts.createdAt ?? new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO stairs (id, goal_id, name, status, elapsed_seconds, visible_started_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    row.id,
    row.goal_id,
    row.name,
    row.status,
    row.elapsed_seconds,
    row.visible_started_at,
    row.created_at,
  );
  return row;
}

export function newFinishedStair(
  db: DatabaseSync,
  opts: {
    id?: string;
    goalId: string;
    name: string;
    elapsedSeconds: number;
    createdAt?: string;
  },
): StairFixture {
  const row: StairFixture = {
    id: opts.id ?? ulid(),
    goal_id: opts.goalId,
    name: opts.name,
    status: "finished",
    elapsed_seconds: opts.elapsedSeconds,
    visible_started_at: null,
    created_at: opts.createdAt ?? new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO stairs (id, goal_id, name, status, elapsed_seconds, visible_started_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    row.id,
    row.goal_id,
    row.name,
    row.status,
    row.elapsed_seconds,
    row.visible_started_at,
    row.created_at,
  );
  return row;
}
