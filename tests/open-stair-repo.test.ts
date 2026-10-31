import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import {
  findGoalByName,
  findOpenStair,
  insertGoal,
  insertOpenStair,
} from "../src/modules/open-stair/repo.js";
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

describe("open-stair repo", () => {
  it("inserts and finds a goal by trimmed name (AC-09, AC-11)", () => {
    const migrated = migrateTempDb("open-stair-repo-goal");
    sqlitePath = migrated.path;
    db = migrated.db;

    const created = insertGoal(db, {
      id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      name: "Homework",
      created_at: "2026-10-31T10:00:00.000Z",
    });
    expect(created.name).toBe("Homework");

    expect(findGoalByName(db, "Homework")).toEqual(created);
    expect(findGoalByName(db, "homework")).toBeUndefined();

    expect(() =>
      insertGoal(db!, {
        id: "01ARZ3NDEKTSV4RRFFQ69G5FAW",
        name: "Homework",
        created_at: "2026-10-31T10:01:00.000Z",
      }),
    ).toThrow();
  });

  it("inserts one open stair and reads whether a stair is open (AC-01)", () => {
    const migrated = migrateTempDb("open-stair-repo-stair");
    sqlitePath = migrated.path;
    db = migrated.db;

    const goal = newGoal(db, {
      id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      name: "Homework",
      createdAt: "2026-10-31T10:00:00.000Z",
    });

    expect(findOpenStair(db)).toBeUndefined();

    const stair = insertOpenStair(db, {
      id: "01ARZ3NDEKTSV4RRFFQ69G5FB0",
      goal_id: goal.id,
      name: "Write the outline",
      elapsed_seconds: 0,
      visible_started_at: "2026-10-31T12:00:00.000Z",
      created_at: "2026-10-31T12:00:00.000Z",
    });

    expect(stair.status).toBe("open");
    expect(findOpenStair(db)).toEqual(stair);

    expect(() =>
      insertOpenStair(db!, {
        id: "01ARZ3NDEKTSV4RRFFQ69G5FB1",
        goal_id: goal.id,
        name: "Second",
        elapsed_seconds: 0,
        visible_started_at: "2026-10-31T12:01:00.000Z",
        created_at: "2026-10-31T12:01:00.000Z",
      }),
    ).toThrow();

    // Detect existing open row via fixture insert path as well
    const other = migrateTempDb("open-stair-repo-detect");
    cleanupTempDb(sqlitePath, db);
    sqlitePath = other.path;
    db = other.db;
    const g2 = newGoal(db, { name: "G" });
    newOpenStair(db, { goalId: g2.id, name: "A" });
    expect(findOpenStair(db)?.name).toBe("A");
  });
});
