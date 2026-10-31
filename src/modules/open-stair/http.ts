import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import {
  escapeHtml,
  readFormBody,
  redirect,
  renderAppShell,
  writeHtml,
} from "../../ui/html.js";
import { readJsonBody, writeError, writeJson } from "../shared/http.js";
import { openStair, OpenStairError } from "./service.js";

export function renderOpenStairHtml(options: {
  errorMessage?: string | null;
  stairName?: string;
  goalName?: string;
} = {}): string {
  const stairName = options.stairName ?? "";
  const goalName = options.goalName ?? "";
  const parts: string[] = [];
  if (options.errorMessage) {
    parts.push(`<p class="inline-message">${escapeHtml(options.errorMessage)}</p>`);
  }
  parts.push('<form method="post" action="/stairs/new">');
  parts.push('<label class="field-label" for="stair_name">Stair name</label>');
  parts.push(
    `<input class="field" id="stair_name" name="stair_name" type="text" value="${escapeHtml(stairName)}">`,
  );
  parts.push('<label class="field-label" for="goal_name">Goal name</label>');
  parts.push(
    `<input class="field" id="goal_name" name="goal_name" type="text" value="${escapeHtml(goalName)}">`,
  );
  parts.push('<button class="primary-button" type="submit">Open stair</button>');
  parts.push("</form>");
  parts.push('<p><a class="text-link" href="/">Cancel</a></p>');
  return renderAppShell({ title: "Focus Steps · Open a stair", body: parts.join("") });
}

export async function tryHandle(
  req: IncomingMessage,
  res: ServerResponse,
  db: DatabaseSync,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (req.method === "GET" && url.pathname === "/stairs/new") {
    writeHtml(res, 200, renderOpenStairHtml());
    return true;
  }

  if (req.method === "POST" && url.pathname === "/stairs/new") {
    const form = await readFormBody(req);
    const stairName = form.get("stair_name") ?? "";
    const goalName = form.get("goal_name") ?? "";
    try {
      openStair(db, { stairName, goalName });
      redirect(res, "/");
    } catch (error) {
      if (error instanceof OpenStairError) {
        if (error.code === "open_stair.already_open") {
          redirect(res, "/?error=already_open");
          return true;
        }
        writeHtml(
          res,
          400,
          renderOpenStairHtml({
            errorMessage: error.message,
            stairName,
            goalName,
          }),
        );
        return true;
      }
      throw error;
    }
    return true;
  }

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
