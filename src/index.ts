import fs from "node:fs";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { openDatabase } from "./db/sqlite.js";
import { handle } from "./modules/health/http.js";
import { tryHandle as tryHandleOpenStair } from "./modules/open-stair/http.js";

const stylesPath = path.join(process.cwd(), "src", "ui", "styles.css");

export function start(port = Number(process.env.PORT ?? 3000)): Promise<Server> {
  const db = openDatabase();
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (req.method === "GET" && url.pathname === "/styles.css") {
      const css = fs.readFileSync(stylesPath, "utf8");
      res.writeHead(200, { "content-type": "text/css; charset=utf-8" });
      res.end(css);
      return;
    }
    void (async () => {
      if (await tryHandleOpenStair(req, res, db)) {
        return;
      }
      handle(req, res, db);
    })().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "internal error";
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ code: "internal.error", message }));
      } else {
        res.end();
      }
    });
  });
  server.on("close", () => {
    db.close();
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

const entry = process.argv[1];
if (entry !== undefined && import.meta.url === pathToFileURL(entry).href) {
  start()
    .then((server) => {
      const address = server.address();
      const listening = typeof address === "object" && address !== null ? address.port : portFromEnv();
      console.log(`listening on ${listening}`);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "failed to start";
      console.error(message);
      process.exitCode = 1;
    });
}

function portFromEnv(): string {
  return process.env.PORT ?? "3000";
}
