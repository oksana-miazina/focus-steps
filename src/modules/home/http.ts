import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { writeError, writeJson } from "../shared/http.js";
import {
  finishOpenStair,
  getGoalProgress,
  getHome,
  hideVisibility,
  HomeError,
} from "./service.js";
import { listGoals } from "./repo.js";

export async function tryHandle(
  req: IncomingMessage,
  res: ServerResponse,
  db: DatabaseSync,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const { pathname } = url;

  if (req.method === "GET" && pathname === "/api/v1/home") {
    writeJson(res, 200, getHome(db));
    return true;
  }

  if (req.method === "GET" && pathname === "/api/v1/goals") {
    const items = listGoals(db);
    writeJson(res, 200, {
      items,
      has_next: false,
      has_prev: false,
      next_cursor: null,
    });
    return true;
  }

  const goalMatch = /^\/api\/v1\/goals\/([^/]+)$/.exec(pathname);
  if (req.method === "GET" && goalMatch !== null) {
    try {
      writeJson(res, 200, getGoalProgress(db, decodeURIComponent(goalMatch[1]!)));
    } catch (error) {
      if (error instanceof HomeError) {
        writeError(res, 404, error.code, error.message);
        return true;
      }
      throw error;
    }
    return true;
  }

  if (req.method === "POST" && pathname === "/api/v1/stairs/open/finish") {
    try {
      writeJson(res, 200, finishOpenStair(db));
    } catch (error) {
      if (error instanceof HomeError) {
        writeError(res, 409, error.code, error.message);
        return true;
      }
      throw error;
    }
    return true;
  }

  if (req.method === "POST" && pathname === "/api/v1/visibility/hide") {
    hideVisibility(db);
    res.writeHead(204);
    res.end();
    return true;
  }

  return false;
}
