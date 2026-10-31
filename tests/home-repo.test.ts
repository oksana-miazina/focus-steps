import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import {
  finishOpenStair,
  findGoalById,
  getOpenStairWithGoalName,
  listFinishedStairs,
  listGoals,
  pauseVisibility,
  resumeVisibilitySegment,
} from "../src/modules/home/repo.js";
import { newFinishedStair, newGoal, newOpenStair } from "./helpers/fixtures.js";
import { cleanupTempDb, migrateTempDb } from "./helpers/migrate-temp-db.js";

let sqlitePath: string | undefined;
let db: DatabaseSync | undefined;

afterEach(() => {
  if (sqlitePath === undefined) {
    return;
  }
  cleanupTempDb(sqlitePath, db);
  sqlitePath = undefined;
  db = undefined;
});

function setup(): DatabaseSync {
  const migrated = migrateTempDb("home-repo");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

describe("home repo", () => {
  it("lists goals (AC-16)", () => {
    const database = setup();
    newGoal(database, { id: "01ARZ3NDEKTSV4RRFFQ69G5FA1", name: "A", createdAt: "2026-10-31T10:00:00.000Z" });
    newGoal(database, { id: "01ARZ3NDEKTSV4RRFFQ69G5FA2", name: "B", createdAt: "2026-10-31T10:01:00.000Z" });
    const goals = listGoals(database);
    expect(goals.map((g) => g.name)).toEqual(["A", "B"]);
  });

  it("reads the open stair with goal name (AC-15 support)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    expect(getOpenStairWithGoalName(database)).toBeUndefined();
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 10,
      visibleStartedAt: "2026-10-31T12:00:00.000Z",
    });
    const open = getOpenStairWithGoalName(database);
    expect(open?.name).toBe("Write the outline");
    expect(open?.goal_name).toBe("Homework");
  });

  it("lists finished stairs only and never the open row (AC-03, AC-12)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, { goalId: goal.id, name: "Still open" });
    newFinishedStair(database, { goalId: goal.id, name: "Done A", elapsedSeconds: 60 });
    newFinishedStair(database, { goalId: goal.id, name: "Done B", elapsedSeconds: 40 });
    const finished = listFinishedStairs(database, goal.id);
    expect(finished.map((s) => s.name)).toEqual(["Done A", "Done B"]);
    expect(finished.every((s) => s.status === "finished")).toBe(true);
  });

  it("finishes the open stair freezing elapsed and clearing visibility (AC-02)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 100,
      visibleStartedAt: "2026-10-31T12:00:00.000Z",
    });
    const finished = finishOpenStair(database, {
      elapsedSeconds: 160,
      nowIso: "2026-10-31T12:01:00.000Z",
    });
    expect(finished?.status).toBe("finished");
    expect(finished?.elapsed_seconds).toBe(160);
    expect(finished?.visible_started_at).toBeNull();
    expect(getOpenStairWithGoalName(database)).toBeUndefined();
    expect(listFinishedStairs(database, goal.id)).toHaveLength(1);
  });

  it("pauses visibility without deleting the open stair and resumes a segment (AC-08)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 50,
      visibleStartedAt: "2026-10-31T12:00:00.000Z",
    });

    const paused = pauseVisibility(database, {
      elapsedSeconds: 80,
      nowIso: "2026-10-31T12:00:30.000Z",
    });
    expect(paused?.status).toBe("open");
    expect(paused?.elapsed_seconds).toBe(80);
    expect(paused?.visible_started_at).toBeNull();
    expect(getOpenStairWithGoalName(database)?.id).toBe(paused?.id);

    // idempotent when already paused
    const pausedAgain = pauseVisibility(database, {
      elapsedSeconds: 999,
      nowIso: "2026-10-31T12:00:40.000Z",
    });
    expect(pausedAgain?.elapsed_seconds).toBe(80);
    expect(pausedAgain?.visible_started_at).toBeNull();

    const resumed = resumeVisibilitySegment(database, "2026-10-31T12:05:00.000Z");
    expect(resumed?.visible_started_at).toBe("2026-10-31T12:05:00.000Z");
    expect(resumed?.elapsed_seconds).toBe(80);
    expect(findGoalById(database, goal.id)?.name).toBe("Homework");
  });
});
