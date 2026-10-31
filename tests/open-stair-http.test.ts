import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { tryHandle as tryHandleOpenStair } from "../src/modules/open-stair/http.js";
import { findGoalByName, findOpenStair } from "../src/modules/open-stair/repo.js";
import { newGoal, newOpenStair } from "./helpers/fixtures.js";
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
  const migrated = migrateTempDb("open-stair-http");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

describe("POST /api/v1/stairs", () => {
  it("returns 201 OpenStair (AC-01, AC-09)", async () => {
    const database = setup();
    await withApiServer(database, tryHandleOpenStair, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/stairs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stair_name: "Write the outline", goal_name: "Homework" }),
      });
      expect(response.status).toBe(201);
      const body = (await response.json()) as {
        name: string;
        goal_name: string;
        status: string;
        display_elapsed_seconds: number;
        visible_started_at: string | null;
      };
      expect(body.name).toBe("Write the outline");
      expect(body.goal_name).toBe("Homework");
      expect(body.status).toBe("open");
      expect(body.visible_started_at).not.toBeNull();
      expect(body.display_elapsed_seconds).toBe(0);
      expect(findOpenStair(database)?.name).toBe("Write the outline");
      expect(findGoalByName(database, "Homework")).toBeDefined();
    });
  });

  it("returns 400 open_stair.empty_stair_name (AC-04)", async () => {
    const database = setup();
    await withApiServer(database, tryHandleOpenStair, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/stairs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stair_name: "  ", goal_name: "Homework" }),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        code: "open_stair.empty_stair_name",
        message: "The name has to be a completed action.",
      });
      expect(findOpenStair(database)).toBeUndefined();
    });
  });

  it("returns 400 open_stair.empty_goal_name (AC-10)", async () => {
    const database = setup();
    await withApiServer(database, tryHandleOpenStair, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/stairs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stair_name: "Done", goal_name: "" }),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        code: "open_stair.empty_goal_name",
        message: "The goal needs a name.",
      });
    });
  });

  it("returns 409 open_stair.already_open (AC-06)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, { goalId: goal.id, name: "First" });
    await withApiServer(database, tryHandleOpenStair, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/stairs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stair_name: "Second", goal_name: "Other" }),
      });
      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({
        code: "open_stair.already_open",
        message: "Mark the current stair done first.",
      });
      expect(findGoalByName(database, "Other")).toBeUndefined();
    });
  });
});
