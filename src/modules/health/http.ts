import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { healthStatus } from "./service.js";

export type ErrorBody = { code: string; message: string };

export function writeError(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
): void {
  const body: ErrorBody = { code, message };
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

export function handle(
  req: IncomingMessage,
  res: ServerResponse,
  db: DatabaseSync,
): void {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (req.method === "GET" && url.pathname === "/") {
    healthStatus(db);
    const html = [
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '<meta charset="utf-8">',
      "<title>Focus Steps</title>",
      '<link rel="stylesheet" href="/styles.css">',
      "</head>",
      "<body>",
      "<p>Focus Steps is up.</p>",
      "</body>",
      "</html>",
    ].join("");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }
  writeError(res, 404, "not_found", "Not found");
}
