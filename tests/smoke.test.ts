import type { Server } from "node:http";
import os from "node:os";
import path from "node:path";
import { afterAll, expect, it } from "vitest";
import { start } from "../src/index.js";

let server: Server | undefined;

afterAll(async () => {
  if (server === undefined) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    server?.close((error) => (error ? reject(error) : resolve()));
  });
});

it("boots and answers on the root page", async () => {
  process.env.SQLITE_PATH = path.join(os.tmpdir(), `focus-steps-smoke-${process.pid}.sqlite`);
  server = await start(0);
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("server did not bind a port");
  }
  const response = await fetch(`http://127.0.0.1:${address.port}/`);
  expect(response.status).toBe(200);
  expect(await response.text()).toContain("Focus Steps is up.");
});
