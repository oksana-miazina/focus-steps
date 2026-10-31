import { afterEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { tryHandle as tryHandleHome } from "../src/modules/home/http.js";
import { tryHandle as tryHandleOpenStair } from "../src/modules/open-stair/http.js";
import { getOpenStairWithGoalName } from "../src/modules/home/repo.js";
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
  const migrated = migrateTempDb("open-stair-html");
  sqlitePath = migrated.path;
  db = migrated.db;
  return db;
}

async function mount(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
  database: DatabaseSync,
): Promise<void> {
  if (await tryHandleOpenStair(req, res, database)) {
    return;
  }
  if (await tryHandleHome(req, res, database)) {
    return;
  }
  res.writeHead(404);
  res.end("not found");
}

describe("SCR-02 Open a stair HTML", () => {
  it("GET /stairs/new renders the default form (AC-01)", async () => {
    const database = setup();
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/stairs/new`);
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("Open a stair");
      expect(html).toContain("Stair name");
      expect(html).toContain("Goal name");
      expect(html).toContain('name="stair_name"');
      expect(html).toContain('name="goal_name"');
      expect(html).toContain("field-label");
      expect(html).toContain("primary-button");
    });
  });

  it("POST opens a stair and redirects home (AC-01)", async () => {
    const database = setup();
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/stairs/new`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "stair_name=Write+the+outline&goal_name=Homework",
        redirect: "manual",
      });
      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe("/");
      const open = getOpenStairWithGoalName(database);
      expect(open?.name).toBe("Write the outline");
      expect(open?.goal_name).toBe("Homework");
    });
  });

  it("empty stair name stays on SCR-02 with contract message (AC-04)", async () => {
    const database = setup();
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/stairs/new`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "stair_name=+++&goal_name=Homework",
      });
      expect(response.status).toBe(400);
      const html = await response.text();
      expect(html).toContain("inline-message");
      expect(html).toContain("The name has to be a completed action.");
      expect(html).toContain('name="stair_name"');
      expect(getOpenStairWithGoalName(database)).toBeUndefined();
    });
  });

  it("empty goal name stays on SCR-02 with contract message (AC-10)", async () => {
    const database = setup();
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/stairs/new`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "stair_name=Write+the+outline&goal_name=",
      });
      expect(response.status).toBe(400);
      const html = await response.text();
      expect(html).toContain("The goal needs a name.");
      expect(getOpenStairWithGoalName(database)).toBeUndefined();
    });
  });

  it("already_open redirects to Home with flash (AC-06)", async () => {
    const database = setup();
    const goal = newGoal(database, { name: "Homework" });
    newOpenStair(database, { goalId: goal.id, name: "Existing" });
    await withApiServer(database, mount, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/stairs/new`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "stair_name=Second&goal_name=Homework",
        redirect: "manual",
      });
      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe("/?error=already_open");
    });
  });
});
