import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { getOpenStairWithGoalName } from "../src/modules/home/repo.js";
import {
  finishOpenStair,
  getGoalProgress,
  getHome,
  hideVisibility,
} from "../src/modules/home/service.js";
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
  const migrated = migrateTempDb("home-service");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

describe("home service", () => {
  it("returns home goals and open stair with display elapsed (AC-15, AC-16)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 120,
      visibleStartedAt: "2026-10-31T12:00:00.000Z",
    });
    const home = getHome(database, new Date("2026-10-31T12:00:05.000Z"));
    expect(home.goals.map((g) => g.name)).toEqual(["Homework"]);
    expect(home.open_stair?.name).toBe("Write the outline");
    expect(home.open_stair?.goal_name).toBe("Homework");
    expect(home.open_stair?.display_elapsed_seconds).toBe(125);
  });

  it("resumes a paused open stair when reading home (AC-08)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 80,
      visibleStartedAt: null,
    });
    const home = getHome(database, new Date("2026-10-31T12:05:00.000Z"));
    expect(home.open_stair?.elapsed_seconds).toBe(80);
    expect(home.open_stair?.visible_started_at).toBe("2026-10-31T12:05:00.000Z");
    expect(getOpenStairWithGoalName(database)?.visible_started_at).toBe(
      "2026-10-31T12:05:00.000Z",
    );
  });

  it("finishes open stair freezing display elapsed into progress (AC-02)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 100,
      visibleStartedAt: "2026-10-31T12:00:00.000Z",
    });
    const progress = finishOpenStair(database, new Date("2026-10-31T12:01:00.000Z"));
    expect(progress.finished_stairs).toHaveLength(1);
    expect(progress.finished_stairs[0]?.elapsed_seconds).toBe(160);
    expect(progress.total_elapsed_seconds).toBe(160);
    expect(getOpenStairWithGoalName(database)).toBeUndefined();
  });

  it("derives goal progress total and excludes open stair (AC-03, AC-12)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, { goalId: goal.id, name: "Still open" });
    const empty = getGoalProgress(database, goal.id);
    expect(empty.finished_stairs).toEqual([]);
    expect(empty.total_elapsed_seconds).toBe(0);

    newFinishedStair(database, { goalId: goal.id, name: "A", elapsedSeconds: 10 });
    newFinishedStair(database, { goalId: goal.id, name: "B", elapsedSeconds: 20 });
    const progress = getGoalProgress(database, goal.id);
    expect(progress.finished_stairs).toHaveLength(2);
    expect(progress.total_elapsed_seconds).toBe(30);
  });

  it("counts duplicate finished names as separate rows (AC-17)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newFinishedStair(database, { goalId: goal.id, name: "Same", elapsedSeconds: 5 });
    newFinishedStair(database, { goalId: goal.id, name: "Same", elapsedSeconds: 7 });
    const progress = getGoalProgress(database, goal.id);
    expect(progress.finished_stairs).toHaveLength(2);
    expect(progress.total_elapsed_seconds).toBe(12);
  });

  it("hides visibility adding 0 gap seconds (AC-08)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 50,
      visibleStartedAt: "2026-10-31T12:00:00.000Z",
    });
    hideVisibility(database, new Date("2026-10-31T12:00:30.000Z"));
    const open = getOpenStairWithGoalName(database);
    expect(open?.status).toBe("open");
    expect(open?.elapsed_seconds).toBe(80);
    expect(open?.visible_started_at).toBeNull();

    // gap while hidden does not accumulate until resume+hide again
    hideVisibility(database, new Date("2026-10-31T12:10:00.000Z"));
    expect(getOpenStairWithGoalName(database)?.elapsed_seconds).toBe(80);
  });
});
