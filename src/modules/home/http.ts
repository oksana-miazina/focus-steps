import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import {
  ALREADY_OPEN_MESSAGE,
  escapeHtml,
  formatElapsedHms,
  redirect,
  renderAppShell,
  writeHtml,
} from "../../ui/html.js";
import { writeError, writeJson } from "../shared/http.js";
import {
  finishOpenStair,
  getGoalProgress,
  getHome,
  hideVisibility,
  HomeError,
  type HomeDto,
} from "./service.js";
import { listGoals } from "./repo.js";

export function renderHomeHtml(home: HomeDto, options: { error?: string | null } = {}): string {
  const parts: string[] = [];

  if (options.error === "already_open") {
    parts.push(`<p class="inline-message">${escapeHtml(ALREADY_OPEN_MESSAGE)}</p>`);
  }

  if (home.open_stair !== null) {
    const open = home.open_stair;
    parts.push("<section>");
    parts.push("<h2>Open stair</h2>");
    parts.push(`<p>${escapeHtml(open.name)}</p>`);
    parts.push(`<p>Goal: ${escapeHtml(open.goal_name)}</p>`);
    parts.push(
      `<p>Time so far: ${escapeHtml(formatElapsedHms(open.display_elapsed_seconds))}</p>`,
    );
    parts.push('<form method="post" action="/stairs/open/finish">');
    parts.push('<button class="primary-button" type="submit">Mark done</button>');
    parts.push("</form>");
    parts.push("</section>");
  }

  if (home.goals.length === 0 && home.open_stair === null) {
    parts.push('<p class="empty-home-hint">No goals yet. Start a stair to create one.</p>');
    parts.push('<p><a class="primary-button" href="/stairs/new">Start a stair</a></p>');
  } else {
    if (home.goals.length > 0) {
      parts.push("<section>");
      parts.push("<h2>Goals</h2>");
      parts.push("<ul>");
      for (const goal of home.goals) {
        parts.push(
          `<li><a class="text-link" href="/goals/${encodeURIComponent(goal.id)}">${escapeHtml(goal.name)}</a></li>`,
        );
      }
      parts.push("</ul>");
      parts.push("</section>");
    }
    if (home.open_stair === null) {
      parts.push('<p><a class="primary-button" href="/stairs/new">Start a stair</a></p>');
    }
  }

  return renderAppShell({ title: "Focus Steps", body: parts.join("") });
}

export async function tryHandle(
  req: IncomingMessage,
  res: ServerResponse,
  db: DatabaseSync,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const { pathname } = url;

  if (req.method === "GET" && pathname === "/") {
    const home = getHome(db);
    writeHtml(res, 200, renderHomeHtml(home, { error: url.searchParams.get("error") }));
    return true;
  }

  if (req.method === "POST" && pathname === "/stairs/open/finish") {
    try {
      const progress = finishOpenStair(db);
      redirect(res, `/goals/${encodeURIComponent(progress.goal.id)}`);
    } catch (error) {
      if (error instanceof HomeError) {
        redirect(res, "/");
        return true;
      }
      throw error;
    }
    return true;
  }

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
