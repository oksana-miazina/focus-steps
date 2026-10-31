import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { findGoalByName, findOpenStair } from "../src/modules/open-stair/repo.js";
import { openStair, OpenStairError } from "../src/modules/open-stair/service.js";
import { newGoal, newOpenStair } from "./helpers/fixtures.js";
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
  const migrated = migrateTempDb("open-stair-service");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

describe("openStair service", () => {
  it("opens a stair under an existing goal and starts time (AC-01)", () => {
    const database = setup();
    newGoal(database, { name: "Homework", createdAt: "2026-10-31T10:00:00.000Z" });

    const opened = openStair(database, {
      stairName: "Write the outline",
      goalName: "Homework",
      now: new Date("2026-10-31T12:00:00.000Z"),
    });

    expect(opened.status).toBe("open");
    expect(opened.name).toBe("Write the outline");
    expect(opened.goal_name).toBe("Homework");
    expect(opened.elapsed_seconds).toBe(0);
    expect(opened.visible_started_at).toBe("2026-10-31T12:00:00.000Z");
    expect(opened.display_elapsed_seconds).toBe(0);
    expect(findOpenStair(database)?.id).toBe(opened.id);
  });

  it("creates the goal when opening under a new name (AC-09)", () => {
    const database = setup();
    const opened = openStair(database, {
      stairName: "Draft intro",
      goalName: "Essay",
      now: new Date("2026-10-31T12:00:00.000Z"),
    });
    expect(findGoalByName(database, "Essay")?.id).toBe(opened.goal_id);
    expect(opened.goal_name).toBe("Essay");
  });

  it("reuses trimmed case-sensitive goal name and does not create a second (AC-11)", () => {
    const database = setup();
    const existing = newGoal(database, { name: "Homework" });
    const opened = openStair(database, {
      stairName: "Write the outline",
      goalName: "  Homework  ",
    });
    expect(opened.goal_id).toBe(existing.id);
    expect(findGoalByName(database, "Homework")?.id).toBe(existing.id);
    expect(findGoalByName(database, "homework")).toBeUndefined();
  });

  it("refuses empty stair name with no writes (AC-04)", () => {
    const database = setup();
    expect(() => openStair(database, { stairName: "   ", goalName: "Homework" })).toThrow(
      OpenStairError,
    );
    try {
      openStair(database, { stairName: "", goalName: "Homework" });
    } catch (error) {
      expect(error).toBeInstanceOf(OpenStairError);
      expect((error as OpenStairError).code).toBe("open_stair.empty_stair_name");
      expect((error as OpenStairError).message).toBe("The name has to be a completed action.");
    }
    expect(findGoalByName(database, "Homework")).toBeUndefined();
    expect(findOpenStair(database)).toBeUndefined();
  });

  it("refuses empty goal name with no writes (AC-10)", () => {
    const database = setup();
    try {
      openStair(database, { stairName: "Write the outline", goalName: "  " });
      expect.fail("expected refusal");
    } catch (error) {
      expect(error).toBeInstanceOf(OpenStairError);
      expect((error as OpenStairError).code).toBe("open_stair.empty_goal_name");
      expect((error as OpenStairError).message).toBe("The goal needs a name.");
    }
    expect(findOpenStair(database)).toBeUndefined();
  });

  it("refuses a second open stair with no goal or stair writes (AC-06)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, { goalId: goal.id, name: "First" });
    const goalsBefore = database.prepare("SELECT COUNT(*) AS n FROM goals").get() as { n: number };
    const stairsBefore = database.prepare("SELECT COUNT(*) AS n FROM stairs").get() as { n: number };

    try {
      openStair(database, { stairName: "Second", goalName: "NewGoal" });
      expect.fail("expected refusal");
    } catch (error) {
      expect(error).toBeInstanceOf(OpenStairError);
      expect((error as OpenStairError).code).toBe("open_stair.already_open");
      expect((error as OpenStairError).message).toBe("Mark the current stair done first.");
    }

    const goalsAfter = database.prepare("SELECT COUNT(*) AS n FROM goals").get() as { n: number };
    const stairsAfter = database.prepare("SELECT COUNT(*) AS n FROM stairs").get() as { n: number };
    expect(goalsAfter.n).toBe(goalsBefore.n);
    expect(stairsAfter.n).toBe(stairsBefore.n);
    expect(findOpenStair(database)?.name).toBe("First");
    expect(findGoalByName(database, "NewGoal")).toBeUndefined();
  });
});
