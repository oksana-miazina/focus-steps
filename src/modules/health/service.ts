import type { DatabaseSync } from "node:sqlite";
import { ping } from "./repo.js";

export function healthStatus(db: DatabaseSync): { ok: true } {
  if (ping(db) !== 1) {
    throw new Error("database ping failed");
  }
  return { ok: true };
}
