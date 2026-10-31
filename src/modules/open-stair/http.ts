import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { readJsonBody, writeError, writeJson } from "../shared/http.js";
import { openStair, OpenStairError } from "./service.js";

export async function tryHandle(
  req: IncomingMessage,
  res: ServerResponse,
  db: DatabaseSync,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (req.method !== "POST" || url.pathname !== "/api/v1/stairs") {
    return false;
  }

  let body: unknown;
  try {
    body = await readJsonBody(req);
  } catch {
    writeError(res, 400, "open_stair.invalid_body", "Request body must be JSON.");
    return true;
  }

  if (body === null || typeof body !== "object") {
    writeError(res, 400, "open_stair.invalid_body", "Request body must be JSON.");
    return true;
  }

  const record = body as Record<string, unknown>;
  const stairName = typeof record.stair_name === "string" ? record.stair_name : "";
  const goalName = typeof record.goal_name === "string" ? record.goal_name : "";

  try {
    const opened = openStair(db, { stairName, goalName });
    writeJson(res, 201, opened);
  } catch (error) {
    if (error instanceof OpenStairError) {
      const status = error.code === "open_stair.already_open" ? 409 : 400;
      writeError(res, status, error.code, error.message);
      return true;
    }
    throw error;
  }
  return true;
}
