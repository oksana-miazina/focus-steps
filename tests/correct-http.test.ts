import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { tryHandle as tryHandleCorrect } from "../src/modules/correct/http.js";
import { newFinishedStair, newGoal } from "./helpers/fixtures.js";
import { withApiServer } from "./helpers/http.js";
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
  const migrated = migrateTempDb("correct-http");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

describe("PATCH /api/v1/stairs/{stairId}", () => {
  it("returns 200 GoalProgress after a kept correction (AC-07)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Old",
      elapsedSeconds: 600,
    });
    await withApiServer(database, tryHandleCorrect, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/stairs/${stair.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Write the outline", elapsed_seconds: 540 }),
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        finished_stairs: { id: string; name: string; elapsed_seconds: number }[];
        total_elapsed_seconds: number;
      };
      expect(body.finished_stairs[0]?.name).toBe("Write the outline");
      expect(body.finished_stairs[0]?.elapsed_seconds).toBe(540);
      expect(body.total_elapsed_seconds).toBe(540);
    });
  });

  it("returns 400 correct.invalid_time (AC-13)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });
    await withApiServer(database, tryHandleCorrect, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/stairs/${stair.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ elapsed_seconds: -5 }),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        code: "correct.invalid_time",
        message: "The time has to be the time the stair ran.",
      });
    });
  });

  it("returns 400 correct.empty_stair_name (AC-14)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });
    await withApiServer(database, tryHandleCorrect, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/stairs/${stair.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "  " }),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        code: "correct.empty_stair_name",
        message: "The name has to be a completed action.",
      });
    });
  });
});
