import type { IncomingMessage, ServerResponse } from "node:http";

export const ALREADY_OPEN_MESSAGE = "Mark the current stair done first.";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatElapsedHms(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const VISIBILITY_HIDE_SCRIPT = [
  "<script>",
  "(function () {",
  "  function hide() {",
  "    try {",
  '      navigator.sendBeacon("/api/v1/visibility/hide");',
  "    } catch (e) {",
  '      fetch("/api/v1/visibility/hide", { method: "POST", keepalive: true }).catch(function () {});',
  "    }",
  "  }",
  '  document.addEventListener("visibilitychange", function () {',
  '    if (document.visibilityState === "hidden") hide();',
  "  });",
  '  window.addEventListener("pagehide", hide);',
  "})();",
  "</script>",
].join("");

export function renderAppShell(options: {
  title: string;
  body: string;
  scripts?: string;
}): string {
  const scripts = `${VISIBILITY_HIDE_SCRIPT}${options.scripts ?? ""}`;
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    `<title>${escapeHtml(options.title)}</title>`,
    '<link rel="stylesheet" href="/styles.css">',
    "</head>",
    "<body>",
    '<div class="app-shell">',
    `<h1>${escapeHtml(options.title)}</h1>`,
    options.body,
    "</div>",
    scripts,
    "</body>",
    "</html>",
  ].join("");
}

export function writeHtml(res: ServerResponse, status: number, html: string): void {
  res.writeHead(status, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}

export function redirect(res: ServerResponse, location: string): void {
  res.writeHead(303, { location });
  res.end();
}

export async function readFormBody(req: IncomingMessage): Promise<URLSearchParams> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}
