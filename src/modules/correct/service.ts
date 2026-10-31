import type { DatabaseSync } from "node:sqlite";
import { getGoalProgress, type GoalProgressDto } from "../home/service.js";
import { isBlankName, trimName } from "../shared/names.js";
import { findFinishedStair, updateFinishedStair } from "./repo.js";

export class CorrectError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CorrectError";
    this.code = code;
  }
}

export type CorrectPatch = {
  name?: string | null;
  elapsedSeconds?: number | null;
};

export function correctFinishedStair(
  db: DatabaseSync,
  stairId: string,
  patch: CorrectPatch,
): GoalProgressDto {
  const hasName = Object.prototype.hasOwnProperty.call(patch, "name");
  const hasTime = Object.prototype.hasOwnProperty.call(patch, "elapsedSeconds");

  if (!hasName && !hasTime) {
    throw new CorrectError("correct.invalid_body", "Provide a name and/or time to correct.");
  }

  if (hasName) {
    if (typeof patch.name !== "string" || isBlankName(patch.name)) {
      throw new CorrectError(
        "correct.empty_stair_name",
        "The name has to be a completed action.",
      );
    }
  }

  if (hasTime) {
    if (
      typeof patch.elapsedSeconds !== "number" ||
      !Number.isFinite(patch.elapsedSeconds) ||
      patch.elapsedSeconds < 0
    ) {
      throw new CorrectError(
        "correct.invalid_time",
        "The time has to be the time the stair ran.",
      );
    }
  }

  const current = findFinishedStair(db, stairId);
  if (current === undefined) {
    throw new CorrectError("correct.stair_not_found", "Finished stair not found.");
  }

  updateFinishedStair(db, stairId, {
    name: hasName ? trimName(patch.name as string) : undefined,
    elapsedSeconds: hasTime ? (patch.elapsedSeconds as number) : undefined,
  });

  return getGoalProgress(db, current.goal_id);
}
