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
import { correctFinishedStair, CorrectError } from "./service.js";
import { findFinishedStair, type StairRow } from "./repo.js";

export function renderCorrectHtml(options: {
  stair: StairRow;
  errorMessage?: string | null;
  name?: string;
  elapsedSeconds?: string;
}): string {
  const name = options.name ?? options.stair.name;
  const elapsedSeconds =
    options.elapsedSeconds ?? String(options.stair.elapsed_seconds);
  const parts: string[] = [];
  if (options.errorMessage) {
    parts.push(`<p class="inline-message">${escapeHtml(options.errorMessage)}</p>`);
  }
  parts.push(
    `<form method="post" action="/stairs/${encodeURIComponent(options.stair.id)}/correct">`,
  );
  parts.push('<label class="field-label" for="name">Stair name</label>');
  parts.push(
    `<input class="field" id="name" name="name" type="text" value="${escapeHtml(name)}">`,
  );
  parts.push('<label class="field-label" for="elapsed_seconds">Time (seconds)</label>');
  parts.push(
    `<input class="field" id="elapsed_seconds" name="elapsed_seconds" type="text" value="${escapeHtml(elapsedSeconds)}">`,
  );
  parts.push('<button class="primary-button" type="submit">Keep correction</button>');
  parts.push("</form>");
  parts.push(
    `<p><a class="text-link" href="/goals/${encodeURIComponent(options.stair.goal_id)}">Cancel → Goal</a></p>`,
  );
  return renderAppShell({
    title: "Focus Steps · Correct a stair",
    body: parts.join(""),
  });
}

export async function tryHandle(
  req: IncomingMessage,
  res: ServerResponse,
  db: DatabaseSync,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  const pageMatch = /^\/stairs\/([^/]+)\/correct$/.exec(url.pathname);
  if (pageMatch !== null) {
    const stairId = decodeURIComponent(pageMatch[1]!);
    const stair = findFinishedStair(db, stairId);
    if (stair === undefined) {
      writeError(res, 404, "correct.stair_not_found", "Finished stair not found.");
      return true;
    }

    if (req.method === "GET") {
      writeHtml(res, 200, renderCorrectHtml({ stair }));
      return true;
    }

    if (req.method === "POST") {
      const form = await readFormBody(req);
      const name = form.get("name") ?? "";
      const elapsedRaw = form.get("elapsed_seconds") ?? "";
      const elapsedParsed = Number(elapsedRaw);
      try {
        const progress = correctFinishedStair(db, stairId, {
          name,
          elapsedSeconds: elapsedRaw.trim() === "" ? null : elapsedParsed,
        });
        redirect(res, `/goals/${encodeURIComponent(progress.goal.id)}`);
      } catch (error) {
        if (error instanceof CorrectError) {
          writeHtml(
            res,
            400,
            renderCorrectHtml({
              stair,
              errorMessage: error.message,
              name,
              elapsedSeconds: elapsedRaw,
            }),
          );
          return true;
        }
        throw error;
      }
      return true;
    }
  }

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
