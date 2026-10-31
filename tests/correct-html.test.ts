import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { tryHandle as tryHandleCorrect } from "../src/modules/correct/http.js";
import { tryHandle as tryHandleHome } from "../src/modules/home/http.js";
import { findFinishedStair } from "../src/modules/correct/repo.js";
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
  const migrated = migrateTempDb("correct-html");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

async function mount(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
  database: DatabaseSync,
): Promise<void> {
  if (await tryHandleCorrect(req, res, database)) {
    return;
  }
  if (await tryHandleHome(req, res, database)) {
    return;
  }
  res.writeHead(404);
  res.end("not found");
}

describe("SCR-04 Correct HTML", () => {
  it("GET prefills finished stair name and time (AC-07)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/stairs/${stair.id}/correct`);
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("Correct a stair");
      expect(html).toContain('value="Write the outline"');
      expect(html).toContain('value="600"');
      expect(html).toContain(`href="/goals/${goal.id}"`);
    });
  });

  it("POST keeps correction and redirects to Goal (AC-07)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/stairs/${stair.id}/correct`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "name=Revised+outline&elapsed_seconds=90",
        redirect: "manual",
      });
      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe(`/goals/${goal.id}`);
      const updated = findFinishedStair(database, stair.id);
      expect(updated?.name).toBe("Revised outline");
      expect(updated?.elapsed_seconds).toBe(90);
    });
  });

  it("invalid time stays on SCR-04 with contract message (AC-13)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/stairs/${stair.id}/correct`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "name=Write+the+outline&elapsed_seconds=-1",
      });
      expect(response.status).toBe(400);
      const html = await response.text();
      expect(html).toContain("The time has to be the time the stair ran.");
      expect(findFinishedStair(database, stair.id)?.elapsed_seconds).toBe(600);
    });
  });

  it("empty name stays on SCR-04 with contract message (AC-14)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const stair = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/stairs/${stair.id}/correct`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "name=+++&elapsed_seconds=600",
      });
      expect(response.status).toBe(400);
      const html = await response.text();
      expect(html).toContain("The name has to be a completed action.");
      expect(findFinishedStair(database, stair.id)?.name).toBe("Write the outline");
    });
  });
});
