import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export function databasePath(): string {
  return process.env.SQLITE_PATH ?? path.join("data", "focus-steps.sqlite");
}

export function openDatabase(file = databasePath()): DatabaseSync {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  return new DatabaseSync(file);
}
