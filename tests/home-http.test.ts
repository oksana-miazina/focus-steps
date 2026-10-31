import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { tryHandle as tryHandleHome } from "../src/modules/home/http.js";
import { getOpenStairWithGoalName } from "../src/modules/home/repo.js";
import { newFinishedStair, newGoal, newOpenStair } from "./helpers/fixtures.js";
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
  const migrated = migrateTempDb("home-http");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

describe("home API routes", () => {
  it("GET /api/v1/home returns goals and open stair (AC-15, AC-16)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 10,
      visibleStartedAt: "2026-10-31T12:00:00.000Z",
    });
    await withApiServer(database, tryHandleHome, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/home`);
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        goals: { name: string }[];
        open_stair: { name: string; goal_name: string; display_elapsed_seconds: number } | null;
      };
      expect(body.goals.map((g) => g.name)).toEqual(["Homework"]);
      expect(body.open_stair?.name).toBe("Write the outline");
      expect(body.open_stair?.goal_name).toBe("Homework");
      expect(typeof body.open_stair?.display_elapsed_seconds).toBe("number");
    });
  });

  it("GET /api/v1/home with no goals returns empty and null open stair", async () => {
    const database = setup();
    await withApiServer(database, tryHandleHome, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/home`);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ goals: [], open_stair: null });
    });
  });

  it("GET /api/v1/goals returns GoalPage (AC-16)", async () => {
    const database = setup();
    newGoal(database, { name: "Homework" });
    await withApiServer(database, tryHandleHome, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/goals`);
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        items: { name: string }[];
        has_next: boolean;
        has_prev: boolean;
        next_cursor: string | null;
      };
      expect(body.items.map((g) => g.name)).toEqual(["Homework"]);
      expect(body.has_next).toBe(false);
      expect(body.has_prev).toBe(false);
    });
  });

  it("GET /api/v1/goals/{id} returns finished progress excluding open (AC-03, AC-12, AC-17)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, { goalId: goal.id, name: "Open" });
    newFinishedStair(database, { goalId: goal.id, name: "Same", elapsedSeconds: 5 });
    newFinishedStair(database, { goalId: goal.id, name: "Same", elapsedSeconds: 7 });
    await withApiServer(database, tryHandleHome, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/goals/${goal.id}`);
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        finished_stairs: { name: string; elapsed_seconds: number }[];
        total_elapsed_seconds: number;
      };
      expect(body.finished_stairs).toHaveLength(2);
      expect(body.total_elapsed_seconds).toBe(12);
    });
  });

  it("POST /api/v1/stairs/open/finish returns GoalProgress (AC-02)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 60,
      visibleStartedAt: null,
    });
    await withApiServer(database, tryHandleHome, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/stairs/open/finish`, { method: "POST" });
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        finished_stairs: { name: string; status: string }[];
        total_elapsed_seconds: number;
      };
      expect(body.finished_stairs[0]?.name).toBe("Write the outline");
      expect(body.finished_stairs[0]?.status).toBe("finished");
      expect(body.total_elapsed_seconds).toBe(60);
      expect(getOpenStairWithGoalName(database)).toBeUndefined();
    });
  });

  it("POST /api/v1/visibility/hide returns 204 and is idempotent (AC-08)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 10,
      visibleStartedAt: "2026-10-31T12:00:00.000Z",
    });
    await withApiServer(database, tryHandleHome, async (baseUrl) => {
      const first = await fetch(`${baseUrl}/api/v1/visibility/hide`, { method: "POST" });
      expect(first.status).toBe(204);
      expect(getOpenStairWithGoalName(database)?.visible_started_at).toBeNull();
      const second = await fetch(`${baseUrl}/api/v1/visibility/hide`, { method: "POST" });
      expect(second.status).toBe(204);
    });
  });
});
