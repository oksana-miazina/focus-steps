import type { IncomingMessage, ServerResponse } from "node:http";

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

export function writeJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (raw === "") {
    return undefined;
  }
  return JSON.parse(raw) as unknown;
}
