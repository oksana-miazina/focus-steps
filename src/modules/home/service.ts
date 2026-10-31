import type { DatabaseSync } from "node:sqlite";
import { displayElapsedSeconds } from "../shared/elapsed.js";
import {
  finishOpenStair as finishOpenStairRow,
  findGoalById,
  getOpenStairWithGoalName,
  listFinishedStairs,
  listGoals,
  pauseVisibility,
  resumeVisibilitySegment,
  type GoalRow,
  type OpenStairWithGoalName,
  type StairRow,
} from "./repo.js";

export type OpenStairDto = {
  id: string;
  goal_id: string;
  goal_name: string;
  name: string;
  status: "open";
  elapsed_seconds: number;
  visible_started_at: string | null;
  display_elapsed_seconds: number;
  created_at: string;
};

export type HomeDto = {
  goals: GoalRow[];
  open_stair: OpenStairDto | null;
};

export type GoalProgressDto = {
  goal: GoalRow;
  finished_stairs: StairRow[];
  total_elapsed_seconds: number;
};

export class HomeError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "HomeError";
    this.code = code;
  }
}

function toOpenStairDto(open: OpenStairWithGoalName, now: Date): OpenStairDto {
  return {
    id: open.id,
    goal_id: open.goal_id,
    goal_name: open.goal_name,
    name: open.name,
    status: "open",
    elapsed_seconds: open.elapsed_seconds,
    visible_started_at: open.visible_started_at,
    display_elapsed_seconds: displayElapsedSeconds(
      open.elapsed_seconds,
      open.visible_started_at,
      now,
    ),
    created_at: open.created_at,
  };
}

export function getHome(db: DatabaseSync, now: Date = new Date()): HomeDto {
  const goals = listGoals(db);
  let open = getOpenStairWithGoalName(db);
  if (open !== undefined && open.visible_started_at === null) {
    resumeVisibilitySegment(db, now.toISOString());
    open = getOpenStairWithGoalName(db);
  }
  return {
    goals,
    open_stair: open === undefined ? null : toOpenStairDto(open, now),
  };
}

export function getGoalProgress(db: DatabaseSync, goalId: string): GoalProgressDto {
  const goal = findGoalById(db, goalId);
  if (goal === undefined) {
    throw new HomeError("home.goal_not_found", "Goal not found.");
  }
  const finished_stairs = listFinishedStairs(db, goalId);
  const total_elapsed_seconds = finished_stairs.reduce(
    (sum, stair) => sum + stair.elapsed_seconds,
    0,
  );
  return { goal, finished_stairs, total_elapsed_seconds };
}

export function finishOpenStair(
  db: DatabaseSync,
  now: Date = new Date(),
): GoalProgressDto {
  const open = getOpenStairWithGoalName(db);
  if (open === undefined) {
    throw new HomeError("home.no_open_stair", "There is no open stair to finish.");
  }
  const frozen = displayElapsedSeconds(open.elapsed_seconds, open.visible_started_at, now);
  finishOpenStairRow(db, { elapsedSeconds: frozen, nowIso: now.toISOString() });
  return getGoalProgress(db, open.goal_id);
}

export function hideVisibility(db: DatabaseSync, now: Date = new Date()): void {
  const open = getOpenStairWithGoalName(db);
  if (open === undefined || open.visible_started_at === null) {
    return;
  }
  const elapsed = displayElapsedSeconds(open.elapsed_seconds, open.visible_started_at, now);
  pauseVisibility(db, { elapsedSeconds: elapsed, nowIso: now.toISOString() });
}
