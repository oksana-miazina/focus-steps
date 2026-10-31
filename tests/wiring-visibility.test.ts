import fs from "node:fs";
import type { Server } from "node:http";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { start } from "../src/index.js";
import { cleanupTempDb, createTempSqlitePath, runDbmate } from "./helpers/migrate-temp-db.js";

let server: Server | undefined;
let sqlitePath: string | undefined;

afterEach(async () => {
  if (server !== undefined) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()));
    });
    server = undefined;
  }
  if (sqlitePath !== undefined) {
    cleanupTempDb(sqlitePath);
    sqlitePath = undefined;
  }
});

async function boot(): Promise<string> {
  sqlitePath = createTempSqlitePath("wiring");
  runDbmate(sqlitePath, "up");
  process.env.SQLITE_PATH = sqlitePath;
  server = await start(0);
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("server did not bind a port");
  }
  expect(address.address).toBe("127.0.0.1");
  return `http://127.0.0.1:${address.port}`;
}

describe("T17 wiring + visibility", () => {
  it("listens on loopback and serves product Home (AC-05)", async () => {
    const baseUrl = await boot();
    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("app-shell");
    expect(html).toContain("Focus Steps");
    expect(html).not.toContain("Focus Steps is up.");
  });

  it("serves styles.css and injects hide signal on pages (AC-08)", async () => {
    const baseUrl = await boot();
    const css = await fetch(`${baseUrl}/styles.css`);
    expect(css.status).toBe(200);
    expect(await css.text()).toContain(".app-shell");

    const home = await (await fetch(`${baseUrl}/`)).text();
    expect(home).toContain("/api/v1/visibility/hide");
    expect(home).toContain("visibilitychange");
    expect(home).toContain("pagehide");

    const open = await (await fetch(`${baseUrl}/stairs/new`)).text();
    expect(open).toContain("/api/v1/visibility/hide");
  });

  it("index.ts mounts open-stair, home, and correct modules", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "src", "index.ts"), "utf8");
    expect(source).toContain("tryHandleOpenStair");
    expect(source).toContain("tryHandleHome");
    expect(source).toContain("tryHandleCorrect");
    expect(source).toContain('"127.0.0.1"');
  });
});
