import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { tryHandle as tryHandleHome } from "../src/modules/home/http.js";
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
  const migrated = migrateTempDb("goal-html");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

async function mount(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
  database: DatabaseSync,
): Promise<void> {
  if (!(await tryHandleHome(req, res, database))) {
    res.writeHead(404);
    res.end("not found");
  }
}

describe("SCR-03 Goal HTML", () => {
  it("shows finished stairs, total, and correct links (AC-03, AC-17)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    const a = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });
    const b = newFinishedStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 600,
    });
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/goals/${goal.id}`);
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("Homework");
      expect(html).toContain("Total time: 0:20:00");
      expect(html).toContain("Write the outline");
      expect(html).toContain(`href="/stairs/${a.id}/correct"`);
      expect(html).toContain(`href="/stairs/${b.id}/correct"`);
      expect(html).toContain("Correct");
      expect(html).toContain('href="/"');
    });
  });

  it("empty finished list when only open stair exists (AC-12)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, { goalId: goal.id, name: "Still open" });
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/goals/${goal.id}`);
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("Total time: 0:00:00");
      expect(html).toContain("No finished stairs yet.");
      expect(html).not.toContain("Still open");
    });
  });
});
