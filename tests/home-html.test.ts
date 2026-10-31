import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { tryHandle as tryHandleHome } from "../src/modules/home/http.js";
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
  const migrated = migrateTempDb("home-html");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

async function mountHome(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
  database: DatabaseSync,
): Promise<void> {
  if (!(await tryHandleHome(req, res, database))) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
  }
}

describe("SCR-01 Home HTML", () => {
  it("empty state shows hint and Start a stair (AC-16 empty)", async () => {
    const database = setup();
    await withApiServer(database, mountHome, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/`);
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/text\/html/);
      const html = await response.text();
      expect(html).toContain("Focus Steps");
      expect(html).toContain("app-shell");
      expect(html).toContain("No goals yet. Start a stair to create one.");
      expect(html).toContain('href="/stairs/new"');
      expect(html).toContain("Start a stair");
    });
  });

  it("default state lists goals and open stair with mark-done (AC-15, AC-16)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 125,
      visibleStartedAt: null,
    });
    await withApiServer(database, mountHome, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/`);
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("Write the outline");
      expect(html).toContain("Homework");
      expect(html).toContain("0:02:05");
      expect(html).toContain("Mark done");
      expect(html).toContain(`href="/goals/${goal.id}"`);
      expect(html).toMatch(/action="\/stairs\/open\/finish"/);
    });
  });

  it("error flash shows already_open contract message (AC-06)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, {
      goalId: goal.id,
      name: "Write the outline",
      elapsedSeconds: 10,
      visibleStartedAt: null,
    });
    await withApiServer(database, mountHome, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/?error=already_open`);
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("inline-message");
      expect(html).toContain("Mark the current stair done first.");
      expect(html).toContain("Write the outline");
    });
  });

  it("escapes HTML in stair and goal names", async () => {
    const database = setup();
    const goal = newGoal(database, { name: '<script>alert("g")</script>' });
    newOpenStair(database, {
      goalId: goal.id,
      name: '<img src=x onerror=alert(1)>',
      elapsedSeconds: 0,
      visibleStartedAt: null,
    });
    await withApiServer(database, mountHome, async (baseUrl) => {
      const html = await (await fetch(`${baseUrl}/`)).text();
      expect(html).not.toContain("<script>alert");
      expect(html).not.toContain("<img src=x");
      expect(html).toContain("&lt;script&gt;");
    });
  });
});
