import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { correctFinishedStair, CorrectError } from "../src/modules/correct/service.js";
import { newFinishedStair, newGoal } from "./helpers/fixtures.js";
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
  const migrated = migrateTempDb("correct-service");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

describe("correctFinishedStair service", () => {
  it("keeps a valid name and time correction in goal progress (AC-07)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Old name",
      elapsedSeconds: 600,
    });
    newFinishedStair(database, { goalId: goal.id, name: "Other", elapsedSeconds: 100 });

    const progress = correctFinishedStair(database, stair.id, {
      name: "  Write the outline  ",
      elapsedSeconds: 540,
    });

    const corrected = progress.finished_stairs.find((s) => s.id === stair.id);
    expect(corrected?.name).toBe("Write the outline");
    expect(corrected?.elapsed_seconds).toBe(540);
    expect(progress.total_elapsed_seconds).toBe(640);
  });

  it("refuses empty or negative time without writing (AC-13)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });

    try {
      correctFinishedStair(database, stair.id, { elapsedSeconds: -1 });
      expect.fail("expected refusal");
    } catch (error) {
      expect(error).toBeInstanceOf(CorrectError);
      expect((error as CorrectError).code).toBe("correct.invalid_time");
      expect((error as CorrectError).message).toBe("The time has to be the time the stair ran.");
    }

    const row = database
      .prepare("SELECT name, elapsed_seconds FROM stairs WHERE id = ?")
      .get(stair.id) as { name: string; elapsed_seconds: number };
    expect(row.name).toBe("Write the outline");
    expect(row.elapsed_seconds).toBe(600);
  });

  it("refuses empty stair name without writing (AC-14)", () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });

    try {
      correctFinishedStair(database, stair.id, { name: "   " });
      expect.fail("expected refusal");
    } catch (error) {
      expect(error).toBeInstanceOf(CorrectError);
      expect((error as CorrectError).code).toBe("correct.empty_stair_name");
      expect((error as CorrectError).message).toBe("The name has to be a completed action.");
    }

    const row = database
      .prepare("SELECT name FROM stairs WHERE id = ?")
      .get(stair.id) as { name: string };
    expect(row.name).toBe("Write the outline");
  });
});
