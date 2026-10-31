import type { Server } from "node:http";
import { afterAll, expect, it } from "vitest";
import { start } from "../src/index.js";
import { cleanupTempDb, createTempSqlitePath, runDbmate } from "./helpers/migrate-temp-db.js";

let server: Server | undefined;
let sqlitePath: string | undefined;

afterAll(async () => {
  if (server !== undefined) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()));
    });
  }
  if (sqlitePath !== undefined) {
    cleanupTempDb(sqlitePath);
  }
});

it("boots and answers on the root page", async () => {
  sqlitePath = createTempSqlitePath("smoke");
  runDbmate(sqlitePath, "up");
  process.env.SQLITE_PATH = sqlitePath;
  server = await start(0);
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("server did not bind a port");
  }
  const response = await fetch(`http://127.0.0.1:${address.port}/`);
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).toContain("Focus Steps");
  expect(html).toContain("app-shell");
});
