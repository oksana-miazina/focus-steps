import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { readJsonBody, writeError, writeJson } from "../shared/http.js";
import { correctFinishedStair, CorrectError } from "./service.js";

export async function tryHandle(
  req: IncomingMessage,
  res: ServerResponse,
  db: DatabaseSync,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const match = /^\/api\/v1\/stairs\/([^/]+)$/.exec(url.pathname);
  if (req.method !== "PATCH" || match === null) {
    return false;
  }

  const stairId = decodeURIComponent(match[1]!);

  let body: unknown;
  try {
    body = await readJsonBody(req);
  } catch {
    writeError(res, 400, "correct.invalid_body", "Request body must be JSON.");
    return true;
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    writeError(res, 400, "correct.invalid_body", "Request body must be JSON.");
    return true;
  }

  const record = body as Record<string, unknown>;
  const patch: { name?: string | null; elapsedSeconds?: number | null } = {};
  if (Object.prototype.hasOwnProperty.call(record, "name")) {
    patch.name = typeof record.name === "string" ? record.name : null;
  }
  if (Object.prototype.hasOwnProperty.call(record, "elapsed_seconds")) {
    patch.elapsedSeconds =
      typeof record.elapsed_seconds === "number" ? record.elapsed_seconds : null;
  }

  try {
    writeJson(res, 200, correctFinishedStair(db, stairId, patch));
  } catch (error) {
    if (error instanceof CorrectError) {
      const status = error.code === "correct.stair_not_found" ? 404 : 400;
      writeError(res, status, error.code, error.message);
      return true;
    }
    throw error;
  }
  return true;
}
