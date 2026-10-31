import type { DatabaseSync } from "node:sqlite";
import { ulid } from "ulid";
import { displayElapsedSeconds } from "../shared/elapsed.js";
import { isBlankName, trimName } from "../shared/names.js";
import {
  findGoalByName,
  findOpenStair,
  insertGoal,
  insertOpenStair,
  type StairRow,
} from "./repo.js";

export class OpenStairError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "OpenStairError";
    this.code = code;
  }
}

export type OpenStairResult = {
  id: string;
  goal_id: string;
  goal_name: string;
  name: string;
  status: "open";
  elapsed_seconds: number;
  visible_started_at: string;
  display_elapsed_seconds: number;
  created_at: string;
};

function toOpenStairResult(
  stair: StairRow,
  goalName: string,
  now: Date,
): OpenStairResult {
  const visibleStartedAt = stair.visible_started_at ?? now.toISOString();
  return {
    id: stair.id,
    goal_id: stair.goal_id,
    goal_name: goalName,
    name: stair.name,
    status: "open",
    elapsed_seconds: stair.elapsed_seconds,
    visible_started_at: visibleStartedAt,
    display_elapsed_seconds: displayElapsedSeconds(
      stair.elapsed_seconds,
      stair.visible_started_at,
      now,
    ),
    created_at: stair.created_at,
  };
}

export function openStair(
  db: DatabaseSync,
  input: { stairName: string; goalName: string; now?: Date },
): OpenStairResult {
  const now = input.now ?? new Date();
  const stairName = trimName(input.stairName);
  const goalName = trimName(input.goalName);

  if (isBlankName(input.stairName)) {
    throw new OpenStairError(
      "open_stair.empty_stair_name",
      "The name has to be a completed action.",
    );
  }
  if (isBlankName(input.goalName)) {
    throw new OpenStairError("open_stair.empty_goal_name", "The goal needs a name.");
  }
  if (findOpenStair(db) !== undefined) {
    throw new OpenStairError(
      "open_stair.already_open",
      "Mark the current stair done first.",
    );
  }

  let goal = findGoalByName(db, goalName);
  if (goal === undefined) {
    goal = insertGoal(db, {
      id: ulid(),
      name: goalName,
      created_at: now.toISOString(),
    });
  }

  const stair = insertOpenStair(db, {
    id: ulid(),
    goal_id: goal.id,
    name: stairName,
    elapsed_seconds: 0,
    visible_started_at: now.toISOString(),
    created_at: now.toISOString(),
  });

  return toOpenStairResult(stair, goal.name, now);
}
